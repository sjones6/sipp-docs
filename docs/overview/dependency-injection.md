---
id: dependency-injection
title: Dependency Injection
sidebar_label: Dependency Injection
---

Dependency injection can help decouple various parts of the application.

By this point, you have seen a few different examples of dependency injection throughout the documentation.

## Automatic Dependency Resolution

One of the most powerful things about Sipp's dependency injection capabilities is that you merely have to type-hint what you want, and Sipp takes care of the rest. 

For instance, let's look at an example in a controller:

```typescript
import { Controller, Get } from 'sipp';
import { User } from '@app/models';

export class UsersController extends Controller {

  @Get(':user')
  async getUser(user: User): Promise<User> {
    return user;
  }
}
```

In this method, Sipp knows that the handler for this `GET` request expects a `User` model instance.

At runtime, Sipp inspects the expected parameters and resolves all of them before calling your handling function.

## Using the `@Provide()` decorator

While dependency injection is automatically available for controller handlers, you can indicate that parameters should be resolved for methods on other classes, like middleware or views, by using the `@Provide()` decorator.

Let's consider some middleware:

```typescript
import { Middleware, Provide, Body } from 'sipp';
import { Tenant } from '@app/models';
import { Request } from 'express';

export class FindTenantMiddleware extends Middleware {
  @Provide()
  async handle(body: Body): Promise<void> {
    body.tenant = await Tenant.findById(body.tenant_id);
  }
}
```

We're injecting the request body into the middleware and then doing some async work to find a tenant.

## Custom Providers

You can extend the dependency resolution mechanism to resolve any class, not just the ones provided by Sipp.

See the secion on [service providers](providers.md).

## A Peak Under the Hood

In order for dependency injection to work, Sipp takes advantage of a few TypeScript features:

1. `emitDecoratorMetadata`: this compiler flag will emit references to the classes (constructors) in method parameters and return values
2. [`reflect-metadata`](https://www.npmjs.com/package/reflect-metadata) allows you to attach metadata to classes and methods

This means that there are a few limitations:

1. It requires a _method_ on a class. It does not work with bare functions.
2. The method must be `async` - dependency resolution may be async.
