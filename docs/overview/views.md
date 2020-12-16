---
id: views
title: Views - Templating in JSX
sidebar_label: Views
---

Sipp uses JSX for it's templating engine.

JSX is compiled into JavaScript functions by the TypeScript compiler, and it allows for complete type-safety while still providing an elegant, HTML-like templating language.

> Remember to use the `.tsx` extension for any file that includes JSX to signal to the TypeScript compiler to expect JSX.

## The Basics

In most cases, you should feel like you're writing HTML - with a few differences.

When rendering a view, you can use plain JSX functions *or* the `View` class. Both patterns are fully correct and supported in Sipp.

The only material difference is that class-based `View`s can take advantage of Sipp's dependency injection via `@Provide()`.

### Functional 

Functional views receive 

```tsx
// users.views.tsx
import { h } from 'sipp';

export function profileView(user: User): string {
  return <html>
    <body>
      <h1>Welcome, {user.first_name}!</h1>
    </body>
  </html>
}
```

Then, call the view function in your controller and return the rendered HTML:
```typescript
// UsersController.ts
import {
  Controller,
  Get
} from 'sipp';
import { User } from '@app/models';
import { profileView } from './users.views';

export class UsersController extends Controller {

  @Get(':id', { name: 'profile' }) // GET: /users/:id
  async getUser(user: User): Promise<string> { 
    return profileView(user);
  }
}
```

### Class-Based

Class-based views must extend the `View` class:

```tsx
// users.views.tsx
import { View } from 'sipp';

export class ProfileView extends View {
  constructor(private readonly user: User) {}

  render(h): string {
    const { user } = this;
    return <html>
      <body>
        <h1>Welcome, {user.first_name}!</h1>
      </body>
    </html>
  }
}
```

(`h` is passed in automatically to the `render` function, so you don't need to export it separately.)

And, called from the controller:
```typescript
// UsersController.ts
import {
  Controller,
  Get
} from 'sipp';
import { User } from '@app/models';
import { ProfileView } from './users.views';

export class UsersController extends Controller {

  @Get(':id', { name: 'profile' }) // GET: /users/:id
  async getUser(user: User): Promise<string> { 
    return new ProfileView(user);
  }
}
```

While this simply looks like more code, it does provide the advantage of being able to support `@Provide` so you can resolve framework and application dependencies into your view's `render` function _without_ needing to pass them from the controller.

This provides a nice separation of concerns between the views and controllers.

## Layouts

Sipp doesn't impose any schema on how you want to create re-useable layouts.

JSX supports defining components, which can be composed together in any way that makes sense to your application. 

### Functional Layouts

Create a template component that renders children into the body (or some other part of the page):

```tsx
// views/template.tsx
export function Template({ title, children }): string {
  return <html>
    <head>
      <title>{ title || 'Your App'}</title>
    </head>
    <body>
      {children}
    </body>
  </html>
}
```

Import your template component and pass the body and any props into the template component:
```tsx
// users.views.tsx
import { h } from 'sipp';
import { Template } from '@app/views/template';

export function profileView(user: User): string {
  return <Template title={`${user.first_name}'s User Profile`}>
      <h1>Welcome, {user.first_name}!</h1>
    </Template>
}
```

You can of course split your template into smaller components like a re-useable nav bar or footer.

> **Warning!** While this may seem simpler, the drawback of this approach is that _any_ view that uses the template needs to pass all of it's depdencies - which also means the controller needs to resolve and pass those into the view render function. This can mean that you are importing a lot of stuff in your controller just to pass it to the view.

If you find this is the case, you may want to use class-based layouts.

### Class-Based Layouts

Class-based layouts offer the advantage of allowing you to use Sipp's dependency injection in your view templates.

This can help decouple things required by a template (e.g., Session messages, authenticated user, etc) from the handling required by a controller.

In this pattern, you would first create a base view class:

```tsx
// views/template.tsx
import { View, Url, Provide } from 'sipp';

export class TemplateView extends View {
  constructor(private readonly title: string) {}

  @Provide()
  public async render(h, url: Url): Promise<string> {
    return <html>
      <head>
        <title>{this.title}</title>
      </head>
      <body>
        <nav>
          <a href={url.alias('home')}>Home</a>
        </nav>
        {await this.renderBody(h)}
      </body>
      <footer>
        {await this.renderFooter(h)}
      </footer>
    </html>
  }

  // these methods can be overriden by children to insert specific content into the template
  protected async renderBody(h, ...args: any[]): Promise<string> {
    return '';
  }
  protected async renderFooter(h, ...args: any[]): Promise<string> {
    return '';
  }
}
```

Then, extend the view class, but override the functions provided by the parent class to inject content into the page:
```tsx
// users.views.tsx
import { Url, Provide } from 'sipp';
import { TemplateView } from '@app/views';

export class ProfileView extends TemplateView {
  constructor(private readonly user: User) {}

  @Provide()
  async renderBody(h, url: Url): Promise<string> {
    // notice: sipp takes care of resolving the dependency on Url here
    const { user } = this;
    return <div>
      <h1>Welcome, {user.first_name}!</h1>
      <a href={url.alias('user.edit', { id: user.id })}>edit your information</a>
    </div>
  }
}
```

## Components

The full power of JSX is at your disposal, so you are free to create any components or view partials using the tools that JSX provides.

```tsx
import { View } from 'sipp';

function Button({ label }: { label: string }) {
  // "class" is correct in Sipp!
  return <button class="btn btn-primary">{label}</button>
}

export class ProfileView extends View {
  constructor(private readonly user: User) {}

  render(h): string {
    const { user } = this;
    return <html>
      <body>
        <h1>Welcome, {user.first_name}!</h1>
        {/* render a custom component */}
        <Button label="Logout" />
      </body>
    </html>
  }
}
```

## On React Flavored JSX

Since React is close to browser-executed JavaScript, it uses the JavaScript HTML Element APIs for properties. For instance, you use `className` instead of `class`.

> Warning! **Sipp uses standard html property names.** `class` is used instead of `className`.

```tsx
function Button(label) {
  // "class" is correct in Sipp!
  return <button class="btn btn-primary">{label}</button>
}
```

## Cross-Site Scripting (XSS)

You are responsible for sanitizing any user-entered input that you render into HTML via the `view`.
