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

function clearContent(element) {
  element.innerHTML = '';
}

function hideElement(element) {
  element.classList.add('hidden');
}

function unhideElement(element) {
  element.classList.remove('hidden');
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

export {
  createElement,
  hideElement,
  unhideElement,
  createInputFieldLabels,
  createInputFieldElements,
  clearContent,
  createErrorDisplay,
};
