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

const test = {
  setDocs() {
    new Array(30000).fill(0).forEach((_, i) => {
      const lorem = (_, i) => `Index - ${i} ${Math.random()} ${Math.random()}`;
      const data = new Array(10).fill('').map(lorem);
      client.collection('manyDocs')
        .insert({
          data,
          // index: i,
          // anotherProp: 'foo'
        });
      const batchReady = (i + 1) % 100 === 0;
      if (batchReady) {
        // response.then(res => console.log(res));
        client.flush();
      }
    });
    // client.collection('manyDocs').delete('doc_0');
  },

  readDocs(_, index) {
    const $manyDocs = client.collection('manyDocs');
    // const start = Now();

    const limit = 2;
    const offset = (index % 5) * limit;
    const ids = new Array(limit).fill(0)
      .map((_, i) => `doc_${i + offset}`);

    new Array(limit).fill('').forEach((_, i) => {
      const sliceCount = 20;
      // const offset = 700;
      const startIdx = (i * sliceCount) + offset;
      const stages = [
        {
          $match: { _id: { $in: ids } },
          // anotherProp: 'foo',
          // anotherProp: { $eq: 'blah' }
        },
        {
          // limit,
          // page: Math.round(index / 3),
          $project: {
            data: { $slice: ['$data', startIdx, sliceCount] },
            // index: 1,
            // _id: 0
          }
        }
      ];
      $manyDocs.aggregate(
        stages,
        {},
        function forEach(data) {
          if (data.done) {
            // console.log(data);
          }
        }
      );
    });
  },

  aggregation() {
    const allowedAggregationOperators = [
      // '$limit',
      '$match',
      '$project',
      '$skip',
      '$sort',
      '$sortByCount',
      '$indexStats',
      '$sample',
      '$redact',
    ].reduce((opMap, op) => {
      return opMap.set(op, true);
    }, new Map());

    const pipelines = [
      // { $skip: 300 },
      { $limit: 100 },
      {
        $project: {
          foo: 1,
          _id: 0,
          // data: { $slice: ['$data', 0, 5] }
        }
      }
      // { $lookup: {
      //   from: 'r1qSmDBNz_insertTest',
      //   localField: '_id',
      //   foreignField: 'foo',
      //   as: 'maliciousCombo'
      // } }
    ];

    const start = Now();
    for (let i = 0; i < pipelines.length; i++) {
      const stage = pipelines[i];
      for (const op in stage) {
        if (!allowedAggregationOperators.has(op)) {
          pipelines.splice(i, 1);
          i--;
        }
      }
    }

    // const ops = JSON.stringify(pipelines).match(/\$[a-z]+/g);
    console.log({
      pipelines,
      took: Now() - start
    });

    client.collection('helloTest')
      .aggregate(
        pipelines
      ).then((res) => console.log(res));

    client.collection('helloTest')
      .has('testzzbar')
      .then(res => console.log(res));
  }
};

class HelloWorld extends Component {
  state = {
    loggedIn: false,
    message: ''
  }

  componentDidMount() {
    this.$collection = client.collection('helloTest');

    // SetupRealtime(projectID, this);
    lucidbyte.auth(config).onAuthStateChange(async (state) => {
      console.log('authState', state);
      this.setState({ loggedIn: state.loggedIn });

      if (state.loggedIn) {
        this.loadMessage();

        // test.setDocs();

        console.log(
          client.collection('helloTest')
        );
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
    const handleResult = item => {
      console.log(item);
      if (!item) {
        return;
      }
      this.setState({
        message: item.data.message
      });
    };
    return this.$collection.get('testzzbar')
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
