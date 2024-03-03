function parseQuery(query){
    query = query.trim();

    const whereSplit = query.split(/\sWHERE\s/i);
    query = whereSplit[0]; // everthing before where

    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;

    const selectRegex = /^SELECT\s(.+?)\sFROM\s(\S+).*/i;
    const selectMatch = query.match(selectRegex);

    if(!selectMatch){
        throw new Error("Invalid Select Format");
    }

    const [, fields, table] = selectMatch;

    //parsing join part if it exists
    const {joinType,joinTable,joinCondition} = parseJoinClause(query);

    let whereClauses = [];
    if(whereClause) whereClauses = parseWhereClauses(whereClause);

    return {
        fields: fields.split(',').map(field => field.trim().toLowerCase()),
        table: table.trim().toLowerCase(),
        whereClauses,
        joinType,
        joinTable,
        joinCondition
    }
}

function parseJoinClause(query){
    const joinRegex = /\s(INNER|LEFT|RIGHT)\sJOIN\s(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
    const joinMatch = query.match(joinRegex);
    // console.log("This is joinMatch: ",joinMatch);

    if(joinMatch) return {
        joinType: joinMatch[1].trim().toLowerCase(),
        joinTable: joinMatch[2].trim().toLowerCase(),
        joinCondition: {
            left: joinMatch[3].trim().toLowerCase(),
            right: joinMatch[4].trim().toLowerCase()
        }
    };
    return {
        joinType: null,
        joinTable: null,
        joinCondition: null
    }
}

function parseWhereClauses(whereString){
    const conditionRegex = /(.*?)(=|!=|>=|<=|>|<)(.*)/;
    return whereString.split(/ AND | OR /i).map(conditionString => {
        const match = conditionString.match(conditionRegex);

        if(match){
            const [,field,operator,value] = match;
            return {field: field.trim().toLowerCase(), operator, value: value.trim()};
        }
        throw new Error("Invalid WHERE clause format");
    })
};

module.exports = {parseQuery, parseJoinClause};