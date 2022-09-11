import { add } from 'date-fns';
import PubSub from 'pubsub-js';
import * as fns from './fns.js';
import * as appcsts from '../appcsts.js';

function createRenameButton(titleOfProjectToRename) {
  const element = fns.createElement({
    type: 'button',
    classList: 'rename-button',
    textContent: 'Rename',
  });

  element.addEventListener('click', () => {
    const link = document.querySelector(`#project-${titleOfProjectToRename}`);
    if (link.contentEditable === 'false') {
      link.contentEditable = true;
      element.textContent = 'Finish Renaming';
      link.classList.add('being-renamed');
    }
    else {
      PubSub.publish('rename project clicked', {
        oldTitle: titleOfProjectToRename,
        newTitle: link.textContent,
      });
    }
  });

  return element;
}

function createLinkToProject(projectTitle) {
  const link = fns.createElement({
    type: 'p',
    classList: 'project-link',
    id: `project-${projectTitle}`,
    textContent: projectTitle,
  });
  link.contentEditable = false;
  link.addEventListener('click', () => PubSub.publish('project link clicked', {
    projectTitle,
    isBeingEdited: link.contentEditable === 'true',
  }));
  return link;
}

function createErrorDisplayFor(projectTitle) {
  const errorDisplay = fns.createElement({
    type: 'p',
    classList: 'project-error-display hidden',
    id: `project-error-display-${projectTitle}`,
  });

  PubSub.subscribe('error updating project', (msg, errorData) => {
    const { title, errors } = errorData;
    if (title === projectTitle) {
      errorDisplay.textContent = errors.join(' ');
      errorDisplay.classList.remove('hidden');
    }
  });

  return errorDisplay;
}

function createProjectRow(projectTitle) {
  const container = fns.createElement({
    type: 'div',
    classList: 'project-pane-row-container',
  });
  const link = createLinkToProject(projectTitle);
  const errorDisplay = createErrorDisplayFor(projectTitle);
  const renameButton = createRenameButton(projectTitle);
  container.append(link, errorDisplay, renameButton);
  return container;
}

function createCurrentProjectHeader() {
  const element = fns.createElement({
    type: 'h1',
    classList: 'current-project-header',
    textContent: appcsts.INITIAL_PROJECT_DATA.title,
  });

  PubSub.subscribe('current project changed', (msg, newProjectTitle) => {
    element.textContent = newProjectTitle;
  });
  PubSub.subscribe('project renamed', (msg, projectData) => {
    const {title, isCurrentProject} = projectData;
    if (isCurrentProject) element.textContent = title;
  });
  return element;
}

const createProjectDisplay = () => {
  const container = document.createElement('div');
  container.classList.add('project-display');

  const projectList = fns.createElement({
    type: 'div',
    classList: 'project-list',
  });

  const addNewProjectButton = fns.createElement({
    type: 'button',
    classList: 'add-new-project-button',
    textContent: 'Add new project',
    clickEventListener: () => PubSub.publish('add-new-project-button-clicked'),
  });

  container.append(createCurrentProjectHeader(), projectList, addNewProjectButton);

  function addProjectToContainer(projectTitle) {
    projectList.appendChild(createProjectRow(projectTitle));
  }

  function displayAllProjects(projectArray) {
    fns.clearContent(projectList);
    projectArray.forEach((project) => {
      addProjectToContainer(project.title);
    });
  }

  PubSub.subscribe('project array changed', (msg, projectArray) => displayAllProjects(projectArray));

  PubSub.subscribe('project-added', (msg, name) => {
    addProjectToContainer(name);
  });

  return container;
};

export {
  createProjectDisplay,
  createCurrentProjectHeader,
};
