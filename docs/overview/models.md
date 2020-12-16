---
id: models
title: Models
sidebar_label: Models
---

Sipp leans heavily on some amazing packages to provide a stellar ORM experience.

The Model wrapper is a light wrapper around [ObjectionJS](https://vincit.github.io/objection.js/). In many cases, especially for query building, you'll interact with Objection's methods directly.

Objection uses [knex](http://knexjs.org/) for it's query-building experience.

(You'll also notice knex show up in the migrations and database connections.)

## The Basics

### Extending the `Model` Class

Your models should extend Sipp's `Model` class. This will allow you to tap into Sipp's behavior around automatic model resolution and dependency injection, as well as transactions.

```typescript
import { Model } from 'sipp';

export class User extends Model {
  static tableName = 'users';

  email: string;
  password: string;
}
```

## Defining Relationships

[ObjectionJS](https://vincit.github.io/objection.js/guide/relations.html#examples) allows you to define relationships with other models, which allows you to query relationships using ORM methods:

In order to do this, you'll want to fill com

### Circular Relationships

It's very common for relationships to be circular (e.g., a user writes posts and posts have an author). Due to the constraints of how node handles circular dependencies, you can use the following strategy to play nicely with both TypeScript and the Node runtime:

First, export the models from your `models/index` file:
```typescript
// models/index.ts
export * from './User';
export * from './Post';
```

Then, when defining relationships, reference the imported `index` and use a static getter to define the relationships:
```typescript
// models/User.ts
import { Model } from 'sipp';
import Models from '.'

export class User extends Model {
  static tableName = 'users';

  email: string;
  password: string;

  posts?: Models.Post[];

  static get relationMappings() {

    // it's important both to use a static getter function as well as 
    // reference related models from the Models aggregate.
    const { Posts } = Models;
    return {
      posts: {
        relation: Model.HasManyRelation,
        modelClass: Posts,
        join: {
          from: `${User.tableName}.id`,
          to: `${Post.tableName}.user_id`,
        },
      }
    }
  }
}
```

### Eager Relationships

Sipp provides a method, `Model.load()` to query a model and automatically load all of it's relationships.

Sometimes you might not want to load *every* relationship when eager loading.

> Note! Sipp calls `load` when resolving models that are injected into Controllers and elsewhere.

```typescript
// models/User.ts
import { Model } from 'sipp';
import Models from '.'

export class User extends Model {
  static tableName = 'users';

  email: string;
  password: string;

  posts?: Models.Post[];
  comments?: Models.Comments[];

  static eager(): string | false {

    // disable eager loading
    return false;

    // return a string that contains the names of the relationships
    // the names should correlate to keys in the `relationMappings` definition.
    return 'posts comments';
  }

  static get relationMappings() {
    return { 
      posts: /* etc */
      comments: /* etc */,
      ...
    }
  }
}
```

## Validating

The Sipp model implementions the Sipp validation interface, so you can use the validation decorators to provide easy validation for your models.

### Defining Validations

When you define properties on the model, you can decorate those properties with validators:

```typescript
import {
  Model
} from 'sipp';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
} from 'sipp/validation';

// not this is a class! Not an Interface!
class User extends Model {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @MinLength(8)
  @MaxLength(24)
  @IsString()
  password: string
}
```

Then, you can call `modelInstance.validate()` at any point and receive back a `ValidationErrorCollection` instance. See the [validation](validation.md) section for more info on interacting with the validation result.

### Available Validations

Validations are provided via the [class-validator](https://github.com/typestack/class-validator) package. There are large number of validations available. 

[See the complete list](https://github.com/typestack/class-validator#validation-decorators) of available validation decorators.


## Querying

In most cases, you will quickly pass-through to using Objection methods directly. You can reference [the Objection documentation on query building](https://vincit.github.io/objection.js/api/query-builder/find-methods.html). Here are a few examples:

### Reading

```typescript
import { User } from '@app/models';

// gets all users in the table
const allUsers = await User.query();

// gets one user with an id of 1
const user = await User.query().findById(1);

// same as above, different method
const user = await User.query().findOne('id', 1);

// same as above, different method
const user = await User.query().where('id', 1).first();

// all users with a first_name of Alice
const user = await User.query().where('first_name', 'Alice');
```

### Writing

```typescript
import { User } from '@app/models';

// create a new model
const user = new User();
user.first_name = 'Jane';
user.last_name = 'Doe';
await user.save();

// alternative method to create a new model
const user = await User.query().insert({ first_name: 'Jane', last_name: 'Doe' });

// gets one user with an id of 1, and update
const user = await User.query().findById(1);
user.first_name = 'Bill';
await user.save();

// updates a user all in one query
await User.query().findById(1).patch({ first_name: 'Bill' });
```
