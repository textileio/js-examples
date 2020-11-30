import hub from '@textile/hub'
import dotenv from 'dotenv'
import fs from 'fs'

// Read from .env file
dotenv.config()

// Default to hub api.
const API = process.env.API || undefined
// Pull out required modules
const { Client, PrivateKey, createUserAuth } = hub

/**
 * Create random identity for testing.
 * @param string The exported string of the user identity. If undefined will write new key to .env.
 */
function identity (string = undefined) {
  if (string) return PrivateKey.fromString(string)
  // Create a new one if this is the first time
  const id = PrivateKey.fromRandom()
  // Write it to the file for use next time
  fs.appendFileSync('.env', `APP_IDENTITY=${id.toString()}`)
  return id
}

/**
 * Main async function.
 * @param insecure Should be true if the user group key is an insecure key
 * (i.e., doesn't require auth signature), false otherwise.
 */
async function main (insecure = true) {
  let client
  if (insecure) {
    // If using insecure keys, we can stick with jut key info.
    client = await Client.withKeyInfo(
      {
        key: process.env.APP_API_KEY,
        secret: process.env.APP_API_SECRET
      },
      API,
      process.env.NODE_ENV !== 'production'
    )
  } else {
    // Create user auth object with auth signature valid for 30 minutes.
    client = Client.withUserAuth(await createUserAuth(
      process.env.APP_API_KEY, // User group key
      process.env.APP_API_SECRET // User group key secret
    ),
    API,
    process.env.NODE_ENV !== 'production'
    )
  }
  // Now that we have the pertinent metadata, authenticate user with hub.
  await client.getToken(identity(process.env.APP_IDENTITY))
}

// Run main async program.
main(false)
