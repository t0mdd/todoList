import PubSub from 'pubsub-js';

const completeSymbol = '✓';
const incompleteSymbol = '✗';
const completeMarkContent = (isComplete) => (isComplete ? completeSymbol : incompleteSymbol);

const notEditingText = 'Edit';
const editingText = 'Finish editing';
const editText = (editing) => (editing ? editingText : notEditingText);

const notExpandedText = 'Show description';
const expandedText = 'Hide description';
const expandText = (expanded) => (expanded ? expandedText : notExpandedText);

const createTitle = (content) => {
  const element = document.createElement('h1');
  element.classList.add('title');
  element.textContent = content;
  return element;
};

const createCompleteMark = (isComplete) => {
  const element = document.createElement('b');
  element.classList.add('complete-symbol');
  element.textContent = completeMarkContent(isComplete);
  return element;
};

const createDueDate = (dueDate) => {
  const element = document.createElement('p');
  element.classList.add('dueDate');
  element.textContent = dueDate;
  return element;
};

const createDescription = (content) => {
  const element = document.createElement('p');
  element.classList.add('description');
  element.textContent = content;
  element.classList.add('hidden');
  return element;
};
const createErrorDisplay = () => {
  const element = document.createElement('p');
  element.classList.add('error-display', 'hidden');
  return element;
};

const createEditButton = () => {
  const element = document.createElement('button');
  element.classList.add('edit-button');
  element.textContent = notEditingText;
  return element;
};

const createDiscardChangesButton = () => {
  const element = document.createElement('button');
  element.textContent = 'Discard Changes';
  element.classList.add('discard-changes-button', 'hidden');
  return element;
};

const createExpandButton = () => {
  const element = document.createElement('button');
  element.classList.add('expand-button');
  element.textContent = notExpandedText;
  return element;
};

const createDeleteButton = () => {
  const element = document.createElement('button');
  element.classList.add('delete-button');
  element.textContent = 'Delete';
  return element;
};

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
  const errorDisplay = createErrorDisplay();
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
  };

  const finishEditing = () => {
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

  PubSub.subscribe('todo updated', (msg, updatedTodoId) => {
    if (id !== updatedTodoId) return;
    finishEditing();
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
    finishEditing();
  });

  expandButton.addEventListener('click', () => {
    expanded = !expanded;
    triggerExpandEvents();
  });

  deleteButton.addEventListener('click', () => {
    removeTodoElement(id);
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
  document.body.appendChild(container);
};

PubSub.subscribe('todo added', (msg, todo) => createTodoElement(todo));

const removeTodoElement = (id) => {
  document.body.removeChild(document.querySelector(`#todo-${id}`));
};

export {
  createTodoElement,
};
