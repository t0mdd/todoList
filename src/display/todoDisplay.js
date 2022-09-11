import PubSub from 'pubsub-js';
import * as appcsts from '../appcsts.js';
import * as fns from './fns.js';

const completeSymbol = '✓';
const incompleteSymbol = '✗';
const completeMarkContent = (isComplete) => (isComplete ? completeSymbol : incompleteSymbol);

const notEditingText = 'Edit';
const editingText = 'Finish editing';
const editText = (editing) => (editing ? editingText : notEditingText);

const notExpandedText = 'Show description';
const expandedText = 'Hide description';
const expandText = (expanded) => (expanded ? expandedText : notExpandedText);

const emptyProjectMessage = 'No todos in this project!';

const emptyProjectMessageElement = fns.createElement({
  type: 'p',
  classList: 'empty-project-message',
  textContent: emptyProjectMessage,
});

const addNewTodoButton = fns.createElement({
  type: 'button',
  textContent: 'Add new todo',
  clickEventListener: () => PubSub.publish('add new todo clicked'),
});

document.body.appendChild(addNewTodoButton);

const sortDropdownLabel = fns.createElement({
  type: 'label',
  textContent: 'Sort by:',
});

const sortMethodDropdown = document.createElement('select');
for (const method in appcsts.SORTING_FUNCTIONS) {
  const option = document.createElement('option');
  option.textContent = method;
  option.addEventListener('click', () => {
    PubSub.publish('sort method selected', method);
  });
  sortMethodDropdown.appendChild(option);
}
document.body.appendChild(sortMethodDropdown);

const sortDirectionDropdown = document.createElement('select');
const directions = ['Ascending', 'Descending'];
for (const direction of directions) {
  let option = document.createElement('option');
  option.textContent = direction;
  option.addEventListener('click', () => {
    PubSub.publish('sort direction selected', direction);
  });
  sortDirectionDropdown.appendChild(option);
}

document.body.appendChild(sortDirectionDropdown);

const todosContainer = fns.createElement({
  type: 'div',
  classList: 'todos-container',
});

const createTitle = (textContent) => fns.createElement({
  type: 'h1',
  classList: 'todo-title',
  textContent,
});

const createCompleteMark = (isComplete) => fns.createElement({
  type: 'b',
  classList: 'complete-symbol',
  textContent: completeMarkContent(isComplete),
});

const createDueDate = (dueDate) => fns.createElement({
  type: 'p',
  classList: 'dueDate',
  textContent: dueDate,
});

const createDescription = (textContent) => fns.createElement({
  type: 'p',
  classList: 'description hidden',
  textContent,
});

const createEditButton = () => fns.createElement({
  type: 'button',
  classList: 'editButton',
  textContent: notEditingText,
});

const createDiscardChangesButton = () => fns.createElement({
  type: 'button',
  classList: 'discard-changes-button hidden',
  textContent: 'Discard Changes',
});

const createExpandButton = () => fns.createElement({
  type: 'button',
  classList: 'expand-button',
  textContent: notExpandedText,
});

const createDeleteButton = () => fns.createElement({
  type: 'button',
  classList: 'delete-button',
  textContent: 'Delete',
});

const createTodoElement = (todo) => {
  let lastSnapshot;
  let editMode = false;
  let expanded = false;
  let isComplete = todo.complete;

  const { id } = todo;

  const container = document.createElement('div');
  const title = createTitle(todo.title);
  const completeMark = createCompleteMark(isComplete);
  const dueDate = createDueDate(todo.dueDate);
  const description = createDescription(todo.description);
  const errorDisplay = fns.createErrorDisplay();
  const editButton = createEditButton();
  const discardChangesButton = createDiscardChangesButton();
  const expandButton = createExpandButton();
  const deleteButton = createDeleteButton();

  const editableElements = {
    title,
    dueDate,
    description,
  };

  const grabEditableData = () => ({
    title: title.textContent,
    dueDate: dueDate.textContent,
    description: description.textContent,
  });

  const resetToLastSnapshot = () => {
    title.textContent = lastSnapshot.title;
    dueDate.textContent = lastSnapshot.dueDate;
    description.textContent = lastSnapshot.description;
    changeContentEditableStatus(false);
    editMode = false;
    editButton.textContent = notEditingText;
    discardChangesButton.classList.add('hidden');
    errorDisplay.textContent = '';
    errorDisplay.classList.add('hidden');
  };

  const changeContentEditableStatus = (newStatus) => {
    for (const key in editableElements) {
      editableElements[key].contentEditable = newStatus;
    }
  };

  const triggerExpandEvents = () => {
    expandButton.textContent = expandText(expanded);
    if (expanded) description.classList.remove('hidden');
    else description.classList.add('hidden');
  };

  container.classList.add('todo-container');
  container.id = `todo-${id}`;

  completeMark.addEventListener('click', () => {
    isComplete = !isComplete;
    PubSub.publish('complete toggled', id);
    completeMark.textContent = completeMarkContent(isComplete);
  });

  editButton.addEventListener('click', () => {
    if (editMode) {
      PubSub.publish('todo edited', { id, ...grabEditableData() });
    }
    else {
      lastSnapshot = grabEditableData();
      changeContentEditableStatus(true);
      expanded = true;
      editMode = true;
      editButton.textContent = editingText;
      discardChangesButton.classList.remove('hidden');
      triggerExpandEvents();
    }
  });

  PubSub.subscribe('error updating todo', (msg, data) => {
    const { editedTodoId, errors } = data;
    if (id !== editedTodoId) return;
    errorDisplay.classList.remove('hidden');
    errorDisplay.textContent = '';
    for (const error of errors) {
      errorDisplay.textContent += `${error} `;
    }
  });

  discardChangesButton.addEventListener('click', () => {
    resetToLastSnapshot();
  });

  expandButton.addEventListener('click', () => {
    expanded = !expanded;
    triggerExpandEvents();
  });

  deleteButton.addEventListener('click', () => {
    PubSub.publish('delete clicked', id);
  });

  container.append(
    title,
    completeMark,
    dueDate,
    description,
    errorDisplay,
    editButton,
    discardChangesButton,
    expandButton,
    deleteButton,
  );
  return container;
};

const displayAllTodos = (todoTextDataArray) => {
  fns.clearContent(todosContainer);
  if (todoTextDataArray.length === 0) {
    todosContainer.appendChild(emptyProjectMessageElement);
    return;
  }
  for (const todoData of todoTextDataArray) todosContainer.appendChild(createTodoElement(todoData));
};

PubSub.subscribe('todo array changed', (msg, todoTextDataArray) => displayAllTodos(todoTextDataArray));

const removeTodoElement = (id) => {
  todosContainer.removeChild(document.querySelector(`#todo-${id}`));
};

const createTodoDisplay = () => {
  const container = fns.createElement({
    type: 'div',
    classList: 'todo-display',
  });

  container.append(
    todosContainer,
    addNewTodoButton,
    sortDropdownLabel,
    sortMethodDropdown,
    sortDirectionDropdown,
  );

  return container;
};

export default createTodoDisplay;
