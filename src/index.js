import './style.css';
import _ from 'lodash';
import PubSub from 'pubsub-js';
import * as application from './application.js';
import * as display from './display.js';
import createModal from './modal.js';
import {add, format, parse} from 'date-fns';

document.body.appendChild(createModal());

const addNewTodoButton = document.createElement('button');
addNewTodoButton.textContent = 'Add new todo';
addNewTodoButton.addEventListener('click', () => {
  PubSub.publish('add new todo clicked');
  addNewTodoButton.classList.add('hidden');
});

PubSub.subscribe('add todo form removed', () => {
  addNewTodoButton.classList.remove('hidden');
});

document.body.appendChild(addNewTodoButton);

application.createTodo(
  'Put togs in washer',
  'Just the darks',
  'high',
  '27/6/2022',
);

application.createTodo(
  'Put fish in pie',
  'Janet has requested my services',
  'low',
  '28/6/2022',
);
