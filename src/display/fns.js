import { mapValues } from 'lodash';

function mapObjectVals(obj, valMap) {
  const result = {};
  for (const key in obj) result[key] = valMap(obj[key]);
  return result;
}

function forEachObjectVal(obj, process) {
  mapObjectVals(obj, process);
}

function filterObjectVals(obj, predicate) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (predicate(value)) result[key] = value;
  }
  return result;
}

function createElement({ type, classList, id, textContent, clickEventListener, data = {} }) {
  const element = document.createElement(type);
  if (classList) element.classList.add(...classList.split(' '));
  if (id) element.id = id;
  if (textContent) element.textContent = textContent;
  if (clickEventListener) element.addEventListener('click', clickEventListener.bind(element));
  element.data = data;
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

function hideElement(element) {
  element.classList.add('hidden');
}

function showElement(element) {
  element.classList.remove('hidden');
}

function hideElements(elements) {
  for (const element of arguments) hideElement(element);
}

function showElements(elements) {
  for (const element of arguments) showElement(element);
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

function runIfConfirmed(functionToRun) {
  if (confirm(appcsts.CONFIRM_DELETION_MESSAGE)) functionToRun();
}

export {
  mapObjectVals,
  forEachObjectVal,
  filterObjectVals,
  createElement,
  createContainer,
  createErrorMessage,
  hideElement,
  showElement,
  hideElements,
  showElements,
  createInputFieldLabels,
  createInputFieldElements,
  clearContent,
  createErrorDisplay,
  priorityToColour,
  runIfConfirmed,
};
