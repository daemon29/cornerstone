import type { Types } from '@cornerstonejs/tools';
export declare type ToolBinding = {
    tool?: any;
    baseTool?: string;
    configuration?: Record<string, any>;
    passive?: boolean;
    bindings?: Types.IToolBinding[];
};
/**
 * Adds navigation bindings to the given tool group.  Registers the basic
 * tool with CS Tools if register is true.
 *
 * Adds:
 * * Pan on Right or Primary+Ctrl
 * * Zoom on Middle, Primary+Shift
 * * Stack Scroll on Mouse Wheel, Primary+Alt
 * * Length Tool on fourth button
 *
 * Also allows registering other tools by having them in the options.toolMap with configuration values.
 */
export default function addManipulationBindings(toolGroup: any, options?: {
    enableShiftClickZoom?: boolean;
    is3DViewport?: boolean;
    toolMap?: Map<string, ToolBinding>;
}): void;
