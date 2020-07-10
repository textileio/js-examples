import {Libp2pCryptoIdentity} from '@textile/threads-core'
// @ts-ignore
import { uniqueNamesGenerator, animals, colors } from 'unique-names-generator'

/**
 * Creates a new random keypair-based Identity
 * 
 * The identity will be cached in the browser for later
 * sessions.
 */
export const getIdentity = (async (): Promise<Libp2pCryptoIdentity> => {
  try {
    var storedIdent = localStorage.getItem("identity")
    if (storedIdent === null) {
      throw new Error('No identity')
    }
    const restored = Libp2pCryptoIdentity.fromString(storedIdent)
    return restored
  }
  catch (e) {
    /**
     * If any error, create a new identity.
     */
    try {
      const identity = await Libp2pCryptoIdentity.fromRandom()
      const identityString = identity.toString()
      localStorage.setItem("identity", identityString)
      return identity
    } catch (err) {
      return err.message
    }
  }
})


export const getUsername = (async (): Promise<string> => {
  try {
    var storedIdent = localStorage.getItem("username")
    if (storedIdent === null) {
      throw new Error('No username')
    }
    return storedIdent
  }
  catch (e) {
    /**
     * If any error, create a new identity.
     */
    try {
      const shortName = uniqueNamesGenerator({ dictionaries: [animals, colors], length: 1}) 
      localStorage.setItem("username", shortName)
      return shortName
    } catch (err) {
      return err.message
    }
  }
})