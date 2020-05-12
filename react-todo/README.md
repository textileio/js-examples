# Threads Todo Demo

This project is Textile's take on the classic React todo app demo. It uses [Create React App](https://github.com/facebook/create-react-app) with Typescript, with [Semantic UI](https://react.semantic-ui.com) React components for styling, and [Mobx](https://mobx.js.org) for reactive state management. But most importantly, it uses Textile's [Threads Store API](https://github.com/textileio/js-threads-client) to create, store, manage, and distribute the underlying app data. The data is encrypted and pushed to IPFS via Threads, with only a few extra lines of code!


## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Note

You shouldn't have to "eject" this app to use the advanced features used here, but that script is available if you want it.

## Learn More

Visit Textile's [Bounty Resources Page](https://blog.textile.io/ethden-2020-textile-bounty-resources/) for more information about Getting Started.

## Create a React Native App

Initialize a new application

```
react-native init <app-name>
cd <app-name>
```

**Install Nodeify**

This is required as a number of dependencies require global variables like Buffer, crypto, and others.

```
npm install --save rn-nodeify
npx react-native link
npm install
```

**Pod Install**

```
cd ios
pod install
cd ..
```

**Enable streams and events**

```
npm install --save events  stream readable-stream
```

**Postinstall shim**

The following postinstall script will keep your shim (for Buffer, crypto, etc) working. Add this to your `scripts` array in `package.json`.

```
  "postinstall": "./node_modules/.bin/rn-nodeify --install fs,path,process,buffer,crypto,stream,vm --hack"
```

And import the generated shim file (`/shim.js` in your app root directory) in your primary file, `index.js` first line.

```
import './shim';
```


**Bind for android**

I find it helpful to have this script in my `package.json` for quickly binding the local thread daemon port if needed.

```
    "bind": "adb reverse tcp:6007 tcp:6007",
```