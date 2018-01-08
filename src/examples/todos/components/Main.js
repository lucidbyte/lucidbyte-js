// Tell Babel to transform JSX into h() calls:
/** @jsx h */

import { h, Component } from 'preact';
import { BaseStyle } from './BaseStyle';
import lucidbyte from '../../../index';

// local project
export const project = '60d1e385-e710-46e7-b4d4-507741622bdb';
// remote project
// export const project = '722fd47f-fe5c-4d9f-ab42-0f1f9c947fb7';
const config = {
  origin: 'https://localhost:3001',
  projectID: project
};
const client = lucidbyte.client(config);
const auth = lucidbyte.auth(config);
export { client, auth };
const email = 'leland.kwong2@gmail.com';

class LoginButton extends Component {
  state = {
    isLoggedIn: false
  }

  componentDidMount() {

    auth.onAuthStateChange(({ loggedIn }) => {
      this.setState({ isLoggedIn: loggedIn });
    });
  }

  render() {
    const { isLoggedIn } = this.state;
    return (
      isLoggedIn
        ? <button className='button' onClick={auth.logout}>logout</button>
        : <button className='button' onClick={() => auth.login(email, project)}>login</button>
    );
  }
}

export const Main = ({ children, style, ...rest }) => (
  <main
    id='App'
    style={{ display: 'flex', flexDirection: 'column', ...style } }
    {...rest}
  >
    {/* <Head>
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta name="theme-color" content="#cf3165" />
    </Head> */}
    <BaseStyle />
    <div className='columns is-mobile' style={{ flexShrink: 0 }}>
      <h1 className='column has-text-weight-bold'>Lucidbyte Examples</h1>
      <LoginButton />
    </div>
    <script src='https://js.pusher.com/4.1/pusher.min.js' />
    {children}
  </main>
);
