import { forIn, mapValues } from 'lodash';
import PubSub from 'pubsub-js';
import * as appcsts from '../appcsts.js';
import * as fns from './fns.js';

const addNewProjectModal = fns.createElement({
  type: 'div',
  classList: 'modal hidden',
});

const addNewProjectFormContainer = fns.createElement({
  type: 'div',
  classList: 'modal-content-container',
});

const inputFieldElements = fns.createInputFieldElements(
  appcsts.ADD_NEW_PROJECT_FORM_ELEMENT_STRUCTURE,
);

const inputFieldLabels = fns.createInputFieldLabels(
  appcsts.ADD_NEW_PROJECT_FORM_LABEL_STRUCTURE,
);

const errorDisplay = fns.createElement({
  type: 'p',
  classList: 'error-display',
});

PubSub.subscribe('error creating project', (msg, errorText) => {
  errorDisplay.textContent = fns.createErrorMessage(errorText);
});

const getInputValues = () => ({
  title: inputFieldElements.title.value,
});

const clearInputValues = () => forIn(inputFieldElements, (input) => input.value = '');
const clearErrorDisplay = () => errorDisplay.textContent = '';

const clearEverything = () => {
  clearInputValues();
  clearErrorDisplay();
};

const removeForm = () => {
  clearEverything();
  fns.hideElements(addNewProjectModal);
  PubSub.publish('add new project form removed');
};

const createProjectButton = fns.createElement({
  type: 'button',
  classList: 'create-project-button',
  textContent: 'Create project',
  clickEventListener: () => PubSub.publish('create project button clicked', getInputValues()),
});

const discardButton = fns.createElement({
  type: 'button',
  classList: 'discard-project-button',
  textContent: 'Discard',
  clickEventListener: removeForm,
});

addNewProjectModal.appendChild(addNewProjectFormContainer);

for(const fieldName in appcsts.ADD_NEW_PROJECT_FORM_LABEL_STRUCTURE) {
  addNewProjectFormContainer.append(inputFieldLabels[fieldName], inputFieldElements[fieldName]);
}

addNewProjectFormContainer.append(errorDisplay, createProjectButton, discardButton);

PubSub.subscribe('add new project button clicked', () => fns.showElements(addNewProjectModal));
PubSub.subscribe('project array changed', removeForm);

export default addNewProjectModal;
