const publisher = require('./publisher');
const { dataStore } = require('./published.sampleData');
const template = {
  name: 'test template',
  items: [
    {
      id: 1,
      type: 'field',
      mapping: 'partCount.values.partCount',
      width: '2',
      title: '# Parts'
    },
    {
      id: 3,
      type: 'field',
      mapping: 'documentCount.values.documentCount',
      width: '2',
      title: '# Documents'
    },
    {
      id: 4,
      type: 'field',
      mapping: 'userCount.values.userCount',
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
          fields: { part: '_level', user: '_level' },
          label: 'Level',
          width: 120,
        },
        {
          graphType: 'node',
          fields: { part: 'properties._ref', user: 'properties.lastName' },
          label: 'Ref',
          width: 130,
        },
        {
          graphType: 'node',
          fields: { part: 'properties.name' },
          label: 'Name',
          width: 160,
        },
        {
          graphType: 'node',
          fields: { part: 'properties._createdByName' },
          label: 'Created By',
          width: 150,
        },
        {
          graphType: 'node',
          fields: { part: 'properties._createdOn' },
          label: 'Created On',
          width: 160,
        },
        {
          id: 'Docs',
          columns: [
            {
              graphType: 'node',
              fields: { document: 'node.properties._ref' },
              label: 'Ref Doc',
              width: 200,
            },
            {
              graphType: 'node',
              fields: { document: 'node.properties.name' },
              label: 'Title Doc',
              width: 200,
            },
          ]
        },
        {
          graphType: 'node',
          fields: { user: 'properties.email' },
          label: 'email',
          width: 200,
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
  expect(publisher.getMappedResult(dataSet, 'a.b.c.d')).toBe(null);
  expect(publisher.getMappedResult(dataSet, 'a.c.d')).toBe(2);
  expect(publisher.getMappedResult(dataSet, 'a.b')).toBe(1);
  expect(publisher.getMappedResult(dataSet, 'i')).toBe(5);
  expect(publisher.getMappedResult(dataSet, 'h')).toBe(null);

});

test('Produce an HTML report', async () => {
  const report = await publisher.produce(dataStore, template);
});