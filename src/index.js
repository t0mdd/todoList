import './style.css';
import _ from 'lodash';
import * as application from './application.js';
import addNewTodoModal from './display/addNewTodoModal.js';
import addNewProjectModal from './display/addNewProjectModal.js';
import createProjectDisplay from './display/projectDisplay.js';
import createTodoDisplay from './display/todoDisplay.js';
import * as displayfns from './display/fns.js';

const displayContainer = displayfns.createContainer('display-container');
displayContainer.append(createProjectDisplay(), createTodoDisplay());

document.body.append(
  displayContainer,
  addNewProjectModal,
  addNewTodoModal,
);
