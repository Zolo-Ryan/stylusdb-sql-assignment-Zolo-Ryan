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
    hasAggregateWithoutGroupBy: false,
    orderByFields: null,
    limit: null,
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
    hasAggregateWithoutGroupBy: false,
    orderByFields: null,
    limit: null,
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
    orderByFields: null,
    limit: null,
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
    orderByFields: null,
    limit: null,
  });
});

test("Parse SQL Query with GroupBy clause", () => {
  const query = "SELECT id from student group by id, enrollment.student_id";
  const result = parseQuery(query);
  expect(result).toEqual(
    expect.objectContaining({
      groupByFields: expect.arrayContaining(["id", "enrollment.student_id"]),
    })
  );
});

test("Parse SQL Query with ORDER BY", () => {
  const query = "SELECT name FROM student ORDER BY name ASC";
  const parsed = parseQuery(query);
  expect(parsed.orderByFields).toEqual([{ fieldName: "name", order: "ASC" }]);
});

test("Parse SQL Query with ORDER BY and WHERE", () => {
  const query = "SELECT name FROM student WHERE age > 20 ORDER BY name DESC";
  const parsed = parseQuery(query);
  expect(parsed.orderByFields).toEqual([{ fieldName: "name", order: "DESC" }]);
  expect(parsed.whereClauses.length).toBeGreaterThan(0);
});

test("Parse SQL Query with ORDER BY and GROUP BY", () => {
  const query =
    "SELECT COUNT(id), age FROM student GROUP BY age ORDER BY age DESC";
  const parsed = parseQuery(query);
  expect(parsed.orderByFields).toEqual([{ fieldName: "age", order: "DESC" }]);
  expect(parsed.groupByFields).toEqual(["age"]);
});

test('Parse SQL Query with standard LIMIT clause', () => {
  const query = 'SELECT id, name FROM student LIMIT 2';
  const parsed = parseQuery(query);
  expect(parsed.limit).toEqual(2);
});

test('Parse SQL Query with large number in LIMIT clause', () => {
  const query = 'SELECT id, name FROM student LIMIT 1000';
  const parsed = parseQuery(query);
  expect(parsed.limit).toEqual(1000);
});

test('Parse SQL Query without LIMIT clause', () => {
  const query = 'SELECT id, name FROM student';
  const parsed = parseQuery(query);
  expect(parsed.limit).toBeNull();
});

test('Parse SQL Query with LIMIT 0', () => {
  const query = 'SELECT id, name FROM student LIMIT 0';
  const parsed = parseQuery(query);
  expect(parsed.limit).toEqual(0);
});

test('Parse SQL Query with negative number in LIMIT clause', () => {
  const query = 'SELECT id, name FROM student LIMIT -5';
  const parsed = parseQuery(query);
  // Assuming the parser sets limit to null for invalid values
  expect(parsed.limit).toBeNull();
});
