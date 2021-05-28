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
        { type: 'link', attributes: { href: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css', rel: 'stylesheet' } },
        {
          type: 'style', content: `  
        @page {
          size: A4;
        }
    
        @page {
          size: 5.5in 8.5in;
        }
    
        @page :left {
          margin-left: 3cm;
        }
    
        @page :right {
          margin-left: 4cm;
        }
    
        .reportPage {
          padding: 10px 50px;
          border: solid 1px #333;
          box-shadow: 0px 0px 12px 3px #aaa;
        }
        #reportHeader{
          padding-bottom: 20px;
        }
        td,th{
          padding: 7px 5px;
        }
        `}
      ]
    }
  );
  const body = {
    type: 'body',
    attributes: {
      id: 'reportPage',
      class: 'reportPage',
    },
    content: [],
  };

  // add header
  body.content.push(buildReportHeader('Yoann Maingon'));
  // add hr separation
  body.content.push({
    type: 'hr',
  });

  // generate content
  if (template.items) {
    template.items.forEach((item) => {
      body.content.push(buildReportBlock(item, dataStore));
    });
  }
  const mainDataContent= {
    type: 'div',
    attributes: {
      class: 'row',
    },
    content:[],
  };
  mainDataContent.content.push(body);
  htmlCreatorContent.push(mainDataContent);
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
    attributes: { class: '' },
    content: [],
  };
  if (templateBlock.columns) {
    templateBlock.columns.forEach((col) => {
      headerBlock.content.push({
        type: 'th',
        attributes: { class: '' },
        content: col.label,
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
        attributes: { class: '' },
        content: [],
      };
      if (templateBlock.columns) {
        templateBlock.columns.forEach((col) => {
          rowBlock.content.push({
            type: 'td',
            attributes: { class: '' },
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
      type: 'h5',
      content: templateBlock.title,
      attributes: { class: ` ` },
    },
    {
      type: 'h4',
      content: getMappedResult(dataStore, templateBlock.mapping),
      attributes: { class: ` ` },
    },
  ];
  return fieldContent;
  ;
};









/**
 * 
 * @param {*} dataStore 
 * @param {*} mapping 
 * @returns 
 */
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







/**
 * 
 * @param {*} dataStore 
 * @param {*} mapping 
 * @returns 
 */
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
 * @param {*} userName 
 * @param {*} title 
 * @param {*} subtitle 
 * @returns 
 */
function buildReportHeader(userName, title = 'Report', subtitle = 'Report Name') {
  const date = Date.now();
  const formatedDate = new Intl.DateTimeFormat('fr-FR').format(date);
  const htmlBlock = {
    type: 'div',
    attributes: { class: 'row valign-wrapper' },
    content: [
      {
        type: 'div',
        attributes: { class: 'col s2' },
        content: [{
          type: 'img',
          attributes: { class: '', src: 'https://ganister.eu/images/G_50.png' },
        }],
      }, {
        type: 'div',
        attributes: { class: 'col s8' },
        content: [{
          type: 'h4',
          attributes: { class: '' },
          content: title,
        }, {
          type: 'h2',
          attributes: { class: '' },
          content: subtitle,
        }],
      }, {
        type: 'div',
        attributes: { class: 'col s2' },
        content: [{
          type: 'h6',
          attributes: { class: '' },
          content: userName,
        }, {
          type: 'h6',
          attributes: { class: '' },
          content: formatedDate,
        }],
      }
    ]
  };
  return htmlBlock;
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
      htmlBlock.attributes = { id: templateBlock.id, class: `col s${templateBlock.width}` };
      htmlBlock.content = buildReportField(templateBlock, dataStore);
      break;
    case 'container':
      htmlBlock.type = 'div';
      htmlBlock.attributes = { id: templateBlock.id, class: `row` };
      htmlBlock.content = templateBlock.items.map((item) => buildReportBlock(item, dataStore))
      break;
    case 'table':
      const tableBlock = {};
      tableBlock.type = 'table';
      tableBlock.attributes = { id: templateBlock.id, class: `` };
      tableBlock.content = buildReportTable(templateBlock, dataStore);
      htmlBlock.type = 'div';
      htmlBlock.attributes = { id: templateBlock.id, class: `` };
      htmlBlock.content = [tableBlock];
      break;
  }

  return htmlBlock;
}

module.exports.produce = produce;
module.exports.resolveMapping = resolveMapping;
module.exports.getMappedResult = getMappedResult;