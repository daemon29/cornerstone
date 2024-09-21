import { configElement } from './createElement';
interface configCheckbox extends configElement {
    id?: string;
    title: string;
    checked?: boolean;
    container?: HTMLElement;
    onChange: (checked: boolean) => void;
    label?: configElement;
}
export default function addCheckboxToToolbar(config: configCheckbox): void;
export {};
