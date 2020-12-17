---
id: providers
title: Service Providers
sidebar_label: Service Providers
---

Service providers enable you to extend Sipp's built in dependency injection capabilities. Service providers are capable of resolving a class (constructor) object into an instance of that class. 

Service providers can serve as factories - creating a new instance at every resolution - or resolve with singletons.

## Writing a Service Provider

A service provider must extend the `ServiceProvider` class. 

The service provider then implements a `register` method that is able to register resolvers with the Sipp injection mechanism.

```typescript
import { ServiceProvider, Req } from 'sipp';

export class AuthServiceProvider extends ServiceProvider {
  public register(registerProvider: IServiceRegistryFn) {
    registerProvider('*', Auth, async (resolve) => {
      const req = (await resolve(Req)) as Req;
      return new Auth(req.req.user);
    });
  }
}
```

The `registerProvider` method function that is passed into the `register` method takes 3 parameters: `registerProvider(scope, Type, factoryFn)`. Let's take a closer look at these parameters.

### Resolution Scope

The scope indicates what types of classes this provider serves. You can indicate a global resolver with the special string `'*'`. You can also pass one or more classes:

```typescript
import { View, Controller, Middleware } from 'sipp';

// global resolver
registerProvider('*', Auth, async (resolve): Promise<Auth> => { });

// only for views
registerProvider([View], Auth, async (resolve): Promise<Auth> => { });

// for views and middleware
registerProvider([Middleware, Controller], Auth async (resolve): Promise<Auth> => { });
```

### Resolved Class

The resolved class can be either a base class *or* a class that extends the base class. For instance, let's suppose your class structure reflects this hierarchy:

```typescript

class BaseClass {}

class AChild extends BaseClass {}
class BChild extends BaseClass {}

registerProvider('*', BaseClass, async (resolve): Promise<BaseClass> => { });
```

The provider's resolution function could be triggered if someone requested class `AChild`:

```typescript
@Provide()
async fn(a: AChild) {
}
```

To account for this, the class being resolved is passed into the factory function as the second parameter.

For a use case where this comes in handy, see below on different email service providers.

### Factory Function

The third and final parameter of the service provider registration is a factory function which resolves with an instance of the requested class *or* undefined.

```typescript
registerProvider('*', BaseClass, async (resolve, Type): Promise<BaseClass> => {
  
  // returning undefined signals that no resolution was found.
  // another resolver might be able to handle.
  // If no resolver can handler, it will throw.
  if (cannotResolve) {
    return undefined;
  }

  // The class being resolved may extend BaseClass
  if (Type === SomeTypeThatExtendsBaseClass) {
    return new Type(...args)
  }

  // or it may be the exact class
  return new BaseClass();

  // you may call `resolve` in order to resolve some other class
  // from another service provider
  const foo = await resolve(FooClass);
  return new Type(foo);
});
```

## Use Cases

## Injecting Data into Every View

It's common that *every* view in your application needs to have some sort of shared state (e.g., the authenticated user).

Let's say you have a template view that looks like this:

```tsx
// views/template.tsx
import { Auth } from '@app/auth';
import { View, Url, Provide } from 'sipp';
import { PublicNav, PrivateNav } from './partials';

export class TemplateView extends View {
  constructor(private readonly title: string) {}

  @Provide()
  public async render(h, auth: Auth): Promise<string> {
    return <html>
      <head>
        <title>{this.title}</title>
      </head>
      <body>
        {auth.user ? <PrivateNav user={auth.user} /> : <PublicNav />}
        {await this.renderBody(h)}
      </body>
      <footer>
        {await this.renderFooter(h)}
      </footer>
    </html>
  }
}
```

> See [class-based template](overview/../../overview/views.md) section for more info on creating a re-useable template like this one.

Your service provider might look like so:

```typescript
import { ServiceProvider, Req } from 'sipp';

export class AuthViewServiceProvider extends ServiceProvider {
  public register(registerProvider: IServiceRegistryFn) {
    registerProvider('*', Auth, async (resolve) => {
      const req = (await resolve(Req)) as Req;
      return new Auth(req.req.user);
    });
  }
}
```

Now, the template can receive the authentication state but pages that use this template don't need to know of or be aware of authentication.

## Decoupling from Concrete Implementations

Your application most likely needs to generate emails. Locally, you may want to use one implementation for development but a different provider in production.

```typescript
import { ServiceProvider, Req } from 'sipp';
import { Emailer, SmtpEmailer, SendgridEmailer } from '@app/services';

export class EmailServiceProvider extends ServiceProvider {

  /**
   * Emailer is our base class that both SmtpEmailer and SendgridEmailer extend
   */
  private emailer: Emailer;

  constructor(isProductionMode = false): void {
    super();

    // email is a singleton stored on this class instance
    this.emailer = isProductionMode ? new SendgridEmailer() : new SmtpEmailer();
  }
  public register(registerProvider: IServiceRegistryFn) {
    registerProvider('*', Emailer, async () => this.emailer);
  }
}
```

In your controller, you simply need to request the `Emailer`:

```typescript
import { Controller, Post } from 'sipp';
import { User } from '@app/models';
import { Emailer } from '@app/services';

export class UsersController extends Controller {

  async registerUser(user: User, emailer: Emailer): Promise<User> {
    /* create user */
    await emailer.send(user.email, `You've registered for our app!`);

    /* etc */
  }
}
```
