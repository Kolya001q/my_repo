# Read .env and output only the requested keys in KEY=VALUE form, copy to clipboard
param(
    [string]$EnvFile = "..\.env",
    [string[]]$Keys = @("MONGO_URI","SESSION_SECRET","NODE_ENV")
)

$path = Join-Path $PSScriptRoot $EnvFile
if (-not (Test-Path $path)) {
    Write-Error ".env file not found at $path"
    exit 1
}

# Read lines and parse simple KEY=VALUE (ignore comments)
$lines = Get-Content $path | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') }
$env = @{}
foreach ($line in $lines) {
    $idx = $line.IndexOf('=')
    if ($idx -gt -1) {
        $k = $line.Substring(0,$idx).Trim()
        $v = $line.Substring($idx+1).Trim(' "')
        $env[$k] = $v
    }
}

$outputLines = @()
foreach ($k in $Keys) {
    if ($env.ContainsKey($k)) {
        $outputLines += "$k=$($env[$k])"
    } else {
        $outputLines += "$k="
    }
}

# Join for clipboard
$output = $outputLines -join "`n"

# Try to copy to clipboard (PowerShell)
try {
    $output | Set-Clipboard -ErrorAction Stop
    Write-Host "Environment block copied to clipboard. Paste into Render/Vercel environment input."
} catch {
    Write-Warning "Could not copy to clipboard. Outputting below instead."
}

Write-Host "----- Paste this into Render / Vercel environment (Key=Value) -----" -ForegroundColor Cyan
Write-Host $output
Write-Host "---------------------------------------------------------------" -ForegroundColor Cyan

Write-Host "Notes: Do not commit .env to git. Use Render/Vercel UI to add these values as environment variables." -ForegroundColor Yellow
