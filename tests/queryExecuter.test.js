const executeSelectQuery = require("../src/index.js");

test("Execute SQL query", async () => {
  const query = "SELECT id,name FROM sample";
  const result = await executeSelectQuery(query);

  expect(result.length).toBeGreaterThan(0);
  expect(result[0]).toHaveProperty("id");
  expect(result[0]).toHaveProperty("name");
  expect(result[0]).not.toHaveProperty("age");
  expect(result[0]).toEqual({ id: "1", name: "John" });
});

test("Execute SQL query to fail", async () => {
  const query = "SELECT fun FROM sample";
  const result = await executeSelectQuery(query);

  expect(result.length).toBe(0); //since fun is not in data
});

// can't handle error for file not found
// test("Execute SQL query to fail again", async () => {
//     const query = "SELECT fun FROM samples";
//     expect(await executeSelectQuery(query)).toThrow();
// })

test("Execute SQL Query with WHERE clause", async () => {
  const query = "SELECT id, name FROM SAMPLE WHERE age = 25";
  const result = await executeSelectQuery(query);
  expect(result.length).toBe(1);
  expect(result[0]).toHaveProperty("id");
  expect(result[0]).toHaveProperty("name");
  expect(result[0].id).toBe("2");
});

test("Execute SQL Query with Multiple WHERE Clause", async () => {
  const query = "SELECT id, name FROM sample WHERE age = 30 AND name = John";
  const result = await executeSelectQuery(query);
  expect(result.length).toBe(1);
  expect(result[0]).toEqual({ id: "1", name: "John" });
});

// OR is not handled
test("Execute SQL Query with Multiple WHERE Clause having OR", async () => {
  const query = "SELECT id,name FROM sample WHERE age = 30 OR age = 25";
  const result = await executeSelectQuery(query);
  expect(result.length).toBe(0);
});

test("Execute SQL Query with Greater Than", async () => {
  const query = "SELECT id FROM sample WHERE age > 22";
  const result = await executeSelectQuery(query);
  expect(result.length).toEqual(2);
  expect(result[0]).toHaveProperty("id");
});

test("Execute SQL Query with Greater Than and Equal to", async () => {
  const query = "SELECT id FROM sample WHERE age > 22 and age = 30";
  const result = await executeSelectQuery(query);
  expect(result.length).toEqual(1);
  expect(result[0]).toHaveProperty("id");
});

test("Execute SQL Query with Not Equal to", async () => {
  const query = "SELECT name FROM sample WHERE age != 25";
  const result = await executeSelectQuery(query);
  expect(result.length).toEqual(2);
  expect(result[0]).toHaveProperty("name");
});

test("Execute SQL Query with INNER JOIN", async () => {
  const query =
    "SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id";
  const result = await executeSelectQuery(query);
  expect(result.length).toBeGreaterThan(0);
  expect(result[0]).toEqual({
    "student.name": "John",
    "enrollment.course": "Mathematics",
  });
});
test("Execute SQL Query with INNER JOIN and a WHERE Clause", async () => {
  const query =
    "SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id WHERE student.name = John";
  const result = await executeSelectQuery(query);
  expect(result.length).toBeGreaterThan(0);
  expect(result[0]).toEqual({
    "student.name": "John",
    "enrollment.course": "Mathematics",
  });
});

test("Execute SQL Query with LEFT JOIN", async () => {
  const query =
    "SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id";
  const result = await executeSelectQuery(query);
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "student.name": "Alice",
        "enrollment.course": null,
      }),
      expect.objectContaining({
        "student.name": "John",
        "enrollment.course": "Mathematics",
      }),
    ])
  );
  expect(result.length).toEqual(5); // 4 students, but John appears twice
});

test("Execute SQL Query with LEFT JOIN with a WHERE clause filtering the main table", async () => {
  const query =
    "SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age > 22";
  const result = await executeSelectQuery(query);
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "enrollment.course": "Mathematics",
        "student.name": "John",
      }),
      expect.objectContaining({
        "enrollment.course": "Physics",
        "student.name": "John",
      }),
    ])
  );
  expect(result.length).toEqual(4);
});

test("Execute SQL Query with LEFT JOIN with a WHERE clause filtering the join table", async () => {
  const query = `SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Physics'`;
  const result = await executeSelectQuery(query);
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "student.name": "John",
        "enrollment.course": "Physics",
      }),
    ])
  );
  expect(result.length).toEqual(1);
});

test("Execute SQL Query with RIGHT JOIN with a WHERE clause filtering the main table", async () => {
  const query =
    "SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE student.age < 25";
  const result = await executeSelectQuery(query);
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "enrollment.course": "Mathematics",
        "student.name": "Bob",
      }),
      expect.objectContaining({
        "enrollment.course": "Biology",
        "student.name": null,
      }),
    ])
  );
  expect(result.length).toEqual(2);
});

test("Execute SQL Query with RIGHT JOIN with a WHERE clause filtering the join table", async () => {
  const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry'`;
  const result = await executeSelectQuery(query);
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "enrollment.course": "Chemistry",
        "student.name": "Jane",
      }),
    ])
  );
  expect(result.length).toEqual(1);
});

test("Execute SQL Query with RIGHT JOIN with a multiple WHERE clauses filtering the join table and main table", async () => {
  const query = `SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id WHERE enrollment.course = 'Chemistry' AND student.age = 26`;
  const result = await executeSelectQuery(query);
  expect(result).toEqual([]);
});

test("Execute SQL Query with ORDER BY", async () => {
  const query = "SELECT name FROM student ORDER BY name ASC";
  const result = await executeSelectQuery(query);
  expect(result).toStrictEqual([
    { name: "Alice" },
    { name: "Bob" },
    { name: "Jane" },
    { name: "John" },
  ]);
});

test("Execute SQL Query with ORDER BY and WHERE", async () => {
  const query = "SELECT name FROM student WHERE age > 24 ORDER BY name DESC";
  const result = await executeSelectQuery(query);

  expect(result).toStrictEqual([{ name: "John" }, { name: "Jane" }]);
});
test("Execute SQL Query with ORDER BY and GROUP BY", async () => {
  const query =
    "SELECT COUNT(id) as count, age FROM student GROUP BY age ORDER BY age DESC";
  const result = await executeSelectQuery(query);
  expect(result).toStrictEqual([
    { age: "30", "count(id) as count": 1 },
    { age: "25", "count(id) as count": 1 },
    { age: "24", "count(id) as count": 1 },
    { age: "22", "count(id) as count": 1 },
  ]);
});

test("Execute SQL Query with aggregate fxn and limit clause without group by", async() => {
  const query = "SELECT COUNT(id), age FROM student LIMIT 2";
  const result = await executeSelectQuery(query);
  expect(result.length).toBe(2);
})
test('Execute SQL Query with standard LIMIT clause', async () => {
  const query = 'SELECT id, name FROM student LIMIT 2';
  const result = await executeSelectQuery(query);
  expect(result.length).toEqual(2);
});

test('Execute SQL Query with LIMIT clause equal to total rows', async () => {
  const query = 'SELECT id, name FROM student LIMIT 4';
  const result = await executeSelectQuery(query);
  expect(result.length).toEqual(4);
});

test('Execute SQL Query with LIMIT clause exceeding total rows', async () => {
  const query = 'SELECT id, name FROM student LIMIT 10';
  const result = await executeSelectQuery(query);
  expect(result.length).toEqual(4); // Total rows in student.csv
});

test('Execute SQL Query with LIMIT 0', async () => {
  const query = 'SELECT id, name FROM student LIMIT 0';
  const result = await executeSelectQuery(query);
  expect(result.length).toEqual(0);
});

test('Execute SQL Query with LIMIT and ORDER BY clause', async () => {
  const query = 'SELECT id, name FROM student ORDER BY age DESC LIMIT 2';
  const result = await executeSelectQuery(query);
  expect(result.length).toEqual(2);
  expect(result[0].name).toEqual('John');
  expect(result[1].name).toEqual('Jane');
});
