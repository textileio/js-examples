# Publish to a bucket from NPM

## Install

```sh
npm install @textile/buck-util
```

## Configure

Next, add a `publish` script to your `package.json`. See the package.json in this folder for example. Determine where you `npm run build` step outputs, below assumes it outputs to a folder called, `build`. The publish script is of the form: `buck-util push {BUILD-FOLDER}`.

```
...
  "publish": "buck-util push build",
...
```

## Add secrets

Create a `.env` file in the root of your project. This file should be included in `.gitignore` and not shared publically. You can see `env.example` as a guide. 

- API key and secret: generate a new Account Key with the Hub CLI
- Thread: This is ID of the Thread where you will push your bucket. You can manually create your bucket the first time (`hub buck init`) and copy the thread id from there. It looks like, `bafkt2uayur6cxo6oyskpebtrbttahktppoeuvs43myytqzz3oer5bca`.
- Bucket name: A static name for the bucket you are pushing. It should match the one you create with `hub buck init`.

## Publish

Run `npm run publish` to push updates from your build folder.

