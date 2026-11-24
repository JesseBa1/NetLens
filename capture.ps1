param(
  [int]$Seconds = 180,
  [string]$Root = $PSScriptRoot,
  [string]$Tag = ''
)

$ErrorActionPreference = 'Continue'
$capDir = Join-Path $Root 'captures'
New-Item -ItemType Directory -Force -Path $capDir | Out-Null
$statusPath = Join-Path $capDir 'status.json'

$stamp = if ($Tag) { $Tag } else { Get-Date -Format 'yyyyMMdd_HHmmss' }
$base = "cap_$stamp"
$etl = Join-Path $capDir "$base.etl"
$pcap = Join-Path $capDir "$base.pcapng"
$conns = Join-Path $capDir "$base.conns.csv"
$metaPath = Join-Path $capDir "$base.json"

function Set-Status($phase, $progress, $message) {
  $o = [ordered]@{
    phase    = $phase
    progress = [math]::Round($progress, 3)
    message  = $message
    updated  = (Get-Date).ToString('o')
  }
  $o | ConvertTo-Json -Compress | Set-Content -Path $statusPath -Encoding UTF8
}

$procCache = @{}
function Get-PName([int]$id) {
  if ($procCache.ContainsKey($id)) { return $procCache[$id] }
  $n = (Get-Process -Id $id -ErrorAction SilentlyContinue).ProcessName
  if (-not $n) { $n = '?' }
  $procCache[$id] = $n
  return $n
}

try {
  Set-Status 'preparing' 0.02 '清理旧的抓包会话'
  try { pktmon stop 2>&1 | Out-Null } catch { }
  try { pktmon filter remove 2>&1 | Out-Null } catch { }
  Remove-Item $etl, $pcap -Force -ErrorAction SilentlyContinue

  Set-Status 'starting' 0.05 '启动 pktmon 抓包'
  $startInfo = pktmon start --capture --comp nics --pkt-size 1024 -f $etl 2>&1
  if ($LASTEXITCODE -ne 0) { throw ("pktmon 启动失败: " + ($startInfo | Out-String)) }

  $startTime = Get-Date
  Write-Host ('[..] 抓包已开始，' + $Seconds + ' 秒后自动结束（这期间正常上网即可）…') -ForegroundColor Gray
  $writer = New-Object System.IO.StreamWriter($conns, $false, (New-Object System.Text.UTF8Encoding($false)))
  $writer.WriteLine('ts,proto,local,remote,state,pid,proc')
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $lastStatus = 0.0

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
    Write-Progress -Activity 'NetLens 抓包中' -Status ('{0:N0} / {1} 秒' -f $sw.Elapsed.TotalSeconds, $Seconds) `
      -PercentComplete ([math]::Min(99, [int](100 * $sw.Elapsed.TotalSeconds / $Seconds)))
    if ($sw.Elapsed.TotalSeconds - $lastStatus -ge 2) {
      $lastStatus = $sw.Elapsed.TotalSeconds
      Set-Status 'capturing' (0.05 + 0.85 * $sw.Elapsed.TotalSeconds / $Seconds) `
        ('抓包中 ' + [math]::Round($sw.Elapsed.TotalSeconds) + '/' + $Seconds + ' 秒')
    }
    Start-Sleep -Milliseconds 850
  }

  $writer.Close()
  Set-Status 'converting' 0.92 '停止捕获并转换为 pcapng'
  pktmon counters 2>&1 | Out-Null
  pktmon stop 2>&1 | Out-Null
  Start-Sleep -Milliseconds 800
  $conv = pktmon etl2pcap $etl --out $pcap 2>&1
  if (-not (Test-Path $pcap)) { throw ("pcapng 生成失败: " + ($conv | Out-String)) }
  Remove-Item $etl -Force -ErrorAction SilentlyContinue

  $ips = @()
  try {
    $ips = Get-NetIPAddress -ErrorAction Stop |
      Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -ne '::1' } |
      ForEach-Object { ($_.IPAddress -replace '%.*$', '') } | Sort-Object -Unique
  } catch { }

  $endTime = Get-Date
  $meta = [ordered]@{
    capture  = (Split-Path $pcap -Leaf)
    conns    = (Split-Path $conns -Leaf)
    start    = $startTime.ToString('o')
    end      = $endTime.ToString('o')
    seconds  = [math]::Round(($endTime - $startTime).TotalSeconds, 1)
    localIps = @($ips)
    host     = $env:COMPUTERNAME
    size     = (Get-Item $pcap).Length
  }
  $meta | ConvertTo-Json | Set-Content -Path $metaPath -Encoding UTF8
  Set-Status 'done' 1.0 '完成'
  Write-Host ('抓包完成: ' + $pcap + '  (' + [math]::Round($meta.size / 1MB, 1) + ' MB)') -ForegroundColor Green
}
catch {
  Set-Status 'error' 1.0 $_.Exception.Message
  Write-Host ('抓包失败: ' + $_.Exception.Message) -ForegroundColor Red
  throw
}
