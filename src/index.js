import './style.css';
import _ from 'lodash';
import PubSub from 'pubsub-js';
import * as application from './application.js';
import addNewTodoModal from './display/addNewTodoModal.js';
import addNewProjectModal from './display/addNewProjectModal.js';
import createProjectDisplay from './display/projectDisplay.js';
import createTodoDisplay from './display/todoDisplay.js';
import * as appcsts from './appcsts.js';
import * as displayfns from './display/fns.js';

const displayContainer = displayfns.createContainer('display-container');
displayContainer.append(createProjectDisplay(), createTodoDisplay());

document.body.append(
  displayContainer,
  addNewProjectModal,
  addNewTodoModal,
);

application.createProject(appcsts.INITIAL_PROJECT_DATA);

application.createTodo({
  title: 'Put togs in washer',
  description: 'Just the darks',
  priority: '7',
  dueDate: '27/6/2022',
});

application.createTodo({
  title: 'Put fish in pie',
  description: 'Janet has requested my services',
  priority: '3',
  dueDate: '28/6/2022',
});
