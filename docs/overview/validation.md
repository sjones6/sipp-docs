---
id: validation
title: Validation
sidebar_label: Validation
---

Validation in Sipp depends on the [class-validator](https://github.com/typestack/class-validator) package to provide validation decorators and powers validation under the hood.

> All validations can be imported from `sipp/validation` rather than from `sipp` directly.

## Applying Validations

Any class can be validated, but a few have built in validation support:

* Models
* Body (request bodies)
* Query (request queries)
* Params (request params)

Let's look at a few examples of validating these

### Model Validation

First, when defining properties on the model, you'll want to include validation decorators for properties to validate:

```typescript
import {
  Model
} from 'sipp';
import { 
  IsEmail
} from 'sipp/validation';


export class User extends Model {

  @IsEmail()
  email: string;

  static tableName = 'users'
}
```

Then, in a controller or middleware, you can apply the validation:

```typescript
import {
  Controller,
  Post
} from 'sipp';
import { User } from '@app/models';
import { UserView } from './users.view';

export class UsersController extends Controller {

  @Post()
  async createUser(user: User): Promise<UserView> {
    const validation = await user.validate();
    if (validation.isValid) {
      await user.save();
      return UserView(user);
    }
    return UserView(user, validation);
  }
}
```

### Query/Body/Parm Validation

First, you'll want to create a class that will serve as a transfer object from the raw query:

```typescript
import {
  Controller,
  Post,
  Query
} from 'sipp';
import { IsNumber, Min, Max } from 'sipp/validation'

class Pagination extends Query {
  @IsNumber()
  @Min(0)
  page: number

  @IsNumber()
  @Min(10)
  @Max(50)
  page_size: number
}

export class PostsController extends Controller {

  @Post()
  async createUser(page: Pagination): Promise<UserView> {
    /* sipp injected a Pagination class into the handler */
    const validation = page.validateSync();
    /* perform paged query */
  }
} 
```

> Note! The dependency injection framework will create a `Pagination` instance from the request `query` automatically since it extends the `Query` class.

### Available Validations

Validations are provided via the [class-validator](https://github.com/typestack/class-validator) package. There are large number of validations available. 

[See the complete list](https://github.com/typestack/class-validator#validation-decorators) of available validation decorators.

## The `ValidationErrorCollection` Class

When you validate a class - calling either `instance.validate()` or `instance.validateSync()`, the response is a `ValidationErrorCollection`.

The `ValidationErrorCollection` exposes a number of methods to make interacting with validation errors easier.

```typescript
interface ValidationErrorCollection {
  isValid(): boolean;
  hasError(propertyName: string): boolean;
  getError(propertyName: string): ValidationError;
  errorMessages(propertyName: string): string[];
}
```

A `ValidationError` takes this shape:

```typescript
type ValidationError ={
    target: Object; // Object that was validated.
    property: string; // Object's property that haven't pass validation.
    value: any; // Value that haven't passed a validation.
    constraints?: { // Constraints that failed validation with error messages.
        [type: string]: string;
    };
    children?: ValidationError[]; // Contains all nested validation errors of the property
}
```

## Showing Validation Errors in Forms

A common application of validation errors is to render them in a form.

A clean way to handle this is to accept the data to show in the form and an optional validation instance.

Here is an example registration form that might show validation errors:

```tsx
import { View, Url, Csrf } from 'sipp';
import { ValidationErrorCollection } from 'sipp/validation';
import { App } from '@app/views';
import { User } from '@app/models';

export class RegistrationView extends App {
  protected title = 'Register';

  constructor(
    private readonly user: User = new User(),
    private readonly validation: ValidationErrorCollection = new ValidationErrorCollection(
      [],
    ),
  ) {
    super();
  }

  @Provide()
  async renderBody(h, url: Url, csrf: Csrf): Promise<string> {
    const { user, validation } = this;
    return (
      <div>
        <h1 class="text-2xl text-gray-800">Login</h1>
          <form action={url.alias('register')} method="post">
            <Input
              label="First Name"
              value={user.first_name || ''}
              name="first_name"
              required
              error={validation.errorMessages('first_name').join(' ')}
            />
            <Input
              label="Last Name"
              value={user.last_name || ''}
              name="last_name"
              required
              error={validation.errorMessages('last_name').join(' ')}
            />
            <Input
              label="Email"
              value={user.email || ''}
              name="email"
              type="email"
              required
              error={validation.errorMessages('email').join(' ')}
            />
            <Input
              label="Password"
              value={''}
              name="password"
              type="password"
              required
              error={validation.errorMessages('password').join(' ')}
            />
            {csrf.csrfField()}
            <Button type="submit" label="Register" />
          </form>
      </div>
    );
  }
}
```

> For more details on creating a template layout like this example, see [more on views](views.md)  

Using this model, you can cleanly handle both an empty state and error state from the controller:

```typescript
import { Controller, Post, Get } from 'sipp';
import { User } from '@app/models';
import { RegistrationView } from './users.view';

export class UsersController extends Controller {

  @Get()
  async showRegistration(): Promise<RegistrationView> {
    return new RegistrationView(new User());
  }

  @Post()
  async registerUser(user: User): Promise<RegistrationView> {
    const validation = await user.validate();
    if (validation.isValid) {
      return this.redirect('login');
    }
    return new RegistrationView(user, validation);
  }
}
```