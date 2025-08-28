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

### Open Rails console
```bash
docker compose exec web bash -lc "bin/rails console"
```

### Run tests (RSpec)
```bash
docker compose exec web bash -lc "bundle exec rspec"
```

App will be available at http://localhost:3000
