
const neo4j = require('neo4j-driver');

const queries = [
  {
    id: 'docs',
    query: `MATCH (d:document) 
    OPTIONAL MATCH (d)-[]->(f:file) 
    OPTIONAL MATCH (d)<-[r]-(p:part) 
    RETURN d as documents, f as files, r as docparts, p as parts ORDER BY documents._createdOn`,
  },
  {
    id: 'partCount',
    query: `MATCH (a:part) WHERE NOT(a)<-[:revises]-() RETURN COUNT(a) as partCount`,
  },
  {
    id: 'userCount',
    query: `MATCH (a:user) RETURN COUNT(a) as userCount`,
  },
  {
    id: 'documentCount',
    query: `MATCH (a:document) WHERE NOT(a)<-[:revises]-() RETURN COUNT(a) as documentCount`,
  },
  {
    id: 'partBom',
    query: `MATCH p=(a:part{_id:'8d835650-7b35-11eb-9cb7-e11518db4323'})-[:consumes*]->(items:part) 
            OPTIONAL MATCH (items)-[rel]->(docs:document)
            RETURN p,rel,docs`,
  }
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
      mapping: 'partCount.values.partCount',
      width: '4',
      title: '# Parts'
    },
    {
      id: 3,
      type: 'field',
      mapping: 'documentCount.values.documentCount',
      width: '4',
      title: '# Documents'
    },
    {
      id: 4,
      type: 'field',
      mapping: 'userCount.values.userCount',
      width: '4',
      title: '# Users'
    },
    {
      id: 5,
      type: 'table',
      mapping: 'partBom',
      width: '12',
      title: 'Document Listing',
      columns: [
        {
          field: 'properties._ref',
          label: 'Reference',
        },
        {
          field: 'properties.name',
          label: 'Name',
        },
        {
          field: 'properties._createdByName',
          label: 'Created By',
        },
        {
          field: 'properties._modifiedBy',
          label: 'Modified By',
        },
      ]
    }
  ]
};

module.exports = {
  queries, template, driver
};