import { configElement } from './createElement';
interface configBrush extends configElement {
    title?: string;
    toolGroupId?: string;
    range?: number[];
    defaultValue?: number;
}
export default function addBrushSizeSlider(config: configBrush): void;
export {};
