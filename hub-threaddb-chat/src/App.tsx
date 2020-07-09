import React from 'react'
import { Button, Modal, InputGroup, FormControl } from 'react-bootstrap'
// @ts-ignore
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {ThreadID} from '@textile/hub'
import logo from './logo.svg'
import './App.css'
import { ChatInstance, ChatState } from './types'
import { ChatContext } from './ChatContext'
import { getUsername } from './helpers'

class App extends React.Component {
  static contextType = ChatContext;
  private username = React.createRef()
  private textInput = React.createRef()
  private messagesEnd = React.createRef()
  state: ChatState = {
    /**
     * We'll use the ChatInstance so they match our thread schema right away.
     * This first message wont actually be written to the chat.
     */
    messages: [
      {
        _id: '',
        text: 'Welcome! Type a message and press Send Message to continue the chat.',
        author: 'Bot'
      }
    ],
    input: '',
    username: 'unknown'
  }

  setupObservables = () => {
    const observable = this.context.onMessage();

    observable.subscribe((threadEvent: any) => {
      const m: ChatInstance = threadEvent.event.patch;
      let messages = this.state.messages;

      messages.push(m);
      this.setState({ messages: messages });
    });
  }
  componentDidMount () {
    //initiate thread connection
    this.context.init().then(() => {
      this.setupObservables()
      let room = window.location.hash.replace('#', '');
      if (room && room !== '') {
        this.context.rejoinOpenRoom().then((threadID: ThreadID) => {
          this.setRoom(threadID)
        })
      } 
    })
    getUsername().then((username) => {
      this.setState({username})
    })
  }

  componentDidUpdate(prevProps: any, prevState: ChatState) {
    if (prevState.messages.length < this.state.messages.length) {
      this.scrollToBottom()
    }
  }

  componentWillUnmount () {
    this.context.disconnect();
  }

  setRoom(threadID: ThreadID) {
    this.context.getInfoString().then((info: string) => {
      const b = Buffer.from(info)
      this.setState({invite: b.toString('hex')})
    })
    this.setState({
      threadID,
    })
  }
  createNewRoom () {
    this.context.startNewRoom().then(this.setRoom.bind(this))
  }
  joinInvite() {
    // @ts-ignore
    const info = this.textInput.current.value
    if (info === '') {
      throw new Error('Invite required to join')
    }
    const json = Buffer.from(info, 'hex').toString()
    const invite = JSON.parse(json)
    this.context.joinExternalRoom(invite).then(this.setRoom.bind(this))
  }
  scrollToBottom = () => {
    // @ts-ignore
    this.messagesEnd.scrollIntoView({ behavior: "smooth" })
  }
  renderUsername() {
    return (
      <p>
        username:
        {/* 
          // @ts-ignore */}
        <FormControl defaultValue={this.state.username} ref={this.username}/>
      </p>
    )
  }
  renderSend() {
    const handleMessage = (): void => {
      if (this.state.input !== '') {
        this.context.send({
          _id: '',
          text: this.state.input,
          // @ts-ignore
          author: this.username.current.value
        });
        this.setState({ input: '' });
      }
    }
    return (
      <p>
        <button onClick={() => { handleMessage() }}>
          Send Message
        </button>
      </p>
    )
  }
  renderInput () {
    const updateInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({ input: e.target.value });
    }
    return (
      <input
        className="App-Textarea"
        placeholder="Type your messsage here..."
        onChange={updateInput}
        value={this.state.input}
      />
    )
  }

  renderChat () {
    return (
      <div className="App-chatbox">
        {this.state.messages.map((msg: ChatInstance, idx: number) => {
          return (
            <div key={idx}>
              <p>{msg.author}</p>
              <p>
                {msg.text}
              </p>
            </div>
          );
        })}

        {/* 
          // @ts-ignore */}
        <div style={{ float:"left", clear: "both" }} ref={this.messagesEnd}>
        </div>
      </div>
    )
  }

  renderModal () {
    return (
      <Modal show={this.state.threadID === undefined} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Start Chat
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <InputGroup>
          {/* 
          // @ts-ignore */}
          <FormControl as="textarea" ref={this.textInput}/>
        </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={this.joinInvite.bind(this)}>Join Invite</Button>
          <Button onClick={this.createNewRoom.bind(this)}>Create New Room</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  renderInvite() {
    return (
      <p>
        <CopyToClipboard text={this.state.invite} >
          <button>Copy invite clipboard</button>
        </CopyToClipboard>
      </p>
    )
  }

  render () {

    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo" />
        {this.state.threadID && this.renderUsername()}
        {this.state.threadID && this.renderChat()}
        {this.state.threadID && this.renderInput()}
        {this.state.threadID && this.renderSend()}
        {this.state.threadID && this.renderInvite()}
        {!this.state.threadID && this.renderModal()}
      </div>
    );
  }
}

export default App;
