import { configElement } from './createElement';
interface configBrush extends configElement {
    title?: string;
    toolGroupId?: string;
    range?: number[];
    defaultValue?: number;
}
/**
 * Adds a slider to control brush size to the example page.
 */
export default function addBrushSizeSlider(config: configBrush): void;
export {};
