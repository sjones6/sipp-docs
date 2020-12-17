---
id: connections
title: Database Connections
sidebar_label: Connecting
---

The database connection is managed by [knex](http://knexjs.org/) (which also provides migrations and the query builder powering the ORM)

## Supported Databases

Sipp supports the same databases supported by knex. Currently this list includes

* Postgres 
* MSSQL
* MySQL
* MariaDB
* SQLite3
* Oracle
*  Amazon Redshift

## Configurating Connections

In most cases, you'll have a connection configurations for different environments.

If you've installed Sipp via `npm init sipp` method or from the starter kit, you should find a configuration file in `./db/knexfile.ts` that looks like so:

```typescript
import 'dotenv';
import Knex from 'knex';

/**
 * Development DB Config
 */
export const development: Knex.Config = { /* snip */ };

/**
 * Production DB Config
 */
export const production: Knex.Config = { /* snip */ };
```

> Important: The exported key's `production` and `development` need to match the application `mode` specified in [the configuration](intro/configuration.md).

A production config might look like this:

```typescript
/**
 * Production DB Config
 */
export const production: Knex.Config = {
  client: 'pg',
  connection: {
    port: parseInt(process.env.DATABASE_PORT),
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_ACCESS_KEY,
  },
  pool: {
    min: parseInt(process.env.DATABASE_POOL_MIN),
    max: parseInt(process.env.DATABASE_POOL_MAX),
  },
  migrations,
};
```

> IMPORTANT! Use [environment variables](intro/configuration.md) to pass database credentials into your applications - do not store them in this file!

You can use any configuration options here that are supported by Knex and your database provider.