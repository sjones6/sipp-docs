---
id: middleware
title: Middleware
sidebar_label: Middleware
---

Middleware functions are a central feature in express applications, and allow you to access and transform the incoming request.

Sipp middleware are fully compatible with basic express middleware functions `(req, res, next)` style.

This is important because it can interoperate with any express middleware package (indeed, some of the core functionalities of sipp are provided this way).

# Promise-Based

One addition that Sipp adds on top of express middleware, is the ability to use Promise-based middleware functions. Actually, because of this, you can use any number of parameters:

```typescript
export const reqLoggingMiddleware = (req): void => {
  req.logger.info('received request');
}
```

This allows you to keep your middleware functions clean.

# Middleware Classes

Sipp also exposes a middleware class as a base export.

The primary purpose of the middleware class is to allow for middleware to access dependency injection.