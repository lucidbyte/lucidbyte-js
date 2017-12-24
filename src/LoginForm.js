import { h, render, Component } from 'preact';

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

const EmailPrompt = ({ onSubmit, onChange, value }) => (
  <form onSubmit={onSubmit}>
    <p><strong>Please enter your email</strong></p>
    <input
      className='input'
      type='email'
      autoComplete='email'
      placeholder='your_email@domain.com'
      value={value}
      onChange={onChange}
    />
  </form>
);

const AwaitingConfirmation = ({ onSubmit, onChange, value }) => (
  <div>
    <p><strong>A one-time code has been sent to your email.</strong></p>
    <form onSubmit={onSubmit}>
      <input
        className='input'
        type='text'
        placeholder='your code'
        value={value}
        onChange={onChange}
      />
    </form>
  </div>
);

export default class LoginForm extends Component {
  state = {
    email: '',
    emailSent: false,

    code: ''
  }

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
    this.getAccessToken(loginCode);
  }

  handleCodeChange = (ev) => {
    const value = ev.target.value;
    this.setState({ code: value });
  }

  render() {
    return (
      <div>
        {!this.state.emailSent
          ? (
            <EmailPrompt
              onChange={this.handleEmailChange}
              onSubmit={this.handleSubmit}
              value={this.state.email}
            />
          ) : (
            <AwaitingConfirmation
              onChange={this.handleCodeChange}
              onSubmit={this.handleCodeSubmit}
              value={this.state.code}
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
