const htmlCreator = require('html-creator');
const path = require('path');
const { htmlStyle } = require('./publisher.styles')
let locale = "fr-FR";

/**
 * produce
 * @param {*} dataStore 
 * @param {*} template 
 * @returns 
 */
async function produce(dataStore, template) {

  // init
  const htmlCreatorContent = [];
  locale = template.locale;

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


  // initialize body
  const body = {
    type: 'body',
    attributes: {
      id: 'reportPage',
      class: 'reportPage',
    },
    content: [
      // add report header
      buildReportHeader(template.author),
      // add hr separation
      { type: 'hr' },
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
  htmlCreatorContent.push(mainDataContent);

  // load htmlCreator content
  const html = new htmlCreator(htmlCreatorContent);

  // convert to html
  await html.renderHTMLToFile(path.join(process.cwd(), 'index.html'));
  return html.renderHTML();
};


/**
 * convertStoreToTableRows
 * @param {*} dataStoreElement 
 * @param {*} templateBlock 
 */
function convertStoreToTableRows(dataStoreElement, templateBlock) {
  const tableRows = [];
  const { nodes = [], edges = [] } = dataStoreElement;

  // retrieve root elements 
  const rootElements = { ...nodes };
  edges.forEach((edge) => {
    delete rootElements[edge.target];
  });


  for (const [key, value] of Object.entries(rootElements)) {
    tableRows.push(value);
    rowRecursiveHandler(value, nodes, edges, 0, templateBlock, tableRows);
  }


  return tableRows;
}

/**
 * rowRecursiveHandler
 * @param {*} rootElement 
 * @param {*} nodes 
 * @param {*} edges 
 * @param {*} level 
 * @param {*} templateBlock 
 * @param {*} tableRows 
 */
function rowRecursiveHandler(rootElement, nodes, edges, level, templateBlock, tableRows) {

  level++;
  rootElement.children = [];
  rootElement._level = level;
  delete rootElement.properties._promotions;
  delete rootElement.properties._history;


  // handle inline relationships
  edges
    .filter((edge) => edge.source === rootElement.identity)
    .filter((edge) => templateBlock.inlineRelationships.indexOf(edge.label) > -1)
    .forEach((edge) => {
      const subElement = nodes[edge.target];
      rowRecursiveHandler(subElement, nodes, edges, level, templateBlock, tableRows);
      rootElement.children.push({
        edge,
        node: subElement
      });

    });

  // handle subline relationships
  edges
    .filter((edge) => edge.source === rootElement.identity)
    .filter((edge) => templateBlock.inlineRelationships.indexOf(edge.label) < 0)
    .forEach((edge) => {
      const subElement = nodes[edge.target];
      tableRows.push(subElement);
      rowRecursiveHandler(subElement, nodes, edges, level, templateBlock, tableRows);
    });
}

/**
 * buildReportTable
 * @param {*} templateBlock 
 * @param {*} dataStore 
 * @returns 
 */
function buildReportTable(templateBlock, dataStore) {
  const tableBlockContent = [];
  // Add Headers
  const headerBlock = {
    type: 'div',
    attributes: { class: 'tr' },
    content: [],
  };
  if (templateBlock.columns) {
    const buildColumns = (columns) => {
      columns.forEach((col) => {
        if (col.fields) {
          headerBlock.content.push({
            type: 'div',
            attributes: { class: 'th', style: `width:${col.width}px;min-width:${col.width}px;` },
            content: col.label,
          });
        }
        if (col.columns) {
          buildColumns(col.columns)
        }
      });
    }
    buildColumns(templateBlock.columns);

  }
  tableBlockContent.push(headerBlock);

  const indentationColumns = 5;

  // Add Data
  const tableRows = convertStoreToTableRows(dataStore[templateBlock.mapping], templateBlock);
  if (tableRows) {
    tableRows.forEach((tableRow) => {
      const rowBlock = {
        type: 'div',
        attributes: { class: 'tr', id: tableRow.identity },
        content: [],
      };
      if (templateBlock.columns) {
        templateBlock.columns.forEach((col) => {
          if (col.fields) {

            if (col.indentation) {

              // Handle indentation column
              const indentCases = [];
              for (let i = 1; i < indentationColumns + 1; i++) {
                let cross = ' ';
                if (i == getTableMappedResult(tableRow, col.graphType, col.fields)) {
                  cross = '' + getTableMappedResult(tableRow, col.graphType, col.fields) + '';
                }
                indentCases.push({
                  type: 'div',
                  attributes: { class: 'td level', field: col.label, style: `text-align: center;min-width:${(col.width / indentationColumns) - 2}px;width:${(col.width / indentationColumns) - 2}px;` },
                  content: cross,
                });
              }
              rowBlock.content.push({
                type: 'div',
                attributes: { class: 'td indentation', field: col.label, style: `min-width:${col.width}px;width:${col.width}px;` },
                content: indentCases,
              });
            } else {

              // Handle normal column
              rowBlock.content.push({
                type: 'div',
                attributes: { class: 'td', field: col.label, style: `min-width:${col.width}px;width:${col.width}px;` },
                content: '' + getTableMappedResult(tableRow, col.graphType, col.fields) + ' ',
              });
            }
          }

          const handleSubColumns = (subcols, row, block) => {
            // if it has children
            if (row.node && row.node.children && row.node.children.length > 0) {
              row.children = row.node.children;
            }
            if (row.children && row.children.length > 0) {
              const childrenTdDiv = {
                type: 'div',
                attributes: { class: 'tdr' },
                content: [],
              };
              row.children.forEach((childRow) => {
                const subRowBlock = {
                  type: 'div',
                  attributes: { class: 'tr', id: childRow.node.identity },
                  content: [],
                };
                subcols.forEach((subCol) => {
                  if (subCol.columns) {
                    handleSubColumns(subCol.columns, childRow, subRowBlock);
                  } else {
                    subRowBlock.content.push({
                      type: 'div',
                      attributes: { class: 'td', field: subCol.label, style: `min-width:${subCol.width}px;width:${subCol.width}px;` },
                      content: '' + getTableMappedResult(childRow, subCol.graphType, subCol.fields, true) + ' ',
                    });
                  }
                });

                childrenTdDiv.content.push(subRowBlock)
              })
              block.content.push(childrenTdDiv);
            } else {

              // add spacers when no data is available
              const subRowArray = [];
              const subRowBlockSpacer = {
                type: 'div',
                attributes: { class: 'tr' },
                content: subRowArray,
              }
              subcols.forEach((subCol) => {
                if (subCol.columns) {
                  handleSubColumns(subCol.columns, {}, subRowBlockSpacer);
                } else {
                  subRowArray.push({
                    type: 'div',
                    attributes: { class: 'td spacer', field: subCol.label, style: `min-width:${subCol.width}px;width:${subCol.width}px;` },
                    content: ' ',
                  });
                }
              });
              block.content.push({
                type: 'div',
                attributes: { class: 'tdr', style: 'display: flex;' },
                content: [subRowBlockSpacer],
              });

            }
          }

          if (col.columns) {
            handleSubColumns(col.columns, tableRow, rowBlock);
          }
        });
      }
      tableBlockContent.push(rowBlock);
    });
  }
  return tableBlockContent;
};







/**
 * buildReportField
 * @param {*} templateBlock 
 * @param {*} dataStore 
 * @returns 
 */
function buildReportField(templateBlock, dataStore) {
  const fieldContent = [
    {
      type: 'h6',
      content: templateBlock.title,
      attributes: { class: ` ` },
    },
    {
      type: 'h5',
      content: getMappedResult(dataStore, templateBlock.mapping),
      attributes: { class: `dataField` },
    },
  ];
  return fieldContent;
  ;
};





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
      return dataStore[mapping][0] || null;
    } else {
      return dataStore[mapping] || null;
    }
  } else if (mappingArray.length > 1) {
    // retrieve object value
    const value = resolveMapping(dataStore, mappingArray);

    // return the formatted result
    return formatValue(value, datatype);
  }
  return null;
}




/**
 * getTableMappedResult
 * @param {*} dataStore 
 * @param {*} graphType 
 * @param {*} mapping 
 * @param {*} children 
 * @returns 
 */
function getTableMappedResult(dataStore, graphType, mapping, children = false) {
  let label;
  if (graphType === 'node') {
    if (children) {
      label = dataStore.node.labels[0];
    } else {
      label = dataStore.labels[0];
    }
  } else {
    if (children) {
      label = dataStore.edge.label;
    } else {
      label = dataStore.label;
    }
  }

  if (mapping && (label in mapping)) {
    const mappingArray = mapping[label].map.split('.');
    const datatype = mapping[label].datatype;
    if (mappingArray.length === 1) {
      if (Array.isArray(dataStore[mapping[label]]) && dataStore[mapping[label].map].length === 1) {
        return dataStore[mapping[label].map][0] || null;
      } else {
        return dataStore[mapping[label].map] || null;
      }
    } else if (mappingArray.length > 1) {
      const value = resolveMapping(dataStore, mappingArray);
      return formatValue(value, datatype);
    }
  }
  return ' ';
}



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


/**
 * formatValue
 * @param {*} value 
 * @param {*} type 
 */
function formatValue(value, type) {
  let formattedValue = value;
  if (value && value != "") {
    switch (type) {
      case 'string':
        formattedValue = value;
        break;
      case 'filesize':
        if (value) {
          formattedValue = humanFileSize(value, true);
        }
        break;
      case 'date':
        formattedValue = new Date(value).toLocaleDateString(locale);
        break;
      case 'boolean':
        if (!!JSON.parse(value)) {
          formattedValue = "✔️";
        } else {
          formattedValue = "❌";
        }
        break;
      default:
        formattedValue = value;
        break;
    }
  } else {
    formattedValue = " ";
  }

  return formattedValue;
}



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
    type: 'div',
    attributes: { class: 'row valign-wrapper' },
    content: [
      {
        type: 'div',
        attributes: { class: 'col s2 center-align' },
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