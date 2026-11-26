param(
  [switch]$ServeOnly,
  [int]$Seconds = 180,
  [int]$Port = 8765,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$webDir = Join-Path $root 'web'
$capDir = Join-Path $root 'captures'
New-Item -ItemType Directory -Force -Path $capDir | Out-Null

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin -and -not $ServeOnly) {
  Write-Host '需要管理员权限才能抓包，正在请求提权…' -ForegroundColor Yellow
  $argList = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $PSCommandPath + '"'),
    '-Seconds', $Seconds, '-Port', $Port)
  if ($NoBrowser) { $argList += '-NoBrowser' }
  try {
    Start-Process -FilePath 'powershell.exe' -ArgumentList $argList -Verb RunAs | Out-Null
  } catch {
    Write-Host '提权被取消，已退出。' -ForegroundColor Red
    exit 1
  }
  exit 0
}

function Write-Banner {
  Write-Host ''
  Write-Host '  NetLens · 本地流量分析' -ForegroundColor Cyan
  Write-Host '  看看你的电脑到底在上传什么（全程离线，数据不出本机）' -ForegroundColor DarkGray
  Write-Host ''
}

if ($isAdmin) {
  $Host.UI.RawUI.WindowTitle = 'NetLens · 本地流量分析'
}

Write-Banner

$minutes = [math]::Round($Seconds / 60, 1)
if (-not $ServeOnly) {
  Write-Host '  马上开始，只有 3 步：' -ForegroundColor White
  Write-Host '    1) 抓包期间正常上网就行（刷网页、看视频都可以）' -ForegroundColor Gray
  Write-Host '    2) 不要关闭这个黑色窗口' -ForegroundColor Gray
  Write-Host ('    3) 抓完 ' + $minutes + ' 分钟后会自动打开浏览器显示结果') -ForegroundColor Gray
  Write-Host ''
  Write-Host ('[*] 开始抓包（{0} 秒）…' -f $Seconds) -ForegroundColor Yellow

  if (-not (Get-Command pktmon -ErrorAction SilentlyContinue)) {
    Write-Host '[!] 当前系统没有 pktmon（需要 Windows 10 1809 及以上），跳过抓包，直接打开分析界面。' -ForegroundColor Red
  } else {
    try {
      & (Join-Path $root 'capture.ps1') -Seconds $Seconds -Root $root
    } catch {
      Write-Host ('[!] 抓包失败：' + $_.Exception.Message) -ForegroundColor Red
      Write-Host '    你仍然可以在打开的页面里手动拖入 pcap 文件分析。' -ForegroundColor Yellow
    }
  }
}

# ---------- static files ----------
$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
}

function Send-Bytes($ctx, [byte[]]$bytes, [string]$type, [int]$code = 200) {
  $res = $ctx.Response
  $res.StatusCode = $code
  $res.ContentType = $type
  $res.Headers['Cache-Control'] = 'no-store'
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.OutputStream.Close()
  $res.Close()
}

function Send-Text($ctx, [string]$text, [string]$type, [int]$code = 200) {
  Send-Bytes $ctx ([Text.Encoding]::UTF8.GetBytes($text)) $type $code
}

function Send-Json($ctx, $obj, [int]$code = 200) {
  $json = ConvertTo-Json -InputObject $obj -Depth 6 -Compress
  if ($null -eq $json -or $json -eq '') { $json = 'null' }
  Send-Bytes $ctx ([Text.Encoding]::UTF8.GetBytes($json)) 'application/json; charset=utf-8' $code
}

function Send-File($ctx, [string]$path) {
  $res = $ctx.Response
  $ext = [IO.Path]::GetExtension($path).ToLower()
  $type = $mime[$ext]
  if (-not $type) { $type = 'application/octet-stream' }
  $fs = [IO.File]::OpenRead($path)
  try {
    $res.StatusCode = 200
    $res.ContentType = $type
    $res.Headers['Cache-Control'] = 'no-store'
    $res.ContentLength64 = $fs.Length
    $buf = New-Object byte[] 262144
    while (($n = $fs.Read($buf, 0, $buf.Length)) -gt 0) {
      $res.OutputStream.Write($buf, 0, $n)
    }
    $res.OutputStream.Close()
  } finally {
    $fs.Dispose()
    $res.Close()
  }
}

# ---------- http server ----------
$listener = $null
$chosen = 0
for ($p = $Port; $p -lt $Port + 25; $p++) {
  try {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://127.0.0.1:$p/")
    $l.Start()
    $listener = $l
    $chosen = $p
    break
  } catch {
    try { $l.Close() } catch { }
  }
}
if (-not $listener) {
  Write-Host '无法启动本地 HTTP 服务（端口被占用）。' -ForegroundColor Red
  Read-Host '按回车退出'
  exit 1
}

$url = "http://127.0.0.1:$chosen/"
Write-Host ''
Write-Host '[+] 分析界面已启动，正在打开浏览器…' -ForegroundColor Green
Write-Host ('    如果浏览器没有自动打开，请手动访问: ' + $url) -ForegroundColor Gray
Write-Host '    保持本窗口开着；关闭窗口即停止服务。' -ForegroundColor DarkGray
Write-Host ''

if (-not $NoBrowser) {
  Start-Process $url | Out-Null
}

$running = $true
$job = $null

try {
  while ($running) {
    $ctx = $null
    try { $ctx = $listener.GetContext() } catch { break }
    $req = $ctx.Request
    $path = $req.Url.AbsolutePath
    try {
      if ($path -eq '/' -or $path -eq '/index.html') {
        Send-File $ctx (Join-Path $webDir 'index.html')
      }
      elseif ($path -eq '/api/latest') {
        $files = Get-ChildItem -Path $capDir -Filter 'cap_*.json' -File -ErrorAction SilentlyContinue |
          Sort-Object LastWriteTime -Descending
        if (-not $files) {
          Send-Json $ctx ([ordered]@{ capture = $null })
        } else {
          $meta = Get-Content $files[0].FullName -Raw -Encoding UTF8 | ConvertFrom-Json
          Send-Json $ctx $meta
        }
      }
      elseif ($path -eq '/api/status') {
        $sp = Join-Path $capDir 'status.json'
        if (Test-Path $sp) {
          $st = Get-Content $sp -Raw -Encoding UTF8 | ConvertFrom-Json
          Send-Json $ctx $st
        } else {
          Send-Json $ctx ([ordered]@{ phase = 'idle'; progress = 0 })
        }
      }
      elseif ($path -eq '/api/history' -and $req.HttpMethod -eq 'POST') {
        $histDir = Join-Path $capDir 'history'
        New-Item -ItemType Directory -Force -Path $histDir | Out-Null
        $len = $req.ContentLength64
        if ($len -le 0 -or $len -gt 52428800) {
          Send-Json $ctx ([ordered]@{ error = 'payload size' }) 400
        } else {
          $reader = New-Object System.IO.StreamReader($req.InputStream, [Text.Encoding]::UTF8)
          $body = $reader.ReadToEnd()
          $reader.Close()
          try {
            $obj = $body | ConvertFrom-Json
            $key = ([string]$obj.name) + '|' + ([string]$obj.result.meta.packets) + '|' + ([string]$obj.result.meta.duration)
            $existing = $null
            Get-ChildItem $histDir -Filter '*.summary.json' -ErrorAction SilentlyContinue |
              Sort-Object Name -Descending | Select-Object -First 40 | ForEach-Object {
                if (-not $existing) {
                  try {
                    $sj = Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
                    if ($sj.key -eq $key) { $existing = $sj.id }
                  } catch { }
                }
              }
            if ($existing) {
              Send-Json $ctx ([ordered]@{ ok = $true; id = $existing; duplicate = $true })
            } else {
              $id = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
              $file = Join-Path $histDir ($id + '.json')
              [IO.File]::WriteAllText($file, $body, (New-Object Text.UTF8Encoding($false)))
              $m = $obj.result.meta
              $fail = @($obj.result.checks | Where-Object { -not $_.pass }).Count
              $sum = [ordered]@{
                id       = $id
                key      = $key
                name     = [string]$obj.name
                mode     = [string]$obj.mode
                created  = (Get-Date).ToString('o')
                duration = [math]::Round([double]$m.duration, 1)
                up       = [double]$m.bytesOut
                down     = [double]$m.bytesIn
                packets  = [int]$m.packets
                fail     = $fail
                samples  = [int]$m.sampleCount
              }
              $sum | ConvertTo-Json -Compress | Set-Content -Path (Join-Path $histDir ($id + '.summary.json')) -Encoding UTF8
              $old = Get-ChildItem $histDir -Filter '*.summary.json' | Sort-Object Name -Descending | Select-Object -Skip 100
              foreach ($f in $old) {
                $bid = $f.Name -replace '\.summary\.json$', ''
                Remove-Item (Join-Path $histDir ($bid + '.json')) -Force -ErrorAction SilentlyContinue
                Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
              }
              Send-Json $ctx ([ordered]@{ ok = $true; id = $id })
            }
          } catch {
            Send-Json $ctx ([ordered]@{ error = 'bad json' }) 400
          }
        }
      }
      elseif ($path -eq '/api/history' -and $req.HttpMethod -eq 'GET') {
        $histDir = Join-Path $capDir 'history'
        $items = New-Object System.Collections.ArrayList
        if (Test-Path $histDir) {
          Get-ChildItem $histDir -Filter '*.summary.json' -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending | Select-Object -First 100 | ForEach-Object {
              try { [void]$items.Add((Get-Content $_.FullName -Raw -Encoding UTF8 | ConvertFrom-Json)) } catch { }
            }
        }
        Send-Json $ctx ([object[]]$items.ToArray())
      }
      elseif ($path -eq '/api/history/item') {
        $id = $req.QueryString['id']
        if ($id -match '^[0-9_]+$') {
          $f = Join-Path (Join-Path $capDir 'history') ($id + '.json')
          if (Test-Path $f) { Send-File $ctx $f } else { Send-Json $ctx ([ordered]@{ error = 'not found' }) 404 }
        } else {
          Send-Json $ctx ([ordered]@{ error = 'bad id' }) 400
        }
      }
      elseif ($path -eq '/api/history' -and $req.HttpMethod -eq 'DELETE') {
        $id = $req.QueryString['id']
        if ($id -match '^[0-9_]+$') {
          $histDir = Join-Path $capDir 'history'
          Remove-Item (Join-Path $histDir ($id + '.json')) -Force -ErrorAction SilentlyContinue
          Remove-Item (Join-Path $histDir ($id + '.summary.json')) -Force -ErrorAction SilentlyContinue
          Send-Json $ctx ([ordered]@{ ok = $true })
        } else {
          Send-Json $ctx ([ordered]@{ error = 'bad id' }) 400
        }
      }
      elseif ($path -eq '/api/capture') {
        if ($job -and $job.State -eq 'Running') {
          Send-Json $ctx ([ordered]@{ ok = $false; message = '正在抓包，请稍候' })
        } else {
          if ($job) { Remove-Job $job -Force -ErrorAction SilentlyContinue }
          $mode = $req.QueryString['mode']
          $sec = 180
          if ($req.QueryString['seconds']) { $sec = [int]$req.QueryString['seconds'] }
          if ($mode -eq 'series') {
            $times = 12; $interval = 600
            if ($req.QueryString['times']) { $times = [int]$req.QueryString['times'] }
            if ($req.QueryString['interval']) { $interval = [int]$req.QueryString['interval'] }
            if ($sec -lt 5) { $sec = 30 }
            $job = Start-Job -FilePath (Join-Path $root 'capture.ps1') `
              -ArgumentList $sec, $root, '', $true, $times, $interval
            Send-Json $ctx ([ordered]@{ ok = $true; mode = 'series'; seconds = $sec; times = $times; interval = $interval })
          } else {
            $job = Start-Job -FilePath (Join-Path $root 'capture.ps1') -ArgumentList $sec, $root
            Send-Json $ctx ([ordered]@{ ok = $true; mode = 'single'; seconds = $sec })
          }
        }
      }
      elseif ($path -eq '/api/shutdown') {
        Send-Json $ctx ([ordered]@{ ok = $true })
        $running = $false
      }
      elseif ($path -eq '/api/file') {
        $name = $req.QueryString['name']
        $rel = ($name -replace '\\', '/').TrimStart('/')
        if ($rel -and $rel -notmatch '\.\.') {
          $full = Join-Path $capDir $rel
          if (Test-Path -LiteralPath $full) {
            Send-File $ctx $full
          } else {
            Send-Json $ctx ([ordered]@{ error = 'not found' }) 404
          }
        } else {
          Send-Json $ctx ([ordered]@{ error = 'bad name' }) 400
        }
      }
      else {
        $safe = [IO.Path]::GetFileName($path)
        $full = Join-Path $webDir $safe
        if ($safe -and (Test-Path $full)) { Send-File $ctx $full }
        else { Send-Json $ctx ([ordered]@{ error = 'not found' }) 404 }
      }
    } catch {
      try { Add-Content -Path (Join-Path $root 'server-error.log') -Value ((Get-Date).ToString('o') + ' ' + $path + ' ' + $_.Exception.ToString()) } catch { }
      try { Send-Json $ctx ([ordered]@{ error = $_.Exception.Message }) 500 } catch { }
    }
  }
} finally {
  try { $listener.Stop() } catch { }
  try { $listener.Close() } catch { }
  if ($job) { Remove-Job $job -Force -ErrorAction SilentlyContinue }
  Write-Host '服务已停止。' -ForegroundColor DarkGray
}
