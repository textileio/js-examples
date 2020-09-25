import React from 'react'
// @ts-ignore
import { dispatchCustomEvent, ButtonPrimary, ButtonDisabled, GlobalNotification } from 'slate-react-system'
import { PrivateKey } from '@textile/hub'

const Box = require("3box")

type WindowInstanceWithEthereum = Window & typeof globalThis & { ethereum?: any }

class App extends React.Component {
  state = {
    secret: '',
    loggedIn: false,
    working: false
  }
  handleChange = (e: any) => this.setState({ [e.target.name]: e.target.value })

  generatePrivateKey = async (): Promise<PrivateKey> => {

    if (!(window as WindowInstanceWithEthereum).ethereum) {
      throw new Error(
        'Ethereum is not connected. Please download Metamask from https://metamask.io/download.html'
      );
    }

    this.setState({working: true})

    const box = await Box.create((window as WindowInstanceWithEthereum).ethereum)
    const [address] = await (window as WindowInstanceWithEthereum).ethereum.enable()
    await box.auth([], { address })
    const space = await box.openSpace('io-textile-3box-demo')
    await box.syncDone
    let identity: PrivateKey
    try {
      var storedIdent = await space.private.get("ed25519-identity")
      if (storedIdent === null) {
        throw new Error('No identity')
      }
      identity = PrivateKey.fromString(storedIdent)
      return identity
    } catch (e) {
      try {
        identity = PrivateKey.fromRandom()
        const identityString = identity.toString()
        await space.private.set("ed25519-identity", identityString)
      } catch (err) {
        return err.message
      }
    }

    this.createNotification(identity)
    this.setState({loggedIn: true, working: false})

    return identity
  }

  createNotification = (identity: PrivateKey) => {
    dispatchCustomEvent({ name: "create-notification", detail: {
      id: 1,
      description: `PubKey: ${identity.public.toString()}. Your app can now generate and reuse this users PrivateKey for creating user Mailboxes, Threads, and Buckets.`,
      timeout: 5000,
    }})
  }

  render () {
    return (
      <div className="container">
      <GlobalNotification style={{ bottom: 0, right: 0 }} />
        <div className="login">
          {(!this.state.loggedIn && !this.state.working) && 
            <ButtonPrimary full={'true'} onClick={this.generatePrivateKey} >Login with 3Box</ButtonPrimary> }

          {(!this.state.loggedIn && this.state.working) && 
            <ButtonDisabled full={'true'}>Connecting...</ButtonDisabled>
          }

          {(this.state.loggedIn) && 
            <ButtonDisabled full={'true'}>Success!</ButtonDisabled>
          }
        </div>
      </div>
    )
  }
}

export default App
