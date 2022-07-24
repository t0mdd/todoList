import PubSub from 'pubsub-js';

const completeSymbol = '✓';
const incompleteSymbol = '✗';
const completeText = 
  isComplete => isComplete ? completeSymbol : incompleteSymbol;

const notEditingText = 'Edit';
const editingText = 'Finish editing';
const editText = editing => editing ? editingText : notEditingText;

const notExpandedText = 'Show description';
const expandedText = 'Hide description';

const toggleComplete = element => {
  element.textContent = 
    element.textContent === completeSymbol ? incompleteSymbol : completeSymbol;
}

const createTodoElement = (todo) => {

  let element = document.createElement('div');
  element.classList.add('todo-container');

  let editMode = false;
  let expanded = false;

  function createTitle() {
    let title;
    if (editMode) {
      title = document.createElement('input');
      title.value = todo.title;
    } 
    else {
      title = document.createElement('h1'); 
      title.textContent = todo.title;
    }
    return title;
  }

  function updateTitle() {
    let newTitle = createTitle();
    element.replaceChild(newTitle, title);
    title = newTitle;
  }

  let title = createTitle();
  PubSub.subscribe('title updated', (msg, todoUpdated) => {
    updateTitle();
  });

  let dueDate = document.createElement('p');
  dueDate.textContent = `Due: ${todo.dueDate}`;

  let description;
  if (editMode) {
    description = document.createElement('input');
    description.value = todo.description;
    description.classList.remove('hidden');
  }
  else {
    description = document.createElement('p');
    description.textContent = todo.description;
    description.classList.add('hidden');
  }
    
  let complete = document.createElement('b');
  complete.classList.add('complete-symbol');
  complete.textContent = incompleteSymbol;
  complete.addEventListener('click', () => {
    PubSub.publish('complete toggled', todo);
  });
    
  PubSub.subscribe('complete updated', (msg, todoUpdated) => {
    if (todoUpdated === todo)
      complete.textContent = completeText(todoUpdated.complete);
  });

  let edit = document.createElement('b');
  edit.classList.add('edit');
  edit.textContent = notEditingText;
  edit.addEventListener('click', () => {
    editMode = !editMode;
    edit.textContent = editText(editMode);
    if (editMode) {
      updateTitle();
    }
    else {
      PubSub.publish('title changed', {
        title: title.value,
        todo
      });
    }
  });

  let expand = document.createElement('b');
  expand.classList.add('edit');
  expand.textContent = expanded ? expandedText : notExpandedText;
  expand.addEventListener('click', () => {
    expanded = !expanded;
    expand.textContent = expanded ? expandedText : notExpandedText;
    description.classList.toggle('hidden');
  });

  element.append(title,complete,dueDate,description,expand,edit);
  return element;
}

const displayTodoElement = 
  todoElement => document.body.appendChild(todoElement);

export {
  createTodoElement,
  displayTodoElement
}