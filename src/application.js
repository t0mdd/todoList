import _ from 'lodash';
import PubSub from 'pubsub-js';

const INITIAL_PROJECT_NAME = 'Default'

const projects = [];
let currentProject;

const createProject = name => {
  const todos = [];
  const addTodo = todo => {
    todos.push(todo);
  };
  const removeTodo = 
    todoToRemove => _.remove(todos, todo => todo === todoToRemove);

  return {name,todos,addTodo,removeTodo};
}

const addProject = name => {
  if (projects.map(project => project.name).includes(name)) return false;
  else {
    let project = createProject(name);
    currentProject = project;
    projects.push(project)
  };
}

const removeProject = 
  name => _.remove(projects, project => project.name === name);

const createTodo = (title,description,dueDate,priority) => {
  let todo = {title,description,dueDate,priority,complete:false};
  PubSub.subscribe('title changed', (msg, data) => {
    if (todo === data.todo) {
      todo.title = data.title;
      PubSub.publish('title updated', todo);
    }
  });

  PubSub.subscribe('complete toggled', (msg, todoChanged) => {
    if (todo === todoChanged) {
      todo.complete = !todo.complete;
      PubSub.publish('complete updated', todo);
    }
  });
  currentProject.addTodo(todo);
  return todo;
}

const removeTodo = todo => currentProject.removeTodo;

addProject(INITIAL_PROJECT_NAME);

export {
  currentProject,
  createProject,
  addProject,
  removeProject,
  createTodo,
  removeTodo,
}