
import { Client, KeyInfo } from '@textile/hub'
import {Libp2pCryptoIdentity} from '@textile/threads-core';
import {displayIdentity, displayStatus, displayAvatar, displayThreadsList} from './ui'

/**
 * Creates a new random keypair-based Identity
 * 
 * The identity will be cached in the browser for later
 * sessions.
 */
const getIdentity = (async (): Promise<Libp2pCryptoIdentity> => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  try {
    if (urlParams.get('force')) {
      window.history.replaceState({}, document.title, "/");
      throw new Error('Forced new identity')
    }
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
});

class HubClient {

  /** The users unique pki identity */
  id?: Libp2pCryptoIdentity

  /** The Hub API authentication */
  client?: Client

  constructor () {}

  sign = async (buf: Buffer) => {
    if (!this.id) {
      throw Error('No user ID found')
    }
    return this.id.sign(buf)
  }
  setupIdentity = async () => {
    /** Create or get identity */
    this.id = await getIdentity();
    /** Contains the full identity (including private key) */
    const identity = this.id.toString();

    /** Render our avatar */
    displayAvatar(identity)

    /** Get the public key */
    const publicKey = this.id.public.toString();

    /** Display the publicKey short ID */
    displayIdentity(publicKey)
  }

  listThreads = async () => {
    if (!this.client) {
      throw Error('User not authenticated')
    }
    /** Query for all the user's existing threads (expected none) */
    const result = await this.client.listThreads()

    /** Display the results */
    displayThreadsList(JSON.stringify(result.listList));
  }

  /**
   * Provides a mocked login where no api secret is required
   * 
   * see index.html for example running this method
   */
  login = async () => {
    if (!this.id) {
      throw Error('No user ID found')
    }

    
    /**
     * No authentication required, use your insecure key to setup
     * API sessions directly.
     */
    const keys: KeyInfo = {
      key: 'non-signing api key',
      secret: ''
    }

    /**
     * Generate or fetch the API token for your user
     */
    this.client = await Client.withKeyInfo(keys)
    console.log('Verified on Textile API')

    /**
     * Generate or fetch the API token for your user
     */
    await this.client.getToken(this.id)
    console.log('Verified Identity')
    displayStatus();
  }
}

(<any>window).HubClient = HubClient;