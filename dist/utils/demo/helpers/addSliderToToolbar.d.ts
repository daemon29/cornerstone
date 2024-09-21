import { configElement } from './createElement';
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
export default function addSliderToToolbar(config: configSlider): void;
export {};
