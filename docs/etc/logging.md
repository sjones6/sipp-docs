---
id: logging
title: Logging
sidebar_label: Logging
---

Sipp provides a logger that uses [winston](https://github.com/winstonjs/winston) under the hood.

## Log Levels

The logger includes the following the levels:

* emergency
* alert
* critical
* error
* warning
* notice
* info
* debug

Each log level is available via a method on the logger: `logger.alert('Uh oh!');`

## Accessing the Logger

The logger is available via the dependency injection mechanism:

```typescript
import { Controller, Get, Logger, Middleware, Provide } from 'sipp';

// SomeMiddleware.ts
class SomeMiddleware extends Middleware {
  @Provide()
  async handle(logger: Logger) {
    logger.notice('middleware');
  }
}

// SomeContoller.ts
class SomeController extends Controller {
  @Get()
  async getSome(logger: Logger): void {
    logger.notice('controller');
  }
}
```

## Log Scoping

During a request lifecycle, Sipp automatically generates and attaches a request ID to the request. This ID is also attached to logger scope so that each log line can be traced back to a specific request.

You can add additional scope to the logger with `logger.addScope({ ... })`:

```typescript
import { Logger, Middleware, Provide } from 'sipp';

// SomeMiddleware.ts
class SomeMiddleware extends Middleware {
  @Provide()
  async handle(logger: Logger) {
    logger.addScope({ signed: 'middleware' });
  }
}
```

> Note! Scope is only rendered for the production logger. It will show up as `key="value"` in the log line along with the message.

## Custom Logger

You are welcome to extend and create your owner logger.

```typescript
// custom-logger.ts

import { Logger } from 'sipp';

export class MyLogger extends Logger {
  
  /* etc */
}
```

The logger can then be passed into the application via the [configuration](intro/configuration.md).