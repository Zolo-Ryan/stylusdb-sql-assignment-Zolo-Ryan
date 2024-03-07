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
    isDistinct: false,
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
    isDistinct: false,
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
    isDistinct: false,
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
    isDistinct: false,
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

test('Error Handling with Malformed Query', async () => {
  const query = 'SELECT FROM table'; // intentionally malformed
  expect(() => parseQuery(query)).toThrow("Query parsing error: Invalid SELECT format");
});

test('Parse SQL Query with Basic DISTINCT', () => {
  const query = 'SELECT DISTINCT age FROM student';
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
      fields: ['age'],
      table: 'student',
      isDistinct: true,
      whereClauses: [],
      groupByFields: null,
      joinType: null,
      joinTable: null,
      joinCondition: null,
      orderByFields: null,
      limit: null,
      hasAggregateWithoutGroupBy: false
  });
});

test('Parse SQL Query with DISTINCT and Multiple Columns', () => {
  const query = 'SELECT DISTINCT student_id, course FROM enrollment';
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
      fields: ['student_id', 'course'],
      table: 'enrollment',
      isDistinct: true,
      whereClauses: [],
      groupByFields: null,
      joinType: null,
      joinTable: null,
      joinCondition: null,
      orderByFields: null,
      limit: null,
      hasAggregateWithoutGroupBy: false
  });
});

test('Parse SQL Query with DISTINCT and WHERE Clause', () => {
  const query = 'SELECT DISTINCT course FROM enrollment WHERE student_id = "1"';
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
      fields: ['course'],
      table: 'enrollment',
      isDistinct: true,
      whereClauses: [{ field: 'student_id', operator: '=', value: '"1"' }],
      groupByFields: null,
      joinType: null,
      joinTable: null,
      joinCondition: null,
      orderByFields: null,
      limit: null,
      hasAggregateWithoutGroupBy: false
  });
});

test('Parse SQL Query with DISTINCT and JOIN Operations', () => {
  const query = 'SELECT DISTINCT student.name FROM student INNER JOIN enrollment ON student.id = enrollment.student_id';
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
      fields: ['student.name'],
      table: 'student',
      isDistinct: true,
      whereClauses: [],
      groupByFields: null,
      joinType: 'inner',
      joinTable: 'enrollment',
      joinCondition: {
          left: 'student.id',
          right: 'enrollment.student_id'
      },
      orderByFields: null,
      limit: null,
      hasAggregateWithoutGroupBy: false
  });
});

test('Parse SQL Query with DISTINCT, ORDER BY, and LIMIT', () => {
  const query = 'SELECT DISTINCT age FROM student ORDER BY age DESC LIMIT 2';
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
      fields: ['age'],
      table: 'student',
      isDistinct: true,
      whereClauses: [],
      groupByFields: null,
      joinType: null,
      joinTable: null,
      joinCondition: null,
      orderByFields: [{ fieldName: 'AGE', order: 'DESC' }],
      limit: 2,
      hasAggregateWithoutGroupBy: false
  });
});

test('Parse SQL Query with DISTINCT on All Columns', () => {
  const query = 'SELECT DISTINCT * FROM student';
  const parsed = parseQuery(query);
  expect(parsed).toEqual({
      fields: ['*'],
      table: 'student',
      isDistinct: true,
      whereClauses: [],
      groupByFields: null,
      joinType: null,
      joinTable: null,
      joinCondition: null,
      orderByFields: null,
      limit: null,
      hasAggregateWithoutGroupBy: false
  });
});