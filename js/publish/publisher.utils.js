const dayjs = require('dayjs')
const localizedFormat = require('dayjs/plugin/localizedFormat')
require('dayjs/locale/fr')
require('dayjs/locale/de')
require('dayjs/locale/en')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone') // dependent on utc plugin
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)
/**
 * humanFileSize
 * transforms a byte size of file into human readable format
 * @param {*} bytes 
 * @param {*} si 
 */
function humanFileSize(bytes, si) {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return `${bytes.toFixed(1)} ${units[u]}`;
}

module.exports.humanFileSize = humanFileSize;

/**
 * styleToString
 */
function styleToString(style) {
  return Object.keys(style).reduce((acc, key) => (
    acc + key.split(/(?=[A-Z])/).join('-').toLowerCase() + ':' + style[key] + ';'
  ), '');
};

module.exports.styleToString = styleToString;

/**
 * formatValue
 * @param {*} value 
 * @param {*} type 
 */
function formatValue(value = " ", type, TZ = 'Europe/Paris') {
  if (global.locale && global.locale.split('-').length > 0) dayjs.locale(global.locale.split('-')[0]);
  let formattedValue = value;
  if (type && type.type) {
    formattedValue = global._dataConverters[type.type](value, type.options);
  } else {
    if (value !== null && value !== undefined) {
      switch (type) {
        case 'float':
          formattedValue = parseFloat(value);
          break;
        case 'integer':
          formattedValue = parseInt(value);
          break;
        case 'string':
          formattedValue = value.toString();
          break;
        case 'filesize':
          formattedValue = humanFileSize(value, true);
          break;
        case 'date':
          formattedValue = dayjs(value).tz(TZ).format('L');
          break;
        case 'boolean':
          if (!!(value) && value !== 'false') {
            formattedValue = "??????";
          } else {
            formattedValue = "???";
          }
          break;
        default:
          formattedValue = value;
          break;
      }
    }
  }
  if (formattedValue === null || formattedValue === undefined || formattedValue === "") {
    formattedValue = " ";
  }
  return formattedValue;
}

module.exports.formatValue = formatValue;


/**
 * resolveMapping
 * @param {*} dataStore 
 * @param {*} mapping 
 * @returns 
 */
function resolveMapping(dataStore, mapping) {

  // check if data exists and if mapping exists
  if (!dataStore || mapping.length < 1) return null;

  if (mapping.length > 1) {

    // if object mapping go on object deeper and restart this method recursively
    const firstElt = mapping.shift();
    return resolveMapping(dataStore[firstElt], mapping);

  } else {

    // if value mapping return data
    const firstElt = mapping.shift();
    return dataStore[firstElt];
  }
}



module.exports.resolveMapping = resolveMapping;

/**
 * getMappedResult
 * @param {*} dataStore 
 * @param {*} mapping 
 * @param {*} datatype 
 * @returns 
 */
function getMappedResult(dataStore, mapping, datatype) {

  // convert mapping into array
  const mappingArray = mapping.split('.');
  if (mappingArray.length === 1) {
    if (Array.isArray(dataStore[mapping]) && dataStore[mapping].length === 1) {
      return dataStore[mapping][0] || " ";
    } else {
      return dataStore[mapping] || " ";
    }
  } else if (mappingArray.length > 1) {
    // retrieve object value
    const value = resolveMapping(dataStore, mappingArray);

    // return the formatted result
    return formatValue(value, datatype);
  }
  return " ";
}
module.exports.getMappedResult = getMappedResult;
