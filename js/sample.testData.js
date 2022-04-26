
const neo4j = require('neo4j-driver');

const queries = [
  {
    id: 'docs',
    query: `MATCH (d:document) 
    OPTIONAL MATCH (d)-[df]->(f:file) 
    OPTIONAL MATCH (d)<-[r]-(p:part) 
    RETURN d as documents,df, f as files, r as docparts, p as parts ORDER BY documents._createdOn`,
    ordering: [],
    structure: [
      {
        identifier: "documents",
        children: [
          {
            identifier: "df",
            children: [
              {
                identifier: "files",
                children: [],
              }
            ],
          }, {
            identifier: "docparts",
            children: [
              {
                identifier: "parts",
                children: [],
              }
            ],
          }
        ],
      }
    ]
  },
  {
    id: 'partCount',
    query: `MATCH (a:part) WHERE NOT(a)<-[:revises]-() RETURN COUNT(a) as partCount`,
    ordering: [],
    structure: []
  },
  {
    id: 'userCount',
    query: `MATCH (a:user) RETURN COUNT(a) as userCount`,
    ordering: [],
    structure: []
  },
  {
    id: 'documentCount',
    query: `MATCH (a:document) WHERE NOT(a)<-[:revises]-() RETURN COUNT(a) as documentCount`,
    ordering: [],
    structure: []
  },
  {
    id: 'partBom',
    query: `MATCH p=(a:part{_id:'8d835650-7b35-11eb-9cb7-e11518db4323'})-[:consumes*]->(items:part) 
            OPTIONAL MATCH (items)-[rel]->(docs:document)
            OPTIONAL MATCH (docs)-[rel2]->(f:file)
            RETURN p,rel,docs,rel2,f`,
    ordering: [],
    structure: [
      {
        identifier: "p",
        children: [
          {
            identifier: "relf",
            children: [
              {
                identifier: "docs",
                children: [
                  {
                    identifier: "rel2",
                    children: [
                      {
                        identifier: "f",
                        children: [],
                      }
                    ],
                  }
                ],
              }
            ],
          },
        ],
      }
    ]
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
  locale: "fr-FR",
  author: 'Yoann Maingon',
  items: [
    {
      id: 1,
      type: 'field',
      mapping: 'partCount.values.partCount',
      datatype: 'integer',
      width: '2',
      title: '# Parts'
    },
    {
      id: 3,
      type: 'field',
      mapping: 'documentCount.values.documentCount',
      datatype: 'integer',
      width: '2',
      title: '# Documents'
    },
    {
      id: 4,
      type: 'field',
      mapping: 'userCount.values.userCount',
      datatype: 'integer',
      width: '2',
      title: '# Users'
    },
    {
      id: 5,
      type: 'table',
      mapping: 'partBom',
      width: '12',
      title: 'Part BOM and Documents',
      inlineRelationships: ['contains'],
      columns: [
        {
          graphType: 'node',
          indentation: true,
          fields: { part: { map: '_level', datatype: 'level' }, user: { map: '_level', datatype: 'level' } },
          label: 'Level',
          width: 120,
        },
        {
          graphType: 'node',
          fields: {
            part: { map: 'properties._ref', datatype: 'string' },
            user: { map: 'properties.lastName', datatype: 'string' }
          },
          label: 'Ref',
          width: 130,
        },
        {
          graphType: 'node',
          fields: { part: { map: 'properties.name', datatype: 'string' } },
          label: 'Name',
          width: 160,
        },
        {
          graphType: 'node',
          fields: { part: { map: 'properties._createdByName', datatype: 'string' } },
          label: 'Created By',
          width: 150,
        },
        {
          graphType: 'node',
          fields: { part: { map: 'properties._createdOn', datatype: 'date' } },
          label: 'Created On',
          width: 160,
        },
        {
          columns: [
            {
              graphType: 'node',
              fields: { document: { map: 'node.properties._ref', datatype: 'string' } },
              label: 'Ref Doc',
              width: 200,
            },
            {
              graphType: 'node',
              fields: { document: { map: 'node.properties.name', datatype: 'string' } },
              label: 'Title Doc',
              width: 200,
            },
            {
              columns: [
                {
                  graphType: 'node',
                  fields: { file: { map: 'node.properties.filename', datatype: 'string' } },
                  label: 'File Ref',
                  width: 200,
                },
                {
                  graphType: 'node',
                  fields: { file: { map: 'node.properties.filesize', datatype: 'filesize' } },
                  label: 'FileSize',
                  width: 200,
                },
                {
                  graphType: 'node',
                  fields: { file: { map: 'node.properties.name', datatype: 'string' } },
                  label: 'Name',
                  width: 300,
                },
              ]
            },
          ]
        },
        // {
        //   graphType: 'node',
        //   fields: { user: { map: 'properties.email', datatype: 'email' } },
        //   label: 'email',
        //   width: 200,
        // },
      ]
    }
  ]
};

module.exports = {
  queries, template, driver
};