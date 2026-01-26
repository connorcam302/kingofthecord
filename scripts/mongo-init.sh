#!/bin/bash
# MongoDB init script - restores data on first run
#
# Usage:
#   Linux/Mac:     ./mongo-init.sh
#   Windows:       pwsh ./mongo-init.ps1

set -e

echo "Checking if restoration is needed..."

# Check if database has data
DOC_COUNT=$(mongosh --quiet --eval "db.getSiblingDB('${MONGODB_DB:-kingofthecord}').getCollectionNames().length")

if [ "$DOC_COUNT" -eq 0 ]; then
    echo "Database is empty. Restoring from dumps..."
    mongorestore --drop --nsInclude="${MONGODB_DB:-kingofthecord}.*" /dumps/
    echo "Restore complete!"
else
    echo "Database already has data. Skipping restore."
    echo "Collections: $(mongosh --quiet --eval "db.getSiblingDB('${MONGODB_DB:-kingofthecord}').getCollectionNames().join(', ')")"
fi
