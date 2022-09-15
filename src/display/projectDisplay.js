import { add } from 'date-fns';
import PubSub from 'pubsub-js';
import * as fns from './fns.js';
import * as appcsts from '../appcsts.js';

function createRenameButton(projectId) {
  const element = fns.createElement({
    type: 'button',
    classList: 'rename-button',
    textContent: 'Rename',
  });

  element.addEventListener('click', () => {
    const link = document.querySelector(`#project-${projectId}`);
    if (link.contentEditable === 'false') {
      link.contentEditable = true;
      element.textContent = 'Finish Renaming';
      link.classList.add('being-renamed');
    }
    else {
      PubSub.publish('rename project clicked', {
        id: projectId,
        newTitle: link.textContent,
      });
    }
  });

  return element;
}

function createDeleteButton(projectId) {
  const button = fns.createElement({
    type: 'button',
    classList: 'delete-button',
    textContent: 'Delete',
    clickEventListener: () => PubSub.publish('delete project clicked', projectId),
  });

  return button;
}

function createLinkToProject(projectTitle, projectId) {
  const link = fns.createElement({
    type: 'p',
    classList: 'project-link',
    id: `project-${projectId}`,
    textContent: projectTitle,
  });
  link.contentEditable = false;
  link.addEventListener('click', () => PubSub.publish('project link clicked', {
    projectId,
    isBeingEdited: link.contentEditable === 'true',
  }));
  return link;
}

function createErrorDisplayFor(projectId) {
  const errorDisplay = fns.createElement({
    type: 'p',
    classList: 'project-error-display hidden',
    id: `project-error-display-${projectId}`,
  });

  PubSub.subscribe('error updating project', (msg, errorData) => {
    const { errorId, errors } = errorData;
    if (projectId === errorId) {
      errorDisplay.textContent = fns.createErrorMessage(errors);
      errorDisplay.classList.remove('hidden');
    }
  });

  return errorDisplay;
}

function createProjectRow(projectData) {
  const { title, id } = projectData;
  const container = fns.createElement({
    type: 'div',
    classList: 'project-pane-row-container',
  });
  const link = createLinkToProject(title, id);
  const errorDisplay = createErrorDisplayFor(id);
  const buttons = fns.createContainer('project-element-buttons-container');
  buttons.append(createRenameButton(id), createDeleteButton(id));
  container.append(link, errorDisplay, buttons);
  return container;
}

function createCurrentProjectHeader() {
  const element = fns.createElement({
    type: 'h1',
    classList: 'current-project-header',
    textContent: appcsts.INITIAL_PROJECT_DATA.title,
  });

  PubSub.subscribe('current project changed', (msg, projectData) => {
    if (projectData) element.textContent = projectData.title;
  });

  PubSub.subscribe('no projects', (msg) => element.textContent = appcsts.NO_PROJECTS_MESSAGE);

  PubSub.subscribe('project renamed', (msg, projectData) => {
    const { title, isCurrentProject } = projectData;
    if (isCurrentProject) element.textContent = title;
  });
  return element;
}

const sortDropdownLabel = fns.createElement({
  type: 'label',
  textContent: 'Sort by:',
});

const sortMethodDropdown = document.createElement('select');
for (const method in appcsts.PROJECT_SORTING_FUNCTIONS) {
  const option = document.createElement('option');
  option.textContent = method;
  option.addEventListener('click', () => {
    PubSub.publish('project sort method selected', method);
  });
  sortMethodDropdown.appendChild(option);
}

const sortDirectionDropdown = document.createElement('select');
const directions = ['Ascending', 'Descending'];
for (const direction of directions) {
  let option = document.createElement('option');
  option.textContent = direction;
  option.addEventListener('click', () => {
    PubSub.publish('project sort direction selected', direction);
  });
  sortDirectionDropdown.appendChild(option);
}

const projectOptionsContainer = fns.createContainer('project-options-container');
const projectSortOptionsContainer = fns.createContainer('sort-options-container');
projectSortOptionsContainer.append(sortDropdownLabel, sortMethodDropdown, sortDirectionDropdown);

const addNewProjectButton = fns.createElement({
  type: 'button',
  classList: 'add-new-project-button',
  textContent: 'Add new project',
  clickEventListener: () => PubSub.publish('add new project button clicked'),
});

projectOptionsContainer.append(projectSortOptionsContainer, addNewProjectButton);

const createProjectDisplay = () => {
  const container = document.createElement('div');
  container.classList.add('project-display');

  const projectList = fns.createElement({
    type: 'div',
    classList: 'project-list',
  });

  function addProjectToContainer(projectData) {
    projectList.appendChild(createProjectRow(projectData));
  }

  function displayAllProjects(projectArray) {
    fns.clearContent(projectList);
    projectArray.forEach((projectData) => {
      addProjectToContainer(projectData);
    });
  }

  container.append(
    createCurrentProjectHeader(),
    projectList,
    projectOptionsContainer,
  );

  PubSub.subscribe('project array changed', (msg, projectArray) => displayAllProjects(projectArray));

  return container;
};

export {
  createProjectDisplay,
  createCurrentProjectHeader,
};
