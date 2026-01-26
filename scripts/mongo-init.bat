@echo off
REM MongoDB init script - restores data on first run (Windows CMD version)

setlocal EnableDelayedExpansion

set MONGODB_DB=kingofthecord

echo Checking if restoration is needed...

REM Check if database has data
for /f %%i in ('mongosh --quiet --eval "db.getSiblingDB('%MONGODB_DB%').getCollectionNames().length"') do set DOC_COUNT=%%i

if "%DOC_COUNT%"=="0" (
    echo Database is empty. Restoring from dumps...
    mongorestore --drop --nsInclude="%MONGODB_DB%.*" /dumps/
    echo Restore complete!
) else (
    echo Database already has data. Skipping restore.
    for /f %%i in ('mongosh --quiet --eval "db.getSiblingDB('%MONGODB_DB%').getCollectionNames().join(', ')"') do set COLLECTIONS=%%i
    echo Collections: !COLLECTIONS!
)

endlocal
