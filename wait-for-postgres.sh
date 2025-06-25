#!/bin/sh
# Wait for PostgreSQL to be ready

set -e

host="$1"
shift

until pg_isready -h "$host" -p 5432; do
  echo "Waiting for postgres at $host:5432..."
  sleep 1
done

exec "$@"
