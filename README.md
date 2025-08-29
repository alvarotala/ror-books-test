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

### Prepare test DB (RSpec)
```bash
docker compose exec web bash -lc "unset DATABASE_URL; RAILS_ENV=test bin/rails db:environment:set RAILS_ENV=test && RAILS_ENV=test bin/rails db:prepare"
```

### Run tests (RSpec)
```bash
docker compose exec web bash -lc "bundle exec rspec"
```

### Frontend tests (Vitest)

Run in Docker (recommended):
```bash
docker compose exec frontend sh -lc "npm ci || npm i; npm run test:run"
```

Watch mode in Docker:
```bash
docker compose exec frontend sh -lc "npm run test"
```

Coverage in Docker:
```bash
docker compose exec frontend sh -lc "npm run coverage"
```

Run locally (outside Docker):
```bash
cd frontend
npm ci
npm run test:run
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
Member 1: megan@example.com / password123
Member 2: john@example.com / password123



### Seed Bestsellers Books

```bash
docker compose exec web bash -lc "bin/rails db:seed_bestsellers"
```


### Continuous Integration (GitHub Actions)

Two workflows are included in `.github/workflows`:
- `frontend-tests.yml`: runs `npm ci` and `npm run coverage` in `frontend/`, uploads coverage artifact.
- `backend-tests.yml`: provisions Postgres 16, prepares test DB, runs `bundle exec rspec`, uploads coverage artifact.

Triggers:
- On pull requests to any branch.
- On push to `main` or `master`.

How to trigger:
```bash
git checkout -b ci-smoke-test
git commit --allow-empty -m "CI: smoke test"
git push -u origin ci-smoke-test
# open a PR on GitHub
```

Viewing results:
- Go to the “Actions” tab in your repository.
- Open the latest run for “Frontend Tests” or “Backend Tests”.
- Download `frontend-coverage` or `backend-coverage` artifact to inspect coverage locally (open `index.html`).


