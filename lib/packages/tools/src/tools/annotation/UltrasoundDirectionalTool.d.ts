import type { Types } from '@cornerstonejs/core';
import { AnnotationTool } from '../base';
import { UltrasoundDirectionalAnnotation } from '../../types/ToolSpecificAnnotationTypes';
import { EventTypes, ToolHandle, PublicToolProps, ToolProps, SVGDrawingHelper, Annotation, InteractionTypes } from '../../types';
declare class UltrasoundDirectionalTool extends AnnotationTool {
    static toolName: any;
    touchDragCallback: any;
    mouseDragCallback: any;
    startedDrawing: boolean;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        movingTextBox?: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes.InteractionEventType) => UltrasoundDirectionalAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: UltrasoundDirectionalAnnotation, canvasCoords: Types.Point2, proximity: number) => boolean;
    toolSelectedCallback(evt: EventTypes.InteractionEventType, annotation: Annotation, interactionType: InteractionTypes, canvasCoords?: Types.Point2): void;
    handleSelectedCallback(evt: EventTypes.InteractionEventType, annotation: UltrasoundDirectionalAnnotation, handle: ToolHandle): void;
    _endCallback: (evt: EventTypes.InteractionEventType) => void;
    _dragCallback: (evt: EventTypes.InteractionEventType) => void;
    cancel: (element: HTMLDivElement) => any;
    _activateModify: (element: HTMLDivElement) => void;
    _deactivateModify: (element: HTMLDivElement) => void;
    _activateDraw: (element: HTMLDivElement) => void;
    _deactivateDraw: (element: HTMLDivElement) => void;
    renderAnnotation: (enabledElement: Types.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _calculateCachedStats(annotation: any, renderingEngine: any, enabledElement: any): any;
}
export default UltrasoundDirectionalTool;
