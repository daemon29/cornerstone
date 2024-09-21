import type { Types } from '@cornerstonejs/tools';
export declare type ToolBinding = {
    tool?: any;
    baseTool?: string;
    configuration?: Record<string, any>;
    passive?: boolean;
    bindings?: Types.IToolBinding[];
};
export default function addManipulationBindings(toolGroup: any, options?: {
    enableShiftClickZoom?: boolean;
    is3DViewport?: boolean;
    toolMap?: Map<string, ToolBinding>;
}): void;
