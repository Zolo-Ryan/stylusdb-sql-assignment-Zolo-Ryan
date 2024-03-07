const { parseQuery } = require("../src/queryParser.js");

// id,name, will return fields: [id,name,""]; this is a problem
//it should throw error
test("Parse SQL Query", () => {
  const query = "SELECT id,name FROM sample";
  const parsed = parseQuery(query);

  expect(parsed).toEqual({
    fields: ["id", "name"],
    table: "sample",
    whereClauses: [],
    joinType: null,
    joinCondition: null,
    joinTable: null,
    groupByFields: null,
    hasAggregateWithoutGroupBy: false
  });
});

test("Parse SQL Query throw error", () => {
  const query = "HI";

  expect(() => {
    parseQuery(query);
  }).toThrow();
});

test("Parse SQL Query with Multiple WHERE Clauses", () => {
  const query = "SELECT id, name FROM sample WHERE age = 30 AND name = John";
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
    fields: ["id", "name"],
    table: "sample",
    whereClauses: [
      {
        field: "age",
        operator: "=",
        value: "30",
      },
      {
        field: "name",
        operator: "=",
        value: "John",
      },
    ],
    joinType: null,
    joinCondition: null,
    joinTable: null,
    groupByFields: null,
    hasAggregateWithoutGroupBy: false
  });
});

test("Parse SQL Query with INNER JOIN", () => {
  const query =
    "SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id";
  const result = parseQuery(query);
  expect(result).toEqual({
    fields: ["student.name", "enrollment.course"],
    table: "student",
    whereClauses: [],
    joinType: "inner",
    joinTable: "enrollment",
    joinCondition: { left: "student.id", right: "enrollment.student_id" },
    groupByFields: null,
    hasAggregateWithoutGroupBy: false,
  });
});

test("Parse SQL Query with INNER JOIN and WHERE Clause", () => {
  const query =
    "SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id WHERE student.name = John";
  const result = parseQuery(query);
  expect(result).toEqual({
    fields: ["student.name", "enrollment.course"],
    table: "student",
    whereClauses: [
      {
        field: "student.name",
        operator: "=",
        value: "John",
      },
    ],
    joinType: "inner",
    joinTable: "enrollment",
    joinCondition: { left: "student.id", right: "enrollment.student_id" },
    groupByFields: null,
    hasAggregateWithoutGroupBy: false,
  });
});

test("Parse SQL Query with GroupBy clause", () => {
  const query = "SELECT id from student group by id, enrollment.student_id";
  const result = parseQuery(query);
  expect(result).toEqual(expect.objectContaining({
    "groupByFields": expect.arrayContaining([
      "id", "enrollment.student_id"
    ])
  }));
})