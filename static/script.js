class Banner extends React.Component {
  setNarrowDisplay (selected) {
    console.log('set narrow runs')
    document.querySelectorAll(".Panel").forEach((n) => {
      n.style.display = 'none'});
    document.getElementById(selected).style.display = 'block'
  }

  render () {
    return (
      <div>
      <div className="banner">
        <img id="logoImage" src='/static/logo2.png'></img>        
        <div className="bannerBox">
          <a className = "toolbar" id="logo" onClick={()=>this.props.goToMain()}>Belay</a>
        </div>
        <div className="bannerBox" id="profileLink">
          <div className = "toolbar" onClick={()=>this.props.goToLogin()}>
          <i className="fa-solid fa-user"></i>
          {/* {this.props.isLoggedin && <div className = "logout" onClick={()=>this.props.logoutHandler()}>Logout</div>} */}
          </div>
        </div>
        <div className = "header">
          <div className = "hidden-toolbar" onClick={()=>this.setNarrowDisplay("channels")}>Channels</div>
          <a className = "hidden-toolbar" onClick={()=>this.setNarrowDisplay("messages")}>Messages</a>
          <a className = "hidden-toolbar" onClick={()=>this.setNarrowDisplay("thread")}>Reply Thread</a>
        </div>
      </div>
      </div>
    );
  }
}
  
class Splash extends React.Component {
  render() {
    console.log(this.props)
      return (
        <div>
        <h1>Welcome!</h1>
        <div className="splashButtons">
          <div className="splashButtonsLogin">
            <button className="splashButton" id="splashLogin" onClick={()=>this.props.goToLogin()}>Login</button> 
          </div>
          <div className="splashButtonsSignup">
            <button className="splashButton" id="splashSignup" onClick={()=>this.props.goToCreateAccout()}>Create Account</button> 
          </div>
          </div>
        </div>
      );
  }
}

class Login extends React.Component {
  login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch("http://127.0.0.1:5000/api/login", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: username, password: password})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
          this.props.loginHandler(data);
          window.localStorage.setItem("session_token", data.api_key);
        });

      } else {
        console.log(response.status);
        console.log('failed login', this.props)
        this.props.loginFailedHandler()
        this.logout();
      }
    }).catch((response) =>{
      console.log(response);
      this.logout();
    })
  }

  logout() {
    console.log('logout runs')
    this.props.logoutHandler();
  }

  render() {
    console.log('loginpage', this.props)
      return (
        <div>
        <div className="clip">
          <div className="auth container">
            <h3>Enter your username and password to log in:</h3>
            <div className="alignedForm login">
              <label htmlFor="username">Username</label>
              <input name="username" id="login-username"></input>
              <button id="login-button" onClick={() => this.login()}>Login</button>
              <label htmlFor="password">Password</label>
              <input type="password" name="password" id="login-password"></input>
            </div>
            {this.props.loginFailed &&
            <div className="failed hidden" > 
              <div className="loginFailed">
                That username and password doesn't match any of our users
              </div>
              <div className="newAccount">
              <button id="new-account">Create a new Account</button>
              </div>
            </div>}
          </div>
        </div>
        </div>
      );
  }
}

class Mainpage extends React.Component {
  componentDidMount() {
    this.getChannels()
    this.props.stopCountInterval()
    this.props.setCountInterval()
  }

  getChannels() {
    const session_token = window.localStorage.getItem("session_token")
    const myInit = {
      method: 'GET',
      headers: {'api_key': session_token},
    };
    fetch('/api/getchannels', myInit)
      .then((response) => response.json())
      .then((data) => {
      console.log('Success:', data)
        this.props.setChannels(data)
      })
      .catch((error) => {
      console.error("Error:", error)
    });
  }

  postListener = (event) => {
    // TODO: Listen for the Enter Key
    console.log("KeyCode: " +event.key);
    if(event.key === 'Enter' && !event.shiftKey) {
      this.postHandler(event);
      event.preventDefault();
    }
  }

  addChannel () {
    console.log('add channel called')
    const channel_name = document.getElementById("channel-name-box").value;
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/addchannel", {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token},
      body: JSON.stringify({channel: channel_name})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
        });
    }}).catch((response) =>{
      console.log(response);
      })
    this.closeAddChannel()
    this.getChannels()
  }

  openAddChannel() {
    const addChannel = document.getElementById("add-channel-window");
    addChannel.style.display = "block";
  }

  closeAddChannel() {
    console.log('close add channel')
    const addChannel = document.getElementById("add-channel-window");
    addChannel.style.display = "none";
  }

  showEmojiUser(id, show=false) {
    const user = "emoji_user_" + id
    const emoji = document.getElementById("emoji_user_" + id);
    if (show) {
      emoji.style.display = "block";
    }else{
      emoji.style.display = "none";
    }
  }

  showEmojiOptions(show=false) {
    const emoji = document.getElementById("thumbsup");
    if (show) {
      emoji.style.display = "block";
    }else{
      emoji.style.display = "none";
    }
  }

  render() {
    const channels = this.props.channels.map((channel) =>
    <li key={channel.id} className="channel-list" id={"channel_" + channel.id} onClick = {()=>this.props.setActiveChannel(channel)}>
      <i className="fa-solid fa-user-group"></i> {channel.name} 
      <div className="channel-list-unread" id={'unread_'+channel.id}></div>
    </li>
    );

    const messages = this.props.messages.map((message) =>
    <div key={message.id} className="user_messages">
      <div className="user" id={"user_" + message.user_id}>{message.name}</div>
      <div className="singleMessage" id={"channel_" + message.id}>{message.body}</div>
      <img className="message-images" id={"image_" + message.id} src={message.image} 
        onError={(event) => event.target.style.display = 'none'}></img>
      <div className="message-reactions">
        {message.reactions.map((reaction) =>
        <div key={reaction.id} className="messages_reactions">
          <span role="img" className="single-reaction" id={"reaction_" + reaction.id} 
            onMouseEnter={() => this.showEmojiUser(reaction.id, true)}
            onMouseLeave={() => this.showEmojiUser(reaction.id, false)}
            >{String.fromCodePoint(reaction.emoji)}</span>
          <div className="emoji-user" id={"emoji_user_"+ reaction.id}>{reaction.name}</div> 
        </div>
        )}
      </div>
      <div className="replies-bar">
        <div className="line" />
          <ReactionUI user = {this.props.user}
                message_id = {message.id}
                reactions = {this.props.reactions}
                activeChannel = {this.props.activeChannel}
                setReactions = {(data)=>this.props.setReactions(data)}/>
          <i className="fa-solid fa-reply" id={"reply_" + message.id} 
            onClick={()=>this.props.setActiveMessage(message)}></i>
          <div className={message.replies ? "replies" : "no-replies"} id={"num_replies_" + message.id}>{message.replies ? message.replies : 0} replies</div>
          <a className={message.replies ? "replies" : "no-replies"} id={"view_replies_" + message.id} 
            onClick={()=>this.props.setActiveMessage(message)}>view</a>
        <div className="line" />
      </div>
    </div>
      );

    const replies = this.props.replies.map((reply) =>
    <div key={reply.id} className="user_messages">
      <div className="user" id={"user_reply_" + reply.user_id}>{reply.name}</div>
      <div className="singleMessage" id={"reply_" + reply.id}>{reply.body}</div>
    </div>
    );

    return (
      <div>

      <div id="add-channel-window" className="modal">
        <div className="modal-content">
          <div className="close">
            <i className="fa-solid fa-xmark" onClick = {()=>this.closeAddChannel()}></i>
          </div>
          <div className="add-channel-name">
            <textarea name="comment" id="channel-name-box" defaultValue="New Channel"></textarea>
            <button id="add-channel" onClick={()=>this.addChannel()}>Create</button>
          </div>
        </div>
      </div>

      <div className="mainPanel">
        <div className="Panel" id="channels">
          <h3 id="channel-header">Channels <i className="fa-solid fa-circle-plus" onClick={()=>this.openAddChannel()}></i></h3>
          <ul className="channelList"></ul>
            {channels}
          {this.props.channels[0].id == 0 && <div className="noChannels"><p>No Channels Available</p></div>} 
        </div>
        <div className="Panel" id="messages">
          {!this.props.activeChannel && <div className = "no-channel">Select a channel to get started</div>}
        {this.props.activeChannel && <div className = "messages">
          <h3><i className="fa-solid fa-user-group"></i>{this.props.activeChannel.name}</h3>
          {messages}
          <MessageUI activeChannel={this.props.activeChannel}
            user = {this.props.user}/>
        </div>}
        </div>
        {this.props.activeMessage && <div className="Panel" id="thread">
          <div className="close">
            <i className="fa-solid fa-xmark" onClick = {()=>this.props.clearActiveMessage()}></i>
          </div>
          <h3 className="reply-header">Replies to...</h3>
          <div className = "parent-user">{this.props.activeMessage.name}</div>
          <div className = "parent-message">{this.props.activeMessage.body}</div>
          <div className = "parent-channel" onClick={()=>this.props.getSingleChannel(this.props.activeMessage.channel_name)}>{this.props.activeMessage.channel_name}</div>
          <hr />
          {replies}
          <ReplyUI activeMessage={this.props.activeMessage}
            user = {this.props.user}/>
        </div>}
        </div>
      </div>
    );
  }
}

class MessageUI extends React.Component {
  postMessage() {
    console.log('post message called')
    console.log('id', this.props)
    const message = document.getElementById("comment-box");
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/postmessage", {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token},
      body: JSON.stringify({message: message.value,
        userid: this.props.user.id,
        channel: this.props.activeChannel.id})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
        });
    }}).catch((response) =>{
      console.log(response);
      })
    message.value = ''
    }

  clearDefault() {
    const defaultValue = document.getElementById("comment-box")
    const post = document.getElementById("post-message-icon")
    defaultValue.value = ''
    post.style.color = '#2b565a'
    post.style.cursor = 'pointer'
  }

  render() {
    return (
      <div>
        <div className="chat">
          <div className="comment_box">
            <textarea name="comment" id="comment-box" defaultValue="Message Channel"
              onClick = {()=>this.clearDefault()}></textarea>
            <i className="fa-regular fa-paper-plane" id="post-message-icon" onClick = {()=>this.postMessage()}></i>
          </div>
        </div>
      </div>
    );
  }
}

class ReplyUI extends React.Component {
  postReply() {
    console.log('post reply called')
    const reply = document.getElementById("reply-box").value;
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/postreply", {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token},
      body: JSON.stringify({reply: reply,
        userid: this.props.user.id,
        message: this.props.activeMessage.id})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
        });
    }}).catch((response) =>{
      console.log(response);
      })
    }

  clearDefault() {
    const defaultValue = document.getElementById("reply-box")
    const post = document.getElementById("post-reply-icon")
    defaultValue.value = ''
    post.style.color = '#2b565a'
    post.style.cursor = 'pointer'
  }

  render() {
    return (
      <div>
        <div className="chat">
        <div className="comment_box">
          <textarea name="comment" id="reply-box" defaultValue="reply" onClick={()=>this.clearDefault()}></textarea>
          <i className="fa-regular fa-paper-plane" id = "post-reply-icon" onClick={()=>this.postReply()}></i>
      </div>
      </div>
      </div>
    );
  }
}

class ReactionUI extends React.Component {
  postReaction(emoji) {
    console.log('post reaction called')
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/postreaction", {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token},
      body: JSON.stringify({emoji: emoji,
        user_id: this.props.user.id,
        message_id: this.props.message_id,
        channel_id: this.props.activeChannel.id})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
        });
    }}).catch((response) =>{
      console.log(response);
      })
    }


  render () {
    return ( 
      <div> 
        <span className='setreaction' role="img" aria-label="thumbsup" id="thumbsup">👍</span>
        <div className="emoji-list">
          <span className='emoji' role="img" aria-label="thumbsup" onClick = {()=>this.postReaction(128077)}>👍</span>
          <span className='emoji' role="img" aria-label="heart" onClick = {()=>this.postReaction(128156)}>💜</span>
          <span className='emoji' role="img" aria-label="grin" onClick = {()=>this.postReaction(128515)}>😀</span>
          <span className='emoji' role="img" aria-label="cry-laugh" onClick = {()=>this.postReaction(128514)}>😂</span>
          <span className='emoji' role="img" aria-label="heart-eyes" onClick = {()=>this.postReaction(128525)}>😍</span>
          <span className='emoji' role="img" aria-label="eyeroll" onClick = {()=>this.postReaction(128580)}>🙄</span>
          <span className='emoji' role="img" aria-label="shock" onClick = {()=>this.postReaction(128559)}>😯</span>
          <span className='emoji' role="img" aria-label="sad" onClick = {()=>this.postReaction(128542)}>😞</span>
          <span className='emoji' role="img" aria-label="mad" onClick = {()=>this.postReaction(128548)}>😤</span>
        </div>
      </div>
    )
  }
}

class Profile extends React.Component {
  updateUsername() {
    const username = document.getElementById("username-update").value;
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/username", {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token,
        'user_id': this.props.user.id},
      body: JSON.stringify({username: username})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
        });
    }}).catch((response) =>{
      console.log(response);
      })
    }

  updatePassword() {
    const repeatPassword = document.querySelector(".profile input[name=repeatPassword]");
    const repeatPasswordMatches = () => {
      const p = document.querySelector(".profile input[name=password").value;
      const r = repeatPassword.value;
      return p == r;
    }
    repeatPassword.addEventListener("input", (event) => {
      if (repeatPasswordMatches()) {
        repeatPassword.setCustomValidity("");
      } else {
        repeatPassword.setCustomValidity("Password doesn't match");
      }
    });

    const password = document.getElementById("password-update").value;
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/password", {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token,
        'user_id': this.props.user.id},
      body: JSON.stringify({password: password})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
        });
    }}).catch((response) =>{
      console.log(response);
      })
    }

  render() {
      return (
        <div>
        <div className="profile">
          <div className="auth container">
            <h2>Profile</h2>
            <div className="alignedForm">
              <label htmlFor="username">Username: </label>
              <input name="username" id="username-update" defaultValue={this.props.user.name}></input>
              <button id="username-update" onClick={()=>this.updateUsername()}>update</button>
              <label htmlFor="password">Password: </label>
              <input type="password" name="password" id="password-update"></input>
              <button id="password-update" onClick={()=>this.updatePassword()}>update</button>
              {/* <label htmlFor="repeatPassword">Repeat: </label>
              <input type="password" name="repeatPassword"></input>
              <error>Passwords don't match</error> */}
              <button id="cancel" onClick={()=>this.props.goToMain()}>Cancel</button>
              <button className="exit logout" id="exit logout" onClick={()=>this.props.logoutHandler()}>Log out</button>
            </div>
          </div>
        </div> 
      </div>
      );
  }
}

class CreateAccount extends React.Component {
  signup() {
    const username = document.getElementById("username-set").value;
    const password = document.getElementById("password-set").value;

    fetch("http://127.0.0.1:5000/api/signup", {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username: username, password: password})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
          this.props.loginHandler();
          window.localStorage.setItem("session_token", data.api_key);
        });

      } else {
        console.log(response.status);
        console.log('failed login', this.props)
      }
    }).catch((response) =>{
      console.log(response);
    })
  }

  render() {
      return (
        <div>
        <div className="clip">
          <div className="auth container">
            <h2>Create Account</h2>
            <div className="alignedForm">
              <label htmlFor="username">Username: </label>
              <input name="username" id="username-set"></input>
              <div id="username-update"></div>
              <label htmlFor="password">Password: </label>
              <input type="password" name="password" id="password-set"></input>
              <div id="username-update"></div>
              <label htmlFor="repeatPassword">Repeat: </label>
              <input type="password" name="repeatPassword"></input>
              {/* <error>Passwords don't match</error> */}
              <div></div>
              <button className="createAccount" onClick={() => this.signup()}>Create Account</button>
            </div>
          </div>
        </div> 
      </div>
      );
  }
}

class Belay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedin: false,
      loginFailed: false,
      user: {id: 0, name: '', api_key: '', password: ''},
      main: true,
      login: false,
      newAccount: false,
      channels: [{id: 0, name: ''}],
      activeChannel: null,
      messages: [{id: 0, user_id: 0, name: '', body: 'Select a channel to get started', 
        reactions: [{id: 0, user_id: 0, message_id: 0, emoji: 0, name: ''}]}],
      activeMessage: null,
      replies: [{id: 0, user_id: 0, user_name: '', body: 'No Replies'}],
      unreadCount: [{channel_id: 0, count: 0}],
    }
  }

  componentDidMount () {
    const path = window.location.pathname
    console.log('component did mount', path)
    if (path == '/profile' || path == '/login') {
      this.setState({login: true})
      this.setState({main: false})
      this.setState({newAccount: false})
      if (this.state.user.id == 0) {
        window.history.pushState({'page': 'login'},'','/login')}
      else{window.history.pushState({'page': 'login'},'','/profile')}
    }else if (path.includes('channel')) {
      const channel_name = path.slice(9)
      console.log(channel_name)
      this.getSingleChannel(channel_name)
      window.history.pushState({'page': 'main', 'channel': channel_name}, '', channel_name)
    }else if (path == '/create-account') {
      this.setState({login: false})
      this.setState({main: false})
      this.setState({newAccount: true})
      window.history.pushState({'page': 'newAccount'},'') 
    }else{
      this.setState({login: false})
      this.setState({main: true})
      this.setState({newAccount: false})
      if (path.includes('channel')) {
        const channel_name = path.slice(9)
        console.log(channel_name)
        this.getSingleChannel(channel_name)
        window.history.pushState({'page': 'main', 'channel': channel_name}, '', channel_name)
      }
      else if (path.includes('replies')){
        const message_id = path.slice(9)
        console.log(message_id)
        this.getSingleMessage(message_id)
        window.history.pushState({'page': 'main', 'replies': message_id}, '', 'replies_'+message_id)
      }
      window.history.pushState({'page': 'main', 'channel': ''},'')
    }
  }

  loginHandler(data) {
    console.log('loginHandler runs')
    console.log(data)
    this.setState({user: data})
    this.setState({isLoggedin: true})
    this.setState({login: false})
    this.setState({main: true})
    this.setState({newAccount: false})
    window.localStorage.setItem("session_token", data.api_key)
    this.getUserInfo()
    if (!this.activeChannel) {
      window.history.pushState({'page': 'main', 'channel': ''}, '', '/')
    }else {
      window.history.pushState({'page': 'main', 'channel': ''}, '', '/channel_'+this.activeChannel.name)
    }
  }

  logoutHandler() {
    console.log('logoutHandler runs')
    this.setState({isLoggedin: false})
    this.setState({login: true})
    this.setState({main: false})
    this.setState({newAccount: false})
    this.setState({user: null})
    this.setState({activeChannel: null})
    this.setState({activeMessage: null})
    this.setState({channels: [{id: 0, name: ''}]})
    this.setState({messages: [{id: 0, user_id: 0, name: '', body: 'Select a channel to get started', 
    reactions: [{id: 0, user_id: 0, message_id: 0, emoji: 0, name: ''}]}],})
    this.setState({replies: [{id: 0, user_id: 0, user_name: '', body: 'No Replies'}]})
    this.stopInterval()
    this.stopCountInterval()
    window.localStorage.removeItem("session_token");
    window.history.pushState({'page':'login'}, '', '/login')
  }

  loginFailedHandler() {
    console.log('loginFailed runs')
    this.setState({loginFailed: true})
  }

  goToLogin() {
    console.log('goToLogin runs')
    this.setState({login: true})
    this.setState({main: false})
    this.setState({newAccount: false})
    this.stopCountInterval()
    this.stopInterval()
    if (this.state.user.id == 0) {
      window.history.pushState({'page': 'login'},'','/login')
    }else{
      window.history.pushState({'page': 'login'},'','/profile')
    }
  }

  goToMain() {
    console.log('goToMain runs')
    this.setState({main: true})
    this.setState({login: false})
    this.setState({newAccount: false})
    window.history.pushState({'page': 'main', 'channel': ''},'','/')
  }

  goToCreateAccout () {
    console.log('goToMain runs')
    this.setState({main: false})
    this.setState({login: false})
    this.setState({newAccount: true})
    window.history.pushState({'page': 'login'},'','/new-account')
  }

  getSingleChannel (channel_name) {
    const session_token = window.localStorage.getItem("session_token")
    const myInit = {
      method: 'GET',
      headers: {'api_key': session_token,
      'channel_name': channel_name
      },
    };
    fetch('api/get_single_channel', myInit)
      .then((response) => response.json())
      .then((data) => {
      console.log('Get single channel', data)
      this.setActiveChannel(data)
      })
      .catch((error) => {
      console.error("Error:", error)
    });
  }

  setChannels (data) { //i thing this can be reorganized better if the app returns {id:0 name:''}
    console.log('get Channels runs')
    if (Object.keys(data).length === 0) {
      this.setState({channels: [{id: 0, name: ''}]})
      console.log(this.state.messages)
    }else{
    this.setState({channels: data})}
  }

  getMessages (channel) {
    console.log('interval working')
    const session_token = window.localStorage.getItem("session_token")
    const api_url = '/api/getmessages'
    const myInit = {
      method: 'GET',
      headers: {'api_key': session_token,
      'channel_id': channel.id
    },
    };
    fetch(api_url, myInit)
      .then((response) => response.json())
      .then((data) => {
      console.log('Get Messages', data)
      this.setState({messages: data})
      })
      .catch((error) => {
      console.error("Error:", error)
    });
  }

  setInterval (channel) {
    this.interval = setInterval(()=>this.getMessages(channel), 500)
  }

  stopInterval () {
    clearInterval(this.interval)
  }

  setActiveChannel (channel, pushHistory=true) {
    console.log('set active channel', channel.id)
    if (Object.keys(channel).length === 0) {
      this.setState({activeChannel: null})
    }else{
    this.setState({activeChannel: channel})
    this.stopInterval()
    this.getMessages(channel)
    this.setInterval(channel)
    const path = '/channel_'+channel.name
    console.log('path', path)
    if (pushHistory) {window.history.pushState({'page': 'main', 'channel':channel.name},'', path)}
    document.querySelectorAll(".channel-list-active").forEach((n) => {
      n.setAttribute("class", "channel-list")});
    const channel_div = document.getElementById("channel_"+channel.id)
    channel_div.setAttribute("class", "channel-list-active")
    }
  }

  getSingleMessage (message_id) {
    const session_token = window.localStorage.getItem("session_token")
    const myInit = {
      method: 'GET',
      headers: {'api_key': session_token,
      'message_d': message_id
      },
    };
    fetch('api/get_single_message', myInit)
      .then((response) => response.json())
      .then((data) => {
      console.log('Get single channel', data)
      this.setActiveMessage(data)
      })
      .catch((error) => {
      console.error("Error:", error)
    });
  }

  setActiveMessage (message) {
    console.log('replies active')
    this.setState({activeMessage: message})
    this.getReplies(message.id)
  }

  clearActiveMessage () {
    this.setState({activeMessage: null})
  }

  getReplies(message) {
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/getreplies", {
      method: 'GET',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token,
        'message_id': message}
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
          this.setReplies(data) //clean this up by moving if statement to api
        });
    }}).catch((response) =>{
      console.log(response);
      })
    }

  setReplies (data) {
    console.log('get replies runs')
    if (Object.keys(data).length === 0) {
      this.setState({replies: [{id: 0, user_id: 0, user_name: '', body: 'No Replies'}]})
    }else{
      this.setState({replies: data})}
  }

  getUserInfo () {
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/getuser", {
      method: 'GET',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token}
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log(data)
          this.setState({user: data})
        });
    }}).catch((response) =>{
      console.log(response);
      })
    }

   postReadMessages () {
    console.log('post read called')
    const session_token = window.localStorage.getItem("session_token")
    if (!session_token) {
      return
    }

    fetch("http://127.0.0.1:5000/api/updateread", {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token},
      body: JSON.stringify({user_id: this.state.user.id,
        channel_id: this.state.activeChannel.id})
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          console.log('postReadMessages', data)
        });
    }}).catch((response) =>{
      console.log(response);
      })
    }


  countUnreadMessages () {
    const session_token = window.localStorage.getItem("session_token")

    fetch("http://127.0.0.1:5000/api/countunread", {
      method: 'GET',
      headers: {'Content-Type': 'application/json',
        'api_key': session_token,
        'user_id': this.state.user.id,
        'active_channel': this.state.activeChannel ? this.state.activeChannel.id : 0}
    }).then((response) => {
      if(response.status == 200) {
        response.json().then((data) => {
          this.setState({unreadCount: data})
          for (const count of data) {
            if (count.channel_id) {
              let channel = document.getElementById("unread_"+count.channel_id)
              if (channel) {
                channel.innerHTML = '('+count.unread_count+')'
                channel.classList.remove('unread_count_0')
                if (count.unread_count == 0) {
                  channel.classList.add('unread_count_0')
                }
                }}}
        });
    }}).catch((response) =>{
      console.log(response);
      })
  }

  setCountInterval () {
    this.countInterval = setInterval(()=>this.countUnreadMessages(), 1000)
  }

  stopCountInterval () {
    clearInterval(this.countInterval)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.messages !== this.state.messages) {
      console.log('did update runs')
      this.postReadMessages()
  }}

  popstateUpdate (newstate) {
    console.log('popstate update runs',newstate)
    if (newstate.page == 'main') {
      this.setState({main: true})
      this.setState({login: false})
      this.setState({newAccount: false})
      if (newstate.channel != '') {
        this.getSingleChannel(newstate.channel)
      }
      if (newstate.replies != 0) {
        this.getSingleChannel(newstate.replies)
      }
      else{
        this.setState({activeChannel: null})
        this.stopInterval()
      }}
    else if (newstate.page == 'login') {
      this.setState({main: false})
      this.setState({login: true})
      this.setState({newAccount: false})
    }
    else if (newstate.page == 'newAccount') {
      this.setState({main: false})
      this.setState({login: false})
      this.setState({newAccount: true})
    }}

  setNarrowDisplay (selected) {
    console.log('set narrow runs')
    document.querySelectorAll(".Panel").forEach((n) => {
      n.style.display = 'none'});
    document.getElementById(selected).style.display = 'inline-flex'
  }

  render() {
    console.log('main state', this.state)
    console.log(window.location.pathname)

    if (this.state.isLoggedin == false) { 
      const session_token = window.localStorage.getItem("session_token");
      this.state.isLoggedin = session_token ? true : false;
      if (session_token) {this.getUserInfo()};
    }

   window.addEventListener("popstate", (newstate) => {this.popstateUpdate(newstate.state)})

    return (
      <div className="weblog">
        <Banner goToLogin = {()=>this.goToLogin()}
          goToMain = {()=>this.goToMain()}
          isLoggedin = {this.state.isLoggedin}
          logoutHandler = {()=>this.logoutHandler()}
          setNarrowDisplay = {(selected)=>this.setNarrowDisplay(selected)}/>
        {!this.state.isLoggedin && this.state.main && <Splash 
          goToLogin = {()=>this.goToLogin()}
          goToCreateAccout = {()=>this.goToCreateAccout()}/>}
        {!this.state.isLoggedin && this.state.login && <Login 
          loginHandler = {(data)=>this.loginHandler(data)}
          logoutHandler = {()=>this.logoutHandler()}
          loginFailedHandler = {()=>this.loginFailedHandler()}
          loginFailed = {this.state.loginFailed}/>}
        {this.state.isLoggedin && this.state.main && <Mainpage 
          channels = {this.state.channels}
          messages = {this.state.messages}
          replies = {this.state.replies}
          activeChannel = {this.state.activeChannel}
          user = {this.state.user}
          activeMessage = {this.state.activeMessage}
          unreadCount = {this.state.unreadCount}
          setChannels = {(data)=>this.setChannels(data)}
          setActiveChannel = {(channel)=>this.setActiveChannel(channel)}
          getSingleChannel = {(channel_name)=>this.getSingleChannel(channel_name)}
          setActiveMessage = {(message)=>this.setActiveMessage(message)}
          clearActiveMessage = {()=>this.clearActiveMessage()}
          setCountInterval = {(channel)=>this.setCountInterval(channel)}
          stopCountInterval = {()=>this.stopCountInterval()}
          />}
        {this.state.isLoggedin && this.state.login && <Profile 
          logoutHandler = {()=>this.logoutHandler()}
          goToMain = {()=>this.goToMain()}
          user = {this.state.user}/>}
        {this.state.newAccount && <CreateAccount goToMain = {()=>this.goToMain()}
          loginHandler = {(data)=>this.loginHandler(data)}/>}
      </div>
    );
  }
}

  // ========================================
  
ReactDOM.render(
  <Belay />,
  document.getElementById('root')
);