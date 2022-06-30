const express = require('express');
const cors = require('cors');

const {
  v4: uuidv4
} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {
    username
  } = request.headers
  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(404).json({
      error: 'User not exists!'
    })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const {
    name,
    username
  } = request.body;

  const foundUser = users.find(user => user.username === username);
  if (foundUser !== undefined) {
    return response.status(400).json({
      error: 'Username already exists'
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.status(200).json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {
    title,
    deadline
  } = request.body;
  const {
    user
  } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  user.todos.push(todo);
  const userIndex = users.findIndex(currentUser => currentUser.username === user.username);
  users[userIndex] = user;

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    title,
    deadline
  } = request.body;
  const {
    user
  } = request;
  const {
    id
  } = request.params;

  const foundTodo = user.todos.find(todo => todo.id === id);
  if (foundTodo === undefined) {
    return response.status(404).json({
      error: 'Todo not exists'
    });
  }

  if (title !== undefined) {
    foundTodo.title = title;
  }
  if (deadline !== undefined) {
    foundTodo.deadline = deadline;
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  user.todos[todoIndex] = foundTodo;

  const userIndex = users.findIndex(currentUser => currentUser.username === user.username);
  users[userIndex] = user;

  return response.status(200).json(foundTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;
  const {
    id
  } = request.params;

  const foundTodo = user.todos.find(todo => todo.id === id);
  if (foundTodo === undefined) {
    return response.status(404).json({
      error: 'Todo not exists'
    });
  }

  foundTodo.done = true;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  user.todos[todoIndex] = foundTodo;

  const userIndex = users.findIndex(currentUser => currentUser.username === user.username);
  users[userIndex] = user;

  return response.status(200).json(foundTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;
  const {
    id
  } = request.params;

  const foundTodo = user.todos.find(todo => todo.id === id);
  if (foundTodo === undefined) {
    return response.status(404).json({
      error: 'Todo not exists'
    });
  }
  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  user.todos.splice(todoIndex, 1);

  const userIndex = users.findIndex(currentUser => currentUser.username === user.username);
  users[userIndex] = user;

  return response.status(204).json(foundTodo);
});

module.exports = app;