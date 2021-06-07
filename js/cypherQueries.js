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
      console.log("LOG / file: cypherQueries.js / line 19 / data.forEach / res", res);
      dataStore[res.id] = res.data;
    });
  }
  await cypherDriver.close();
  return dataStore;
}




/**
 * 
 * @param {*} query 
 * @param {*} cypherDriver 
 */
async function runQuery(query, cypherDriver) {

  // prepare dataSet
  let content = {
    id: query.id,
    data: {},
  };

  // run query
  const session = cypherDriver.session();
  try {
    const result = await session.run(query.query);
    // content.data = parseQueryResult(result);
    content.data = parseQueryResult(result);
    await session.close();
    return content;
  } catch (error) {
    await session.close();
    return content;
  }
}



/**
 * 
 * @param {*} result 
 * @returns 
 */
function parseQueryResult(result) {
  try {
    const nodes = {};
    let edges = [];
    const values = {};
    if (result.records.length > 0) {
      result.records.map((n, index) => {
        let currentLastRowItem = {};
        if (n.keys) {
          n.keys.forEach((key, index) => {
            const obj = n.get(key);
            if (obj) {
              switch (obj.constructor.name) {
                case 'Path':
                  obj.segments.forEach((seg) => {
                    if (!nodes[seg.start.identity]) nodes[seg.start.identity] = seg.start;
                    if (!nodes[seg.end.identity]) nodes[seg.end.identity] = seg.end;
                    if (!edges.some(edge => edge.content.identity === seg.relationship.identity)) {
                      edges.push({
                        type: 'inPath',
                        source: seg.start.identity,
                        label: seg.relationship.type,
                        target: seg.end.identity,
                        content: seg.relationship,
                      })
                    }
                  });
                  if (index > 0) {
                    edges.push({
                      type: 'toPath',
                      source: currentLastRowItem.identity,
                      label: obj.type,
                      target: obj.start.identity,
                      content: {},
                    });
                  }
                  currentLastRowItem = obj.end;
                  break;
                case 'Relationship':
                  if (index > 0) {
                    // prevent duplicates
                    if (!edges.find(edge => edge.content.identity === obj.identity)) {
                      edges.push({
                        type: 'Relationship',
                        label: obj.type,
                        source: obj.start,
                        target: obj.end,
                        content: obj,
                      });
                    }
                  }
                  break;
                case 'Node':
                  if (!nodes[obj.identity]) nodes[obj.identity] = obj;
                  // if (index > 0 && currentLastRowItem) {
                  //   if (!edges.find(edge => edge.content.identity === currentLastRowItem.identity + '-' + obj.identity)) {
                  //     // add relationship from currentLastRowItem to actual item
                  //     edges.push({
                  //       type: 'Node',
                  //       source: currentLastRowItem.identity,
                  //       target: obj.identity,
                  //       content: {
                  //         identity: currentLastRowItem.identity + '-' + obj.identity
                  //       },
                  //     });
                  //   }
                  // }
                  currentLastRowItem = obj;
                  break;
                case 'Number':
                case 'String':
                  values[key] = obj;
                default:
                  break;
              }
            }
          });
        }
      });
    }



    const data = {
      nodes,
      edges,
      values,
    };
    return data;
  } catch (error) {
    console.log(error);
  }
}



module.exports.runQueries = runQueries;