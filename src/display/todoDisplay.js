/* eslint-disable guard-for-in */
/* eslint-disable no-unused-vars */
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
  classList: 'add-new-todo-button',
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
  PubSub.subscribe('sort from local storage loaded', (msg, { todoSort }) => {
    if (todoSort.method === method) option.selected = true;
  });
  sortMethodDropdown.appendChild(option);
}

const sortDirectionDropdown = document.createElement('select');
const directions = ['Ascending', 'Descending'];
for (const direction of directions) {
  const option = document.createElement('option');
  option.textContent = direction;
  option.addEventListener('click', () => {
    PubSub.publish('todo sort direction selected', direction);
  });
  PubSub.subscribe('sort from local storage loaded', (msg, { todoSort }) => {
    if (todoSort.direction === direction) option.selected = true;
  });
  sortDirectionDropdown.appendChild(option);
}

const todosContainer = fns.createContainer('todos-container')

const createLabel = (textContent) => fns.createElement({
  type: 'label',
  classList: 'todo-label',
  textContent,
});

const createHidableLabel = (textContent) => {
  const label = createLabel(textContent);
  label.data.hidable = true;
  fns.hideElement(label);
  return label;
};

const createTitle = (textContent) => fns.createElement({
  type: 'h1',
  classList: 'todo-title',
  textContent,
  data: {
    editable: true,
  },
});

const createDescription = (textContent) => fns.createElement({
  type: 'p',
  classList: 'description hidden',
  textContent,
  data: {
    editable: true,
    hidable: true,
  },
});

const createPriority = (priority) => fns.createElement({
  type: 'p',
  classList: 'priority-display hidden',
  textContent: priority,
  data: {
    editable: true,
    hidable: true,
  },
});

const createCompleteMark = (isComplete) => fns.createElement({
  type: 'p',
  classList: 'complete-mark',
  textContent: completeMarkContent(isComplete),
  clickEventListener() {
    const newStatus = !this.data.todo.isComplete;
    this.data.todo.isComplete = newStatus;
    PubSub.publish('complete toggled', this.data.todo.data.idNumber);
    this.textContent = completeMarkContent(newStatus);
  },
});

const createDueDate = (dueDate) => fns.createElement({
  type: 'p',
  classList: 'dueDate',
  textContent: dueDate,
  data: {
    editable: true,
  },
});

const createErrorDisplay = () => {
  const errorDisplay = fns.createElement({
    type: 'p',
    classList: 'error-display hidden',
    data: {
      hidable: true,
    },
  });
  PubSub.subscribe('error updating todo', (msg, { editedTodoId, errors }) => {
    if (errorDisplay.data.todo.data.idNumber !== editedTodoId) return;
    errorDisplay.textContent = fns.createErrorMessage(errors);
  });
  return errorDisplay;
};

const createEditButton = () => fns.createElement({
  type: 'button',
  classList: 'edit-button',
  textContent: notEditingText,
  clickEventListener() {
    const editableData = this.data.todo.data.grabEditableData();
    if (this.data.todo.data.inEditMode) {
      PubSub.publish('todo edited', { id: this.data.todo.data.idNumber, updatedTextData: editableData });
    }
    else {
      this.textContent = editingText;
      this.data.todo.data = {
        ...this.data.todo.data,
        lastSnapshot: editableData,
        inEditMode: true,
      };

      this.data.todo.data.changeContentEditableStatus(true);
      this.data.todo.data.showHidableElements();
      this.data.todo.data.addEditingClasses();

      this.data.todo.data.isExpanded = true;
      this.data.todo.data.triggerExpandEvents();
    }
  },
});

const createDiscardChangesButton = () => fns.createElement({
  type: 'button',
  classList: 'discard-changes-button hidden',
  textContent: 'Discard Changes',
  clickEventListener() {
    this.data.todo.data.resetToLastSnapshot();
  },
});

const createExpandButton = () => fns.createElement({
  type: 'button',
  classList: 'expand-button',
  textContent: notExpandedText,
  clickEventListener() {
    this.data.todo.data.isExpanded = !this.data.todo.data.isExpanded;
    this.data.todo.data.triggerExpandEvents();
  },
});

const createDeleteButton = () => fns.createElement({
  type: 'button',
  classList: 'delete-button',
  textContent: 'Delete',
  clickEventListener() {
    if (confirm('To confirm deletion, click OK.')) {
      PubSub.publish('delete clicked', this.data.todo.data.idNumber);
    }
  },
});

const createTodoElementContainer = (id) => fns.createElement({
  type: 'div',
  classList: 'todo-element-container',
  id: `todo-${id}`,
});

const todoDataMethods = {
  getEditableComponents() {
    return fns.filterObjectVals(this.components, (component) => component.data.editable);
  },
  getHidableComponents() {
    return fns.filterObjectVals(this.components, (component) => component.data.hidable);
  },
  grabEditableData() {
    return fns.mapObjectVals(this.getEditableComponents(), (component) => component.textContent);
  },
  changeContentEditableStatus(newStatus) {
    fns.forEachObjectVal(
      this.getEditableComponents(),
      (component) => component.contentEditable = newStatus
    );
  },
  addEditingClasses() {
    fns.forEachObjectVal(this.getEditableComponents(), (component) => component.classList.add('editing'));
  },
  removeEditingClasses() {
    fns.forEachObjectVal(this.getEditableComponents(), (component) => component.classList.remove('editing'));
  },
  hideHidableElements() {
    fns.forEachObjectVal(this.getHidableComponents(), (component) => fns.hideElement(component));
  },
  showHidableElements() {
    fns.forEachObjectVal(this.getHidableComponents(), (component) => fns.showElement(component));
  },
  resetToLastSnapshot() {
    const { editButton, expandButton, errorDisplay } = this.components;
    editButton.textContent = notEditingText;
    expandButton.textContent = notExpandedText;
    fns.clearContent(errorDisplay);
    this.components = { ...this.components, ...this.lastSnapshot };
    this.changeContentEditableStatus(false);
    this.inEditMode = false;
    this.hideHidableElements();
    this.removeEditingClasses();
  },
  triggerExpandEvents() {
    const { expandButton, descriptionLabel, description } = this.components;
    expandButton.textContent = expandText(this.isExpanded);
    if (this.isExpanded) fns.showElements(descriptionLabel, description);
    else fns.hideElements(descriptionLabel, description);
  },
};

const createTodo = ({ id, title, dueDate, description, priority, complete }) => {
  const todo = createTodoElementContainer(id);
  todo.data = {
    ...todoDataMethods,
    idNumber: id,
    isComplete: false,
    inEditMode: false,
    isExpanded: false,
    lastSnapshot: undefined,
  };
  todo.style.backgroundColor = fns.priorityToColour(priority);

  const components = {
    title: createTitle(title),
    completeMark: createCompleteMark(complete),
    dueDateLabel: createLabel('Due date:'),
    dueDate: createDueDate(dueDate),
    descriptionLabel: createHidableLabel('Description:'),
    description: createDescription(description),
    priorityLabel: createHidableLabel('Priority:'),
    priority: createPriority(priority),
    errorDisplay: createErrorDisplay(),
    editButton: createEditButton(),
    discardChangesButton: createDiscardChangesButton(),
    expandButton: createExpandButton(),
    deleteButton: createDeleteButton(),
  };

  for (const key in components) components[key].data.todo = todo;
  todo.data.components = components;

  const topLine = fns.createContainer('todo-top-row');
  topLine.append(components.title, components.completeMark);

  const todoInformationContainer = fns.createContainer('todo-information-container');
  todoInformationContainer.append(
    components.dueDateLabel,
    components.dueDate,
    components.descriptionLabel,
    components.description,
    components.priorityLabel,
    components.priority,
  );

  const buttonsContainer = fns.createContainer('todo-element-buttons-container');
  buttonsContainer.append(
    components.editButton,
    components.discardChangesButton,
    components.expandButton,
    components.deleteButton,
  );

  todo.append(
    topLine,
    todoInformationContainer,
    components.errorDisplay,
    buttonsContainer,
  );

  return todo;
};

const displayAllTodos = (todoTextDataArray) => {
  fns.clearContent(todosContainer);
  if (todoTextDataArray.length === 0) {
    todosContainer.appendChild(emptyProjectMessageElement);
    return;
  }
  for (const todoData of todoTextDataArray) todosContainer.appendChild(createTodo(todoData));
};

PubSub.subscribe('todo array changed', (msg, todoTextDataArray) => displayAllTodos(todoTextDataArray));

const removeTodoElement = (id) => {
  todosContainer.removeChild(document.querySelector(`#todo-${id}`));
};

const todoOptionsContainer = fns.createContainer('todo-options-container');
const todoSortOptionsContainer = fns.createContainer('sort-options-container');
todoSortOptionsContainer.append(sortDropdownLabel, sortMethodDropdown, sortDirectionDropdown);

todoOptionsContainer.append(todoSortOptionsContainer, addNewTodoButton);

const createTodoDisplay = () => {
  const todoDisplayContainer = fns.createContainer('todo-display');

  todoDisplayContainer.append(
    todosContainer,
    todoOptionsContainer,
  );

  PubSub.subscribe('no projects', (msg) => todoDisplayContainer.classList.add('hidden'));
  PubSub.subscribe('project added', (msg) => todoDisplayContainer.classList.remove('hidden'));
  return todoDisplayContainer;
};

export default createTodoDisplay;
