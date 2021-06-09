const htmlCreator = require('html-creator');
const path = require('path');
const { htmlStyle } = require('./publisherStyles')




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
          type: 'style', content: htmlStyle
        }
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
  const mainDataContent = {
    type: 'div',
    attributes: {
      class: 'row',
    },
    content: [],
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
 * @param {*} dataStore 
 */
function convertStoreToTableRows(dataStoreElement, templateBlock) {
  const tableRows = [];
  const { nodes, edges } = dataStoreElement;

  // retrieve root elements 
  const rootElements = { ...nodes };
  edges.forEach((edge) => {
    delete rootElements[edge.target];
  });


  const rowRecursiveHandler = (rootElement, nodes, edges, level = 0, templateBlock) => {

    level++;
    rootElement.children = [];
    rootElement._level = level;
    delete rootElement.properties._promotions;
    delete rootElement.properties._history;
    tableRows.push(rootElement);
    // handle inline relationships
    edges
      .filter((edge) => edge.source === rootElement.identity)
      .filter((edge) => templateBlock.inlineRelationships.indexOf(edge.label) > -1)
      .forEach((edge) => {
        // console.log("LOG / file: publisher.js / line 120 / .forEach / edge", edge);
        rootElement.children.push({
          edge,
          node: nodes[edge.target]
        });
      });

    // handle subline relationships
    edges
      .filter((edge) => edge.source === rootElement.identity)
      .filter((edge) => templateBlock.inlineRelationships.indexOf(edge.label) < 0)
      .forEach((edge) => {
        // console.log("LOG / file: publisher.js / line 132 / .forEach / edge", edge);
        const subElement = nodes[edge.target];
        rowRecursiveHandler(subElement, nodes, edges, level, templateBlock);
      });
  }

  for (const [key, value] of Object.entries(rootElements)) {
    rowRecursiveHandler(value, nodes, edges, 0, templateBlock);
  }

  // console.log("LOG / file: publisher.js / line 114 / rowRecursiveHandler / tableRows", JSON.stringify(tableRows));

  return tableRows;
}



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
    type: 'div',
    attributes: { class: 'tr' },
    content: [],
  };
  if (templateBlock.columns) {
    templateBlock.columns.forEach((col) => {
      if (col.fields) {
        headerBlock.content.push({
          type: 'div',
          attributes: { class: 'th', style: `width:${col.width}px;min-width:${col.width}px;` },
          content: col.label,
        });
      }
      if (col.columns) {
        col.columns.forEach((subCol) => {
          headerBlock.content.push({
            type: 'div',
            attributes: { class: 'th', style: `width:${subCol.width}px;min-width:${subCol.width}px;` },
            content: subCol.label,
          });
        })
      }
    });
  }
  tableBlockContent.push(headerBlock);

  const indentationColumns = 10;

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
              const indentCases = [];
              for (let i = 1; i < indentationColumns + 1; i++) {
                let cross = ' ';
                if (i == getTableMappedResult(tableRow, col.graphType, col.fields)) {
                  cross = '' + getTableMappedResult(tableRow, col.graphType, col.fields) + '';
                }
                indentCases.push({
                  type: 'div',
                  attributes: { class: 'td level', field: col.label, style: `text-align: center;min-width:${(col.width / indentationColumns)-2}px;width:${(col.width / indentationColumns)-2}px;` },
                  content: cross,
                });
              }
              rowBlock.content.push({
                type: 'div',
                attributes: { class: 'td indentation', field: col.label, style: `min-width:${col.width}px;width:${col.width}px;` },
                content: indentCases,
              });
            } else {
              rowBlock.content.push({
                type: 'div',
                attributes: { class: 'td', field: col.label, style: `min-width:${col.width}px;width:${col.width}px;` },
                content: '' + getTableMappedResult(tableRow, col.graphType, col.fields) + '',
              });
            }
          }
          if (col.columns) {
            // if it has children
            if (tableRow.children && tableRow.children.length > 0) {
              const childrenTdDiv = {
                type: 'div',
                attributes: { class: 'tdr' },
                content: [],
              };
              tableRow.children.forEach((childRow) => {
                const subRowBlock = {
                  type: 'div',
                  attributes: { class: 'tr', id: childRow.identity },
                  content: [],
                };
                col.columns.forEach((subCol) => {
                  subRowBlock.content.push({
                    type: 'div',
                    attributes: { class: 'td', field: subCol.label, style: `min-width:${subCol.width}px;width:${subCol.width}px;` },
                    content: '' + getTableMappedResult(childRow, subCol.graphType, subCol.fields, true) + ' ',
                  });
                });

                childrenTdDiv.content.push(subRowBlock)
              })
              rowBlock.content.push(childrenTdDiv);
            } else {
              // add spacers
              const subRowArray = [];
              col.columns.forEach((subCol) => {
                subRowArray.push({
                  type: 'div',
                  attributes: { class: 'td spacer', field: subCol.fields[0], style: `min-width:${subCol.width}px;width:${subCol.width}px;` },
                  content: ' ',
                });
              });
              rowBlock.content.push({
                type: 'div',
                attributes: { class: 'tdr' },
                content: [{
                  type: 'div',
                  attributes: { class: 'tr' },
                  content: subRowArray,
                }],
              });
            }
          }
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

  if (label in mapping) {
    const mappingArray = mapping[label].split('.');
    if (mappingArray.length === 1) {
      if (Array.isArray(dataStore[mapping[label]]) && dataStore[mapping[label]].length === 1) {
        return dataStore[mapping[label]][0] || null;
      } else {
        return dataStore[mapping[label]] || null;
      }
    } else if (mappingArray.length > 1) {
      return resolveMapping(dataStore, mappingArray);
    }
  }
  return ' ';
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