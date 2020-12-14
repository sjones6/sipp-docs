---
id: controllers-routing
title: Controllers & Routing
sidebar_label: Controllers & Routing
---

Sipp controllers are classes that include routing and route handlers.

# The `Controller` Class

Sipp provides a base controller class that your controllers must extend:

```typescript
import { Controller, Get } from 'sipp';
import { User } from '../models';

export class UsersController extends Controller {

  @Get('/:id') // registers a GET: /users/:id method
  async getUser(): User {
    return /* */;
  }
}
```

# Base Path

Sipp uses the controller class name to set a default base path that is prepended to any registered routes. For instance, the `UsersController` has a default base path of `users`.

You can override the base path by setting the `basePath` property:

```typescript
export class UsersController extends Controller {
  basePath = 'people'

  @Get('/:id') // registers a GET: /people/:id method
  async getUser(): User {
    return /* */;
  }
}
```

# Routing

Sipp provides a number of decorators that can be used to register routes to be handled by your controller:

```typescript
import {
  Delete,
  Get,
  Head,
  Options
  Patch,
  Post,
  Put,
} from 'sipp';

export class UsersController extends Controller {

  // the basepath is implicitly /users

  @Get() // GET: /users/
  async getUsers(): User[] { /* */ }

  @Get(':id') // GET: /users/:id
  async getUser(): User { /* */ }

  @Post() // POST: /users
  async createUser(): User {}

  @Put(':id') // PUT: /users/:id
  async updateUser(): User { /* */ }

  @Patch(':id') // PATCH: /users/:id
  async patchUser(): User { /* */ }

  @Delete(':id') // DELETE: /users/:id
  async deleteUser(): User { /* */ }

  @Head() // HEAD: /users
  async headUsers(): User { /* */ }

  @Options() // OPTIONS: /users
  async optUsers(): User { /* */ }
}
```

# Dependency Injection

Coming soon.

# Registering Your Controller with Sipp

Each controller must be registered with Sipp in order to have it's routes bound to the application.

```typescript
import { UsersController, AuthController } from './controllers';

app.withControllers(new UsersController(), new AuthController())
```