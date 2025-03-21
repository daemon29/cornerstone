import { BaseTool } from './base';
import { MouseWheelEventType } from '../types/EventTypes';
declare class StackScrollMouseWheelTool extends BaseTool {
    static toolName: any;
    _configuration: any;
    constructor(toolProps?: {}, defaultToolProps?: {
        supportedInteractionTypes: string[];
        configuration: {
            invert: boolean;
            debounceIfNotLoaded: boolean;
            loop: boolean;
            scrollSlabs: boolean;
        };
    });
    mouseWheelCallback(evt: MouseWheelEventType): void;
}
export default StackScrollMouseWheelTool;
