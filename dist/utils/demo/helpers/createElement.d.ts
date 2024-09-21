export declare type configElement = {
    merge?: object;
    tag?: string;
    class?: string;
    attr?: Record<string, any>;
    style?: Record<string, any>;
    html?: string;
    event?: Record<string, any>;
    container?: HTMLElement;
};
export default function createElement(config: configElement): HTMLElement;
