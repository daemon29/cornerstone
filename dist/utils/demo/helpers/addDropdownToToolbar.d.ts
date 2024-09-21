import { configElement } from './createElement';
export declare type optionTypeDefaultValue = {
    defaultValue: number | string;
} | {
    defaultIndex?: number;
};
export declare type optionTypeValues = {
    values: number[] | string[];
} | {
    map: Map<string | number, any>;
};
interface configDropdown extends configElement {
    id?: string;
    placeholder?: string;
    options: optionTypeDefaultValue & optionTypeValues;
    onSelectedValueChange: (key: number | string, value?: any) => void;
    toolGroupId?: string | string[];
    label?: configElement;
    labelText?: string;
    container?: HTMLElement;
}
export default function addDropDownToToolbar(config: configDropdown): void;
export {};
