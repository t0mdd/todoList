import { forIn, forEach } from 'lodash';
import PubSub from 'pubsub-js';
import * as appcsts from '../appcsts.js';
import * as fns from './fns.js';

const addNewTodoModal = fns.createElement({
  type: 'div',
  classList: 'modal hidden',
});

const addNewTodoFormContainer = fns.createElement({
  type: 'div',
  classList: 'modal-content-container',
});

const inputFieldElements = fns.createInputFieldElements(
  appcsts.ADD_NEW_TODO_FORM_ELEMENT_STRUCTURE,
);

const inputFieldLabels = fns.createInputFieldLabels(
  appcsts.ADD_NEW_TODO_FORM_LABEL_STRUCTURE,
);

const errorDisplay = fns.createElement({
  type: 'p',
  classList: 'error-display',
});

PubSub.subscribe('error creating todo', (msg, errors) => {
  errorDisplay.textContent = '';
  errors.forEach((err) => errorDisplay.textContent += `${err} `);
});

const getInputValues = () => ({
  title: inputFieldElements.title.value,
  dueDate: inputFieldElements.dueDate.value,
  Priority: inputFieldElements.priority.value,
  Description: inputFieldElements.description.value,
});

const clearInputValues = () => forIn(inputFieldElements, (input) => input.value = '');
const clearErrorDisplay = () => errorDisplay.textContent = '';

const clearEverything = () => {
  clearInputValues();
  clearErrorDisplay();
};

const removeForm = () => {
  clearEverything();
  fns.hideElement(addNewTodoModal);
  PubSub.publish('add todo form removed');
};

const createTodoButton = fns.createElement({
  type: 'button',
  classList: 'create-todo-button',
  textContent: 'Create todo',
  clickEventListener: () => PubSub.publish('create todo clicked', getInputValues()),
});

const discardButton = fns.createElement({
  type: 'button',
  classList: 'discard-todo-button',
  textContent: 'Discard',
  clickEventListener: removeForm,
});

function appendInputFields() {
  forEach(appcsts.ADD_NEW_TODO_FORM_LABEL_STRUCTURE, (value, fieldName) => {
    addNewTodoFormContainer.append(inputFieldLabels[fieldName], inputFieldElements[fieldName]);
  });
}

addNewTodoModal.appendChild(addNewTodoFormContainer);
appendInputFields();
addNewTodoFormContainer.append(errorDisplay, createTodoButton, discardButton);

PubSub.subscribe('add new todo clicked', () => fns.unhideElement(addNewTodoModal));
PubSub.subscribe('todo added', removeForm);

export default addNewTodoModal;
