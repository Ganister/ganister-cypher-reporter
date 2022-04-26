require('dotenv').config();
const fs = require('fs')
const main = require('./index');
const testData = require('./js/sample.testData');

test('generates a report', async () => {
  const options = { 
    queries: testData.queries, 
    template: testData.template, 
    output: 'html', 
    cypherDriver: testData.driver,
    dataConverters: testData.dataConverters, 
  };
  main.optionsSchema.validate(options);
  const report = await main.buildReport(options)
  fs.writeFile("temp/etoe.html", report, 'utf8', function (err) {
  });
},20000);