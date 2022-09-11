import { isBefore, isEqual } from 'date-fns';

const NO_PROJECTS_MESSAGE = 'No projects yet...';

const INITIAL_PROJECT_DATA = {
  title: 'Project 1',
  priority: 5,
  id: 0,
};

const DEFAULT_TODO_SORT = { method: 'Date', direction: 'Ascending' };

const ADD_NEW_TODO_FORM_ELEMENT_STRUCTURE = {
  title: 'input',
  priority: 'input',
  dueDate: 'input',
  description: 'textarea',
};

const ADD_NEW_TODO_FORM_LABEL_STRUCTURE = {
  title: 'Title',
  priority: 'Priority',
  dueDate: 'Due Date',
  description: 'Description',
};

const ADD_NEW_PROJECT_FORM_ELEMENT_STRUCTURE = {
  title: 'input',
  priority: 'input',
};

const ADD_NEW_PROJECT_FORM_LABEL_STRUCTURE = {
  title: 'Title',
  priority: 'Priority',
};

const SORTING_FUNCTIONS = {
  Date(todo1, todo2) {
    const [dueDate1, dueDate2] = [todo1.dueDate, todo2.dueDate];
    if (isBefore(dueDate1, dueDate2)) return -1;
    if (isEqual(dueDate1, dueDate2)) return 0;
    return 1;
  },
  Priority: (todo1, todo2) => todo1.Priority - todo2.Priority,
  Alphabetical(todo1, todo2) {
    if (todo1.Title.toLowerCase() < todo2.Title.toLowerCase()) return -1;
    if (todo1.Title.toLowerCase() === todo2.Title.toLowerCase()) return 0;
    return 1;
  },
};

export {
  NO_PROJECTS_MESSAGE,
  INITIAL_PROJECT_DATA,
  DEFAULT_TODO_SORT,
  SORTING_FUNCTIONS,
  ADD_NEW_TODO_FORM_ELEMENT_STRUCTURE,
  ADD_NEW_TODO_FORM_LABEL_STRUCTURE,
  ADD_NEW_PROJECT_FORM_ELEMENT_STRUCTURE,
  ADD_NEW_PROJECT_FORM_LABEL_STRUCTURE,
};
