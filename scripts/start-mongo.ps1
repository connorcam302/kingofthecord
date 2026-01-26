#!/usr/bin/env pwsh
# Run MongoDB Docker Compose (Windows version)

$ErrorActionPreference = "Stop"

# Check if running in PowerShell
if ($PSVersionTable.PSVersion.Major -lt 6) {
    Write-Warning "PowerShell 6+ recommended for best compatibility"
}

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Set environment variables
$env:MONGODB_DB ??= "kingofthecord"
$env:MONGODB_PORT ??= "27017"

Write-Host "Building and starting MongoDB..."
docker compose -f (Join-Path $scriptDir "docker-compose.mongodb.yml") up --build -d

Write-Host "MongoDB is starting..."
Write-Host "Connect string: mongodb://localhost:$($env:MONGODB_PORT)/$($env:MONGODB_DB)"
