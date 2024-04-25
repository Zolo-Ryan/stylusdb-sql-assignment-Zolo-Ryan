const {readCSV, writeCSV} = require("../../src/csvStorage.js");
const fs = require("fs");
const {
    parseSELECTQuery,
    parseINSERTQuery,
    parseDELETEQuery,
  } = require("../../src/queryParser.js");
  
test("Read CSV file", async () => {
  const data = await readCSV("./sample.csv");
  expect(data.length).toBeGreaterThan(0);
  expect(data.length).toBe(3);
  expect(data[0].name).toBe("John");
  expect(data[0].age).toBe("30");
});

  // id,name, will return fields: [id,name,""]; this is a problem
  //it should throw error
  test("Parse SQL Query", () => {
    const query = "SELECT id,name FROM sample";
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual({
      fields: ["id", "name"],
      table: "sample",
      whereClauses: [],
      joinType: null,
      joinCondition: null,
      joinTable: null,
      groupByFields: null,
      hasAggregateWithoutGroupBy: false,
      orderByFields: null,
      limit: null,
      isDistinct: false,
      isApproximateCount: false,
      isCountDistinct: false,
      distinctFields: [],
    });
  });