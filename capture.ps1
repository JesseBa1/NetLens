param(
  [int]$Seconds = 180,
  [string]$Root = $PSScriptRoot,
  [string]$Tag = '',
  [bool]$Series = $false,
  [int]$Times = 12,
  [int]$Interval = 600
)

$ErrorActionPreference = 'Continue'
$capDir = Join-Path $Root 'captures'
New-Item -ItemType Directory -Force -Path $capDir | Out-Null
$statusPath = Join-Path $capDir 'status.json'

$stamp = if ($Tag) { $Tag } else { Get-Date -Format 'yyyyMMdd_HHmmss' }
$base = "cap_$stamp"

function Set-Status($phase, $progress, $message, $code = '', $params = $null) {
  $o = [ordered]@{
    phase    = $phase
    progress = [math]::Round($progress, 3)
    message  = $message
    updated  = (Get-Date).ToString('o')
  }
  if ($code) { $o['code'] = $code }
  if ($params) { $o['params'] = $params }
  $o | ConvertTo-Json -Depth 4 -Compress | Set-Content -Path $statusPath -Encoding UTF8
}

$procCache = @{}
function Get-PName([int]$id) {
  if ($procCache.ContainsKey($id)) { return $procCache[$id] }
  $n = (Get-Process -Id $id -ErrorAction SilentlyContinue).ProcessName
  if (-not $n) { $n = '?' }
  $procCache[$id] = $n
  return $n
}

function Get-LocalIps {
  try {
    return @(Get-NetIPAddress -ErrorAction Stop |
      Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -ne '::1' } |
      ForEach-Object { ($_.IPAddress -replace '%.*$', '') } | Sort-Object -Unique)
  } catch {
    return @()
  }
}

function Invoke-Sample([string]$fileBase, [double]$progressFrom, [double]$progressSpan, [string]$label, [string]$statusCode = 'capturing', [hashtable]$statusParams = $null) {
  $etl = "$fileBase.etl"
  $pcap = "$fileBase.pcapng"
  $conns = "$fileBase.conns.csv"
  Remove-Item $etl, $pcap -Force -ErrorAction SilentlyContinue

  try { pktmon stop 2>&1 | Out-Null } catch { }
  Start-Sleep -Milliseconds 300
  # 高码率场景下默认 512MB 循环日志会被写满、覆盖掉开头，这里放宽到 4GB；
  # 超长抓包再配合更小的截断长度，避免文件过大。
  $pktSize = if ($Seconds -ge 1200) { 512 } else { 1024 }
  $startInfo = pktmon start --capture --comp nics --pkt-size $pktSize --file-size 4096 -f $etl 2>&1
  if ($LASTEXITCODE -ne 0) { throw ("pktmon 启动失败: " + ($startInfo | Out-String)) }

  $startTime = Get-Date
  $writer = New-Object System.IO.StreamWriter($conns, $false, (New-Object System.Text.UTF8Encoding($false)))
  $writer.WriteLine('ts,proto,local,remote,state,pid,proc')
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $lastStatus = -10.0

  while ($sw.Elapsed.TotalSeconds -lt $Seconds) {
    $ts = (Get-Date).ToString('HH:mm:ss.fff')
    foreach ($c in Get-NetTCPConnection -ErrorAction SilentlyContinue) {
      $writer.WriteLine(('{0},TCP,{1},{2},{3},{4},{5}' -f $ts, ($c.LocalAddress + ':' + $c.LocalPort),
        ($c.RemoteAddress + ':' + $c.RemotePort), $c.State, $c.OwningProcess, (Get-PName $c.OwningProcess)))
    }
    if (([int]$sw.Elapsed.TotalSeconds) % 2 -eq 0) {
      foreach ($e in Get-NetUDPEndpoint -ErrorAction SilentlyContinue) {
        $writer.WriteLine(('{0},UDP,{1},,Listen,{2},{3}' -f $ts, ($e.LocalAddress + ':' + $e.LocalPort), $e.OwningProcess, (Get-PName $e.OwningProcess)))
      }
    }
    $writer.Flush()
    $frac = [math]::Min(1, $sw.Elapsed.TotalSeconds / $Seconds)
    Write-Progress -Activity $label -Status ('{0:N0} / {1} 秒' -f $sw.Elapsed.TotalSeconds, $Seconds) `
      -PercentComplete ([math]::Min(99, [int](100 * $frac)))
    if ($sw.Elapsed.TotalSeconds - $lastStatus -ge 2) {
      $lastStatus = $sw.Elapsed.TotalSeconds
      $p = $progressFrom + $progressSpan * $frac
      $sp = @{ done = [int]$sw.Elapsed.TotalSeconds; total = $Seconds }
      if ($statusParams) { foreach ($k in $statusParams.Keys) { $sp[$k] = $statusParams[$k] } }
      Set-Status 'capturing' $p ('{0} · 已采样 {1:N0}/{2} 秒' -f $label, $sw.Elapsed.TotalSeconds, $Seconds) $statusCode $sp
    }
    Start-Sleep -Milliseconds 850
  }

  $writer.Close()
  pktmon counters 2>&1 | Out-Null
  pktmon stop 2>&1 | Out-Null
  Start-Sleep -Milliseconds 600
  $conv = pktmon etl2pcap $etl --out $pcap 2>&1
  if (-not (Test-Path $pcap)) { throw ("pcapng 生成失败: " + ($conv | Out-String)) }
  $etlMB = 0
  if (Test-Path $etl) { $etlMB = [math]::Round((Get-Item $etl).Length / 1MB, 0) }
  Remove-Item $etl -Force -ErrorAction SilentlyContinue

  return [ordered]@{
    capture = (Split-Path $pcap -Leaf)
    conns   = (Split-Path $conns -Leaf)
    start   = $startTime.ToString('o')
    seconds = $Seconds
    etlMB   = $etlMB
  }
}

try {
  Set-Status 'preparing' 0.02 '清理旧的抓包会话' 'preparing'
  try { pktmon stop 2>&1 | Out-Null } catch { }
  try { pktmon filter remove 2>&1 | Out-Null } catch { }

  $ips = Get-LocalIps
  $meta = $null

  if ($Series -eq $true) {
    $dir = Join-Path $capDir "series_$stamp"
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Set-Status 'starting' 0.03 ('开始定时抽采：共 {0} 次，每次 {1} 秒' -f $Times, $Seconds) 'starting' @{ times = $Times; seconds = $Seconds }
    $samples = @()
    for ($i = 1; $i -le $Times; $i++) {
      $from = 0.03 + 0.94 * (($i - 1) / $Times)
      $span = 0.94 / $Times
      $label = ('第 {0}/{1} 次' -f $i, $Times)
      $s = Invoke-Sample (Join-Path $dir ('sample_{0:D2}' -f $i)) $from $span $label 'series' @{ index = $i; times = $Times }
      $s['index'] = $i
      $samples += $s
      if ($i -lt $Times) {
        $wait = [math]::Max(0, $Interval - $Seconds)
        $until = (Get-Date).AddSeconds($wait)
        while ((Get-Date) -lt $until) {
          $left = [math]::Max(0, [int]($until - (Get-Date)).TotalSeconds)
          Set-Status 'capturing' (0.03 + 0.94 * ($i / $Times)) ('等待下一次采样，约 {0} 秒后' -f $left) 'waiting' @{ sec = $left }
          Start-Sleep -Seconds 2
        }
      }
    }
    $meta = [ordered]@{
      mode     = 'series'
      series   = (Split-Path $dir -Leaf)
      samples  = @($samples)
      start    = $samples[0].start
      end      = (Get-Date).ToString('o')
      seconds  = $Seconds
      times    = $Times
      interval = $Interval
      localIps = @($ips)
      host     = $env:COMPUTERNAME
    }
  } else {
    $dir = $capDir
    $s = Invoke-Sample (Join-Path $capDir $base) 0.03 0.94 '抓包中' 'capturing'
    $warnings = @()
    if ($s.etlMB -ge 4000) {
      $warnings += '抓包触发了 4GB 日志上限，开头部分可能已被覆盖；建议缩短时长或调小 --pkt-size。'
    }
    $meta = [ordered]@{
      capture  = $s.capture
      conns    = $s.conns
      start    = $s.start
      end      = (Get-Date).ToString('o')
      seconds  = $Seconds
      localIps = @($ips)
      host     = $env:COMPUTERNAME
      size     = (Get-Item (Join-Path $capDir $s.capture)).Length
      warnings = @($warnings)
    }
    $meta['warningCodes'] = @()
    if ($s.etlMB -ge 4000) { $meta.warningCodes += @{ code = 'truncated' } }
  }

  $metaPath = Join-Path $capDir "$base.json"
  $meta | ConvertTo-Json -Depth 6 | Set-Content -Path $metaPath -Encoding UTF8
  Set-Status 'done' 1.0 '完成' 'done'
  if ($Series) {
    Write-Host ('定时抽采完成：' + $Times + ' 次采样，目录 captures\' + $meta.series) -ForegroundColor Green
  } else {
    Write-Host ('抓包完成: ' + $meta.capture + '  (' + [math]::Round($meta.size / 1MB, 1) + ' MB)') -ForegroundColor Green
  }
}
catch {
  Set-Status 'error' 1.0 $_.Exception.Message 'error' @{ msg = $_.Exception.Message }
  Write-Host ('抓包失败: ' + $_.Exception.Message) -ForegroundColor Red
  throw
}
