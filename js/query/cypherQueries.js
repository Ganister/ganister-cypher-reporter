

const { resolveMapping } = require('../publish/publisher.utils')

/**
 * 
 * @param {*} queries 
 * @param {*} cypherDriver 
 */
async function runQueries(queries, cypherDriver) {
  let dataStore = {};
  const queryPromises = queries.map(async (query) => {
    return await runQuery(query, cypherDriver);
  });
  const data = await Promise.all(queryPromises);
  if (data) {
    data.forEach((res) => {
      dataStore[res.id] = res.data;
    });
  }
  return dataStore;
}




/**
 * 
 * @param {*} query 
 * @param {*} cypherDriver 
 */
async function runQuery(query, cypherDriver) {
  console.time(query.id)

  // prepare dataSet
  let content = {
    id: query.id,
    data: {},
  };

  // run query
  const session = cypherDriver.session();
  try {

    // run query
    const result = await session.run(query.query);

    // parse result
    content.data = parseQueryResult(query.structure, query.ordering, result);

    console.timeEnd(query.id)
  } catch (error) {
    console.error(error);
  } finally {
    await session.close();
    return content;
  }
}


/**
 * 
 * @param {*} structureItem item in the structure object provided
 * @param {*} store store content
 * @param {*} n 
 * @param {*} level 
 */
function parseStructureElement(structureItem, store, n, level = 0) {

  // For Each element of the Parsing Structure
  structureItem.forEach((nodetype) => {

    // get the structure element identifier (usually a cypher variable)
    const identifier = nodetype.identifier;

    // get the value from the result for this identifier
    const obj = n.get(identifier);

    // test if value exists
    if (obj) {

      // check the type of the element
      switch (obj.constructor.name) {

        // case PATH
        case 'Path':
          let latestItem = [store];
          const pathPickType = nodetype.pick;

          switch (pathPickType) {
            case 'last':
              // check if path is empty
              if (obj.segments.length == 0) {

              } else {
                // case path is multiple segments
                // retrieve last segment
                const lastSegment = obj.segments[obj.segments.length - 1];
                lastSegment.end._children = [];
                lastSegment.end._type = 'node';

                // case path is not the first element in the structure

                latestItem.push({
                  _type: 'relationship',
                  identity: lastSegment.relationship.identity,
                  label: lastSegment.relationship.type,
                  source: lastSegment.start.identity,
                  target: lastSegment.end.identity,
                  _edge: lastSegment.relationship,
                  _node: lastSegment.end
                });
                latestItem = lastSegment.end._children;
              }

              parseStructureElement(nodetype.children, latestItem, n, level)
              break;
            case 'list':
              break;
            case 'path':
            default:

              // check if path is empty
              if (obj.segments.length == 0) {
                obj.start._children = [];
                obj.start._type = 'node';
                if (level == 0) {
                  if (obj.start && obj.start.properties) {
                    const objRetrieve = latestItem.find((itm) => {
                      return itm.properties._id === obj.start.properties._id
                    });
                    if (!objRetrieve) {
                      latestItem.push(obj.start)
                      latestItem = obj.start._children;
                    } else {
                      latestItem = objRetrieve._children;
                    }
                  }
                } else {
                  // case path is not the first element in the structure
                  if (store._node && store._node.identity == obj.start.identity) {
                  } else {
                    store._node = seg.start;
                    if (!obj.start._children) obj.start._children = [];
                    latestItem = obj.start._children;
                  }
                }
              } else {
                // case path is multiple segments
                obj.segments.forEach((seg, index) => {
                  if (index == 0) {
                    seg.start._children = [];
                    seg.start._type = 'node';
                    if (level == 0) {
                      if (seg.start && seg.start.properties) {
                        const objRetrieve = latestItem.find((itm) => {
                          return itm.properties._id === seg.start.properties._id
                        });
                        if (!objRetrieve) {
                          latestItem.push(seg.start)
                          latestItem = seg.start._children;
                        } else {
                          latestItem = objRetrieve._children;
                        }
                      }
                    } else {
                      // case path is not the first element in the structure
                      if (store._node && store._node.identity == seg.start.identity) {
                      } else {
                        store._node = seg.start;
                        if (!seg.start._children) seg.start._children = [];
                        latestItem = seg.start._children;
                      }
                    }
                  }

                  let relRetrieve;
                  relRetrieve = latestItem.find(edge => edge.identity === seg.relationship.identity)
                  if (!relRetrieve) {
                    const newRel = {
                      _type: 'relationship',
                      identity: seg.relationship.identity,
                      label: seg.relationship.type,
                      source: seg.start.identity,
                      target: seg.end.identity,
                      _edge: seg.relationship,
                      _node: seg.end,
                    }
                    newRel._node._children = [];
                    latestItem.push(newRel)
                    latestItem = newRel._node._children;
                  } else {
                    latestItem = relRetrieve._node._children;
                  }
                  level++;
                });
              }

              parseStructureElement(nodetype.children, latestItem, n, level)
              break;
          }




          break;




        case 'Relationship':
          // prevent duplicates
          const relRetrieve = store.find((itm) => itm.identity === obj.identity)
          let subObj;
          if (relRetrieve) {
            subObj = relRetrieve;
          } else {
            subObj = {
              _type: 'relationship',
              identity: obj.identity,
              label: obj.type,
              source: obj.start,
              target: obj.end,
              _edge: obj,
              _node: {}
            }
            store.push(subObj);
          }

          level++;
          parseStructureElement(nodetype.children, subObj, n, level)
          break;
        case 'Array':
          // prevent duplicates
          // let concatIds = obj.map(e => e.identity).join(",");
          let concatIds = obj[0].start + ',' + obj[obj.length - 1].end;
          const relArrayRetrieve = store.find((itm) => itm.identity === concatIds)
          let subArrayObj;
          if (relArrayRetrieve) {
            subArrayObj = relArrayRetrieve;
          } else {
            subArrayObj = {
              _type: 'relationship',
              identity: concatIds,
              label: obj[0].type,
              source: obj[0].start,
              target: obj[obj.length - 1].end,
              _edge: obj,
              _node: {}
            }
            subArrayObj._edge.label
            store.push(subArrayObj);
          }

          level++;
          parseStructureElement(nodetype.children, subArrayObj, n, level)
          break;
        case 'Node':
          if (level == 0) {
            obj._children = [];
            obj._type = 'node';
            const objRetrieve = store.find((itm) => itm.properties._id === obj.properties._id);
            if (!objRetrieve) {
              store.push(obj)
              level++;
              if (nodetype.children.length > 0) {
                parseStructureElement(nodetype.children, obj._children, n, level)
              }
            } else {
              level++;
              if (nodetype.children.length > 0) {
                parseStructureElement(nodetype.children, objRetrieve._children, n, level)
              }
            }
          } else {
            if (store._node && store._node.identity == obj.identity) {
            } else {
              store._node = obj;
              level++;
              if (!obj._children) obj._children = [];
            }
            if (nodetype.children.length > 0) {
              parseStructureElement(nodetype.children, store._node._children, n, level)
            }
          }

          break;
        case 'Number':
        case 'String':
          values[key] = obj;
        default:
          if (obj.gType) {
            switch (obj.gType) {
              case 'relationship':
                // prevent duplicates
                const relRetrieve = store.find((itm) => itm.identity === obj.identity)
                let subObj;
                if (relRetrieve) {
                  subObj = relRetrieve;
                } else {
                  subObj = {
                    _type: 'relationship',
                    identity: obj.identity,
                    label: obj.type,
                    source: obj.start,
                    target: obj.end,
                    _edge: obj,
                    _node: {}
                  }
                  store.push(subObj);
                }

                level++;
                parseStructureElement(nodetype.children, subObj, n, level)
                break;
              case 'node':
                console.log('not yet implemented');
                break;
              default:
                break;
            }
          }
          break;
      }
    }
  })
}


/**
 * sortStore
 * @param {*} nodes 
 * @param {*} ordering 
 * @param {*} level 
 * @returns 
 */
function sortStore(nodes, ordering = [], level = 0) {
  if (ordering.length > 0) {
    if (level == 0) {
      nodes
        // first sort by label
        .sort((a, b) => {
          return a.labels[0].localeCompare(b.labels[0]);
        })
      ordering.forEach((ord) => {
        nodes.sort((a, b) => {
          if (a.labels[0] == ord.type && b.labels[0] == ord.type) {
            switch (ord.compareType) {
              case 'integer':
                const integ_un = resolveMapping(a, ord.prop.split('.'));
                const integ_deux = resolveMapping(b, ord.prop.split('.'));
                return parseInt(integ_un || '0') - parseInt(integ_deux || '0');
              default:
                const un = resolveMapping(a, ord.prop.split('.'));
                const deux = resolveMapping(b, ord.prop.split('.'));
                return un.localeCompare(deux);
            }
          }
        })
      })
      level++;
      nodes.forEach((node) => {
        if (node && node._children) {
          sortStore(node._children, ordering, level)
        }
      })
    } else {
      nodes
        // first sort by label
        .sort((a, b) => {
          return a.label.localeCompare(b.label);
        })
      ordering.forEach((ord) => {
        nodes.sort((a, b) => {
          let aLabel = a.label;
          let bLabel = b.label;
          if (ord.graphType === "node") {
            aLabel = a._node.labels[0];
            bLabel = b._node.labels[0];
          }
          if (aLabel == ord.type && bLabel == ord.type) {
            const un = resolveMapping(a, ord.prop.split('.'));
            const deux = resolveMapping(b, ord.prop.split('.'));
            switch (ord.compareType) {
              case 'integer':
                return parseInt(un) - parseInt(deux);
              default:
                return un.localeCompare(deux);
            }
          }
        })
      })
      level++;
      nodes.forEach((node) => {
        if (node._node && node._node._children) {
          sortStore(node._node._children, ordering, level)
        }
      })
    }
  }
  return nodes;
}




/**
 * parseQueryResult
 * @param {*} result 
 * @returns 
 */
function parseQueryResult(structure, ordering, result) {
  try {
    const nodes = [];
    const values = {};

    // Loop through records
    if (result.records.length > 0) {
      result.records.map((n) => {
        parseStructureElement(structure, nodes, n)
      })
    }

    // order elements
    sortStore(nodes, ordering);

    const data = {
      nodes,
      values,
    };
    return data;
  } catch (error) {
    console.error(error);
  }
}



module.exports.runQueries = runQueries;