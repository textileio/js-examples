import React from 'react'
// @ts-ignore
import { ButtonPrimary, ButtonSecondary, ButtonDisabled, CardTabGroup, Input, Table } from 'slate-react-system'
import { PrivateKey, Users, MailboxEvent, UserMessage } from '@textile/hub'

/** Example identity only. Your users should have their own private keys */
const PrivateKeyIdentity = 'bbaareqhvbkss57bqe7u2jz3hmoitqntbbdflalqbnmtpm7t7yq7ee5rhyvre23iivcvttvguhghjt2ht4i2dan7zak7v7h55yblnd5cbwe3m2'

/**
 * A simple type to hold inbox messages after they have been 
 * decrypted with the PrivateKey
 */
interface DecryptedInbox {
  id: string
  body: string
  from: string
  sent: number
  readAt?: number
}

class App extends React.Component {  
  state = { 
    mailboxes: '1', // manages which tab is selected
    newMessage: '', // holds the message during composition
    inbox: Array<DecryptedInbox>(), // the list of all messages
    ready: false // app state
  }

  client?: Users // Our connected Users API client

  _handleChange = (e: any) => this.setState({ [e.target.name]: e.target.value });

  componentDidMount = async () => {
    // Setup the user's PrivateKey identity
    const identity = PrivateKey.fromString(PrivateKeyIdentity)
    console.log('Your public identity:', identity.public.toString())

    // Connect to the API with hub keys.
    // Use withUserAuth for production.
    this.client = await Users.withKeyInfo({key: 'HUB API KEY HERE'})

    // Authorize the user to access your Huh api
    await this.client.getToken(identity)

    // Setup the user's mailbox
    const mailboxID = await this.client.setupMailbox()

    // Create a listener for all new messages in the inbox
    this.client.watchInbox(mailboxID, this.handleNewMessage)

    // Grab all existing inbox messages and decrypt them locally
    const messages = await this.client.listInboxMessages()
    const inbox = []
    for (const message of messages) {
      inbox.push(await this.messageDecoder(message))
    }

    this.setState({ready: true, inbox})
  }

  /**
   * Decrypts a user's inbox messages using their PrivateKey
   */
  messageDecoder = async (message: UserMessage): Promise<DecryptedInbox> => {
    const identity = PrivateKey.fromString(PrivateKeyIdentity)
    const bytes = await identity.decrypt(message.body)
    const body = new TextDecoder().decode(bytes)
    const {from} = message
    const {readAt} = message
    const {createdAt} = message
    const {id} = message
    return {body, from, readAt, sent: createdAt, id}
  }

  /**
   * Handles a new inbox listen event
   */
  handleNewMessage = async (reply?: MailboxEvent, err?: Error) => {
    if (err) return
    if (!this.client) return
    if (!reply || !reply.message) return
    const message = await this.messageDecoder(reply.message)
    this.setState({
      inbox: [...this.state.inbox, message],
    })
  }

  /**
   * This example will simply send a message to yourself, instead of
   * creating two distinct users.
   */
  sendMessageToSelf = async () => {
    if (!this.state.newMessage || this.state.newMessage === '' || !this.client) return
    const encoded = new TextEncoder().encode(this.state.newMessage)
    const identity = PrivateKey.fromString(PrivateKeyIdentity)
    await this.client.sendMessage(identity, identity.public, encoded)
    this.setState({newMessage: ''})
  }

  /**
   * Remove the message from the inbox
   */
  deleteMessage = async (id: string) => {
    if (!this.client) return
    await this.client.deleteInboxMessage(id)
    this.setState({
      inbox: this.state.inbox.filter((msg) => msg.id !== id)
    })
  }

  renderInbox = () => {
    const rows = this.state.inbox.reverse().map((message, i) => {
      return {
        ...message,
        key: i,
        delete: <ButtonSecondary onClick={() => {
          // Deletes this message from the inbox
          this.deleteMessage(message.id)
        }}>-</ButtonSecondary>
      }
    })
    return (
      <React.Fragment>
        <div className={'inbox'}>
          <Table
            data={{
              columns: [
                { key: "from", name: "From", width: '40%'},
                { key: "body", name: "Message", width: '30%'},
                { key: "sent", name: "Sent", width: '15%'},
                { key: "delete", name: "Delete", width: '15%'},
              ],
              rows: rows,
            }}
            name="inbox"
          />
        </div>
        <div className="filler"></div>
      </React.Fragment>
    )
  }

  renderSentbox = () => {
    return (
      <div className="compose">
        <Input
          label='Send a message to yourself'
          max={40}
          name="newMessage"
          value={this.state.newMessage}
          onChange={this._handleChange}
        />
        {this.state.ready ? <ButtonPrimary full={'true'}onClick={this.sendMessageToSelf}>Send</ButtonPrimary> : <ButtonDisabled full={'true'}>Waiting for API</ButtonDisabled>}
      </div>
    )
  }

  render() {
    const tabs = [
      { value: "1", label: "Send" },
      { value: "2", label: `Inbox (${this.state.inbox.length})` },
    ]
    return (
      <React.Fragment>
        <div className={'container'}>
          <CardTabGroup
            name="mailboxes"
            options={tabs}
            value={this.state.mailboxes}
            onChange={this._handleChange}
          />
          <div className='tab'>
            {this.state.mailboxes === "1" ? this.renderSentbox() : this.renderInbox() }
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default App;
