const readCSV = require("./csvReader");
const { parseQuery } = require("./queryParser");

async function executeSelectQuery(query) {
  const { fields, table, whereClauses, joinType, joinTable, joinCondition } =
    parseQuery(query); //id,name
  try {
    //fails when file is not found
    let data = await readCSV(`${table}.csv`);

    //now first data needs to handle join condition
    //then filter on where clause
    if (joinType && joinTable && joinCondition) {
      const joinData = await readCSV(`${joinTable}.csv`);
      switch (joinType.toUpperCase()) {
        case "INNER":
          data = performInnerJoin(data, joinData, joinCondition, fields, table);
          break;
        case "LEFT":
          data = peformLeftJoin(data, joinData, joinCondition, fields, table);
          break;
        case "RIGHT":
          data = peformRightJoin(data, joinData, joinCondition, fields, table);
          break;
      }
    }

    //filter the data before returning result based on where
    const filteredData =
      whereClauses.length > 0 //every assuming only AND is given
        ? data.filter((row) =>
            whereClauses.every((clause) => evaluateCondition(row, clause))
          )
        : data;

    const result = [];
    filteredData.forEach((row) => {
      const fileteredRow = {};
      // what if the asked field is not in the data? handled => []
      fields.forEach((field) => {
        if (row[field] !== undefined) fileteredRow[field] = row[field];
      });
      if (Object.keys(fileteredRow).length !== 0) result.push(fileteredRow);
    }); // [] of {id,name}
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
}

function evaluateCondition(row, clause) {
  const { field, operator, value } = clause;
  switch (operator) {
    case "=":
      return row[field] === value;
    case "!=":
      return row[field] !== value;
    case ">":
      return row[field] > value;
    case "<":
      return row[field] < value;
    case ">=":
      return row[field] >= value;
    case "<=":
      return row[field] <= value;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function performInnerJoin(data, joinData, joinCondition, fields, table) {
  data = data.flatMap((mainRow) => {
    return joinData
      .filter((joinRow) => {
        const mainValue = mainRow[joinCondition.left.split(".")[1]];
        const joinValue = joinRow[joinCondition.right.split(".")[1]];
        return mainValue === joinValue;
      })
      .map((joinRow) => {
        return fields.reduce((acc, field) => {
          const [tableName, fieldName] = field.split(".");
          acc[field] =
            tableName === table ? mainRow[fieldName] : joinRow[fieldName];
          return acc;
        }, {});
      });
  });
  return data;
}

function peformLeftJoin(data, joinData, joinCondition, fields, table) {
  
}

function peformRightJoin(data, joinData, joinCondition, fields, table) {
  
}

// helper fxn to create a result row in right and left join
function createResultRow(mainRow,joinRow,fields,table, includeAllMainFields){
    const resultRow = {};

    if(includeAllMainFields){
        // include all fields from the main table
        Object.keys(mainRow || {}).forEach(key => {
            const prefixedKey = `${table}.${key}`;
            resultRow[prefixedKey] = mainRow ? mainRow[key] : null;
        });
    }

    fields.forEach(field => {
        const [tableName,fieldName] = field.includes('.') ? field.split('.') : [table,field];
        resultRow[field] = tableName === table && mainRow ? mainRow[fieldName] : joinRow ? joinRow[fieldName] : null;
    });
}

module.exports = executeSelectQuery;
