function parseQuery(query) {
  try {
    const originalQuery = query;
    query = query.trim();

    const limitSplit = query.split(/\sLIMIT\s(\d+)/i);
    query = limitSplit[0];
    const limitMatch = limitSplit.length > 1 ? limitSplit[1].trim() : null;
    let limit = null;
    if (limitMatch) limit = parseInt(limitMatch);

    const orderBySplit = query.split(/\sORDER BY\s(.+)/i);
    query = orderBySplit[0];
    const orderByMatch =
      orderBySplit.length > 1 ? orderBySplit[1].trim() : null;
    let orderByFields = null;
    if (orderByMatch) {
      orderByFields = orderByMatch.split(",").map((field) => {
        const [fieldName, order] = field.trim().split(/\s+/);
        return { fieldName, order: order ? order.toUpperCase() : "ASC" };
      });
    }

    const groupBySplit = query.split(/GROUP BY/i);
    query = groupBySplit[0]; // everything before groupby
    const groupByClause =
      groupBySplit.length > 1 ? groupBySplit[1].trim() : null;

    const whereSplit = query.split(/\sWHERE\s/i);
    query = whereSplit[0]; // everthing before where
    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;

    const selectRegex = /^SELECT\s(.+?)\sFROM\s(\S+).*/i;
    const selectMatch = query.match(selectRegex);
    if (!selectMatch) {
      throw new Error(
        "Invalid SELECT clause. Ensure it follows 'SELECT field1, field2 FROM table' format"
      );
    }

    const [, fields, table] = selectMatch;

    //parsing join part if it exists
    const { joinType, joinTable, joinCondition } = parseJoinClause(query);

    let whereClauses = [];
    if (whereClause) whereClauses = parseWhereClauses(whereClause);

    let groupByFields = null;
    if (groupByClause) groupByFields = parseGroupByClause(groupByClause);

    //check for the presence of aggregate fxns without groupby
    const aggregateFunctionRegex =
      /(\bCOUNT\b|\bAVG\b|\bSUM\b|\bMIN\b|\bMAX\b)\s*\(\s*(\*|w+)\s*\)/i;
    const hasAggregateWithoutGroupBy =
      aggregateFunctionRegex.test(originalQuery) && !groupByFields;

    return {
      fields: fields.split(",").map((field) => field.trim().toLowerCase()),
      table: table.trim().toLowerCase(),
      whereClauses,
      joinType,
      joinTable,
      joinCondition,
      groupByFields,
      hasAggregateWithoutGroupBy,
      orderByFields,
      limit,
    };
  } catch (error) {
    throw new Error("Query parsing error: Invalid SELECT format");
  }
}

function parseGroupByClause(query) {
  return query.split(",").map((field) => field.trim().toLowerCase());
}

function parseJoinClause(query) {
  const joinRegex =
    /\s(INNER|LEFT|RIGHT)\sJOIN\s(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
  const joinMatch = query.match(joinRegex);
  // console.log("This is joinMatch: ",joinMatch);

  if (joinMatch)
    return {
      joinType: joinMatch[1].trim().toLowerCase(),
      joinTable: joinMatch[2].trim().toLowerCase(),
      joinCondition: {
        left: joinMatch[3].trim().toLowerCase(),
        right: joinMatch[4].trim().toLowerCase(),
      },
    };
  return {
    joinType: null,
    joinTable: null,
    joinCondition: null,
  };
}

function parseWhereClauses(whereString) {
  const conditionRegex = /(.*?)(=|!=|>=|<=|>|<)(.*)/;
  return whereString.split(/ AND | OR /i).map((conditionString) => {
    const match = conditionString.match(conditionRegex);

    if (match) {
      const [, field, operator, value] = match;
      return {
        field: field.trim().toLowerCase(),
        operator,
        value: value.trim(),
      };
    }
    throw new Error("Invalid WHERE clause format");
  });
}

module.exports = { parseQuery, parseJoinClause };
