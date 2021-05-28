const publisher = require('./publisher');
const { dataStore } = require('./published.sampleData');

const template = {
  name: 'test template',
  items: [
    {
      id: 1,
      type: 'field',
      mapping: 'a',
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
          mapping: 'a',
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
          ]
        }
      ]
    }
  ]
};



test('Recursive Test', async () => {
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
    i:5,
  }
  expect(publisher.resolveMapping(dataSet, ['a','b','c','d'])).toBe(null);
  expect(publisher.resolveMapping(dataSet, ['a','c','d'])).toBe(2);
  expect(publisher.resolveMapping(dataSet, ['a','b'])).toBe(1);
  expect(publisher.resolveMapping(dataSet, ['i'])).toBe(5);

});




test('Recursive Test', async () => {
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
    i:5,
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