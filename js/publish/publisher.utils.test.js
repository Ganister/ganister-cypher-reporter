const publisherUtils = require('./publisher.utils');


test('styleToString', async () => {

  const styleIn ={
    "background-color": '#C00000',
    "color": 'white',
  }
  const tdPadding = publisherUtils.styleToString(styleIn);
  expect(tdPadding).toBe('background-color:#C00000;color:white;');

});

test('formatValue', async () => {
  global.locale = "fr-FR";
  expect(publisherUtils.formatValue('10000.23','float')).toEqual(10000.23);
  expect(publisherUtils.formatValue('10000','float')).toEqual(10000);
  expect(publisherUtils.formatValue('55','integer')).toEqual(55);
  expect(publisherUtils.formatValue('10000.23','integer')).toEqual(10000);
  expect(publisherUtils.formatValue(111,'string')).toBe('111');
  expect(publisherUtils.formatValue('ceci est un test','string')).toBe('ceci est un test');
  expect(publisherUtils.formatValue('ceci est un test','filesize')).toBe('NaN kB');
  expect(publisherUtils.formatValue('12345','filesize')).toBe("12.3 kB");
  expect(publisherUtils.formatValue('ceci est un test','boolean')).toBe("✔️");
  expect(publisherUtils.formatValue(false,'boolean')).toBe('❌');
  expect(publisherUtils.formatValue('false','boolean')).toBe('❌');
  expect(publisherUtils.formatValue('01/02/2000','date')).toBe('02/01/2000');
  // expect(publisherUtils.formatValue('1650961016979','date')).toBe('04/26/2022');

});

test('Resolve Mapping', async () => {
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
  expect(publisherUtils.resolveMapping(dataSet, ['a', 'b', 'c', 'd'])).toBe(null);
  expect(publisherUtils.resolveMapping(dataSet, ['a', 'c', 'd'])).toBe(2);
  expect(publisherUtils.resolveMapping(dataSet, ['a', 'b'])).toBe(1);
  expect(publisherUtils.resolveMapping(dataSet, ['i'])).toBe(5);

});




test('Mapped Result', async () => {
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
  expect(publisherUtils.getMappedResult(dataSet, 'a.b.c.d')).toBe(" ");
  expect(publisherUtils.getMappedResult(dataSet, 'a.c.d')).toBe(2);
  expect(publisherUtils.getMappedResult(dataSet, 'a.b')).toBe(1);
  expect(publisherUtils.getMappedResult(dataSet, 'i')).toBe(5);
  expect(publisherUtils.getMappedResult(dataSet, 'h')).toBe(" ");

});
