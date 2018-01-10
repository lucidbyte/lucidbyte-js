// Tell Babel to transform JSX into h() calls:
/** @jsx h */

import { h, render, Component } from 'preact';

const ErrorMessage = ({ error }) => {
  if (!error) {
    return null;
  }
  return (
    <div className='Login__Error'>
      {error}
    </div>
  );
};

class Input extends Component {
  componentDidMount() {
    this.props.autofocus &&
      this.elem.focus();

    if (this.props.autofocusOnWindowFocus) {
      window.addEventListener('focus', this.windowFocusHandler);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.windowFocusHandler);
  }

  windowFocusHandler = () => this.elem.focus()

  ref = (ref) => this.elem = ref

  render() {
    const {
      autofocus,
      autofocusOnWindowFocus, // eslint-disable-line no-unused-vars
      ...rest
    } = this.props;
    return (
      <input
        autofocus={autofocus}
        ref={this.ref}
        {...rest}
      />
    );
  }
}

const EmailPrompt = ({ onSubmit, onInput, value, sendInProgress, loginError }) => (
  <form className='Login__EmailForm' onSubmit={onSubmit}>
    <h2 className='Login__EmailTitle'>Authenticate</h2>
    {!sendInProgress
      ? <p>To sign up or log in, fill in your email address below:</p>
      : <p>Sending you an email code...</p>
    }
    {loginError &&
      <ErrorMessage error='Sorry, we encountered an error. Please try again.' />
    }
    <Input
      className='Login__EmailInput'
      type='email'
      autoComplete='email'
      disabled={sendInProgress}
      style={{ opacity: sendInProgress ? 0.5 : 1 }}
      autofocus={true}
      autofocusOnWindowFocus={true}
      placeholder='your_email@domain.com'
      value={value}
      onInput={onInput}
    />
  </form>
);

const AwaitingConfirmation = ({ onSubmit, onInput, onUndo, value, email, error }) => {
  const atSignIndex = email.indexOf('@');
  const lastDot = email.lastIndexOf('.');
  const emailDomain = email.slice(atSignIndex + 1, lastDot);
  const UndoLink = <a onClick={onUndo}>(undo)</a>;
  return (
    <div className='Login__CodeForm'>
      <h2>Authenticating</h2>
      <p>We sent an email to <strong>{email}</strong>. {UndoLink}</p>
      <p>Please login to to your <strong>{emailDomain}</strong> account, and copy the code into the field below.</p>
      <form onSubmit={onSubmit}>
        <ErrorMessage error={error} />
        <Input
          className='Login__CodeInput'
          autofocus={true}
          autofocusOnWindowFocus={true}
          type='text'
          placeholder='enter code here'
          value={value}
          onInput={onInput}
        />
      </form>
      <p className='Login__CodeWaitingMessage'>
        Waiting for code...
      </p>
    </div>
  );
};

const Style = () =>
  <style>{/* @css */`
    .Login {
      text-align: center;
      max-width: 33rem;
      margin: 0 auto;
    }

    .Login * {
      box-sizing: border-box;
    }

    .Login input {
      text-align: inherit;
      line-height: 2.2;
      font-family: inherit;
      font-size: inherit;
      width: 100%;
      border: 1px solid #d2d0d0;
      box-shadow: inset 0px 1px 1px rgba(0,0,0,.1);
    }

    .Login input:focus {
      border-color: rgb(1, 93, 201);
      outline: none;
    }

    .Login h2 {
      font-weight: bold;
      font-size: 1.3rem;
      margin-bottom: 1.2em;
    }

    .Login__Error {
      background: rgb(204, 55, 53);
      color: #fff;
      padding: .4em;
    }

    @keyframes pulseCodeWaitingMessage {
      0% {
        opacity: 0;
      }

      50% {
        opacity: 1;
      }

      100% {
        opacity: 0;
      }
    }

    .Login__CodeWaitingMessage {
      font-size: .9em;
      opacity: 0;
      margin-top: 1em;
      animation: pulseCodeWaitingMessage 5s 2s infinite;
    }
  `}</style>;

const initialState = () => ({
  email: '',
  emailSent: false,
  emailSendInProgress: false,

  code: '',
  codeError: ''
});

export default class LoginForm extends Component {
  state = initialState()

  componentDidMount() {
    const { projectID, customOrigin } = this.props;
    const {
      getAccessToken,
      login,
    } = require('./auth').default({ projectID, origin: customOrigin });
    this.login = login;
    this.getAccessToken = getAccessToken;
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { email } = this.state;
    this.login(email).then(() => {
      this.sendInProgressState(false);
      this.setState({ emailSent: true });
    }).catch(err => {
      this.setState({ loginError: true });
      console.error(err);
      this.sendInProgressState(false);
    });
    this.sendInProgressState(true);
  }

  sendInProgressState(inProgress) {
    this.setState({ emailSendInProgress: inProgress });
  }

  handleEmailChange = (ev) => {
    const value = ev.target.value;
    this.setState({ email: value });
  }

  handleCodeSubmit = (ev) => {
    ev.preventDefault();
    const loginCode = this.state.code;
    this.getAccessToken(loginCode)
      .then(res => {
        if (res.status === 401) {
          this.setState({ codeError: res.error });
        }
      });
  }

  handleCodeChange = (ev) => {
    const value = ev.target.value;
    this.setState({
      code: value,
      codeError: ''
    });
  }

  handleRestart = () => {
    this.setState(initialState());
  }

  render(props, state) {
    if (props.unmounted) {
      return null;
    }
    return (
      <div className='Login'>
        {!props.customStyle && <Style />}
        {!state.emailSent
          ? (
            <EmailPrompt
              onInput={this.handleEmailChange}
              onSubmit={this.handleSubmit}
              value={state.email}
              sendInProgress={state.emailSendInProgress}
              loginError={state.loginError}
            />
          ) : (
            <AwaitingConfirmation
              value={state.code}
              email={state.email}
              error={state.codeError}
              onInput={this.handleCodeChange}
              onSubmit={this.handleCodeSubmit}
              onUndo={this.handleRestart}
            />
          )
        }
      </div>
    );
  }
}

LoginForm.render = ({
  projectID,
  origin,
  element,
  customStyle = false,
  unmounted = false
}) => {
  render(
    <LoginForm
      projectID={projectID}
      customOrigin={origin}
      unmounted={unmounted}
      customStyle={customStyle}
    />,
    element
  );
};
