import type { Types } from '@cornerstonejs/core';
import { BaseTool } from '../base';
import { PublicToolProps, ToolProps, EventTypes, SVGDrawingHelper } from '../../types';
declare class SphereScissorsTool extends BaseTool {
    static toolName: any;
    editData: {
        annotation: any;
        segmentIndex: number;
        segmentsLocked: number[];
        segmentationRepresentationUID: string;
        volumeId: string;
        referencedVolumeId: string;
        imageIdReferenceMap: Map<string, string>;
        toolGroupId: string;
        segmentColor: [number, number, number, number];
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
        centerCanvas?: Array<number>;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    preMouseDownCallback: (evt: EventTypes.InteractionEventType) => true;
    _dragCallback: (evt: EventTypes.InteractionEventType) => void;
    _endCallback: (evt: EventTypes.InteractionEventType) => void;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    renderAnnotation: (enabledElement: Types.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
}
export default SphereScissorsTool;
