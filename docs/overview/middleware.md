---
id: middleware
title: Middleware
sidebar_label: Middleware
---

Middleware functions are a central feature in express applications, and allow you to access and transform the incoming request.

Sipp middleware are fully compatible with basic express middleware functions `(req, res, next)` style.

This is important because it can interoperate with any express middleware package (indeed, some of the core functionalities of sipp are provided this way).

## Writing Middleware

### Promise-Based

One addition that Sipp adds on top of express middleware, is the ability to use Promise-based middleware functions. Actually, because of this, you can accept any number of parameters and return a promise or simply perform asynchronouc code:

```typescript
import { Request } from 'express';

export function reqLoggingMiddleware(req: Request): void {
  req.logger.info('received request');
}
```

This allows you to keep your middleware functions clean.

### Middleware Classes

Sipp also exposes a middleware class as a base export.

The primary purpose of the middleware class is to allow for middleware to access dependency injection.

```typescript
import { Middleware, Provide, Body } from 'sipp';
import { Request } from 'express';

export class ValidatePayload extends Middleware {

  @Provide()
  async handle(body: Body): Promise<void> {
    // do something to validate body
  }
}
```

> Important! Whichever format you use, if you accept a `next` callback parameter, you must call it or the request may hang.

## Using Middleware

### Global Application Middleware

There are two sorts of middleware available that can be applied to all routes. While both are applied to all routes, there are some minor differences to be aware of:

1. Global middleware is handled by the global exception handler (not by controller exception handling). Global middleware runs _after_ Sipp's own global middleware is run.
2. Global middleware runs outside of transaction error handling.

You may register global middleware with the application by using the `withGlobalMiddleware` method:

```typescript
import { App } from 'sipp';
import controllers from './controllers';
import { config } from './config';
import { CounterMiddleware, loggingMiddleware } from './middleware';

const app = App.bootstrap(config);

app
  .withGlobalMiddleware(loggingMiddleware, new CounterMiddleware())
  .withControllers(...controllers)
  .wire()
  .then(app => {
    return app.listen()
  });
```

### Application middleware

Much like global middleware, the application middleware runs on all requests. However, if any of the layers of middleware throws an exception, it is passed first to controller exception handling before bubbling up the global exception handler.

```typescript
import { App } from 'sipp';
import controllers from './controllers';
import { config } from './config';
import { CounterMiddleware, loggingMiddleware } from './middleware';

const app = App.bootstrap(config);

app
  .withMiddleware(loggingMiddleware, new CounterMiddleware())
  .withControllers(...controllers)
  .wire()
  .then(app => {
    return app.listen()
  });
```

### Express Middleware

Because Sipp's middleware bindings are fully interoperable with Express middleware, you can take advantage of the large ecosystem of Express middleware. Indeed, some of the core Sipp functionality is provided by some well-known middleware packages.

For example, you might use [Passport](http://www.passportjs.org/) to power an authentication layer:

```typescript

// middleware/auth.ts
export const localAuth = passport.authenticate('local', {
  failureRedirect: '/login',
});

// controllers/AuthController.ts
import { Controller, Post, Apply, Url } from 'sipp';
import { localAuth } from '@app/middleware';

export class AuthController extends Controller {
  basePath = '';

  @Post('login', { name: 'login' })
  @Apply(localAuth)
  login(url: Url) {
    return this.redirect(url.alias('profile'));
  }
```