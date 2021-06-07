
const Joi = require('joi');
const cyq = require('./js/cypherQueries');
const builder = require('./js/template');
const publisher = require('./js/publisher');

const optionsSchema = Joi.object({
  queries: Joi.array(),
  template: Joi.object({
    name: Joi.string(),
    items: Joi.array().items(Joi.object({
      id: Joi.number(),
      type: Joi.string().allow('field', 'table', 'graph'),
      mapping: Joi.string(),
      width: Joi.string().allow('1', '2', '3', '4', '5', '6'),
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



module.exports.buildReport = buildReport;