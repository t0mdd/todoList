import './style.css';
import _ from 'lodash';


const createProject = () => {
  const todos = [];
  const addTodo = todo => {
    todos.push(todo);
  };
  const removeTodo = title => _.remove(todos, todo => todo.title === title);
  return {todos,addTodo,removeTodo};
}

const createTodo = (title,description,dueDate,priority) => {
  return {title,description,dueDate,priority,complete:false};
}

const completeSymbol = '✓';
const incompleteSymbol = '✗';

const toggleComplete = element => {
  element.textContent = 
    element.textContent === completeSymbol ? incompleteSymbol : completeSymbol;
}

const notEditingText = 'Edit';
const editingText = 'Finish editing';

const createTodoElement = (todo) => {

  let element = document.createElement('div');
  element.classList.add('todo-container');

  let editMode = false;

  const generateContent = () => {
    let title;
    if (editMode) {
      title = document.createElement('input');
      title.value = todo.title;
    } 
    else {
      title = document.createElement('h1'); 
      title.textContent = todo.title;
    }

    let dueDate = document.createElement('p');
    dueDate.textContent = `Due: ${todo.dueDate}`;

    let description = document.createElement('p');
    description.textContent = todo.description;
    description.classList.add('hidden');
    
    let complete = document.createElement('b');
    complete.classList.add('complete-symbol');
    complete.textContent = incompleteSymbol;
    complete.addEventListener('click', (event) => {
      toggleComplete(complete);
      event.stopPropagation();
    });
    
    let edit = document.createElement('b');
    edit.classList.add('edit');
    edit.textContent = editMode ? editingText : notEditingText;
    edit.addEventListener('click', (event) => {
      if (editMode) {
        todo.title = title.value;
      }
      editMode = !editMode;
      setContent();
      event.stopPropagation();
    });

    return [title,complete,dueDate,description,edit];
  }

  const setContent = () => {
    element.innerHTML = '';
    for (let content of generateContent())
    element.appendChild(content);
  }

  element.addEventListener('click', () => {
    description.classList.toggle('hidden');
  });
  
  setContent();

  return element;
}

const displayTodoElement = 
  todoElement => document.body.appendChild(todoElement);

let proj = createProject();
let washin = createTodo('Put togs in washer','Just the darks','23th Sunday','high');
let washinElement = createTodoElement(washin);
proj.addTodo(washin);
displayTodoElement(washinElement);