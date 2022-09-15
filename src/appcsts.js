import { isBefore, isEqual } from 'date-fns';

const NO_PROJECTS_MESSAGE = 'No projects yet...';

const INITIAL_PROJECT_DATA = {
  title: 'Project 1',
  id: 0,
};

const DEFAULT_PROJECT_SORT = { method: 'Title (alphabetical)', direction: 'Ascending' };
const DEFAULT_TODO_SORT = { method: 'Time of creation', direction: 'Ascending' };

const ADD_NEW_TODO_FORM_ELEMENT_STRUCTURE = {
  title: 'input',
  priority: 'input',
  dueDate: 'input',
  description: 'textarea',
};

const ADD_NEW_TODO_FORM_LABEL_STRUCTURE = {
  title: 'Title',
  priority: 'Priority; this must be a number from 0 (least important) to 10 (most important)',
  dueDate: 'Due Date; in the form dd/mm/yyyy. This will be set to today\'s date if nothing is entered.',
  description: 'Description',
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
  Date(todo1, todo2) {
    const [dueDate1, dueDate2] = [todo1.dueDate, todo2.dueDate];
    if (isBefore(dueDate1, dueDate2)) return -1;
    if (isEqual(dueDate1, dueDate2)) return 0;
    return 1;
  },
  Priority: (todo1, todo2) => todo1.priority - todo2.priority,
};

export {
  NO_PROJECTS_MESSAGE,
  INITIAL_PROJECT_DATA,
  DEFAULT_PROJECT_SORT,
  DEFAULT_TODO_SORT,
  PROJECT_SORTING_FUNCTIONS,
  TODO_SORTING_FUNCTIONS,
  ADD_NEW_TODO_FORM_ELEMENT_STRUCTURE,
  ADD_NEW_TODO_FORM_LABEL_STRUCTURE,
  ADD_NEW_PROJECT_FORM_ELEMENT_STRUCTURE,
  ADD_NEW_PROJECT_FORM_LABEL_STRUCTURE,
};
