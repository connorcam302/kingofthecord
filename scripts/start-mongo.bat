@echo off
REM Run MongoDB Docker Compose (Windows CMD version)

setlocal

set MONGODB_DB=kingofthecord
set MONGODB_PORT=27017

echo Building and starting MongoDB...
docker compose -f "%~dp0docker-compose.mongodb.yml" up --build -d

echo MongoDB is starting...
echo Connect string: mongodb://localhost:%MONGODB_PORT%/%MONGODB_DB%

endlocal
