param([string]$Out = '')

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$src = Join-Path $root 'src\NetLensLauncher.cs'
$manifest = Join-Path $root 'src\app.manifest'
$ico = Join-Path $root 'assets\netlens.ico'
if (-not $Out) { $Out = Join-Path $root 'NetLens.exe' }

$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) {
  $csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe'
}
if (-not (Test-Path $csc)) { throw '找不到 csc.exe（需要 .NET Framework 4.x）' }

$cscArgs = @(
  '/nologo',
  '/target:winexe',
  '/platform:anycpu',
  ('/out:' + $Out),
  ('/win32icon:' + $ico),
  ('/win32manifest:' + $manifest),
  '/reference:System.dll',
  '/reference:System.Drawing.dll',
  '/reference:System.Windows.Forms.dll',
  $src
)

& $csc @cscArgs
if ($LASTEXITCODE -ne 0) { throw "编译失败（exit $LASTEXITCODE）" }
Write-Host ('已生成 ' + $Out + '  (' + [math]::Round((Get-Item $Out).Length / 1KB, 1) + ' KB)') -ForegroundColor Green
