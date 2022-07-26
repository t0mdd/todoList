import { isBefore, isEqual } from 'date-fns';

const NO_PROJECTS_MESSAGE = 'No projects yet...';

const INITIAL_PROJECT_DATA = {
  title: 'Project 1',
  id: 0,
};

const INITIAL_TODOS_DATA = [
  {
    title: 'Title',
    description: 'Buuuh',
    priority: '5',
    dueDate: '22/2/2022',
  },
  {
    title: 'Feel free to delete me',
    description: 'I am just taking up space here',
    priority: '7',
    dueDate: '30/3/2023',
  },
];

const DEFAULT_PROJECT_SORT = { method: 'Time of creation', direction: 'Ascending' };
const DEFAULT_TODO_SORT = { method: 'Time of creation', direction: 'Ascending' };

const ADD_NEW_TODO_FORM_ELEMENT_STRUCTURE = {
  title: 'input',
  priority: 'input',
  dueDate: 'input',
  description: 'textarea',
};

const ADD_NEW_TODO_FORM_LABEL_STRUCTURE = {
  title: 'Title',
  priority: 'Priority (from 0 to 10)',
  dueDate: 'Due Date in the form dd/mm/yyyy (this will be set to today\'s date if empty)',
  description: 'Description (optional)',
};

const ADD_NEW_PROJECT_FORM_ELEMENT_STRUCTURE = {
  title: 'input',
};

const ADD_NEW_PROJECT_FORM_LABEL_STRUCTURE = {
  title: 'Title',
};

const PROJECT_SORTING_FUNCTIONS = {
  'Time of creation': (project1, project2) => project1.id - project2.id,
  'Title (alphabetical)': (project1, project2) => {
    if (project1.title.toLowerCase() < project2.title.toLowerCase()) return -1;
    if (project1.title.toLowerCase() === project2.title.toLowerCase()) return 0;
    return 1;
  },
};

const TODO_SORTING_FUNCTIONS = {
  'Time of creation': (todo1, todo2) => todo1.id - todo2.id,
  'Title (alphabetical)': (todo1, todo2) => {
    if (todo1.title.toLowerCase() < todo2.title.toLowerCase()) return -1;
    if (todo1.title.toLowerCase() === todo2.title.toLowerCase()) return 0;
    return 1;
  },
  'Due Date': (todo1, todo2) => {
    const [dueDate1, dueDate2] = [todo1.dueDate, todo2.dueDate];
    if (isBefore(dueDate1, dueDate2)) return -1;
    if (isEqual(dueDate1, dueDate2)) return 0;
    return 1;
  },
  Priority: (todo1, todo2) => todo1.priority - todo2.priority,
};

const CONFIRM_DELETION_MESSAGE = 'To confirm deletion, click OK.';

export {
  NO_PROJECTS_MESSAGE,
  INITIAL_PROJECT_DATA,
  INITIAL_TODOS_DATA,
  DEFAULT_PROJECT_SORT,
  DEFAULT_TODO_SORT,
  PROJECT_SORTING_FUNCTIONS,
  TODO_SORTING_FUNCTIONS,
  ADD_NEW_TODO_FORM_ELEMENT_STRUCTURE,
  ADD_NEW_TODO_FORM_LABEL_STRUCTURE,
  ADD_NEW_PROJECT_FORM_ELEMENT_STRUCTURE,
  ADD_NEW_PROJECT_FORM_LABEL_STRUCTURE,
  CONFIRM_DELETION_MESSAGE,
};
