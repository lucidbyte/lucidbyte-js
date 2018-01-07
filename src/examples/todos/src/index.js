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
const origin = customOrigin || 'https://localhost:3001';
const projectID = customProjectID || defaultProjectID;
const config = {
  origin,
  projectID,
  dev: true
};
const client = lucidbyte.client(config);

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

const HelloInput = ({ style = {}, ...props }) => {
  return (
    <textarea
      style={{
        ...style,
        width: '100%',
        maxWidth: '100%',
        minHeight: '10em'
      }}
      {...props}
    />
  );
};

// const aliases = {
//   unsetDoc: {
//     $unset: {
//       anotherProp: 1
//     }
//   },
//   updateDoc: {
//     $set: {
//       ts: `@date`,
//       anotherProp: `@anotherProp`
//     }
//   }
// };

// client.collection('manyDocs')
//   .alias('updateDoc')
//   .set('doc_1', {
//     date: new Date(),
//     anotherProp: 'foobar'
//   });

const test = {
  createDocs() {
    new Array(1000).fill(0).forEach((_, i) => {
      const response = client.collection('manyDocs')
        .set(`doc_${i}`,
          {
            $set: { anotherProp: 1 }
          },
          // $set: {
          //   // data: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          //   ts: new Date(),
          //   anotherProp: 'foo'
          // }
        );
      if ((i > 0) && (i % 100 === 0)) {
        response.then(res => console.log(res));
        client.flush();
      }
    });
  },

  readDocs() {
    client.collection('manyDocs').get();
  }
};

class HelloWorld extends Component {
  state = {
    loggedIn: false,
    message: ''
  }

  componentDidMount() {
    test.createDocs();

    this.$collection = client.collection('helloTest');

    // SetupRealtime(projectID, this);
    lucidbyte.auth(config).onAuthStateChange((state) => {
      console.log('authState', state);
      this.setState({ loggedIn: state.loggedIn });

      if (state.loggedIn) {
        this.loadMessage();
      }
    });
  }

  componentDidUpdate() {
    const Now = () => performance.now();
    const start = Now();
    let index = 0;
    this.$collection.get(
      null,
      null,
      function forEach(item) {
        console.log({
          time: Number((Now() - start).toFixed(2)),
          item,
          index: index++
        });
      }
    );
  }

  loadMessage = async () => {
    const items = await this.$collection
      .get({ _id: 'testzzbar' });
    const item = items[0];
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
      .set('testzzbar', {
        data: {
          message: value
        }
      });
    this.$collection
      .set('testzzbar123', {
        data: {
          message: value
        }
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
