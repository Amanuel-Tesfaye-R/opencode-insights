param(
  [int]$Port = 3777,
  [switch]$NoBrowser
)

$Project = "C:\Users\amanu\Documents\Projects\opencode-insights"
$Url = "http://localhost:$Port"
$Log = Join-Path $Project ".dashboard.log"
$LogErr = "$Log.err"

function Test-PortOpen([int]$p) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect("127.0.0.1", $p, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(400)
    if ($ok) {
      $client.EndConnect($iar)
      $client.Close()
      return $true
    }
    $client.Close()
    return $false
  } catch {
    return $false
  }
}

# Already running, nothing to do.
if (Test-PortOpen $Port) {
  exit 0
}

# Prefer the production server; fall back to dev if no build exists.
$hasBuild = Test-Path (Join-Path $Project ".next\BUILD_ID")
$script = if ($hasBuild) { "start" } else { "dev" }

try {
  $p = Start-Process -FilePath "npm.cmd" -ArgumentList "run", $script `
    -WorkingDirectory $Project -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput $Log -RedirectStandardError $LogErr
} catch {
  Write-Host "opencode-insights: failed to start ($_)" -ForegroundColor Red
  exit 1
}

$deadline = (Get-Date).AddSeconds(40)
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Milliseconds 500
  if (Test-PortOpen $Port) {
    if (-not $NoBrowser) {
      Start-Process $Url
    }
    exit 0
  }
  if ($p.HasExited) {
    Write-Host "opencode-insights: server exited early, see $Log" -ForegroundColor Red
    exit 1
  }
}

Write-Host "opencode-insights: timed out waiting for $Url, see $Log" -ForegroundColor Red
exit 1
