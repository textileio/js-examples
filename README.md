# js-examples

All code here is used as reference in the main documentation page, [docs.textile.io](https://docs.textile.io).

## Issues & Support

Please open all issues on [textileio/js-textile](https://github.com/textileio/js-textile/issues) and the name or link to the specific example you are debugging.

## Progress

**Warning** **These examples are in the process of being updated**. The following list reflects demos ready to use:

- [x] React Native Hub App (Threads & Buckets)
- [x] Browser example storing user files in Buckets
- [x] Browser example with API Auth Provider
- [x] User identities from Metamask Eth address

**Note**

The chat demo, hub-threaddb-chat, has been temporarily deprecated until we complete the [threads refactor](https://github.com/textileio/js-threads/issues/414) project.

> Examples and demos using Textile's Javascript/Typescript libraries and clients.

### User buckets photo gallery example

This example users non-signing keys for development mode. Here, you'll create a new user and then give them an interface to upload files to their own bucket.

You can read about key generation here: https://docs.textile.io/hub/apis/.

Next, you will need to update the example to use your Hub API key, https://github.com/textileio/js-examples/blob/master/bucket-photo-gallery/src/App.tsx#L19.

Note: you will want to use a signing key if you use this example for a production application. Read more about that process here, https://docs.textile.io/tutorials/hub/production-auth/.

#### Build & serve

Change directories into the `bucket-photo-galleries` repo.

```bash
npm run start
```

Your browser should automatically launch to the app running on [localhost:3001](http://localhost:3001).

## Textile Hub Authentication

This example includes two Typescript projects. A server in `src/server` and a client in `src/client`. The example demonstrates how to use the [Textile Hub](https://docs.textile.io/) APIs from the Browser using user identities and **user group keys**.

Read the full tutorial accompanying this example on [docs.textile.io](https://docs.textile.io).

The rest of the instructions take place from the `./hub-browser-auth-app` folder.

#### WARNING

_Do not share any API Key Secrets. This includes User Group Key secret and Account key Secrets. Be sure you never commit them into public repos or share them in published apps._

### Configure

Create a `.env` file in the root of your project. Ensure you never check this file into your repo or share it, it contains your User Group Key Secret.

```bash
cp example.env .env
```

Then replace the `USER_API_KEY` and `USER_API_SECRET` values with those you create using the Textile Hub and your own account or org (see [docs.textile.io](https://docs.textile.io) for details).

### Setup

```bash
npm install
```

### Clean

```bash
npm run clean
```

### Run basic auth client

In this example, you can see how to create a basic user auth flow:

* the user is defined by a simple keypair created in the browser on demand.
* the user is then granted access to the developer's hub resources through the use of API keys.
* the user can then access their own thread APIs to begin creating threads and buckets.

The client code is available in `src/basic`.

#### Build & serve

You can run the server and client in development mode by opening two terminal windows. 

**Terminal 1: watch the client code**

```bash
npm run start:basic
```

**Terminal 2: start the dev server**

```bash
npm run start:server
```

You can now view the example at [localhost:3001](http://localhost:3001).
