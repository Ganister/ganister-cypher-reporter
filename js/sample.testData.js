
const neo4j = require('neo4j-driver');

const queries = [
  `MATCH (d:document) RETURN d as documents ORDER BY documents._createdOn`,
  `MATCH (a:part) RETURN COUNT(a) as partCount`,
  `MATCH (a:part)-[]->(d:document) RETURN a,d`,
];

const db = {
  boltURL: process.env.DB_BOLTURL,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USERNAME,
  encrypted: process.env.DB_ENCRYPTED,
};

const driver = neo4j.driver(db.boltURL, neo4j.auth.basic(
  db.username,
  db.password,
), { disableLosslessIntegers: true, encrypted: db.encrypted === 'true' });

const template = {
  name: 'test template',
  items: [
    {
      id: 1,
      type: 'field',
      mapping: 'partCount',
      width: '12',
      title: 'Test A Value'
    },
    {
      id: 2,
      type: 'container',
      width: '12',
      items: [
        {
          id: 3,
          type: 'field',
          mapping: 'a',
          width: '6',
          title: 'Test C Value'
        },
        {
          id: 4,
          type: 'field',
          mapping: 'b',
          width: '6',
          title: 'Test D Value'
        },
        {
          id: 5,
          type: 'table',
          mapping: 'documents',
          width: '12',
          title: 'Test D Value',
          columns: [
            {
              field: 'properties._ref',
            },
            {
              field: 'properties.name',
            },
            {
              field: 'properties._createdByName',
            },
          ]
        }
      ]
    }
  ]
};

module.exports = {
  queries, template, driver
};