import { h, render, Component } from 'preact';

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

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

const EmailPrompt = ({ onSubmit, onInput, value }) => (
  <form className='Login__EmailForm' onSubmit={onSubmit}>
    <h2 className='Login__EmailTitle'>Authenticate</h2>
    <p>To sign up or log in, fill in your email address below:</p>
    <input
      className='Login__EmailInput input'
      type='email'
      autoComplete='email'
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
        <input
          className='Login__CodeInput input'
          type='text'
          placeholder='your code'
          value={value}
          onInput={onInput}
        />
      </form>
    </div>
  );
};

const initialState = () => ({
  email: '',
  emailSent: false,

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
    } = require('./auth').default.auth({ projectID, origin: customOrigin });
    this.login = login;
    this.getAccessToken = getAccessToken;
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    const { email } = this.state;
    this.login(email).then(res => {
      console.log(res);
      this.setState({ emailSent: true });
    }).catch(err => {
      console.error(err);
    });
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

  render() {
    return (
      <div className='Login'>
        <style>{/* @css */`
          @keyframes showLogin__CodeLabel {
            from {
              opacity: 0;
              transform: scale(.2, .2);
              transform-origin: center;
            }
          }

          .Login__CodeLabel {
            animation: showLogin__CodeLabel .3s 1;
          }

          .Login {
            text-align: center;
            max-width: 35rem;
            margin: 0 auto;
          }

          .Login input {
            text-align: center;
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
        `}</style>
        {!this.state.emailSent
          ? (
            <EmailPrompt
              onInput={this.handleEmailChange}
              onSubmit={this.handleSubmit}
              value={this.state.email}
            />
          ) : (
            <AwaitingConfirmation
              value={this.state.code}
              email={this.state.email}
              error={this.state.codeError}
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
  element
}) => {
  render(
    <LoginForm
      projectID={projectID}
      customOrigin={origin}
    />,
    element
  );
};
