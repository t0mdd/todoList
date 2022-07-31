import { remove, mapValues } from 'lodash';
import PubSub from 'pubsub-js';
import { isValid } from 'date-fns';
import { format, parse } from 'date-fns';

const formatDate = (date) => format(date, 'dd/MM/yyyy');
const parseDate = (str) => parse(str, 'dd/MM/yyyy', new Date());

const INITIAL_PROJECT_NAME = 'Default';

const projects = [];
let currentProject;
let nextTodoId = 0;

const getCurrentProject = () => currentProject;

const projectNameTaken = (name) => projects.map((project) => project.name).includes(name);

const createProject = (name) => {
  if (projectNameTaken(name)) return false;
  const project = { name, todos: [] };
  currentProject = project;
  projects.push(project);
  return true;
};

const removeProject = (name) => remove(projects, (project) => project.name === name);

const removeTodo = (id) => remove(currentProject.todos, (todo) => todo.id === id);

const findTodoWithId = (id) => currentProject.todos.find((todo) => todo.id === id);

const updateTodoWithId = (id, newTodo) => {
  const indexInArray = currentProject.todos.findIndex((todo) => todo.id === id);
  currentProject.todos[indexInArray] = newTodo;
};

PubSub.subscribe('delete clicked', (msg, id) => {
  removeTodo(id);
});

const todoTitleTaken = (title, oldTitle = false) => {
  for (const todo of currentProject.todos) {
    if (oldTitle && todo.title === oldTitle) continue;
    if (title === todo.title) return true;
  }
  return false;
};

const todoToTextData = (todo) => {
  const data = {...todo};
  data.dueDate = formatDate(data.dueDate);
  return data;
};

const todoToStorageData = (todo) => {
  const data = {...todo};
  data.dueDate = parseDate(data.dueDate);
  return data;
};

const generateTodoErrors = (todo, oldTodo = false) => {
  const errors = [];
  const { title, dueDate } = todo;
  if (oldTodo && todoTitleTaken(title, oldTodo.title) || !oldTodo && todoTitleTaken(title)) {
    errors.push('That title is already taken.');
  }
  if (!isValid(dueDate)) errors.push('Invalid date format; it must have the form dd/mm/yyyy.');
  return errors;
};

const createTodo = (title, description, priority, dueDate = false) => {
  dueDate = dueDate ? parseDate(dueDate) : new Date();
  const todo = {
    title,
    description,
    priority,
    dueDate,
    complete: false,
    id: nextTodoId,
  };
  const errors = generateTodoErrors(todo);
  if (errors.length > 0) {
    PubSub.publish('error creating todo', errors);
    return false;
  }
  nextTodoId += 1;
  currentProject.todos.push(todo);
  PubSub.publish('todo added', todoToTextData(todo));
  return true;
};

const updateTodo = (updatedData) => {
  const { id } = updatedData;
  const oldTodo = findTodoWithId(id);
  const newTodo = { ...oldTodo };
  for (const key in updatedData) {
    if (key === 'id') continue;
    newTodo[key] = updatedData[key];
  }
  const errors = generateTodoErrors(newTodo, oldTodo);
  if (errors.length > 0) {
    PubSub.publish('error updating todo', { errors, editedTodoId: id });
    return false;
  }
  updateTodoWithId(id, newTodo);
  PubSub.publish('todo updated', id);
  return true;
};

PubSub.subscribe('create todo clicked', (msg, data) => {
  createTodo(data.title, data.description, data.priority, data.dueDate);
});

PubSub.subscribe('todo edited', (msg, data) => {
  updateTodo(todoToStorageData(data));
});

PubSub.subscribe('complete toggled', (msg, id) => {
  const todoToChange = findTodoWithId(id);
  todoToChange.complete = !todoToChange.complete;
});

createProject(INITIAL_PROJECT_NAME);

export {
  getCurrentProject,
  createProject,
  removeProject,
  createTodo,
  removeTodo,
};
