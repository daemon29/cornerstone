import { AnnotationTool } from '../base';
import type { Types } from '@cornerstonejs/core';
import { EventTypes, ToolHandle, PublicToolProps, ToolProps, SVGDrawingHelper } from '../../types';
import { EllipticalROIAnnotation } from '../../types/ToolSpecificAnnotationTypes';
declare class EllipticalROITool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: Array<string>;
        handleIndex?: number;
        movingTextBox?: boolean;
        centerWorld?: Array<number>;
        canvasWidth?: number;
        canvasHeight?: number;
        originalHandleCanvas?: Array<number>;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes.InteractionEventType) => EllipticalROIAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: EllipticalROIAnnotation, canvasCoords: Types.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes.InteractionEventType, annotation: EllipticalROIAnnotation) => void;
    handleSelectedCallback: (evt: EventTypes.InteractionEventType, annotation: EllipticalROIAnnotation, handle: ToolHandle) => void;
    _endCallback: (evt: EventTypes.InteractionEventType) => void;
    _dragDrawCallback: (evt: EventTypes.InteractionEventType) => void;
    _dragModifyCallback: (evt: EventTypes.InteractionEventType) => void;
    _dragHandle: (evt: EventTypes.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: any) => void;
    _deactivateModify: (element: any) => void;
    _activateDraw: (element: any) => void;
    _deactivateDraw: (element: any) => void;
    renderAnnotation: (enabledElement: Types.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateCachedStats: (annotation: any, viewport: any, renderingEngine: any) => any;
    _isInsideVolume: (index1: any, index2: any, dimensions: any) => boolean;
    _pointInEllipseCanvas(ellipse: any, location: Types.Point2): boolean;
    _getCanvasEllipseCenter(ellipseCanvasPoints: Types.Point2[]): Types.Point2;
}
export default EllipticalROITool;
