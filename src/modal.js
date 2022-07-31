import { capitalize, forIn } from 'lodash';
import PubSub from 'pubsub-js';

const createModal = () => {
  const element = document.createElement('div');
  element.classList.add('add-todo-form', 'hidden');

  const inputs = {};

  function addRow(inputType, rowFor) {
    const label = document.createElement('p');
    label.classList.add(`${rowFor}-input-label`);
    label.textContent = `${capitalize(rowFor)}: `;

    const input = document.createElement(inputType);
    input.classList.add(`${rowFor}-input`);
    inputs[rowFor] = input;

    element.append(label, input);
  }

  addRow('input', 'title');
  addRow('input', 'priority');
  addRow('input', 'dueDate');
  addRow('textarea', 'description');

  function getInputValues() {
    return {
      title: inputs.title.value,
      dueDate: inputs.dueDate.value,
      priority: inputs.priority.value,
      description: inputs.description.value,
    };
  }

  function removeForm() {
    forIn(inputs, (input) => input.value = '');
    errorDisplay.textContent = '';
    element.classList.add('hidden');
    PubSub.publish('add todo form removed');
  }

  const errorDisplay = document.createElement('p');
  errorDisplay.classList.add('error-display');

  PubSub.subscribe('error creating todo', (msg, errors) => {
    errorDisplay.textContent = '';
    errors.forEach((err) => errorDisplay.textContent += `${err} `);
  });

  const createTodoButton = document.createElement('button');
  createTodoButton.classList.add('create-todo-button');
  createTodoButton.textContent = 'Create todo';
  createTodoButton.addEventListener('click', () => {
    PubSub.publish('create todo clicked', getInputValues());
  });

  const discardButton = document.createElement('button');
  discardButton.classList.add('discard-todo-button');
  discardButton.textContent = 'Discard';
  discardButton.addEventListener('click', () => removeForm());

  element.append(errorDisplay, createTodoButton, discardButton);

  PubSub.subscribe('add new todo clicked', () => {
    element.classList.remove('hidden');
  });

  PubSub.subscribe('todo added', () => removeForm());

  return element;
};

export default createModal;
