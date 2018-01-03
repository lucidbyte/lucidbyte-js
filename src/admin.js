import lucidbyteClient from './client';

const client = lucidbyteClient({
  origin: 'http://localhost:3001',
  path: '/api/admin/account'
});

export default class LucidByteAdmin {
  constructor (projectID) {
    this.projectID = projectID;
  }

  setOwner(email) {
    fetch(`http://localhost:3001/api/admin/set-owner/${email}`, {
      method: 'PATCH',
    });
  }

  getAuthToken(email) {

  }

  refreshAuthToken(currentToken) {

  }
}

const adminClient = new LucidByteAdmin('B1xAmR-7M');
adminClient.setOwner('leland.kwong2@gmail.com');
