
const Joi = require('joi');
const cyq = require('./js/query/cypherQueries');
const publisher = require('./js/publish/publisher');


const optionsSchema = Joi.object({
  queries: Joi.array().required().items(Joi.object({
    id: Joi.string().required(),
    query: Joi.string().required(),
    ordering: Joi.array(),
    structure: Joi.array().items(Joi.object({
      identifier: Joi.string(),
      children: Joi.array().items(Joi.object({
        identifier: Joi.string(),
        children: Joi.array().items(Joi.link('#structureNodeType')),
      })),
    }).id('structureNodeType')),
  })),
  template: Joi.object({
    name: Joi.string().required(),
    locale: Joi.string().required(),
    indentationColumns: Joi.number(),
    author: Joi.string().required(),
    items: Joi.array().items(Joi.object({
      id: Joi.number().required(),
      type: Joi.string().allow('field', 'table', 'graph').required(),
      datatype: Joi.string(),
      mapping: Joi.string(),
      inlineRelationships: Joi.array().items(Joi.string()),
      columns: Joi.array().items(Joi.object({
        graphType: Joi.string(),
        indentation: Joi.boolean(),
        fields: Joi.object(),
        label: Joi.string(),
        category: Joi.string(),
        width: Joi.number(),
        relationships: Joi.array(),
        nodes: Joi.array(),
        columns: Joi.array().items(Joi.link('#column')),
        style: Joi.object(), // cell style
        css: Joi.object(), // header style
      }).id('column')),
      style: Joi.object(), // cell style
      width: Joi.string().allow('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'),
      title: Joi.string(),
    })),
  }).required(),
  output: Joi.string().allow('pdf', 'html'),
  cypherDriver: Joi.object().required(),
  dataConverters: Joi.object(),
});


async function buildReport(options) {

  const { error, value } = optionsSchema.validate(options);
  if (error) {
    console.log("LOG / file: index.js / line 55 / buildReport / error", error);
    return error;
  }

  // parse options
  console.time('[ganister-cypher-reporter] parse')
  const { queries, template, output, cypherDriver, dataConverters } = options;
  console.timeEnd('[ganister-cypher-reporter] parse')

  global._dataConverters = dataConverters;
  
  // run queries
  console.time('[ganister-cypher-reporter] query')
  const dataStore = await cyq.runQueries(queries, cypherDriver);
  console.timeEnd('[ganister-cypher-reporter] query')

  // fill template
  console.time('[ganister-cypher-reporter] produce')
  const content = await publisher.produce(dataStore, template);
  console.timeEnd('[ganister-cypher-reporter] produce')

  return content;
}



module.exports.optionsSchema = optionsSchema;
module.exports.buildReport = buildReport;