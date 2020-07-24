## Setup

This project is already setup to run on in the browser. All you need to do is `npm install`, and then `npm run start`... almost! Read on for further steps.

### Textile Hub Key & Secret

In order to run your own app, you'll want to use your own app keys. You can create these from the Textile CLI. Check out the docs for details here:

- https://docs.textile.io/tutorials/hub/development-mode/
- https://docs.textile.io/tutorials/hub/user-thread-database/

Then you'll update the environment variables in your deployed app (or if using insecure keys, you can embed them directly, _not shown_):

```
mv example.env .env
```

edit `.env`. add your own api key and secret from `hub keys create`, via the Textile Hub CLI.

## App

The app is intentionally simple. All the logic is contained in two files (`App.tsx` and `ThreadService.ts`). We highly recommend you read those files, pick through the doc strings, and explore the room creation and join flow. This is by no means best practices for building web-apps, but it is easy to follow!

## Available Scripts

In the project directory, you can run:

### `npm run start`

Which fires up the development server. This allows you to do hot reload, debugging, and all the nice things that React Scripts provides. This is a regular React app, bootstrapped with create-react-app, so you can see that documentation (https://github.com/facebook/create-react-app) for further details.
