---
id: migrations
title: Migrations
sidebar_label: Migrations
---

Database migrations are provided via [knex migrations](http://knexjs.org/#Migrations).

## Writing Migrations

### Generating a Migration File

You can use the knex CLI to create migrations:

```bash
npx knex migrate:make migration_name
```

Knex will create a stubbed migration file in `./db/migrations`, and prefix it with a date timestamp.

A basic migration includes an `up` and a `down` step. It's best practice to include both.

### Schema Builder

Knex's schema builder allows for expressive migrations. Here's an example creating a users table:

```typescript
import * as Knex from 'knex';

const tableName = 'users';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(tableName, function (table) {
    table.increments('id').primary();
    table.string('first_name', 255).notNullable();
    table.string('last_name', 255).notNullable();
    table.string('email', 255).unique().index().notNullable();
    table.string('password', 255).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(tableName);
}
```

> Note! See the [Schema Builder](http://knexjs.org/#Schema) documentation for a deep dive on options available during schema building.

## Running Migrations

### Build First, then migrate!

Migrations are written in TypeScript but executed in TypeScript.

You need to run a build before running migrations. 

```bash
npm run build # compile the app
npx knex migrate:latest --env production
```

This will run the migrations that have not yet been run as a batch. 

### Rolling Back

If you ever need to roll a group of migrations back, you can run the following:

```bash
npx knex migrate:rollback
```

This rolls back the most recently migrated batch (via `migrate:latest`).