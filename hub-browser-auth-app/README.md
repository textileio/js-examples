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

## Run

### Setup

```bash
npm install
```

### Build

The Server and Client code will be written to folders in `dist/`

```bash
npm run build
```

### Develop

Watch changes in Server/Client and rebuild dist. Start the server from `dist/server`.

**Terminal 1**

```bash
npm run watch
```

**Terminal 2**

```bash
npm run dev:serve
```

Visit the app at [http://localhost:3001](http://localhost:3001).

### Clean

```bash
npm run clean
```
