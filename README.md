# js-examples

All code here is used as reference in the main documentation page, [docs.textile.io](https://docs.textile.io).

## Issues & Support

Please open all issues on [textileio/js-textile](https://github.com/textileio/js-textile/issues) and the name or link to the specific example you are debugging.

## Use

You can find each stand-alone example in each of the subdirectories.

**Note**

The chat demo, hub-threaddb-chat, has been temporarily deprecated until we complete the [threads refactor](https://github.com/textileio/js-threads/issues/414) project.

> Examples and demos using Textile's Javascript/Typescript libraries and clients.

### bucket-photo-gallery - setup user buckets to hold files

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

### hub-browser-auth-app - shows the full client/server setup to using signed api keys

This example includes two Typescript projects. A server in `src/server` and a client in `src/client`. The example demonstrates how to use the [Textile Hub](https://docs.textile.io/) APIs from the Browser using user identities and **user group keys**.

Read the full tutorial accompanying this example on [docs.textile.io](https://docs.textile.io).

To run, you need to first copy the `example.env` folder to `.env`. Next, you need to update the key and secret fields with values you create using the Hub CLI.

#### WARNING

_Do not share any API Key Secrets. This includes User Group Key secret and Account key Secrets. Be sure you never commit them into public repos or share them in published apps._

#### Configure

Create a `.env` file in the root of your project. Ensure you never check this file into your repo or share it, it contains your User Group Key Secret.

```bash
cp example.env .env
```

Then replace the `USER_API_KEY` and `USER_API_SECRET` values with those you create using the Textile Hub and your own account or org (see [docs.textile.io](https://docs.textile.io) for details).

#### Setup

```bash
npm install
```

#### Clean

```bash
npm run clean
```

#### Run basic auth client

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



### user-mailbox-setup - demonstrates how to setup the user mailbox api

This example uses a hard-coded PrivateKey as your first user's identity. It then uses the User API to enable the user's mailbox. Instead of setting up a second user, it will just send messages from the user to themselves.

To use this example, you must create a Hub API key and update the code to use it.

### react-native-hub-app - demonstrates both bucket and thread functionality in react native

Like many of the examples, start by copying `example.env` to `.env` and filling our key and secret values from your own Hub account.

The example, when run, will go through a series of examples that set up user identity, threads, and then buckets with the Textile Hub.

### metamask-identities-ed25519 - a password based privatekey generation workflow for textile identities

This example will use a user's Ethereum address and signing API from Metamask to create a new ed25519 private key identity. It does this in combination with a user supplied password. Your app never needs to store the password or private key, as the user can regenerate them at any time.

You can use the identity created with any example above, your own apps, and with any Textile API for your user identities.

### 3box-identities-ed25519

Similar to the above example, this example uses 3Box to derive the private key based on the user's ethereum account. It uses the box api to store the private key value on 3Box's server so it can be fetched at a future time.

You can use the identity created with any example above, your own apps, and with any Textile API for your user identities.
