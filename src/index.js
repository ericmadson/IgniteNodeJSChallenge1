const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const existingUsername = users.find((user) => user.username === username);

  if (existingUsername) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = { id: uuidv4(), name, username, todos: [] };

  users.push(user);

  return response.status(201).send();
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(task);

  return response.json(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const taskById = user.todos.find((todo) => todo.id === id);

  if (!taskById) {
    return response.status(404).json({ error: "Task not found!" });
  }

  taskById.title = title;
  taskById.deadline = new Date(deadline);

  return response.status(201).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const taskById = user.todos.find((todo) => todo.id === id);

  if (!taskById) {
    return response.status(404).json({ error: "Task not found!" });
  }

  taskById.done = true;

  return response.status(201).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskById = user.todos.find((todo) => todo.id === id);

  if (!taskById) {
    return response.status(404).json({ error: "Task not found!" });
  }

  user.todos = user.todos.filter((todo) => {
    return todo.id !== id;
  });

  return response.status(201).send();
});

module.exports = app;
