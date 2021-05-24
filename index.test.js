require('dotenv').config();

const main = require('./index');
const testData = require('./js/sample.testData');

test('generates a report', async () => {
  await main.buildReport({ queries: testData.queries, template: testData.template, output: 'html', cypherDriver: testData.driver })
});