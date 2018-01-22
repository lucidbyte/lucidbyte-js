/* global DEVELOPMENT */

module.exports = {};

if (DEVELOPMENT) {
  module.exports.baseApiUrl = 'https://localhost:3000';
} else {
  module.exports.baseApiUrl = 'https://lucidbyte.com';
}
