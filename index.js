
const Joi = require('joi');
const cyq = require('./js/query/cypherQueries');
const publisher = require('./js/publish/publisher');


const optionsSchema = Joi.object({
  queries: Joi.array().required(),
  template: Joi.object({
    name: Joi.string().required(),
    locale: Joi.string().required(),
    author: Joi.string().required(),
    items: Joi.array().items(Joi.object({
      id: Joi.number().required(),
      type: Joi.string().allow('field', 'table', 'graph').required(),
      datatype :Joi.string(),
      mapping: Joi.string(),
      inlineRelationships: Joi.array().items(Joi.string()),
      columns: Joi.array().items(Joi.object({
        graphType: Joi.string(),
        indentation: Joi.boolean(),
        fields: Joi.object(),
        label: Joi.string(),
        width: Joi.number(),
        columns: Joi.array().items(Joi.link('#column')),
      }).id('column')),
      width: Joi.string().allow('1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'),
      title: Joi.string(),
    })),
  }),
  output: Joi.string().allow('pdf', 'html'),
  cypherDriver: Joi.object(),
});


async function buildReport(options) {
  const { error, value } = optionsSchema.validate(options);
  if (error) return error;

  // parse options
  const { queries, template, output, cypherDriver } = options;

  // run queries
  const dataStore = await cyq.runQueries(queries, cypherDriver);

  // fill template
  await publisher.produce(dataStore, template);
}



module.exports.optionsSchema = optionsSchema;
module.exports.buildReport = buildReport;