
const fs = require('fs')

const publisher = require('./publisher');
const { dataStore } = require('./published.sampleData');
const template = {
  name: 'test template',
  locale : "fr-FR",
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
          category: 'Part',
          width: 120,
        },
        {
          graphType: 'node',
          fields: {
            part: { map: 'relProps.quantity', datatype: 'string' },
          },
          label: 'Qty',
          category: 'Part',
          width: 130,
        },
        {
          graphType: 'node',
          fields: {
            part: { map: 'properties._ref', datatype: 'string' },
            user: { map: 'properties.lastName', datatype: 'string' }
          },
          label: 'Ref',
          category: 'Part',
          width: 130,
        },
        {
          graphType: 'node',
          fields: { part: { map: 'properties.name', datatype: 'string' } },
          label: 'Name',
          category: 'Part',
          width: 160,
        },
        {
          graphType: 'node',
          fields: { part: { map: 'properties._createdByName', datatype: 'string' } },
          label: 'Created By',
          category: 'Part',
          width: 150,
        },
        {
          graphType: 'node',
          fields: { part: { map: 'properties._createdOn', datatype: 'date' } },
          label: 'Created On',
          category: 'Part',
          width: 160,
        },
        {
          columns: [
            {
              graphType: 'node',
              fields: { document: { map: 'node.properties._ref', datatype: 'string' } },
              label: 'Ref Doc',
              category: 'Document',
              width: 200,
            },
            {
              graphType: 'node',
              fields: { document: { map: 'node.properties.name', datatype: 'string' } },
              label: 'Title Doc',
              category: 'Document',
              width: 200,
            },
            {
              columns: [
                {
                  graphType: 'node',
                  fields: { file: { map: 'node.properties.filename', datatype: 'string' } },
                  label: 'File Ref',
                  category: 'File',
                  width: 200,
                },
                {
                  graphType: 'node',
                  fields: { file: { map: 'node.properties.filesize', datatype: 'filesize' } },
                  label: 'FileSize',
                  category: 'File',
                  width: 200,
                },
                {
                  graphType: 'node',
                  fields: { file: { map: 'node.properties.name', datatype: 'string' } },
                  label: 'Name',
                  category: 'File',
                  width: 300,
                },
              ]
            },
          ]
        },
      ]
    }
  ]
};


test('Produce an HTML report', async () => {
  const report = await publisher.produce(dataStore, template);
  fs.writeFile("temp/pubTest.html", report, 'utf8', function (err) {
  });
});