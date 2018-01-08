// Tell Babel to transform JSX into h() calls:
/** @jsx h */

import { h, Component } from 'preact';
import queryString from 'query-string';
import lucidbyte from '../../../index';
import 'regenerator-runtime/runtime';

const apiUrls = {
  remote: 'https://test.remote.lelandkwong.com',
  local: 'http://test.lelandkwong.com:3001'
};

const isBrowser = typeof window !== 'undefined';
const queryParams = (typeof location !== 'undefined') ? queryString.parse(location.search) : '';
const apiOrigin = apiUrls[queryParams.apiUrl] || apiUrls.local;
const Now = () => performance.now();
const dbClient = isBrowser
  ? lucidbyte.client({
    projectID: 'anon--B1xAmR-7M',
    origin: apiOrigin,
    dev: false
  })
  : () => {};

function perftest() {
  const tags = new Array(25000).fill(0).map((_, i) => `tag ${i}`);
  (async function addMany(page = 0, requestBatches = [], startTime = Now()) {
    if (page >= 5) {
      await Promise.all(requestBatches);
      console.log(Now() - startTime);
      return;
    }
    const groupSize = 2;
    const requests = new Array(groupSize).fill(0).map((_, i) => {
      const index = (page * groupSize) + i;
      const _id = `note ${index}`;
      return dbClient.collection('manyTest').filter({ _id }).set({
        _id,
        data: {
          message: `message ${index}`,
          timestamp: performance.now(),
          tags
        }
      });
    });
    requestBatches.push(Promise.all(requests));
    dbClient.flush();
    addMany(page + 1, requestBatches, startTime);
  })();
}

const ListItem = ({ _id, message }) => {
  return (
    <li onClick={() => dbClient.collection('example').filter({ _id }).delete()}>{message}</li>
  );
};

const Style = () => (
  <style>{/* @css */`
    .App {
      font-family: sans-serif;
      font-size: 15px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1em;
    }

    * {
      box-sizing: border-box;
    }

    .App input {
      font-family: inherit;
      font-size: inherit;
      width: 100%;
      line-height: 1.4;
      padding: .3em .4em;
    }
  `}</style>
);

function insertManyCollections() {
  const shortid = require('shortid');
  const projectID = 'anon--' + shortid.generate();
  new Array(1000).fill(0).forEach((_, i) => {
    const name = `${projectID}_collection-${i}`;
    dbClient.collection(name)
      .filter()
      .set({ value: 'foo' });
  });
}

export default class AnonymousProject extends Component {
  state = {
    message: '',
    list: []
  }

  async componentWillMount() {
    this.$example = dbClient.collection('example');
    this.$example2 = dbClient.collection('example2');
    this.$example3 = dbClient.collection('example3');

    // this.$example2
    //   .filter()
    //   // .get();
    //   .deleteMany();

    const list = await this.$example
      .filter()
      .get({
        page: 0,
        hitsPerPage: 100,
        projection: {
          _id: 1,
          message: 1,
          letters: { $slice: 5 }
        }
      }).then(res => {
        console.log(res);
        return res.data.items;
      })
      .catch(err => console.error(err));

    const { data } = await this.$example
      .filter({ _id: 'note 5' })
      .get({
        hitsPerPage: 1,
        projection: {
          message: 1
        }
      });
    if (data && data.items.length) {
      const item = data.items[0];
      this.setState({
        message: item.message,
        list
      });
    }
  }

  handleChange = (ev) => {
    const start = Now();
    const { value: message } = ev.target;

    const doc = (index) => {
      return {
        _id: `note ${index}`,
        message,
        letters: message.split('').slice(0, 10),
        index,
        timestamp: Now()
      };
    };

    const logResult = (batch, alias) => {
      Promise.all(batch)
        .then(res => console.log(alias, res[0].data))
        .catch(err => console.error(err));
    };

    // set multiple for collection1
    const updates1 = new Array(10).fill(0).map((_, i) => {
      const value = doc(i);
      const { _id, ...docToSet } = value;
      return this.$example
        .filter({ _id: value._id })
        .set(docToSet);
    });
    // dbClient.flush();
    logResult(updates1, '[1]');

    // set multiple for collection2
    const updates2 = new Array(10).fill(0).map((_, i) => {
      const valueToSet = doc(i);
      return this.$example2
        .filter({ _id: valueToSet._id })
        .set(valueToSet);
    });
    // dbClient.flush();
    logResult(updates2, '[2]');

    Promise.all([
      ...updates1,
      ...updates2,
    ]).then(() => console.log('total http time:', Now() - start));

    this.setState({ message });
  }

  render() {
    const { message } = this.state;
    return (
      <main className='App'>
        <Style />
        <link
          rel='stylesheet'
          href='https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.css'
        />
        <input
          value={message}
          onChange={this.handleChange}
        />
        <ul>{this.state.list.map(item => {
          return <ListItem key={item._id} {...item} />;
        })}</ul>
      </main>
    );
  }
}
