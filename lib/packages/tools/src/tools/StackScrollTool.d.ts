import { BaseTool } from './base';
import { PublicToolProps, ToolProps, EventTypes } from '../types';
declare class StackScrollTool extends BaseTool {
    static toolName: any;
    deltaY: number;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    mouseDragCallback(evt: EventTypes.InteractionEventType): void;
    touchDragCallback(evt: EventTypes.InteractionEventType): void;
    _dragCallback(evt: EventTypes.InteractionEventType): void;
    _getPixelPerImage(viewport: any): number;
}
export default StackScrollTool;
