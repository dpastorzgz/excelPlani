[CmdletBinding()]
param(
    [Parameter()]
    [string] $ServerShell
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-SharedFileHashValue {
    param([Parameter(Mandatory = $true)][string] $Path)

    $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
    $stream = [System.IO.FileStream]::new(
        $Path,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        $share
    )
    try {
        $sha = [System.Security.Cryptography.SHA256]::Create()
        try { return ([System.BitConverter]::ToString($sha.ComputeHash($stream))).Replace('-', '') }
        finally { $sha.Dispose() }
    }
    finally {
        $stream.Dispose()
    }
}

function Assert-Equal {
    param($Actual, $Expected, [string] $Message)
    if ($Actual -ne $Expected) {
        throw "$Message Expected '$Expected' but got '$Actual'."
    }
}

function Send-RawHttpRequest {
    param([int] $Port, [string] $Request)

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $client.Connect([System.Net.IPAddress]::Loopback, $Port)
        $stream = $client.GetStream()
        $bytes = [System.Text.Encoding]::ASCII.GetBytes($Request)
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Flush()
        $client.Client.Shutdown([System.Net.Sockets.SocketShutdown]::Send)
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::UTF8)
        return $reader.ReadToEnd()
    }
    finally {
        $client.Dispose()
    }
}

$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$serverScript = Join-Path $repositoryRoot 'start-dashboard.ps1'
$workbookPath = Join-Path $repositoryRoot 'diagramaGanttBase.xlsm'
$workbookHashBefore = Get-SharedFileHashValue -Path $workbookPath
$workbookMtimeBefore = (Get-Item -LiteralPath $workbookPath).LastWriteTimeUtc
$shell = $null
if (-not [string]::IsNullOrWhiteSpace($ServerShell)) {
    $shell = (Get-Command $ServerShell -ErrorAction Stop).Source
}
if ([string]::IsNullOrEmpty($shell)) {
    $shell = (Get-Command pwsh -ErrorAction SilentlyContinue).Source
    if ([string]::IsNullOrEmpty($shell)) {
        $shell = (Get-Command powershell.exe -ErrorAction Stop).Source
    }
}

$startInfo = [System.Diagnostics.ProcessStartInfo]::new()
$startInfo.FileName = $shell
$startInfo.UseShellExecute = $false
$startInfo.CreateNoWindow = $true
$startInfo.RedirectStandardOutput = $true
$startInfo.RedirectStandardError = $true
$serverArguments = @('-NoProfile')
if ([System.IO.Path]::GetFileName($shell) -ieq 'powershell.exe') {
    # Test-only override: the production launcher deliberately respects host policy.
    $serverArguments += @('-ExecutionPolicy', 'Bypass')
}
$serverArguments += @('-File', $serverScript, '-Root', $repositoryRoot, '-NoBrowser', '-Port', '0', '-IdleTimeoutMinutes', '1', '-MaxRequests', '6')
foreach ($argument in $serverArguments) {
    [void] $startInfo.ArgumentList.Add($argument)
}

$process = [System.Diagnostics.Process]::new()
$process.StartInfo = $startInfo
[void] $process.Start()

try {
    $urlLine = $process.StandardOutput.ReadLine()
    if ($urlLine -notmatch '^DASHBOARD_URL=http://127\.0\.0\.1:(\d+)/dashboard\.html$') {
        $serverError = $process.StandardError.ReadToEnd()
        throw "Server did not publish a loopback URL. Output: $urlLine Error: $serverError"
    }
    $port = [int] $Matches[1]

    $handler = [System.Net.Http.HttpClientHandler]::new()
    $http = [System.Net.Http.HttpClient]::new($handler)
    $http.BaseAddress = [System.Uri]::new("http://127.0.0.1:$port/")

    $configResponse = $http.GetAsync('dashboard-config.js').GetAwaiter().GetResult()
    Assert-Equal ([int] $configResponse.StatusCode) 200 'GET config failed.'
    Assert-Equal ($configResponse.Headers.GetValues('X-Content-Type-Options') -join ',') 'nosniff' 'Security header missing.'

    $headRequest = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Head, 'dashboard-config.js')
    $headResponse = $http.SendAsync($headRequest).GetAwaiter().GetResult()
    Assert-Equal ([int] $headResponse.StatusCode) 200 'HEAD config failed.'
    Assert-Equal (($headResponse.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()).Length) 0 'HEAD returned a body.'

    $workbookResponse = $http.GetAsync('diagramaGanttBase.xlsm').GetAwaiter().GetResult()
    Assert-Equal ([int] $workbookResponse.StatusCode) 200 'GET workbook failed.'
    $servedWorkbook = $workbookResponse.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
    $servedHash = [System.Convert]::ToHexString([System.Security.Cryptography.SHA256]::HashData($servedWorkbook))
    Assert-Equal $servedHash $workbookHashBefore 'Served workbook hash differs from source.'

    $missingResponse = $http.GetAsync('missing-file.txt').GetAwaiter().GetResult()
    Assert-Equal ([int] $missingResponse.StatusCode) 404 'Missing file did not return 404.'

    $postResponse = $http.PostAsync('dashboard-config.js', [System.Net.Http.StringContent]::new('blocked')).GetAwaiter().GetResult()
    Assert-Equal ([int] $postResponse.StatusCode) 405 'Write method was not rejected.'

    $traversalResponse = Send-RawHttpRequest -Port $port -Request "GET /..%2F..%2FWindows/win.ini HTTP/1.1`r`nHost: 127.0.0.1`r`nConnection: close`r`n`r`n"
    if (-not $traversalResponse.StartsWith('HTTP/1.1 403 Forbidden')) {
        throw "Traversal did not return 403. Response: $traversalResponse"
    }

    if (-not $process.WaitForExit(10000)) {
        throw 'Server did not stop after the configured request limit.'
    }
    Assert-Equal $process.ExitCode 0 'Server exited with an error.'

    $workbookHashAfter = Get-SharedFileHashValue -Path $workbookPath
    $workbookMtimeAfter = (Get-Item -LiteralPath $workbookPath).LastWriteTimeUtc
    Assert-Equal $workbookHashAfter $workbookHashBefore 'Workbook content changed during server test.'
    Assert-Equal $workbookMtimeAfter $workbookMtimeBefore 'Workbook modification time changed during server test.'

    Write-Output "PASS local server: shell=$shell loopback=$port GET HEAD 404 405 traversal shutdown hash=$workbookHashAfter"
}
finally {
    if (-not $process.HasExited) {
        $process.Kill($true)
        [void] $process.WaitForExit(5000)
    }
    $process.Dispose()
}
