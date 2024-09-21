import { configElement } from './createElement';
interface configLabel extends configElement {
    id?: string;
    title: string;
    container?: HTMLElement;
}
export default function addLabelToToolbar(config: configLabel): HTMLLabelElement;
export {};
