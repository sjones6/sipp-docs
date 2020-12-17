---
id: transactions
title: Database Transactions
sidebar_label: Transactions
---

Transactions are an important part of maintaining data integrity in your application.

## Transaction Middleware

This is the preferred way to implement transaction handling.

In most cases, you'll be able to use the transaction middleware to easily and transparently wire up a transaction for the cycle of handling a request. This includes any database mutations done by middleware, controllers, or elsewhere in your application code.

```typescript
import { transacting, Controller, Post, ApplyAll } from 'sipp';
import { User, Team } from '@app/models';

@ApplyAll(transacting) // apply transactions for all routes
export class UsersController extends Controller {

  @Post()
  async createUser(user: User): User {
    await user.save();
    user.$relatedQuery('team_members').insert({ user_id: user.id });
    return user;
  }
}
```

Sipp will automatically commit the transaction if the controller method succeeds, or rollback if an unhandled exception is thrown somewhere along the path.

## Manual Transaction Wiring

You can use [Objection's transaction handling](https://vincit.github.io/objection.js/guide/transactions.html#creating-a-transaction).

However, if you choose this route, you'll need to handle passing the transaction into the query methods as well as committing and/or rolling back.