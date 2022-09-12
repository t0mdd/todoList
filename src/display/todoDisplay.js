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

const sortDropdownLabel = fns.createElement({
  type: 'label',
  textContent: 'Sort by:',
});

const sortMethodDropdown = document.createElement('select');
for (const method in appcsts.TODO_SORTING_FUNCTIONS) {
  const option = document.createElement('option');
  option.textContent = method;
  option.addEventListener('click', () => {
    PubSub.publish('todo sort method selected', method);
  });
  sortMethodDropdown.appendChild(option);
}

const sortDirectionDropdown = document.createElement('select');
const directions = ['Ascending', 'Descending'];
for (const direction of directions) {
  let option = document.createElement('option');
  option.textContent = direction;
  option.addEventListener('click', () => {
    PubSub.publish('todo sort direction selected', direction);
  });
  sortDirectionDropdown.appendChild(option);
}

const todosContainer = fns.createElement({
  type: 'div',
  classList: 'todos-container',
});

const createLabel = (textContent) => fns.createElement({
  type: 'label',
  classList: 'todo-label',
  textContent,
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

const createPriorityDisplay = (priority) => fns.createElement({
  type: 'p',
  classList: 'priority-display hidden',
  textContent: priority,
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

const createTodoElementContainer = (id) => fns.createElement({
  type: 'div',
  classList: 'todo-element-container',
  id: `todo-${id}`,
});

const createTodoElement = (todo) => {
  let lastSnapshot;
  let editMode = false;
  let expanded = false;
  let isComplete = todo.complete;

  const { id, title, dueDate, description, priority } = todo;

  const container = createTodoElementContainer(id);
  container.style.backgroundColor = fns.priorityToColour(priority);

  const titleDisplay = createTitle(title);
  const completeMark = createCompleteMark(isComplete);
  const dueDateLabel = createLabel('Due date:');
  const dueDateDisplay = createDueDate(dueDate);
  const descriptionLabel = createLabel('Description:');
  const descriptionDisplay = createDescription(description);
  const priorityLabel = createLabel('Priority:');
  const priorityDisplay = createPriorityDisplay(priority);
  const errorDisplay = fns.createErrorDisplay();
  const editButton = createEditButton();
  const discardChangesButton = createDiscardChangesButton();
  const expandButton = createExpandButton();
  const deleteButton = createDeleteButton();

  fns.hideElements(descriptionLabel, priorityLabel);

  const editableElements = [
    titleDisplay,
    dueDateDisplay,
    descriptionDisplay,
    priorityDisplay,
  ];

  const hideableElements = [
    descriptionLabel,
    descriptionDisplay,
    priorityLabel,
    priorityDisplay,
    discardChangesButton,
    errorDisplay,
  ];

  const grabEditableData = () => ({
    title: titleDisplay.textContent,
    dueDate: dueDateDisplay.textContent,
    description: descriptionDisplay.textContent,
    priority: priorityDisplay.textContent,
  });

  const changeContentEditableStatus = (newStatus) => {
    for (const element of editableElements) element.contentEditable = newStatus;
  };

  function hideHideableElements() {
    fns.hideElements(...hideableElements);
  }

  function showHideableElements() {
    fns.showElements(...hideableElements);
  }

  const resetToLastSnapshot = () => {
    titleDisplay.textContent = lastSnapshot.title;
    dueDateDisplay.textContent = lastSnapshot.dueDate;
    descriptionDisplay.textContent = lastSnapshot.description;
    priorityDisplay.textContent = lastSnapshot.priority;
    changeContentEditableStatus(false);
    editMode = false;
    editButton.textContent = notEditingText;
    fns.clearContent(errorDisplay);
    hideHideableElements();
  };

  const triggerExpandEvents = () => {
    expandButton.textContent = expandText(expanded);
    if (expanded) fns.showElements(descriptionLabel, descriptionDisplay);
    else fns.hideElements(descriptionLabel, descriptionDisplay);
  };

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
      showHideableElements();
      triggerExpandEvents();
    }
  });

  PubSub.subscribe('error updating todo', (msg, data) => {
    const { editedTodoId, errors } = data;
    if (id !== editedTodoId) return;
    errorDisplay.textContent = fns.createErrorMessage(errors);
  });

  discardChangesButton.addEventListener('click', () => resetToLastSnapshot());

  expandButton.addEventListener('click', () => {
    expanded = !expanded;
    triggerExpandEvents();
  });

  deleteButton.addEventListener('click', () => PubSub.publish('delete clicked', id));

  container.append(
    titleDisplay,
    completeMark,
    dueDateLabel,
    dueDateDisplay,
    descriptionLabel,
    descriptionDisplay,
    priorityLabel,
    priorityDisplay,
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

  PubSub.subscribe('no projects', (msg) => container.classList.add('hidden'));
  PubSub.subscribe('project added', (msg) => container.classList.remove('hidden'));
  return container;
};

export default createTodoDisplay;
