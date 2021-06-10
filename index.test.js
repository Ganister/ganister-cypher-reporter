require('dotenv').config();

const main = require('./index');
const testData = require('./js/sample.testData');

test('generates a report', async () => {
  const options = { queries: testData.queries, template: testData.template, output: 'html', cypherDriver: testData.driver };
  const model = main.optionsSchema.validate(options);
  await main.buildReport(options)
});