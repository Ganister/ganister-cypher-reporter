
const { resolveMapping, formatValue } = require('./publisher.utils')

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
    type: 'tr',
    attributes: { class: 'tr' },
    content: [],
  };
  if (templateBlock.columns) {
    const buildColumns = (columns) => {
      columns.forEach((col) => {
        if (col.fields) {
          headerBlock.content.push({
            type: 'td',
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


  // Add Data
  const tableRows = convertStoreToTableRows(dataStore[templateBlock.mapping], templateBlock);
  if (tableRows) {
    tableRows.forEach((tableRow) => {
      const rowBlock = {
        type: 'tr',
        attributes: { class: 'tr', id: tableRow.identity },
        content: [],
      };
      if (templateBlock.columns) {
        templateBlock.columns.forEach((col) => {
          if (col.fields) {

            if (col.indentation) {

              // Handle indentation column
              const indentCases = [];
              for (let i = 1; i < global.indentationColumns + 1; i++) {
                let cross = ' ';
                if (i == getTableMappedResult(tableRow, col.graphType, col.fields)) {
                  cross = '' + getTableMappedResult(tableRow, col.graphType, col.fields) + '';
                }
                indentCases.push({
                  type: 'td',
                  attributes: { class: 'td level', field: col.label, style: `text-align: center;min-width:${(col.width / global.indentationColumns) - 2}px;width:${(col.width / global.indentationColumns) - 2}px;` },
                  content: cross,
                });
              }
              rowBlock.content.push({
                type: 'td',
                attributes: { class: 'td indentation', field: col.label, style: `min-width:${col.width}px;width:${col.width}px;` },
                content: [
                  {
                    type: 'table', content: [
                      { type: 'tr', attributes: { class: 'indentLine' }, content: indentCases }
                    ]
                  }
                ],
              });
            } else {

              // Handle normal column
              rowBlock.content.push({
                type: 'td',
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
              const subRowBlockArr = [];

              row.children.forEach((childRow) => {
                const subRowBlock = {
                  type: 'tr',
                  attributes: { class: 'tr', id: childRow.node.identity },
                  content: [],
                };
                subcols.forEach((subCol) => {
                  if (subCol.columns) {
                    handleSubColumns(subCol.columns, childRow, subRowBlock);
                  } else {
                    subRowBlock.content.push({
                      type: 'td',
                      attributes: { class: 'td', field: subCol.label, style: `min-width:${subCol.width}px;width:${subCol.width}px;` },
                      content: '' + getTableMappedResult(childRow, subCol.graphType, subCol.fields, true) + ' ',
                    });
                  }
                });

                subRowBlockArr.push(subRowBlock)
              })

              const colspanCount = colspanCounter(subcols);
              const childrenTdDiv = {
                type: 'td',
                attributes: { class: 'tdr', colspan: `${colspanCount}` },
                content: [{
                  type: 'table', content: subRowBlockArr
                }],
              };
              block.content.push(childrenTdDiv);
            } else {


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

module.exports.buildReportTable = buildReportTable;


function colspanCounter(columns) {
  let counter = 0;
  columns.forEach((col) => {
    if (col.columns) {
      counter = counter + colspanCounter(col.columns);
    } else {
      counter = counter + 1;
    }
  })
  return counter;
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
