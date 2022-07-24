import './style.css';
import _ from 'lodash';
import * as application from './application.js'
import * as display from './display.js'

let washin = 
  application.createTodo('Put togs in washer','Just the darks','23th Sunday','high');
let washinElement = display.createTodoElement(washin);

application.createTodo(washin);
display.displayTodoElement(washinElement);