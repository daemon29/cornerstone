import type { Types } from '@cornerstonejs/core';
import { ChangeTypes } from '../../enums';
import type { Annotation, EventTypes, ToolHandle, PublicToolProps, ToolProps, AnnotationRenderContext } from '../../types';
import type { SplineROIAnnotation } from '../../types/ToolSpecificAnnotationTypes';
import ContourSegmentationBaseTool from '../base/ContourSegmentationBaseTool';
declare enum SplineTypesEnum {
    Cardinal = "CARDINAL",
    Linear = "LINEAR",
    CatmullRom = "CATMULLROM",
    BSpline = "BSPLINE"
}
declare enum SplineToolActions {
    AddControlPoint = "addControlPoint",
    DeleteControlPoint = "deleteControlPoint"
}
declare class SplineROITool extends ContourSegmentationBaseTool {
    static toolName: any;
    static SplineTypes: typeof SplineTypesEnum;
    static Actions: typeof SplineToolActions;
    touchDragCallback: any;
    mouseDragCallback: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: SplineROIAnnotation;
        viewportIdsToRender: Array<string>;
        handleIndex?: number;
        movingTextBox?: boolean;
        newAnnotation?: boolean;
        hasMoved?: boolean;
        lastCanvasPoint?: Types.Point2;
        contourHoleProcessingEnabled?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    fireChangeOnUpdate: {
        annotationUID: string;
        changeType: ChangeTypes;
        contourHoleProcessingEnabled: boolean;
    };
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation(evt: EventTypes.InteractionEventType): SplineROIAnnotation;
    isPointNearTool: (element: HTMLDivElement, annotation: SplineROIAnnotation, canvasCoords: Types.Point2, proximity: number) => boolean;
    toolSelectedCallback: (evt: EventTypes.InteractionEventType, annotation: SplineROIAnnotation) => void;
    handleSelectedCallback: (evt: EventTypes.InteractionEventType, annotation: SplineROIAnnotation, handle: ToolHandle) => void;
    _endCallback: (evt: EventTypes.InteractionEventType) => void;
    private _keyDownCallback;
    private _mouseMoveCallback;
    private _mouseDownCallback;
    private _dragCallback;
    cancel(element: HTMLDivElement): string;
    triggerAnnotationCompleted: (annotation: SplineROIAnnotation, contourHoleProcessingEnabled: boolean) => void;
    triggerAnnotationModified: (annotation: SplineROIAnnotation, enabledElement: Types.IEnabledElement, changeType?: ChangeTypes) => void;
    triggerChangeEvent: (annotation: SplineROIAnnotation, enabledElement: Types.IEnabledElement, changeType: ChangeTypes, contourHoleProcessingEnabled: any) => void;
    private _activateModify;
    private _deactivateModify;
    private _activateDraw;
    private _deactivateDraw;
    protected isContourSegmentationTool(): boolean;
    protected renderAnnotationInstance(renderContext: AnnotationRenderContext): boolean;
    protected createInterpolatedSplineControl(annotation: any): void;
    protected createAnnotation(evt: EventTypes.InteractionEventType): Annotation;
    private _renderStats;
    addControlPointCallback: (evt: EventTypes.InteractionEventType, annotation: SplineROIAnnotation) => void;
    private _deleteControlPointByIndex;
    deleteControlPointCallback: (evt: EventTypes.InteractionEventType, annotation: SplineROIAnnotation) => void;
    _isSplineROIAnnotation(annotation: Annotation): annotation is SplineROIAnnotation;
    private _getSplineConfig;
    private _updateSplineInstance;
    private _calculateCachedStats;
}
export default SplineROITool;
