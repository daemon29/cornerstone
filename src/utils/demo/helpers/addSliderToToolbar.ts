import { utilities as csUtilities } from '@cornerstonejs/core';

import createElement, { configElement } from './createElement';
import addLabelToToolbar from './addLabelToToolbar';

interface configSlider extends configElement {
  id?: string;
  title: string;
  range: number[];
  step?: number;
  defaultValue: number;
  container?: HTMLElement;
  onSelectedValueChange: (value: string) => void;
  updateLabelOnChange?: (value: string, label: HTMLElement) => void;
  label?: configElement;
}

export default function addSliderToToolbar(config: configSlider): void {
  config = csUtilities.deepMerge(config, config.merge);

  config.container = config.container ?? document.getElementById('demo-toolbar');

  const existingInputElement = config.id ? document.getElementById(config.id) as HTMLInputElement : null;

  if (existingInputElement) {
    // Element already exists, update config and value
    existingInputElement.min = String(config.range[0]);
    existingInputElement.max = String(config.range[1]);
    existingInputElement.step = String(config.step);
    existingInputElement.value = String(config.defaultValue);
    
    // Update event listener for input change
    existingInputElement.addEventListener('input', (evt: Event) => {
      const selectElement = <HTMLSelectElement>evt.target;
      if (selectElement) {
        config.onSelectedValueChange(selectElement.value);
        if (config.updateLabelOnChange !== undefined) {
          const elLabel = document.getElementById(`${config.id}-label`);
          if (elLabel) {
            config.updateLabelOnChange(selectElement.value, elLabel);
          }
        }
      }
    });

    return; // Exit the function since we don't need to create a new element
  }

  // Create a new label for the slider
  const elLabel = addLabelToToolbar({
    merge: config.label,
    title: config.title,
    container: config.container,
  });

  if (config.id) {
    elLabel.id = `${config.id}-label`;
  }

  elLabel.htmlFor = config.title;

  // Function to handle input change
  const fnInput = (evt: Event) => {
    const selectElement = <HTMLSelectElement>evt.target;

    if (selectElement) {
      config.onSelectedValueChange(selectElement.value);

      if (config.updateLabelOnChange !== undefined) {
        config.updateLabelOnChange(selectElement.value, elLabel);
      }
    }
  };

  // Create a new input element
  const elInput = <HTMLInputElement>createElement({
    merge: config,
    tag: 'input',
    attr: {
      type: 'range',
      name: config.title,
    },
    event: {
      input: fnInput,
    },
  });

  if (config.id) {
    elInput.id = config.id;
  }

  // Add step before setting its value to make sure it works for steps different than 1
  if (config.step) {
    elInput.step = String(config.step);
  }

  elInput.min = String(config.range[0]);
  elInput.max = String(config.range[1]);
  elInput.value = String(config.defaultValue);

  // Append the input element to the toolbar
  config.container.appendChild(elInput);
}
