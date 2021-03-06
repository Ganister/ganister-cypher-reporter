
const { resolveMapping, formatValue, styleToString } = require('./publisher.utils')

const fs = require('fs');
/**
 * convertStoreToTableRows
 * @param {*} dataStoreElement 
 * @param {*} templateBlock 
 */
function convertStoreToTableRows(dataStoreElement, templateBlock) {
  const tableRows = [];
  const { nodes = [] } = dataStoreElement;

  const rootElements = { ...nodes };

  let sequence = 0;
  // for each root element add a new table row and browse relationships
  for (const [key, value] of Object.entries(rootElements)) {

    sequence = sequence + 1;

    // Add Row
    value.indentSequence = sequence;
    if (value._type == 'node') {
      // handle first level
      tableRows.push({
        _edge: {},
        _node: value,
        indentSequence: value.indentSequence,
        level: value.indentSequence,
      });
    } else {
      tableRows.push(value);
    }



    // Browse relationships
    rowRecursiveHandler(value, 0, templateBlock, tableRows);

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
function rowRecursiveHandler(rootElement, level, templateBlock, tableRows) {

  level++;
  rootElement._level = level;

  // removing data we (almost) never use in reports
  delete rootElement.properties._promotions;
  delete rootElement.properties._history;

  // keep relationships of the actual node

  // handle subline relationships
  if (rootElement._children) {
    rootElement._children
      // look for non-inline relationships
      .filter((edge) => templateBlock.inlineRelationships.indexOf(edge.label) < 0)
      .forEach((edge, index) => {
        try {
          const subElement = JSON.parse(JSON.stringify(edge));
          subElement.indentSequence = index + 1;
          tableRows.push(subElement);
          rowRecursiveHandler(subElement._node, level, templateBlock, tableRows);
        } catch (error) {
          console.error("CAUSE: Might be missing a return statement for a nodetype")
          console.error("LOG / file: publisher.tableConverter.js / line 87 :", error);
        }
      });

    rootElement._children = rootElement._children.filter((edge) => templateBlock.inlineRelationships.indexOf(edge.label) > -1)
  }
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
  let headerGroupBlock = {
    type: 'tr',
    attributes: { class: 'tr' },
    content: [],
  };
  const headerBlock = {
    type: 'tr',
    attributes: { class: 'tr' },
    content: [],
  };
  if (templateBlock.columns) {

    const buildColumnsGroups = (columns) => {
      columns.forEach((col) => {
        if (col.fields) {
          headerGroupBlock.content.push({
            type: 'td',
            attributes: { class: 'th' },
            content: col.category,
          });
        }
        if (col.columns) {
          buildColumnsGroups(col.columns)
        }
      });
    }


    buildColumnsGroups(templateBlock.columns);
    const buildColumns = (columns) => {
      columns.forEach((col) => {
        if (col.fields) {
          let css = `width:${col.width}px;
          min-width:${col.width}px;
          max-width: ${col.width}px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;`
          if (col.css) {
            for (const [key, value] of Object.entries(col.css)) {
              css += `${key}:${value};`
            }
          }
          const tableColHeader = {
            type: 'td',
            attributes: {
              class: 'th',
              style: css,
            },
            content: col.label,
          };
          headerBlock.content.push(tableColHeader);
        }
        if (col.columns) {
          buildColumns(col.columns)
        }
      });
    }
    buildColumns(templateBlock.columns);

  }
  let latestCategory = '';
  const headerGroupBlockReduced = {
    type: 'tr',
    attributes: { class: 'tr headerGroups' },
    content: [],
  };
  headerGroupBlock.content.forEach((col) => {
    if (latestCategory !== col.content) {
      col.attributes.colspan = 1;
      headerGroupBlockReduced.content.push(col)
    } else {
      headerGroupBlockReduced.content[headerGroupBlockReduced.content.length - 1].attributes.colspan++;
    }
    latestCategory = col.content
  })
  tableBlockContent.push(headerGroupBlockReduced);
  tableBlockContent.push(headerBlock);

  // Add Data
  const tableRows = convertStoreToTableRows(dataStore[templateBlock.mapping], templateBlock)



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
                  cross = '' + tableRow.indentSequence + ' ';
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
                    type: 'table', attributes: { class: 'indentTable' }, content: [
                      { type: 'tr', attributes: { class: 'indentLine' }, content: indentCases }
                    ]
                  }
                ],
              });
            } else {
              // Handle normal column
              const tdStyle = `width:${col.width}px;
                min-width:${col.width}px;
                max-width: ${col.width}px;`
              rowBlock.content.push({
                type: 'td',
                attributes: { class: 'td', field: col.label, style: tdStyle },
                content: '' + getTableMappedResult(tableRow, col.graphType, col.fields) + ' ',
              });
            }
          }

          const handleSubColumns = (subcols, row, block, relTypes, nodeTypes) => {
            // if it has children
            const subRowBlockArr = [];
            if (row._node && row._node._children && row._node._children.length > 0) {

              let rows = row._node._children;
              rows = rows.filter((row) => {
                return (relTypes && relTypes.indexOf(row.label) > -1) && (nodeTypes && nodeTypes.indexOf(row._node.labels[0]) > -1);
              })

              // find grouping
              subcols.forEach((col) => {
                if (col.groupTo) {
                  switch (col.groupTo) {
                    case 'min':
                      let resu = rows.map((a) => getTableMappedResult(a, col.graphType, col.fields, true))
                      // filter table rows by min value
                      rows.sort((a, b) => {
                        const vala = getTableMappedResult(a, col.graphType, col.fields, true);
                        const valb = getTableMappedResult(b, col.graphType, col.fields, true);
                        return vala.localeCompare(valb);
                      });
                      resu = rows.map((a) => getTableMappedResult(a, col.graphType, col.fields, true))
                      // remove all but first value tableRows collection
                      rows.splice(1, rows.length - 1);
                      break;
                    case 'max':
                      // filter table rows by max value
                      let res = rows.map((a) => getTableMappedResult(a, col.graphType, col.fields, true))
                      rows.sort((a, b) => {
                        const vala = getTableMappedResult(a, col.graphType, col.fields, true);
                        const valb = getTableMappedResult(b, col.graphType, col.fields, true);
                        return valb.localeCompare(vala);
                      });

                      res = rows.map((a) => getTableMappedResult(a, col.graphType, col.fields, true))
                      // keep first value of tableRows collection
                      rows.splice(1, rows.length - 1,);
                      break;
                  }
                }
              });


              rows.forEach((childRow) => {

                // only display rows for the correct relationship

                const subRowBlock = {
                  type: 'tr',
                  attributes: { class: 'tr', id: childRow._node.identity },
                  content: [],
                };
                subcols.forEach((subCol) => {
                  if (subCol.columns) {
                    handleSubColumns(subCol.columns, childRow, subRowBlock, subCol.relationships, subCol.nodes);
                  } else {
                    const tdStyle = `width:${subCol.width}px;
                      min-width:${subCol.width}px;
                      max-width: ${subCol.width}px;`
                    subRowBlock.content.push({
                      type: 'td',
                      attributes: { class: 'td', field: subCol.label, style: tdStyle },
                      content: '' + getTableMappedResult(childRow, subCol.graphType, subCol.fields, true) + ' ',
                    });
                  }
                });
                subRowBlockArr.push(subRowBlock)

              })

              // fill line if no record matched the relationships
              if (subRowBlockArr.length < 1) {
                const subRowBlock = {
                  type: 'tr',
                  attributes: { class: 'tr', id: 'null' },
                  content: [],
                };
                subcols.forEach((subCol) => {
                  if (subCol.columns) {
                    handleSubColumns(subCol.columns, { _node: {} }, subRowBlock, subCol.relationships, subCol.nodes);
                  } else {
                    let tdStyle = `width:${subCol.width}px;
                    min-width:${subCol.width}px;
                    max-width: ${subCol.width}px;`
                    if (subCol.style) {
                      tdStyle = tdStyle + styleToString(subCol.style);
                    }

                    subRowBlock.content.push({
                      type: 'td',
                      attributes: { class: 'td', field: subCol.label, style: tdStyle },
                      content: ' ',
                    });
                  }
                });
                subRowBlockArr.push(subRowBlock)
              }
            } else {
              // fill empty cells
              const subRowBlock = {
                type: 'tr',
                attributes: { class: 'tr' },
                content: [],
              };
              subcols.forEach((subCol) => {
                if (subCol.columns) {
                  handleSubColumns(subCol.columns, { _node: {} }, subRowBlock, subCol.relationships, subCol.nodes);
                } else {
                  const tdStyle = `width:${subCol.width}px;
                  min-width:${subCol.width}px;
                  max-width: ${subCol.width}px;`
                  subRowBlock.content.push({
                    type: 'td',
                    attributes: { class: 'td', field: subCol.label, style: tdStyle },
                    content: ' ',
                  });
                }
              });
              subRowBlockArr.push(subRowBlock)
            }
            const colspanCount = colspanCounter(subcols);
            const childrenTdDiv = {
              type: 'td',
              attributes: { class: 'tdr', colspan: `${colspanCount}` },
              content: [{
                type: 'table', content: subRowBlockArr
              }],
            };
            block.content.push(childrenTdDiv);
          }

          if (col.columns) {
            handleSubColumns(col.columns, tableRow, rowBlock, col.relationships, col.nodes);
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
function getTableMappedResult(dataStore, graphType, mapping) {
  let label;
  if (graphType === 'node') {
    if (dataStore._node) {
      label = dataStore._node.labels[0];
    } else {
      label = ' ';
    }
  } else {
    label = dataStore.label;
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
