---
id: typescript
title: TypeScript
sidebar_label: TypeScript
---

TypeScript is a central pillar of Sipp development.

Apart from adding types to JavaScript, TypeScript supplies a number of things that Sipp takes advantage of. You'll notice these features sprinkled throughout Sipp applications.

## Decorators

While decorators are popular in other languages, they have not been officially adopted by JavaScript (although a proposal has existed for a few years).

Decorators can be used for classes, methods (class functions), parameters in a function, or properties of a class.

Decorators are preceeded with the `@` symbol.

Sipp uses decorators for routing, like so:

```typescript
import { Get, Controller } from 'sipp';

export class UsersController extends Controller {

  // The @Get decorator will register a route for GET /users
  // which will be handled by the getUserList method
  @Get()
  async getUserList() {
    /* */
  }
}
```

Decorators are also used to power 

> Checkout the [official TypeScript documenation](https://www.typescriptlang.org/docs/handbook/decorators.html) on decorators

## JSX

> Contrary to popular opinion, React popularized JSX but JSX is not bound to React.

Sipp templates are composed using JSX, which is compiled natively using the TypeScript compiler's built-in ability to handle JSX.

This means that your templates are compiled into JS functions at build time! 

Your views are also completely TypeSafe, and you are able to strongly type the relationship between your controllers and views.

## Reflection

Reflection is another API that is popular in other language paradigms, but not in the JavaScript ecosystem.

A [popular npm package `reflect-metadata`](https://www.npmjs.com/package/reflect-metadata) implements the reflection API.

Primarily, reflection is used to enable dependency injection into methods. In most cases, you don't need to interact with reflection directly.