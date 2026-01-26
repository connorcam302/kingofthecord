# MongoDB Docker Setup

## Quick Start

### Linux/macOS

```bash
docker compose -f docker-compose.mongodb.yml up --build -d
```

### Windows (Command Prompt)

```cmd
docker compose -f docker-compose.mongodb.yml up --build -d
```

### Windows (PowerShell)

```powershell
docker compose -f docker-compose.mongodb.yml up --build -d
```

## Connect to MongoDB

**Connection string:**

```
mongodb://localhost:27017/kingofthecord
```

## Stop MongoDB

```bash
docker compose -f docker-compose.mongodb.yml down
```

## Re-run Initialization

The init script runs automatically when the container first starts. To re-run it:

### Linux/macOS

```bash
docker exec kingofthecord-mongodb /docker-entrypoint-initdb.d/mongo-init.sh
```

### Windows (PowerShell)

```powershell
docker exec kingofthecord-mongodb /docker-entrypoint-initdb.d/mongo-init.sh
```

### Windows (Command Prompt)

```cmd
docker exec kingofthecord-mongodb /docker-entrypoint-initdb.d/mongo-init.sh
```

## Environment Variables

| Variable       | Default         | Description   |
| -------------- | --------------- | ------------- |
| `MONGODB_DB`   | `kingofthecord` | Database name |
| `MONGODB_PORT` | `27017`         | Host port     |

Example with custom port:

```bash
MONGODB_PORT=27018 docker compose -f docker-compose.mongodb.yml up -d
```

## Troubleshooting

### View logs

```bash
docker logs kingofthecord-mongodb
```

### Access MongoDB shell

```bash
docker exec -it kingofthecord-mongodb mongosh
```

### Rebuild from scratch

```bash
docker compose -f docker-compose.mongodb.yml down -v
docker compose -f docker-compose.mongodb.yml up --build -d
```
