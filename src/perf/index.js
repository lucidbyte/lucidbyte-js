const request = require('request');

const url = `https://localhost:3001/api/main/Query/6969e4de-195f-497b-aae6-59fe0e4a8326`;
const query = (_, index) => {
  const collection = 'manyDocs';
  const filter = {};
  const options = {
    limit: 100,
    page: Math.round(index / 3),
    projection: {
      _id: 1
    }
  };
  request({
    url,
    method: 'POST',
    pool: false,
    rejectUnauthorized: false,
    headers: {
      'Content-type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmOTA2ZDExY2EzNzA1NGVjM2Y3ZmJmOTBmNGI3M2FmOTBmYWU0NzdhZTViZWI5ZWNhOWQxZGVmMmE4MWIxMjkwIiwiaWF0IjoxNTE1Mzk0MTQ1LCJleHAiOjE1MTU0ODA1NDV9.lhXIZfJ0uim8PpQu3MkYLk3iah11aMGuBCeKjNvBfWw',
    },
    body: JSON.stringify({
      payload: [collection, filter, options]
    })
  }, function(err, res) {
    if (err) {
      return console.log(err);
    }
    // console.log(res.body);
  });
  // $manyDocs.query(
  //   {
  //     // anotherProp: { $ne: 'blah' }
  //   },
  //   {
  //     limit: 100,
  //     page: Math.round(index / 3),
  //     projection: {
  //       _id: 1
  //     }
  //   }
  // );
};

new Array(100).fill(0).forEach(query);
