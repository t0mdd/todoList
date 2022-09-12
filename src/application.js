import { remove, forEach, isFinite } from 'lodash';
import PubSub from 'pubsub-js';
import { isValid } from 'date-fns';
import { format, parse } from 'date-fns';
import * as appcsts from './appcsts.js';

const formatDate = (date) => format(date, 'dd/MM/yyyy');
const parseDate = (str) => parse(str, 'dd/MM/yyyy', new Date());

const projects = [];

let currentProject;
let currentProjectSort = appcsts.DEFAULT_PROJECT_SORT;
let currentTodoSort = appcsts.DEFAULT_TODO_SORT;
let nextProjectId = 1;
let nextTodoId = 0;

const getCurrentProject = () => currentProject;

function setCurrentProject(newProject) {
  currentProject = newProject;
  PubSub.publish('current project changed', newProject);
  if (newProject) PubSub.publish('todo array changed', generateTodosTextData());
  else PubSub.publish('no projects');
}

function findProjectWithTitle(title) {
  return projects.find((project) => project.title === title);
}

function findProjectWithId(id) {
  return projects.find((project) => project.id === id);
}

PubSub.subscribe('project link clicked', (msg, linkData) => {
  const { projectId, isBeingEdited } = linkData;
  if (!isBeingEdited) {
    setCurrentProject(findProjectWithId(projectId));
  }
});

function projectTitleTaken(newTitle, oldTitle = '') {
  const titlesToSearch = projects
    .map((project) => project.title)
    .filter((title) => title !== oldTitle);
  return titlesToSearch.includes(newTitle);
}

function priorityIsValid(priority) {
  if (priority === '') return false;
  priority = +priority;
  return isFinite(priority) && 0 <= priority && priority <= 10;
}

const generateProjectErrors = (newProject, oldProject = false) => {
  const errors = [];
  const { title } = newProject;
  if (title === '') {
    errors.push('You need to enter a title.');
  }
  if (projectTitleTaken(title, oldProject ? oldProject.title : undefined)) {
    errors.push('That title is already taken.');
  }
  return errors;
};

const createProject = (data) => {
  const { title } = data;
  const errors = generateProjectErrors(data);
  if (errors.length > 0) {
    PubSub.publish('error creating project', errors);
    return;
  }
  const project = { title, todos: [], id: nextProjectId };
  currentProject = project;
  projects.push(project);
  sortProjects();
  setCurrentProject(project);
  nextProjectId++;
};

PubSub.subscribe('create project button clicked', (msg, data) => createProject(data));

function removeProjectWithId(id) {
  remove(projects, (project) => project.id === id);
}

PubSub.subscribe('delete project clicked', (msg, projectId) => {
  const projectToRemove = findProjectWithId(projectId);
  removeProjectWithId(projectId);
  PubSub.publish('project array changed', projects);
  if (currentProject.id === projectId) {
    setCurrentProject(projects[0]);
  }
});

const sortProjects = () => {
  const { method, direction } = currentProjectSort;
  const directionFunction = (direction === 'Ascending' ? (x) => x : (x) => -x);
  function sortingFunction(s, t) {
    return directionFunction(appcsts.PROJECT_SORTING_FUNCTIONS[method](s, t));
  }
  projects.sort(sortingFunction);
  PubSub.publish('project array changed', projects);
};

const sortTodos = () => {
  const { method, direction } = currentTodoSort;
  const directionFunction = (direction === 'Ascending' ? (x) => x : (x) => -x);
  function sortingFunction(s, t) {
    return directionFunction(appcsts.TODO_SORTING_FUNCTIONS[method](s, t));
  }
  currentProject.todos.sort(sortingFunction);
  PubSub.publish('todo array changed', generateTodosTextData());
};

function updateProjectData(oldProject, updatedData) {
  const newProject = { ...oldProject };
  forEach(updatedData, (value, key) => {
    newProject[key] = updatedData[key];
  });
  return newProject;
}

const updateProject = (newProject, oldProject) => {
  const isCurrentProject = currentProject.title === oldProject.title;
  const errors = generateProjectErrors(newProject, oldProject);
  if (errors.length > 0) {
    PubSub.publish('error updating project', { 
      errors,
      errorId: oldProject.id,
    });
    return false;
  }
  const indexInArray = projects.findIndex((project) => project.title === oldProject.title);
  projects[indexInArray] = newProject;
  sortProjects();
  PubSub.publish('project renamed', {
    title: newProject.title,
    isCurrentProject,
  });
  PubSub.publish('project array changed', projects);
  return true;
};

PubSub.subscribe('rename project clicked', (msg, titleData) => {
  const { id, newTitle } = titleData;
  const oldProject = findProjectWithId(id);
  const newProject = updateProjectData(oldProject, {title: newTitle});
  updateProject(newProject, oldProject);
});

const removeTodo = (id) => remove(currentProject.todos, (todo) => todo.id === id);

const findTodoWithId = (id) => currentProject.todos.find((todo) => todo.id === id);

PubSub.subscribe('project sort method selected', (msg, method) => {
  currentProjectSort.method = method;
  sortProjects();
});

PubSub.subscribe('project sort direction selected', (msg, direction) => {
  currentProjectSort.direction = direction;
  sortProjects();
});

PubSub.subscribe('todo sort method selected', (msg, method) => {
  currentTodoSort.method = method;
  sortTodos();
});

PubSub.subscribe('todo sort direction selected', (msg, direction) => {
  currentTodoSort.direction = direction;
  sortTodos();
});

PubSub.subscribe('delete clicked', (msg, id) => {
  removeTodo(id);
  PubSub.publish('todo array changed', generateTodosTextData());
});

function todoTitleTaken(newTitle, oldTitle = '') {
  const titlesToSearch = currentProject.todos
    .map((todo) => todo.title)
    .filter((title) => title !== oldTitle);
  return titlesToSearch.includes(newTitle);
}

const todoToTextData = (todo) => {
  const data = { ...todo };
  data.dueDate = formatDate(data.dueDate);
  return data;
};

const todoToStorageData = (todo) => {
  const data = { ...todo };
  data.dueDate = parseDate(data.dueDate);
  return data;
};

const generateTodosTextData = () => currentProject.todos.map((todo) => todoToTextData(todo));

const generateTodoErrors = (todo, oldTodo = false) => {
  const errors = [];
  const { title, dueDate, priority } = todo;
  if (title === '') {
    errors.push('You need to enter a title.');
  }
  if (todoTitleTaken(title, oldTodo ? oldTodo.title : undefined)) {
    errors.push('That title is already taken.');
  }
  if (!priorityIsValid(priority)) {
    errors.push('The priority you entered is not a number from 0 to 10.');
  }
  if (!isValid(dueDate)) errors.push('The date you entered does not have the form dd/mm/yyyy.');
  return errors;
};

const createTodo = (data) => {
  const { title, priority, description, dueDate } = data;
  const parsedDueDate = dueDate ? parseDate(dueDate) : new Date();
  const todo = {
    title,
    description,
    priority,
    dueDate: parsedDueDate,
    complete: false,
    id: nextTodoId,
  };
  const errors = generateTodoErrors(todo);
  if (errors.length > 0) {
    PubSub.publish('error creating todo', errors);
    return;
  }
  nextTodoId += 1;
  currentProject.todos.push(todo);
  sortTodos();
  PubSub.publish('todo added', generateTodosTextData());
};

function updateTodoData(oldTodo, updatedData) {
  const newTodo = { ...oldTodo };
  forEach(updatedData, (value, key) => {
    if (key !== 'id') newTodo[key] = updatedData[key];
  });
  return newTodo;
}

const updateTodo = (updatedData) => {
  const { id } = updatedData;
  const oldTodo = findTodoWithId(id);
  const newTodo = updateTodoData(oldTodo, updatedData);
  const errors = generateTodoErrors(newTodo, oldTodo);
  if (errors.length > 0) {
    PubSub.publish('error updating todo', { errors, editedTodoId: id });
    return false;
  }
  const indexInArray = currentProject.todos.findIndex((todo) => todo.id === id);
  currentProject.todos[indexInArray] = newTodo;
  sortTodos();
  PubSub.publish('todo array changed', generateTodosTextData());
  return true;
};

PubSub.subscribe('create todo clicked', (msg, data) => {
  createTodo(data);
});

PubSub.subscribe('todo edited', (msg, todoTextData) => {
  updateTodo(todoToStorageData(todoTextData));
});

PubSub.subscribe('complete toggled', (msg, id) => {
  const todoToChange = findTodoWithId(id);
  todoToChange.complete = !todoToChange.complete;
});

export {
  getCurrentProject,
  createProject,
  removeProjectWithId,
  createTodo,
  removeTodo,
};
