const origin = 'http://localhost:3000';
const projectID = 'rJOfDXJXMByeufwXy7z';

lucidbyte.anonymousProject({
  query: /* GraphQL */`
    mutation($note: JSON!) {
      updateNote(
        collection: "anon test"
        note: $note
      ) {
        _id
      }
  `,
  variables: {
    note: {
      _id: 'anonTest',
      data: {
        message: Math.random()
      }
    },
  },
  projectUrl: location.origin,
  apiOrigin: origin
}).then(res => {
  console.log(res);
});

lucidbyte.auth({
  origin,
  projectID
}).onAuthStateChange((state) => {
  console.log(state);
});

lucidbyte.LoginForm.render({
  element: document.querySelector('#LoginForm'),
  origin,
  projectID,
});
