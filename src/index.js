import './style.css';
import _ from 'lodash';
import * as application from './application.js';
import * as display from './display.js';
import {format, parse} from 'date-fns';

const washin =
  application.createTodo(
  'Put togs in washer',
  'Just the darks',
  'high',
  new Date(2022,6,27),
  );

const washin2 =
  application.createTodo(
  'Put fish in pie',
  'Janet has requested my services',
  'low',
  new Date(2022,6,28),
  );
