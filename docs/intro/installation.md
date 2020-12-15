---
id: installation
title: Installation
sidebar_label: Installation
---

## 1 Minute Startup

In 1 minute, you can have a bare-bones Sipp application up and running. If you prefer something with more batteries included, jump down to the next section.

If you're in a rush, here's the fastest way to get going (requires a npm v6 or greater):

```bash
npm init sipp {project-name}
```

This will bootstrap a new project, install the dependencies, and even do your first build.

You can then open up the project directory and run `npm run dev` to start your development server.

By default, your application should be running on [`http://localhost:3000`](http://localhost:3000).

## With the Starter Kit

The start kit includes local authentication with passport, database migrations and seed examples, a couple of controllers, and a few views.

#### 1. **Clone the repository**

```bash
git clone https://github.com/sjones6/sipp-starter.git your-site

cd your-site

# clear out the git history
rm -rf .git
git init
```

#### 2. **Install Dependencies**

```bash
npm i
```

#### 3. **Fire it up!**

```bash
npm run dev
```

You should be able to visit `http://localhost:3000` and see your Sipp site running.

#### From Scratch

Coming soon.