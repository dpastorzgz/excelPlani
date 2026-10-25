[CmdletBinding()]
param(
    [Parameter()]
    [ValidateRange(0, 65535)]
    [int] $Port = 0,

    [Parameter()]
    [ValidateRange(1, 1440)]
    [int] $IdleTimeoutMinutes = 30,

    [Parameter()]
    [string] $Root = $PSScriptRoot,

    [Parameter()]
    [switch] $NoBrowser,

    [Parameter(DontShow = $true)]
    [ValidateRange(0, 10000)]
    [int] $MaxRequests = 0,

    [Parameter(DontShow = $true)]
    [ValidateRange(0, 3600)]
    [int] $IdleTimeoutSeconds = 0
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-ContentType {
    param([Parameter(Mandatory = $true)][string] $Path)

    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        '.html' { return 'text/html; charset=utf-8' }
        '.css'  { return 'text/css; charset=utf-8' }
        '.js'   { return 'text/javascript; charset=utf-8' }
        '.mjs'  { return 'text/javascript; charset=utf-8' }
        '.json' { return 'application/json; charset=utf-8' }
        '.txt'  { return 'text/plain; charset=utf-8' }
        '.svg'  { return 'image/svg+xml' }
        '.png'  { return 'image/png' }
        '.xlsx' { return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        '.xlsm' { return 'application/vnd.ms-excel.sheet.macroEnabled.12' }
        default { return 'application/octet-stream' }
    }
}

function Read-SharedFileBytes {
    param([Parameter(Mandatory = $true)][string] $Path)

    for ($attempt = 1; $attempt -le 3; $attempt += 1) {
        $before = Get-Item -LiteralPath $Path
        $stream = $null
        $memory = $null
        try {
            $share = [System.IO.FileShare]::ReadWrite -bor [System.IO.FileShare]::Delete
            $stream = [System.IO.FileStream]::new(
                $Path,
                [System.IO.FileMode]::Open,
                [System.IO.FileAccess]::Read,
                $share
            )
            $memory = [System.IO.MemoryStream]::new()
            $stream.CopyTo($memory)
            $content = $memory.ToArray()
        }
        finally {
            if ($null -ne $memory) { $memory.Dispose() }
            if ($null -ne $stream) { $stream.Dispose() }
        }

        $after = Get-Item -LiteralPath $Path
        if ($before.Length -eq $after.Length -and $before.LastWriteTimeUtc -eq $after.LastWriteTimeUtc) {
            return $content
        }
        Start-Sleep -Milliseconds 100
    }

    throw [System.IO.IOException]::new('The file changed while it was being read. Retry after saving it.')
}

function Write-HttpResponse {
    param(
        [Parameter(Mandatory = $true)][System.IO.Stream] $Stream,
        [Parameter(Mandatory = $true)][int] $StatusCode,
        [Parameter(Mandatory = $true)][string] $Reason,
        [Parameter(Mandatory = $true)][string] $ContentType,
        [Parameter(Mandatory = $true)][byte[]] $Body,
        [Parameter(Mandatory = $true)][bool] $IncludeBody
    )

    $headers = @(
        "HTTP/1.1 $StatusCode $Reason",
        "Content-Type: $ContentType",
        "Content-Length: $($Body.Length)",
        'Connection: close',
        "Content-Security-Policy: default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
        'X-Content-Type-Options: nosniff',
        'Referrer-Policy: no-referrer',
        'Cache-Control: no-store',
        '',
        ''
    ) -join "`r`n"

    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
    $Stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($IncludeBody -and $Body.Length -gt 0) {
        $Stream.Write($Body, 0, $Body.Length)
    }
    $Stream.Flush()
}

function New-ErrorBody {
    param([Parameter(Mandatory = $true)][string] $Message)
    return [System.Text.Encoding]::UTF8.GetBytes($Message)
}

$resolvedRoot = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Root).Path)
$rootPrefix = $resolvedRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$requestCount = 0
$lastActivity = [System.DateTime]::UtcNow

try {
    $listener.Start()
    $boundPort = ([System.Net.IPEndPoint] $listener.LocalEndpoint).Port
    $dashboardUrl = "http://127.0.0.1:$boundPort/dashboard.html"
    Write-Output "DASHBOARD_URL=$dashboardUrl"

    if (-not $NoBrowser) {
        Start-Process $dashboardUrl
    }

    while ($true) {
        if ($MaxRequests -gt 0 -and $requestCount -ge $MaxRequests) {
            break
        }
        $idleDuration = [System.DateTime]::UtcNow - $lastActivity
        $idleExpired = if ($IdleTimeoutSeconds -gt 0) {
            $idleDuration.TotalSeconds -ge $IdleTimeoutSeconds
        }
        else {
            $idleDuration.TotalMinutes -ge $IdleTimeoutMinutes
        }
        if ($idleExpired) {
            Write-Output 'DASHBOARD_SERVER_STOP=idle-timeout'
            break
        }
        if (-not $listener.Pending()) {
            Start-Sleep -Milliseconds 50
            continue
        }

        $client = $listener.AcceptTcpClient()
        $requestCount += 1
        $lastActivity = [System.DateTime]::UtcNow
        $stream = $null
        $reader = $null

        try {
            $client.ReceiveTimeout = 5000
            $client.SendTimeout = 5000
            $stream = $client.GetStream()
            $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
            $requestLine = $reader.ReadLine()

            while ($null -ne ($headerLine = $reader.ReadLine()) -and $headerLine.Length -gt 0) {
                # Headers are intentionally ignored; the server is read-only and stateless.
            }

            if ([string]::IsNullOrWhiteSpace($requestLine)) {
                Write-HttpResponse -Stream $stream -StatusCode 400 -Reason 'Bad Request' -ContentType 'text/plain; charset=utf-8' -Body (New-ErrorBody 'Bad Request') -IncludeBody $true
                continue
            }

            $requestParts = $requestLine.Split(' ')
            if ($requestParts.Count -ne 3) {
                Write-HttpResponse -Stream $stream -StatusCode 400 -Reason 'Bad Request' -ContentType 'text/plain; charset=utf-8' -Body (New-ErrorBody 'Bad Request') -IncludeBody $true
                continue
            }

            $method = $requestParts[0].ToUpperInvariant()
            if ($method -notin @('GET', 'HEAD')) {
                Write-HttpResponse -Stream $stream -StatusCode 405 -Reason 'Method Not Allowed' -ContentType 'text/plain; charset=utf-8' -Body (New-ErrorBody 'Method Not Allowed') -IncludeBody $true
                continue
            }

            try {
                $rawPath = $requestParts[1].Split('?')[0]
                $decodedPath = [System.Uri]::UnescapeDataString($rawPath)
                if ($decodedPath.Contains([char] 0) -or $decodedPath.Contains('\')) {
                    throw [System.UnauthorizedAccessException]::new('Invalid request path.')
                }

                $relativePath = $decodedPath.TrimStart('/')
                if ([string]::IsNullOrEmpty($relativePath)) {
                    $relativePath = 'dashboard.html'
                }
                $candidatePath = [System.IO.Path]::GetFullPath((Join-Path $resolvedRoot $relativePath))
                if (-not $candidatePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                    throw [System.UnauthorizedAccessException]::new('Path traversal rejected.')
                }
            }
            catch [System.UnauthorizedAccessException] {
                Write-HttpResponse -Stream $stream -StatusCode 403 -Reason 'Forbidden' -ContentType 'text/plain; charset=utf-8' -Body (New-ErrorBody 'Forbidden') -IncludeBody ($method -eq 'GET')
                continue
            }
            catch {
                Write-HttpResponse -Stream $stream -StatusCode 400 -Reason 'Bad Request' -ContentType 'text/plain; charset=utf-8' -Body (New-ErrorBody 'Bad Request') -IncludeBody ($method -eq 'GET')
                continue
            }

            if (-not [System.IO.File]::Exists($candidatePath)) {
                Write-HttpResponse -Stream $stream -StatusCode 404 -Reason 'Not Found' -ContentType 'text/plain; charset=utf-8' -Body (New-ErrorBody 'Not Found') -IncludeBody ($method -eq 'GET')
                continue
            }

            try {
                $content = Read-SharedFileBytes -Path $candidatePath
            }
            catch [System.IO.IOException] {
                Write-HttpResponse -Stream $stream -StatusCode 423 -Reason 'Locked' -ContentType 'text/plain; charset=utf-8' -Body (New-ErrorBody 'Locked') -IncludeBody ($method -eq 'GET')
                continue
            }
            Write-HttpResponse -Stream $stream -StatusCode 200 -Reason 'OK' -ContentType (Get-ContentType -Path $candidatePath) -Body $content -IncludeBody ($method -eq 'GET')
        }
        catch {
            $requestError = $_
            if ($null -ne $stream -and $stream.CanWrite) {
                try {
                    Write-HttpResponse -Stream $stream -StatusCode 500 -Reason 'Internal Server Error' -ContentType 'text/plain; charset=utf-8' -Body (New-ErrorBody 'Internal Server Error') -IncludeBody $true
                }
                catch {
                    # El cliente puede cerrar la conexión mientras recibe un activo grande.
                }
            }
            Write-Warning "Request closed before completion: $($requestError.Exception.Message)"
        }
        finally {
            if ($null -ne $reader) { $reader.Dispose() }
            if ($null -ne $stream) { $stream.Dispose() }
            $client.Dispose()
        }
    }
}
finally {
    $listener.Stop()
}
