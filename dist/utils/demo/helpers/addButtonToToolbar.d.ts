import { configElement } from './createElement';
interface configButton extends configElement {
    id?: string;
    title: string;
    container?: HTMLElement;
    onClick: () => void;
}
export default function addButtonToToolbar(config: configButton): HTMLButtonElement;
export {};
