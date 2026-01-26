# MongoDB init script - restores data on first run (Windows/PowerShell version)

param(
    [string]$MONGODB_DB = "kingofthecord"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking if restoration is needed..."

# Check if database has data
$docCount = mongosh --quiet --eval "db.getSiblingDB('$MONGODB_DB').getCollectionNames().length"

if ([int]$docCount -eq 0) {
    Write-Host "Database is empty. Restoring from dumps..."
    mongorestore --drop --nsInclude="${MONGODB_DB}.*" /dumps/
    Write-Host "Restore complete!"
} else {
    Write-Host "Database already has data. Skipping restore."
    $collections = mongosh --quiet --eval "db.getSiblingDB('$MONGODB_DB').getCollectionNames().join(', ')"
    Write-Host "Collections: $collections"
}
