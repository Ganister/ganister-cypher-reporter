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
      dataStore = { ...dataStore, ...res };
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
  let data = {};

  // run query
  const session = cypherDriver.session();
  try {
    const result = await session.run(query);
    if (result.records.length > 0) {
      result.records.map((n) => {
        if (n.keys) {
          n.keys.forEach((key) => {
            if (!data[key]) data[key] = [];
            data[key].push(n.get(key));
          });
        }
      });
    }
    await session.close();
    return data;
  } catch (error) {
    await session.close();
    return data;
  }
}


module.exports.runQueries = runQueries;