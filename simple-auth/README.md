## Basic auth flows

Basic auth flow example nodejs app showing the difference between secure and insecure keys.
This is also a "pure" ES module app to showcase that workflow for Textile modules.

## Textile Hub key & secret

This app uses your developer keys to access the Hub. You'll want to keep these secret! We use
the `dotenv` package here to keep things safe.

```
mv example.env .env
```

Edit `.env`. add your own api key and secret from `hub keys ls`, using the Textile Hub CLI.
You can also create new keys with `hub keys create`. Be sure to create secure keys for production
apps.

## App

The app is intentionally simple. All the logic is contained in a single file. Since it is an ES
module, in newer versions of nodejs, you should be able to run it with:

```
node index.js
```
