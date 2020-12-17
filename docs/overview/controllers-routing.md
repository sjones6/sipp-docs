---
id: controllers-routing
title: Controllers & Routing
sidebar_label: Controllers & Routing
---

Sipp controllers are classes that include routing and route handlers.

## Controller Basics

### The `Controller` Class

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

### Base Path

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

### Middleware

You can set middleware on either the controller, which will apply to all routes handled by the controller, or on an individual controller method itself.

The `ApplyAll(...)` decorator applies middleware to all routes.

`Apply(...)` decorator applies middleware to a single route.

```typescript 
import {
  Controller,
  Get,
  Apply,
  ApplyAll
} from 'sipp';
import { authenticatedMiddleware, enforceAdminMiddleware } from '@app/middleware';

@ApplyAll(authenticatedMiddleware)
export class UsersController extends Controller {

  @Get('/:id')
  @Apply(enforceAdminMiddleware)
  async getUser(): User {
    return /* */;
  }

  @Get('/:id/friends')
  async getUser(): User {
    return /* */;
  }
}
```

See [the full write up on middleware](middleware.md) for more info.

### Registering Your Controller with Sipp

Each controller must be registered with Sipp in order to have it's routes bound to the application.

```typescript
import { UsersController, AuthController, /* etc */ } from './controllers';

app.withControllers(
  new UsersController(),
  new AuthController(),
  /* etc */
)
```

## Routing

Sipp provides a number of decorators that can be used to register routes to be handled by your controller.

### Binding Routes

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

### Named Routes

You can provide a route alias for your routes. This is particularly helpful when constructing Urls in your views so that you don't have to remember a fully qualified path but can simply resolve a route by it's alias.

```typescript
import {
  Controller,
  Get,
} from 'sipp';

export class UsersController extends Controller {

  @Get(':id', { name: 'profile' }) // GET: /users/:id
  async getUser(): User { 

    /* sometime later */
    url.alias('profile', { id: 1 }); // returns /users/1
  }
}
```

### Request Responses

Sipp does it's best to resolve the return value from your controller route handler into a network response. In most cases, this is pretty straightforward.

Here are some common things you might do:

```typescript
import {
  Controller,
  Get,
} from 'sipp';
import { User } from '@app/models';
import { ShowUserView } from './users.views';

export class UsersController extends Controller {

  @Get(':id', { name: 'profile' }) // GET: /users/:id
  async getUser(user: User): User { 

    // 204 No Content
    return undefined;
    return null;

    // simple text response
    return 'ok';

    // json response with the user
    return user;

    // render HTML showing the user
    return new ShowUserView(user);

    // download the user as a JSON file
    return this.download(user);

    // redirect to another route
    return this.redirect(`/user/${user.id}/data`);
  }
}
```

The most common use cases will be rendering a view or sending back some JSON. See the section on [views](views.md) for more information on how to render a view in Sipp.

## Dependency Injection

For any method decorated with a route binding, Sipp will inject dependencies into your handling function according to what you have type-hinted in the function.

> This makes your handlers extremely powerful and flexible. You can type-hint all sorts of things that you need to handle the request.

### System-Provided Dependencies

> Important! You must use a **class/constructor** object for type-hints; you cannot use TypeScript interfaces.

The reason that you must use classes is that the dependencies for a function are resolved at runtime in JavaScript; and TypeScript interfaces don't exist in the JavaScript runtime but only at compile time.

Sipp comes with a number of built-in resolvers that you can use to help handle requests:

```typescript
import {
  Controller,
  Get,
  Query
} from 'sipp';

export class UsersController extends Controller {

  @Get(':id', { name: 'profile' }) // GET: /users/:id
  async getUser(query: Query): User { 
    if (query.page > 0) {
      /* etc */
    }
  }
}
```

The following framework classes can be injected:

**`Body`**: the request body

**`Csrf`**: CSRF request protection wrapper (including CSRF token)

**`Headers`**: request header

**`Logger`**: request logger

**`Params`**: request route parameters

**`Query`**: query params

**`Req`**: a slim wrapper around the `express.Request` object. You shouldn't use this unless you need to do lower level operations.

**`Res`**: a slim wrapper around the `express.ServerResponse` object. You shouldn't use this unless you need to do lower level operations

**`Session`**: the current request session information

**`Url`**: can create qualified Urls (to named routes or static assets)

You can also extend some classes and receive an instance of your child class; this is possible with `Body`, `Query`, `Headers`, and `Params`. This is especially helpful to validate parts of the request.

```typescript
import {
  Controller,
  Post,
  Body
} from 'sipp';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'sipp/validation';

// not this is a class! Not an Interface!
class RegistrationPayload extends Body {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @MinLength(8)
  @MaxLength(24)
  @IsString()
  password: string
}

export class UsersController extends Controller {

  @Post('register', { name: 'register' }) // GET: /users/:id
  async handleRegistration(registration: RegistrationPayload) { 
    const validation = await registration.validate();
    if (validation.isValid) {
      // register the user
    }
    // registration invalid ... handle errors
  }
}
```

If you require more custom handling than simply newing up an instance of your class, take a look at registering your [own service provider](providers.md).

### Models

Sipp is able to resolve models from the database into your controller handler, just by type-hinting that you need a model.

#### `GET` or `DELETE` with an ID in a route parameter

For a `GET` request with an ID parameter, Sipp will attempt to look up the model from the database by it's ID and pass it into your handler. This saves you all of the database querying to find a record by ID. 

```typescript
import { Controller, Get, Delete } from 'sipp';
import { User } from '@app/models';

export class UsersController extends Controller {

  @Get(':user') // GET: /users/:user
  async getUser(user: User): Promise<User> { 
    return user;
  }

  @Delete(':user') // DELETE: /users/:user
  async deleteUser(user: User): Promise<User> { 
    // delete the user...
    await user.query().delete();
    return user;
  }
}
```

Sipp first looks for an ID in the route parameters that matches the model's lowercased name and then falls back to `id`. So, a model `User` would match a route parameter called `:user` or `:id`. 

If the record cannot be found, then a `NotFoundException` is thrown.

> The Model's eager relationships are eager loaded when fetched so they're available to your controller method automatically.

#### `PUT` or `PATCH` with an ID in a route parameter

For a `PUT` or `PATCH` request with an ID parameter, Sipp will attempt to look up the model from the database by it's ID (just like in a `GET`) but it will then merge in the request `body` into the model object.

```typescript
import { Controller, Put, Patch } from 'sipp';
import { User } from '@app/models';

export class UsersController extends Controller {

  @Put(':user') // Put: /users/:user
  async updateUser(user: User): Promise<User> { 
    // update the user
    return user;
  }

  @Patch(':user') // Patch: /users/:user
  async patchUser(user: User): Promise<User> { 
    // patch the user
    return user;
  }
}
```
> Note! As a security precaution, Sipp will only fill properties that are marked "fillable". See more in the section on [models](models.md).

> Important! **Sipp does not persist the changes**!

You are still responsible to actually trigger a save to the database. This allows you to run validations before attempting to persist. Here's a more complete example:

```typescript
import { Controller, Put, Session, Logger } from 'sipp';
import { User } from '@app/models';
import { ProfileView } from './users.views';

export class UserController extends Controller {
  @Put(':user')
  async updateUser(user: User) {

    // validate() returns an instance of ValidationErrorCollection
    const validation = await user.validate();
    if (validation.isValid) {
      await user.save();
      return new ProfileView(user);
    }
    return new ProfileView(user, validation);
  }
}
```

#### `POST` Requests (no existing record)

For a `POST` request, the instance is created from the request `body`. Only properties that have been marked `fillable` are pulled from the body.

```typescript
import { Controller, Post } from 'sipp';
import { User } from '@app/models';
import { ProfileView, RegistrationView } from './users.views';

export class UserController extends Controller {
  @Post()
  async createUser(user: User): Promise<ProfileView, RegistrationView> {
    const validation = await user.validate();
    if (validation.isValid) {
      await user.save();
      return new ProfileView(user);
    }
    return new RegistrationView(user, validation);
  }
}
```

## Helper Methods

The controller provides a number of helpful methods on the prototype to help you handle requests.

### Redirects

You can use the `redirect` method to redirect the user to another part of the application.

```typescript
import { Controller, Post } from 'sipp';
import { User } from '@app/models';
import { ProfileView, RegistrationView } from './users.views';

export class UserController extends Controller {
  @Post()
  async createUser(user: User) {
    await user.save();
    return this.redirect('/login');
  }
}
```

By default, it returns a 302 redirect, but you can supply an additional status like so: `redirect(route, 301)`;

### Download Responses

The `download` method allows you to return any number of things that result in a download response.

```typescript
import { Controller, Post } from 'sipp';
import { User } from '@app/models';

export class UserController extends Controller {
  @Post()
  async createUser(user: User) {

    // download a file off the file system
    return this.download('/path/to/file.ext', 'downloadname.ext', 'mime-type/optional');

        // download a file from a read stream
    return this.download(getReadStream(), , 'downloadname.ext', 'mime-type/optional');
    
    // download a JSON file of the User model
    return this.download(user, 'user.json');
  }
}
```