import _ from 'lodash';
import PubSub from 'pubsub-js';
import { isValid } from 'date-fns';

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

const removeProject = (name) => _.remove(projects, (project) => project.name === name);

const removeTodo = (id) => _.remove(currentProject.todos, (todo) => todo.id === id);

const findTodoWithId = (id) => currentProject.todos.find((todo) => todo.id === id);

const updateTodoWithId = (id, newTodo) => {
  let indexInArray = currentProject.todos.indexOf(findTodoWithId(id));
  currentProject.todos[indexInArray] = newTodo;
}

PubSub.subscribe('delete clicked', (msg, id) => {
  removeTodo(id);
});

const todoTitleTaken = (title, oldTitle=false) => {
  for (const todo of currentProject.todos) {
    if (oldTitle && todo.title === oldTitle) continue;
    if (title === todo.title) return true;
  }
  return false;
};

const generateTodoErrors = (todo, oldTodo=false) => {
  const errors = [];
  const { title, dueDate } = todo;
  if (oldTodo && todoTitleTaken(title, oldTodo.title) || !oldTodo && todoTitleTaken(title)) {
    errors.push('That title is already taken.');
  }
  if (!isValid(dueDate)) errors.push('Invalid date format; it must have the form dd/mm/yyyy.');
  return errors;
};

const createTodo = (title, description, priority, dueDate = new Date()) => {
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
  PubSub.publish('todo added', todo);
  return true;
};

const updateTodo = (updatedData) => {
  let id = updatedData.id;
  let oldTodo = findTodoWithId(id);
  let newTodo = {...oldTodo};
  for (const key in updatedData) {
    if (key === 'id') continue;
    newTodo[key] = updatedData[key];
  }
  const errors = generateTodoErrors(newTodo, oldTodo);
  if (errors.length > 0) {
    PubSub.publish('error updating todo', {errors, editedTodoId: id});
    return false;
  } else {
    updateTodoWithId(id,newTodo);
    PubSub.publish('todo updated', id);
  }
}

PubSub.subscribe('todo edited', (msg, data) => {
  const todoToEdit = findTodoWithId(data.id);
  updateTodo(data);
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
