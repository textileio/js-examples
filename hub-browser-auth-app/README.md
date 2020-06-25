# Textile Hub Web App Example

This example includes two Typescript projects. A server in `src/server` and a client in `src/client`. The example demonstrates how to use the [Textile Hub](https://docs.textile.io/) APIs from the Browser using user identities and **user group keys**.

Read the full tutorial accompanying this example on [docs.textile.io](https://docs.textile.io).

#### WARNING

_Do not share any API Key Secrets. This includes User Group Key secret and Account key Secrets. Be sure you never commit them into public repos or share them in published apps._

## Configure

Create a `.env` file in the root of your project. Ensure you never check this file into your repo or share it, it contains your User Group Key Secret.

```bash
cp example.env .env
```

Then replace the `USER_API_KEY` and `USER_API_SECRET` values with those you create using the Textile Hub and your own account or org (see [docs.textile.io](https://docs.textile.io) for details).

## Setup

```bash
npm install
```

### Build all examples

The Server and Client code will be written to folders in `dist/`

```bash
npm run build
```

### Clean

```bash
npm run clean
```

## Running examples

The examples here are organized such that there are multiple available application examples that each use the same single server example. In the default configuration, you can only run one app example at a time.

### Basic user auth example

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

### Dropzone bucket example

This example will build upon the auth example above. Here, you'll create a new user and then give them an interface to upload files to their own bucket.

Unlike the simple auth example, the client application here is a React app. Therefore, a completely new project is contained in the client source code, available in `src/dropzone`. You need to start both our existing `server` and the react app. `dropzone/src/setupProxy.js` will tell the react app to use the server as its backend.

#### Build & serve

**Terminal 1: start the dev server**

```bash
npm run start:server
```

**Terminal 2: start the react app**

```bash
npm run install:dropzone
npm run start:dropzone
```

The server will be running on [localhost:3001](http://localhost:3001) but your browser should automatically launch to the react app running on [localhost:3001](http://localhost:3001).
