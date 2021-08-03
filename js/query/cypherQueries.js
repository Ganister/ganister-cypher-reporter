/**
 * 
 * @param {*} queries 
 * @param {*} cypherDriver 
 */
async function runQueries(queries, cypherDriver) {
  let dataStore = {};
  const queryPromises = queries.map(async (query) => {
    try {
      return await runQuery(query, cypherDriver);
    } catch (error) {
      return error
    }
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
    content.data = parseQueryResult(query.structure, result);

    console.timeEnd(query.id)
    await session.close();
    return content;
  } catch (error) {
    console.error("LOG / file: cypherQueries.js / line 71 / runQuery / error", error);
    await session.close();
    return content;
  }
}

function parseStructureElement(structureItem, store, n, level = 0) {

  structureItem.forEach((nodetype) => {
    const obj = n.get(nodetype.identifier);
    if (obj) {
      switch (obj.constructor.name) {



        case 'Path':
          let latestItem = store;
          obj.segments.forEach((seg, index) => {
            if (index == 0) {
              seg.start._children = [];
              seg.start._type = 'node';
              if (level == 0) {
                const objRetrieve = latestItem.find((itm) => itm.properties._id === seg.start.properties._id);
                if (!objRetrieve) {
                  latestItem.push(seg.start)
                  latestItem = seg.start._children;
                } else {
                  latestItem = objRetrieve._children;
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

            let relRetrieve
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

          parseStructureElement(nodetype.children, latestItem, n, level)
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
          break;
      }
    }
  })
}


/**
 * 
 * @param {*} result 
 * @returns 
 */
function parseQueryResult(structure, result) {
  try {
    const nodes = [];
    const values = {};

    // Loop through records
    if (result.records.length > 0) {
      result.records.map((n, index) => {

        parseStructureElement(structure, nodes, n)

      })
    }

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