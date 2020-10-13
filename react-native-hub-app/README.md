## Setup

This project is already setup to run on mobile apps via React Native. All you need to do is `npm install`.

To create your own React Native apps, you can use this example as a guide. In particular, be sure to use the `postinstall` script you'll see in the `package.json`, this postinstall step will create the `shim.js` file you need to run Threads in your React Native. Next, be sure to copy the `import './shim';` line you'll find in `index.js` to the top of your own `index.js`.

### Textile Hub Key & Secret

```
npm install --save react-native-dotenv
mv example.env .env
```

edit `.env`. add your own api key and secret from `hub`, the [Textile Hub CLI](https://docs.textile.io/hub/accounts/).

## App

The app is intentionally simple. All the logic is contained in a single view (`Tests.js`). The view state contains a series of tests, each is run one after the other. After each test runs, the row in the UI for that test is updated with success or failure indicator.

[App Preview](https://github.com/textileio/js-examples/blob/master/react-native-client-app/preview.gif)

## Available Scripts

In the project directory, you can run:

### `npm run android`

Runs the app in the development mode and on the Android emulator. The app will reload if you make edits.

The app should display a series of Tests directly in the UI, those tests should all succeed if you've set the app up correctly.

## Run

```
npm install
npm run android
```

### Critical

Following each install, the `postinstall` step will run to ensure the node methods are added to the global context.

```
    "postinstall": "./node_modules/.bin/rn-nodeify --install fs,path,process,buffer,crypto,stream,vm --hack"
```
