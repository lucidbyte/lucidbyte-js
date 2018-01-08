// Tell Babel to transform JSX into h() calls:
/** @jsx h */

import { h, render, Component } from 'preact';
// import 'regenerator-runtime/runtime';
import { Main } from '../components/Main';
import lucidbyte from '../../../index';
import querystring from 'query-string';
import 'regenerator-runtime/runtime';

const Now = () => Number(performance.now().toFixed(2));

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

let i = 0;
const test = {
  createDocs() {
    new Array(10000).fill(0).forEach((_, i) => {
      const lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
      const data = new Array(10).fill(lorem);
      client.collection('manyDocs')
        .set(`doc_${i}`, {
          data,
          index: i,
          anotherProp: 'foo'
        });
      const batchReady = (i > 0) && ((i + 1) % 100 === 0);
      if (batchReady) {
        // response.then(res => console.log(res));
        client.flush();
      }
    });
  },

  readDocs(_, index) {
    const $manyDocs = client.collection('manyDocs');
    // const start = Now();

    $manyDocs.query(
      {
        // anotherProp: { $ne: 'blah' }
      },
      {
        limit: 100,
        page: Math.round(index / 3),
        projection: {
          _id: 1
        }
      },
      function forEach(data) {
        // console.log(data);
      }
    );

    // $manyDocs.query(
    //   {},
    //   {
    //     limit: 100,
    //     page: Math.round(index / 3),
    //     projection: {
    //       data: { $slice: [0, 5] }
    //     }
    //   }
    // );
    // $manyDocs.query(
    //   {},
    //   {
    //     limit: 100,
    //     page: Math.round(index / 3),
    //     projection: {
    //       data: { $slice: 5 }
    //     }
    //   }
    // );
  }
};

class HelloWorld extends Component {
  state = {
    loggedIn: false,
    message: ''
  }

  componentDidMount() {
    // test.createDocs();
    // test.readDocs();
    new Array(100).fill(0).forEach(test.readDocs);

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
    // const start = Now();
    // let index = 0;
    // this.$collection.query(
    //   null,
    //   null,
    //   function forEach(item) {
    //     console.log({
    //       time: Number((Now() - start).toFixed(2)),
    //       item,
    //       index: index++
    //     });
    //   }
    // );
  }

  loadMessage = () => {
    const handleResult = items => {
      const item = items[0];
      if (!item) {
        return;
      }
      this.setState({
        message: item.data.message
      });
    };
    this.$collection.get('testzzbar')
      .then(handleResult);
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
