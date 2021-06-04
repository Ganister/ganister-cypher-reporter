require('dotenv').config();

const cyq = require('./js/cypherQueries');
const testData = require('./js/sample.testData');
console.log("LOG / test queries", testData.queries);


cyq.runQueries(testData.queries, testData.driver).then((res) => {
  console.log("LOG / file: testyo.js / line 9 / dataStore", JSON.stringify(res));
});
