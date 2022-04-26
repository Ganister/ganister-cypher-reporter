require('dotenv').config();
const fs = require('fs')
const cyq = require('./cypherQueries');
const testData = require('../sample.testData');


test('Produce a datastore', async () => {
  const dataStore = await cyq.runQueries(testData.queries, testData.driver);
  
  fs.writeFile("temp/datastoreSample.js", JSON.stringify(dataStore), 'utf8', function (err) {
    return dataStore;
  });
});