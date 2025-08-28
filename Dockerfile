# syntax=docker/dockerfile:1

FROM ruby:3.3-bookworm

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      postgresql-client \
      nodejs \
      curl \
      git && \
    rm -rf /var/lib/apt/lists/*

# Bundler configuration
ENV BUNDLE_APP_CONFIG=/usr/local/bundle \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_JOBS=4 \
    BUNDLE_RETRY=3

WORKDIR /app

# Install latest bundler
RUN gem install bundler

EXPOSE 3000

# Default command suitable for dev; ok if app isn't generated yet
CMD ["bash", "-lc", "bundle check || bundle install && (bin/rails db:prepare || true) && bin/rails server -b 0.0.0.0 -p 3000"]


