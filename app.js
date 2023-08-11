const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());

const bcrypt = require("bcrypt");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API 1

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const encrypted = bcrypt.hash(password, 10);

  const q1 = `select * from user where username = '${username}';`;

  const r1 = await db.get(q1);

  if (r1 === undefined) {
    const q2 = `INSERT INTO user (username,name,password,gender,location) VALUES 
        ('${username}','${name}','${encrypted}','${gender}','${location}') ;`;

    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const r2 = await db.run(q2);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//API 2

app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const q4 = `select * from user where username = '${username}';`;

  const r4 = await db.get(q4);

  if (r4 === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const check = await bcrypt.compare(request.body.password, r4.password);

    if (check === true) {
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//API 3

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const encrypted2 = bcrypt.hash(newPassword, 10);

  const q5 = `select * from user where username = '${username}';`;
  const r5 = await db.get(q5);

  if (r5 === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const check = await bcrypt.compare(request.body.oldPassword, r5.password);

    if (check === true) {
      if (newPassword.length > 5) {
        const q6 = `UPDATE user SET password = '${encrypted2}' where username = '${username}' ;`;
        await db.run(q6);
        response.send("Password updated");
      } else {
        response.status(400);
        response.send("Password is too short");
      }
    } else {
      response.status(400);
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
