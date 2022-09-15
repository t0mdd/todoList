import { mapValues } from 'lodash';

function createElement(data) {
  const { type, classList, id, textContent, clickEventListener } = data;
  const element = document.createElement(type);
  if (classList) element.classList.add(...classList.split(' '));
  if (id) element.id = id;
  if (textContent) element.textContent = textContent;
  if (clickEventListener) element.addEventListener('click', clickEventListener);
  return element;
}

function createContainer(classList) {
  return createElement({
    type: 'div',
    classList,
  });
}

function clearContent(element) {
  element.innerHTML = '';
}

function hideElements(elements) {
  for (const element of arguments) element.classList.add('hidden');
}

function showElements(elements) {
  for (const element of arguments) element.classList.remove('hidden');
}

function createInputFieldLabels(formStructure) {
  return mapValues(
    formStructure,
    (labelText) => createElement({
      type: 'p',
      classList: 'input-field-label',
      textContent: labelText,
    }),
  );
}

function createInputFieldElements(formStructure) {
  return mapValues(
    formStructure,
    (inputType) => createElement({
      type: inputType,
      classList: 'input-field',
    }),
  );
}

function createErrorDisplay() {
  return createElement({
    type: 'p',
    classList: 'error-display hidden',
  });
}

function createErrorMessage(errors) {
  return errors.join(' ');
}

function priorityToColour(priority) {
  const intensity = priority/15;
  return `rgba(255,0,0,${intensity})`;
}

export {
  createElement,
  createContainer,
  createErrorMessage,
  hideElements,
  showElements,
  createInputFieldLabels,
  createInputFieldElements,
  clearContent,
  createErrorDisplay,
  priorityToColour,
};
