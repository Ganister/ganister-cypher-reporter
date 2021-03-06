const htmlCreator = require('html-creator');
const { htmlStyle } = require('./publisher.styles')
const { resolveMapping, getMappedResult, styleToString } = require('./publisher.utils')
const { buildReportTable } = require('./publisher.tableConverter')
global.locale = "fr-FR";

/**
 * produce
 * @param {*} dataStore 
 * @param {*} template 
 * @returns 
 */
async function produce(dataStore, template) {

  // init
  const htmlCreatorContent = [];
  global.locale = template.locale;
  global.indentationColumns = template.indentationColumns || 8;

  // build header
  const head = {
    type: 'head',
    content: [
      { type: 'title', content: `Ganister Report : ${template.name}` },
      { type: 'link', attributes: { href: 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css', rel: 'stylesheet' } },
      {
        type: 'style', content: htmlStyle
      }
    ]
  };

  reportLabel = {
    'fr-FR': 'Rapport',
    'en-EN': 'Report'
  }

  // initialize body
  const reportHeader = buildReportHeader(template.author, reportLabel[global.locale], template.name);
  const body = {
    type: 'body',
    attributes: {
      id: 'reportPage',
      class: 'reportPage',
    },
    content: [
      // add hr separation
    ],
  };


  // generate content
  if (template.items) {
    template.items.forEach((item) => {
      body.content.push(buildReportBlock(item, dataStore));
    });
  }
  const mainDataContent = {
    type: 'div',
    attributes: {
      class: 'row',
    },
    content: [body],
  };


  // Assemble the main document
  htmlCreatorContent.push(head);
  htmlCreatorContent.push(reportHeader);
  htmlCreatorContent.push(mainDataContent);

  // load htmlCreator content
  const html = new htmlCreator(htmlCreatorContent);

  // convert to html
  // await html.renderHTMLToFile(path.join(process.cwd(), 'index.html'));
  const result = await html.renderHTML();
  return result;
};









/**
 * buildReportField
 * @param {*} templateBlock 
 * @param {*} dataStore 
 * @returns 
 */
function buildReportField(templateBlock, dataStore) {
  let tdStyle = '';
  if (templateBlock.style) {
    tdStyle = tdStyle + styleToString(templateBlock.style);
  }
  const fieldContent = [
    {
      type: 'h6',
      content: templateBlock.title,
      attributes: { class: ` ` },
    },
    {
      type: 'h5',
      content: getMappedResult(dataStore, templateBlock.mapping, templateBlock.datatype),
      attributes: { class: `dataField`, style: tdStyle },
    },
  ];
  return fieldContent;
  ;
};




/**
 * buildReportHeader
 * @param {*} userName 
 * @param {*} [title='Report'] 
 * @param {*} [subtitle='Report Name'] 
 * @returns 
 */
function buildReportHeader(userName, title = 'Report', subtitle = 'Report Name') {
  const date = Date.now();
  const formatedDate = new Intl.DateTimeFormat('fr-FR').format(date);
  const htmlBlock = {
    type: 'table',
    attributes: { class: 'table' },
    content: [
      {
        type: 'tr',
        content: [
          {
            type: 'td',
            attributes: { class: 'col s2 center-align', colspan: '5' },
            content: [{
              type: 'img',
              attributes: { class: '', src: 'https://ganister.eu/images/G_50.png' },
            }],
          }, {
            type: 'td',
            attributes: { class: 'col s8', colspan: '8' },
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
            type: 'td',
            attributes: { class: 'col s2', colspan: '5' },
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
      htmlBlock.attributes = { id: templateBlock.id, class: `col s${templateBlock.width}` };
      htmlBlock.content = templateBlock.items.map((item) => buildReportBlock(item, dataStore))
      break;

    case 'table':
      const tableTitle = {};
      tableTitle.type = 'h4';
      tableTitle.content = templateBlock.title;
      const tableBlock = {};
      tableBlock.type = 'table';
      tableBlock.attributes = { id: templateBlock.id, class: `` };
      tableBlock.content = buildReportTable(templateBlock, dataStore);
      htmlBlock.type = 'div';
      htmlBlock.attributes = { id: templateBlock.id, class: `col s${templateBlock.width}` };
      htmlBlock.content = [tableTitle, tableBlock];
      break;

  }

  return htmlBlock;
}

module.exports.produce = produce;
module.exports.resolveMapping = resolveMapping;
module.exports.getMappedResult = getMappedResult;