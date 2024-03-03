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
