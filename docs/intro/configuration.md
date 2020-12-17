---
id: configuration
title: Configuration
sidebar_label: Configuration
---

Sipp tries to keep the amount of configuration required to run a production-grade application to a minimum.

Any configuration options are centralized into a `config.ts ` object that must adhere to an interface exposed by sipp. 

Your config file will take this shape:

```typescript
import { IAppConfig } from 'sipp';

export const config: IAppConfig = {

  /**
   * Production mode toggles on a protected exception screen, machine-parseable logging,
   * and, importantly, production DB connection
   */
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

  /**
   * Which directory will serve static assets. Relative to the current working directory
   */
  static: 'public',

  /**
   * Settings for session management.
   *
   * See https://www.npmjs.com/package/express-session for options.
   * 
   * For production, you will want to provide a session storage mechanism here.
   */
  session: {
    secret: process.env.SESSION_SECRET,
  },

  /**
   * Settings for CSRF proection.
   *
   * Set to `false` to disable CSRF protection.
   *
   * See https://www.npmjs.com/package/csurf for options
   */
  csrf: {
    cookie: true,
  },

  /**
   * Base Path
   * 
   * A url prefix that is applied to every route - e.g., /v1
   */
  basePath?: '/',

  /**
   * The port to listen on - defaults to 3000
   */
  port?: 3000,

  /**
   * The mode for the logger
   * 
   * Production mode produces machine parseable logs, and also writes to a temporary file
   * development mode produces human friendly console logs
   */
  logMode?: 'production' | 'development' | string;

  /**
   * Completely override with a custom logger.
   * 
   * Must implement the logger interface
   */
  logger?: Logger,

  /**
   * An optional service name that shows up in the production logs
   */
  serviceName?: string
};
```

> Warning! While Sipp is not yet at a v1 release, required configuration values may be added without warning.

## Environment Variables

Sipp uses the [`dotenv`](https://www.npmjs.com/package/dotenv) package to load environment variables off of a `.env` file that is expected to be at the process's current working directory.

It is automatically creates if you used `npm init sipp` to create your application.

Usually, it'll take a format like this:

```
NODE_ENV=development
# ... etc
CONFIG_VALUE=true
```

> Warning! Never, ever check secrets into source control. The .env file should be ignored and any secrets/tokens should be injected into production via a hosting environment variable mechanism.