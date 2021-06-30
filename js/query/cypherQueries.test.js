require('dotenv').config();

const cyq = require('./cypherQueries');
const testData = require('../sample.testData');


test('Produce a datastore', async () => {
  const dataStore = await cyq.runQueries(testData.queries, testData.driver);
  return dataStore;
});