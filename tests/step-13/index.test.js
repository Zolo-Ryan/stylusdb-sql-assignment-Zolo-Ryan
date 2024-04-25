const {executeSELECTQuery,executeINSERTQuery} = require("../../src/index.js");
const {readCSV, writeCSV} = require("../../src/csvStorage.js");
const fs = require("fs");
const {
    parseSELECTQuery,
    parseINSERTQuery,
    parseDELETEQuery,
    parseJoinClause
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
  
  test("Execute SQL query", async () => {
    const query = "SELECT id,name FROM sample";
    const result = await executeSELECTQuery(query);
  
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).not.toHaveProperty("age");
    expect(result[0]).toEqual({ id: "1", name: "John" });
  });
  
  test("Parse SQL Query with Multiple WHERE Clauses", () => {
    const query = "SELECT id, name FROM sample WHERE age = 30 AND name = John";
    const parsed = parseSELECTQuery(query);
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
      isApproximateCount: false,
      isCountDistinct: false,
      distinctFields: [],
    });
  });

test("Execute SQL Query with WHERE clause", async () => {
    const query = "SELECT id, name FROM SAMPLE WHERE age = 25";
    const result = await executeSELECTQuery(query);
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
    expect(result[0].id).toBe("2");
  });

test('Execute SQL Query with Multiple WHERE Clause', async () => {
    const query = 'SELECT id, name FROM sample WHERE age = 30 AND name = John';
    const result = await executeSELECTQuery(query);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({ id: '1', name: 'John' });
});

test('Execute SQL Query with Greater Than', async () => {
    const queryWithGT = 'SELECT id FROM sample WHERE age > 22';
    const result = await executeSELECTQuery(queryWithGT);
    expect(result.length).toEqual(2);
    expect(result[0]).toHaveProperty('id');
});

test('Execute SQL Query with Not Equal to', async () => {
    const queryWithGT = 'SELECT name FROM sample WHERE age != 25';
    const result = await executeSELECTQuery(queryWithGT);
    expect(result.length).toEqual(2);
    expect(result[0]).toHaveProperty('name');
});

test("Parse SQL Query with INNER JOIN", () => {
    const query =
      "SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id";
    const result = parseSELECTQuery(query);
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
      isApproximateCount: false,
      isCountDistinct: false,
      distinctFields: [],
    });
  });
  
  test("Parse SQL Query with INNER JOIN and WHERE Clause", () => {
    const query =
      "SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id WHERE student.name = John";
    const result = parseSELECTQuery(query);
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
      isApproximateCount: false,
      isCountDistinct: false,
      distinctFields: [],
    });
  });
  
test('Execute SQL Query with INNER JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    /*
    result = [
      { 'student.name': 'John', 'enrollment.course': 'Mathematics' },
      { 'student.name': 'John', 'enrollment.course': 'Physics' },
      { 'student.name': 'Jane', 'enrollment.course': 'Chemistry' },
      { 'student.name': 'Bob', 'enrollment.course': 'Mathematics' }
    ]
    */
    expect(result.length).toEqual(4);
    // toHaveProperty is not working here due to dot in the property name
    expect(result[0]).toEqual(expect.objectContaining({
        "enrollment.course": "Mathematics",
        "student.name": "John"
    }));
});

test('Execute SQL Query with INNER JOIN and a WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course, student.age FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE student.age > 25';
    const result = await executeSELECTQuery(query);
    /*
    result =  [
      {
        'student.name': 'John',
        'enrollment.course': 'Mathematics',
        'student.age': '30'
      },
      {
        'student.name': 'John',
        'enrollment.course': 'Physics',
        'student.age': '30'
      }
    ]
    */
    expect(result.length).toEqual(2);
    // toHaveProperty is not working here due to dot in the property name
    expect(result[0]).toEqual(expect.objectContaining({
        "enrollment.course": "Mathematics",
        "student.name": "John"
    }));
});

test('Execute SQL Query with LEFT JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "student.name": "Alice", "enrollment.course": null }),
        expect.objectContaining({ "student.name": "John", "enrollment.course": "Mathematics" })
    ]));
    expect(result.length).toEqual(5); // 4 students, but John appears twice
});

test('Execute SQL Query with LEFT JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "student.name": "Alice", "enrollment.course": null }),
        expect.objectContaining({ "student.name": "John", "enrollment.course": "Mathematics" })
    ]));
    expect(result.length).toEqual(5); // 4 students, but John appears twice
});

test('Execute SQL Query with RIGHT JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "student.name": null, "enrollment.course": "Biology" }),
        expect.objectContaining({ "student.name": "John", "enrollment.course": "Mathematics" })
    ]));
    expect(result.length).toEqual(5); // 4 courses, but Mathematics appears twice
});

test('Execute SQL Query with LEFT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age > 22';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "enrollment.course": "Mathematics", "student.name": "John" }),
        expect.objectContaining({ "enrollment.course": "Physics", "student.name": "John" })
    ]));
    expect(result.length).toEqual(4);
});

test('Execute SQL Query with LEFT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Physics'`;
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "student.name": "John", "enrollment.course": "Physics" })
    ]));
    expect(result.length).toEqual(1);
});

test('Execute SQL Query with RIGHT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age < 25';
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "enrollment.course": "Mathematics", "student.name": "Bob" }),
        expect.objectContaining({ "enrollment.course": "Biology", "student.name": null })
    ]));
    expect(result.length).toEqual(2);
});

test('Execute SQL Query with RIGHT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry'`;
    const result = await executeSELECTQuery(query);
    expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({ "enrollment.course": "Chemistry", "student.name": "Jane" }),
    ]));
    expect(result.length).toEqual(1);
});

test('Execute SQL Query with RIGHT JOIN with a multiple WHERE clauses filtering the join table and main table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry' AND student.age = 26`;
    const result = await executeSELECTQuery(query);
    expect(result).toEqual([]);
});

test('Returns null for queries without JOIN', () => {
    const query = 'SELECT * FROM table1';
    const result = parseJoinClause(query);
    expect(result).toEqual(
        {
            joinType: null,
            joinTable: null,
            joinCondition: null
        }
    );
});

test('Parse LEFT Join Query Completely', () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id';
    const result = parseSELECTQuery(query);
    expect(result).toEqual(expect.objectContaining({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinType: 'left',
        joinTable: 'enrollment',
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    }))
})

test('Parse LEFT Join Query Completely', () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id';
    const result = parseSELECTQuery(query);
    expect(result).toEqual(expect.objectContaining({
        fields: ['student.name', 'enrollment.course'],
        table: 'student',
        whereClauses: [],
        joinType: 'right',
        joinTable: 'enrollment',
        joinCondition: { left: 'student.id', right: 'enrollment.student_id' },
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    }))
})

test('Parse SQL Query with LEFT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age > 22';
    const result = await parseSELECTQuery(query);
    expect(result).toEqual(expect.objectContaining({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "left",
        "table": "student",
        "whereClauses": [{ "field": "student.age", "operator": ">", "value": "22" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    }));
});

test('Parse SQL Query with LEFT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Physics'`;
    const result = await parseSELECTQuery(query);
    expect(result).toEqual(expect.objectContaining({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "left",
        "table": "student",
        "whereClauses": [{ "field": "enrollment.course", "operator": "=", "value": "'Physics'" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    }));
});

test('Parse SQL Query with RIGHT JOIN with a WHERE clause filtering the main table', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age < 25';
    const result = await parseSELECTQuery(query);
    expect(result).toEqual(expect.objectContaining({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "right",
        "table": "student",
        "whereClauses": [{ "field": "student.age", "operator": "<", "value": "25" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    }));
});

test('Parse SQL Query with RIGHT JOIN with a WHERE clause filtering the join table', async () => {
    const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry'`;
    const result = await parseSELECTQuery(query);
    expect(result).toEqual(expect.objectContaining({
        "fields": ["student.name", "enrollment.course"],
        "joinCondition": { "left": "student.id", "right": "enrollment.student_id" },
        "joinTable": "enrollment",
        "joinType": "right",
        "table": "student",
        "whereClauses": [{ "field": "enrollment.course", "operator": "=", "value": "'Chemistry'" }],
        groupByFields: null,
        hasAggregateWithoutGroupBy: false,
    }));
});


test('Parse COUNT Aggregate Query', () => {
    const query = 'SELECT COUNT(*) FROM student';
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual(expect.objectContaining({
        fields: ['count(*)'],
        table: 'student',
        whereClauses: [],
        groupByFields: null,
        hasAggregateWithoutGroupBy: true,
        "joinCondition": null,
        "joinTable": null,
        "joinType": null,
    }));
});

test('Parse basic GROUP BY query', () => {
    const query = 'SELECT age, COUNT(*) FROM student GROUP BY age';
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual(expect.objectContaining({
        fields: ['age', 'count(*)'],
        table: 'student',
        whereClauses: [],
        groupByFields: ['age'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false
    }));
});

test('Parse GROUP BY query with WHERE clause', () => {
    const query = 'SELECT age, COUNT(*) FROM student WHERE age > 22 GROUP BY age';
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual(expect.objectContaining({
        fields: ['age', 'count(*)'],
        table: 'student',
        whereClauses: [{ field: 'age', operator: '>', value: '22' }],
        groupByFields: ['age'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false
    }));
});

test('Parse GROUP BY query with multiple fields', () => {
    const query = 'SELECT student_id, course, COUNT(*) FROM enrollment GROUP BY student_id, course';
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual(expect.objectContaining({
        fields: ['student_id', 'course', 'count(*)'],
        table: 'enrollment',
        whereClauses: [],
        groupByFields: ['student_id', 'course'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false
    }));
});

test('Parse GROUP BY query with JOIN and WHERE clauses', () => {
    const query = 'SELECT student.name, COUNT(*) FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE enrollment.course = "Mathematics" GROUP BY student.name';
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual(expect.objectContaining({
        fields: ['student.name', 'count(*)'],
        table: 'student',
        whereClauses: [{ field: 'enrollment.course', operator: '=', value: '"Mathematics"' }],
        groupByFields: ['student.name'],
        joinType: 'inner',
        joinTable: 'enrollment',
        joinCondition: {
            left: 'student.id',
            right: 'enrollment.student_id'
        },
        hasAggregateWithoutGroupBy: false
    }));
});
test('Parse GROUP BY query with WHERE clause', () => {
    const query = 'SELECT age, COUNT(*) FROM student WHERE age > 22 GROUP BY age';
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual(expect.objectContaining({
        fields: ['age', 'count(*)'],
        table: 'student',
        whereClauses: [{ field: 'age', operator: '>', value: '22' }],
        groupByFields: ['age'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null
    }));
});

test('Parse GROUP BY query with multiple fields', () => {
    const query = 'SELECT student_id, course, COUNT(*) FROM enrollment GROUP BY student_id, course';
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual(expect.objectContaining({
        fields: ['student_id', 'course', 'count(*)'],
        table: 'enrollment',
        whereClauses: [],
        groupByFields: ['student_id', 'course'],
        joinType: null,
        joinTable: null,
        joinCondition: null,
        hasAggregateWithoutGroupBy: false,
        orderByFields: null
    }));
});

test('Parse GROUP BY query with JOIN and WHERE clauses', () => {
    const query = 'SELECT student.name, COUNT(*) FROM student INNER JOIN enrollment ON student.id = enrollment.student_id WHERE enrollment.course = "Mathematics" GROUP BY student.name';
    const parsed = parseSELECTQuery(query);
    expect(parsed).toEqual(expect.objectContaining({
        fields: ['student.name', 'count(*)'],
        table: 'student',
        whereClauses: [{ field: 'enrollment.course', operator: '=', value: '"Mathematics"' }],
        groupByFields: ['student.name'],
        joinType: 'inner',
        joinTable: 'enrollment',
        joinCondition: {
            left: 'student.id',
            right: 'enrollment.student_id'
        },
        hasAggregateWithoutGroupBy: false,
        orderByFields: null
    }));
});

test('Execute SQL Query with ORDER BY', async () => {
    const query = 'SELECT name FROM student ORDER BY name ASC';
    const result = await executeSELECTQuery(query);

    expect(result).toStrictEqual([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Jane' },
        { name: 'John' }
    ]);
});

test('Execute SQL Query with ORDER BY and WHERE', async () => {
    const query = 'SELECT name FROM student WHERE age > 24 ORDER BY name DESC';
    const result = await executeSELECTQuery(query);

    expect(result).toStrictEqual([
        { name: 'John' },
        { name: 'Jane' },
    ]);
});
test('Execute SQL Query with ORDER BY and GROUP BY', async () => {
    const query = 'SELECT COUNT(id) as count, age FROM student GROUP BY age ORDER BY age DESC';
    const result = await executeSELECTQuery(query);

    expect(result).toStrictEqual([
        { age: '30', 'count(id) as count': 1 },
        { age: '25', 'count(id) as count': 1 },
        { age: '24', 'count(id) as count': 1 },
        { age: '22', 'count(id) as count': 1 }
    ]);
});

test('Execute SQL Query with standard LIMIT clause', async () => {
    const query = 'SELECT id, name FROM student LIMIT 2';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(2);
});

test('Execute SQL Query with LIMIT clause equal to total rows', async () => {
    const query = 'SELECT id, name FROM student LIMIT 4';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(4);
});

test('Execute SQL Query with LIMIT clause exceeding total rows', async () => {
    const query = 'SELECT id, name FROM student LIMIT 10';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(4); // Total rows in student.csv
});

test('Execute SQL Query with LIMIT 0', async () => {
    const query = 'SELECT id, name FROM student LIMIT 0';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(0);
});

test('Execute SQL Query with LIMIT and ORDER BY clause', async () => {
    const query = 'SELECT id, name FROM student ORDER BY age DESC LIMIT 2';
    const result = await executeSELECTQuery(query);
    expect(result.length).toEqual(2);
    expect(result[0].name).toEqual('John');
    expect(result[1].name).toEqual('Jane');
});

test('Error Handling with Malformed Query', async () => {
    const query = 'SELECT FROM table'; // intentionally malformed
    await expect(executeSELECTQuery(query)).rejects.toThrow("Error executing query: Query parsing error: Invalid SELECT format");
});