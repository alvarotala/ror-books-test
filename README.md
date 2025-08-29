## Docker-based Development

No local installs required. Use Docker for Rails web server and PostgreSQL.

### Prerequisites
- Docker Desktop

### First-time setup (if app not generated yet)
```bash
docker compose run --rm web bash -lc "rails new . --force --database=postgresql && bundle install"
```

### Configure database.yml (only if missing)
Set adapter and host env via `DATABASE_URL` or use this minimal config:
```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  url: <%= ENV.fetch("DATABASE_URL") %>

development:
  <<: *default
  database: ror_books_dev
```

### Start services
```bash
docker compose up --build
```

### Create/prepare database
```bash
docker compose exec web bash -lc "bin/rails db:prepare"
```

### Seed data (optional)
```bash
docker compose exec web bash -lc 'bin/rails db:prepare && bin/rails db:seed'
```

### Open Rails console
```bash
docker compose exec web bash -lc "bin/rails console"
```

### Run tests (RSpec)
```bash
docker compose exec web bash -lc "bundle exec rspec"
```

### Prepare test DB (RSpec)
```bash
docker compose exec web bash -lc "unset DATABASE_URL; RAILS_ENV=test bin/rails db:environment:set RAILS_ENV=test && RAILS_ENV=test bin/rails db:prepare"
```

### Check logs
Stream the web container logs (includes Rails server output):
```bash
docker compose logs -f web
docker compose logs -f frontend
```

Tail the Rails development log file:
```bash
docker compose exec web bash -lc 'tail -f log/development.log'
```

### Restart the web service
```bash
docker compose restart web
docker compose restart frontend
```

### Start all services

Frontend: http://localhost:5173
API: http://localhost:3000


```bash
cd ror-books-test
docker compose up -d
```
Demo credentials:
Librarian: librarian@example.com / password123
Member: member@example.com / password123



### Seed Bestsellers Books

```bash
docker compose exec web bash -lc "bin/rails db:seed_bestsellers"
```


