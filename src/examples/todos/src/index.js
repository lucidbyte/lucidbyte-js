// Tell Babel to transform JSX into h() calls:
/** @jsx h */

import { h, render, Component } from 'preact';
import { Main } from '../components/Main';
import lucidbyte from '../../../index';
import querystring from 'query-string';

const defaultProjectID = '6969e4de-195f-497b-aae6-59fe0e4a8326';
const {
  origin: customOrigin,
  projectid: customProjectID
} = querystring.parse(location.search);
const origin = customOrigin || 'http://test.lelandkwong.com:3001';
const projectID = customProjectID || defaultProjectID;

class LoginForm extends Component {
  componentDidMount() {
    lucidbyte.LoginForm
      .render({
        element: this.loginFormElement,
        origin,
        projectID
      });
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div ref={ref => this.loginFormElement = ref} />
    );
  }
}

const HelloInput = (props) => {
  return (
    <input {...props} />
  );
};

class HelloWorld extends Component {
  state = {
    loggedIn: false,
    message: ''
  }

  componentDidMount() {
    const config = {
      origin,
      projectID,
      dev: true
    };
    this.$collection = lucidbyte.client(config).collection('helloTest');

    // SetupRealtime(projectID, this);
    lucidbyte.auth(config).onAuthStateChange((state) => {
      console.log(state);
      this.setState({ loggedIn: state.loggedIn });

      if (state.loggedIn) {
        this.loadMessage();
      }
    });
  }

  componentDidUpdate() {
    this.$collection.get()
      .then(res => {
        console.log('new data', res.data);
      });
  }

  loadMessage = async () => {
    const { data } = await this.$collection
      .filter({ _id: 'testzzbar' })
      .get();
    const item = data.items[0];
    if (!item) {
      return;
    }
    this.setState({
      message: item.data.message
    });
  }

  handleChange = (ev) => {
    const { value } = ev.target;
    this.$collection
      .filter({ '_id': 'testzzbar' })
      // .filter({ 'data.message': prevMessage })
      .set({
        // _id: 'testzzbar',
        data: {
          message: value
        }
      })
      .then(res => {
        console.log(res.data);
      });
    this.setState({ message: value });
  }

  render() {
    const { loggedIn, message } = this.state;
    return (
      <Main>
        {!loggedIn && <LoginForm />}
        {loggedIn
          && (
            <HelloInput
              className='input'
              value={message}
              onInput={this.handleChange}
            />
          )
        }
      </Main>
    );
  }
}

render(<HelloWorld />, document.querySelector('#root'));
