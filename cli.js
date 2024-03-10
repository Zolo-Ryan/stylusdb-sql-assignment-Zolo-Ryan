#!/usr/bin/env node

const readline = require("readline");
const {executeSELECTQuery, executeDELETEQuery, executeINSERTQuery} = require("./src/index.js");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt('SQL> ');
console.log("SQL Query Engine CLI. Enter you SQL commands, or type 'exit' to quit.");

rl.prompt();

rl.on('line', async(line) => {
    if(line.toLowerCase() === 'exit'){
        rl.close();
        return;
    }

    try {
        let tempLine = line.toUpperCase();
        let data = null;
        if(tempLine.includes("INSERT"))
            data = await executeINSERTQuery(line);
        else if(tempLine.includes("DELETE"))
            data = await executeDELETEQuery(line);
        else if(tempLine.includes("SELECT"))
            data = await executeSELECTQuery(line);
        console.log("Result: ",data);
    } catch (error) {
        console.error('Error: ',error.message);
    }

    rl.prompt();
}).on('close' ,() => {
    console.log("Exiting SQL CLI");
    process.exit(0);
});
