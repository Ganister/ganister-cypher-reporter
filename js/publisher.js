const htmlCreator = require('html-creator');
const path = require('path');
const { css } = require('./../css/css')

/**
 * 
 * @param {*} dataStore 
 * @param {*} template 
 * @returns 
 */
async function produce(dataStore, template) {

  // init
  const htmlCreatorContent = [];

  // build header
  htmlCreatorContent.push(
    {
      type: 'head',
      content: [
        { type: 'title', content: `Ganister Report : ${template.name}` },
        { type: 'link', attributes: { href: 'https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css', rel: 'stylesheet' } },
      ]
    }
  );

  // generate content
  if (template.items) {
    template.items.forEach((item) => {
      htmlCreatorContent.push(buildReportBlock(item, dataStore));
    });
  }

  // load htmlCreator content
  const html = new htmlCreator(htmlCreatorContent);

  // convert to html
  await html.renderHTMLToFile(path.join(process.cwd(), 'index.html'));
  return html.renderHTML();
};



/**
 * 
 * @param {*} templateBlock 
 * @param {*} dataStore 
 * @returns 
 */
function buildReportTable(templateBlock, dataStore) {
  const tableBlockContent = [];
  // Add Headers
  const headerBlock = {
    type: 'tr',
    attributes: { class: 'bg-gray-200 text-gray-600 uppercase text-sm leading-normal' },
    content: [],
  };
  if (templateBlock.columns) {
    templateBlock.columns.forEach((col) => {
      headerBlock.content.push({
        type: 'th',
        attributes: { class: 'py-3 px-6 text-left' },
        content: col.field,
      });
    });
  }
  tableBlockContent.push(headerBlock);

  // Add Data
  const data = dataStore[templateBlock.mapping];
  if (data) {
    data.forEach((row) => {
      const rowBlock = {
        type: 'tr',
        attributes: { class: 'border-b border-gray-200 hover:bg-gray-100' },
        content: [],
      };
      if (templateBlock.columns) {
        templateBlock.columns.forEach((col) => {
          rowBlock.content.push({
            type: 'td',
            attributes: { class: 'py-3 px-6 text-left whitespace-nowrap' },
            content: getMappedResult(row, col.field),
          });
        });
      }
      tableBlockContent.push(rowBlock);
    });
  }
  return tableBlockContent;
};

/**
 * 
 * @param {*} templateBlock 
 * @param {*} dataStore 
 * @returns 
 */
function buildReportField(templateBlock, dataStore) {
  const fieldContent = [
    {
      type: 'div',
      content: templateBlock.title,
      attributes: { class: `w-3/12 ` },
    },
    {
      type: 'div',
      content: getMappedResult(dataStore, templateBlock.mapping),
      attributes: { class: `w-9/12 ` },
    },
  ];
  return fieldContent;
  ;
};

function getMappedResult(dataStore, mapping) {

  const mappingArray = mapping.split('.');
  if (mappingArray.length === 1) {
    if (Array.isArray(dataStore[mapping]) && dataStore[mapping].length === 1) {
      return dataStore[mapping][0] || null;

    } else {
      return dataStore[mapping] || null;
    }
  } else if (mappingArray.length > 1) {
    return resolveMapping(dataStore, mappingArray);
  }
  return null;
}

function resolveMapping(dataStore, mapping) {
  if (!dataStore || mapping.length < 1) return null;
  if (mapping.length > 1) {
    const firstElt = mapping.shift();
    return resolveMapping(dataStore[firstElt], mapping);
  } else {
    const firstElt = mapping.shift();
    return dataStore[firstElt]
  }
}



/**
 * 
 * @param {*} templateBlock 
 * @param {*} dataStore 
 * @returns 
 */
function buildReportBlock(templateBlock, dataStore) {
  const htmlBlock = {};
  switch (templateBlock.type) {
    case 'field':
      htmlBlock.type = 'div';
      htmlBlock.attributes = { id: templateBlock.id, class: `flex` };
      htmlBlock.content = buildReportField(templateBlock, dataStore);
      break;
    case 'container':
      htmlBlock.type = 'div';
      htmlBlock.attributes = { id: templateBlock.id, class: `container` };
      htmlBlock.content = templateBlock.items.map((item) => buildReportBlock(item, dataStore))
      break;
    case 'table':
      htmlBlock.type = 'table';
      htmlBlock.attributes = { id: templateBlock.id, class: `min-w-max w-full table-auto` };
      htmlBlock.content = buildReportTable(templateBlock, dataStore);
      break;
  }

  return htmlBlock;
}

module.exports.produce = produce;
module.exports.resolveMapping = resolveMapping;
module.exports.getMappedResult = getMappedResult;