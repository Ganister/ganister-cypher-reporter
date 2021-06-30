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
      ]
    }
  ]
};

test('Recursive Test 1', async () => {
  const dataSet = {
    a: {
      b: 1,
      c: {
        d: 2,
        e: {
          f: 3,
          g: {
            h: 4
          }
        }
      }
    },
    i: 5,
  }
  expect(publisher.resolveMapping(dataSet, ['a', 'b', 'c', 'd'])).toBe(null);
  expect(publisher.resolveMapping(dataSet, ['a', 'c', 'd'])).toBe(2);
  expect(publisher.resolveMapping(dataSet, ['a', 'b'])).toBe(1);
  expect(publisher.resolveMapping(dataSet, ['i'])).toBe(5);

});




test('Recursive Test 2', async () => {
  const dataSet = {
    a: {
      b: 1,
      c: {
        d: 2,
        e: {
          f: 3,
          g: {
            h: 4
          }
        }
      }
    },
    i: 5,
  }
  expect(publisher.getMappedResult(dataSet, 'a.b.c.d')).toBe(" ");
  expect(publisher.getMappedResult(dataSet, 'a.c.d')).toBe(2);
  expect(publisher.getMappedResult(dataSet, 'a.b')).toBe(1);
  expect(publisher.getMappedResult(dataSet, 'i')).toBe(5);
  expect(publisher.getMappedResult(dataSet, 'h')).toBe(" ");

});


test('Produce an HTML report', async () => {
  const report = await publisher.produce(dataStore, template);
});