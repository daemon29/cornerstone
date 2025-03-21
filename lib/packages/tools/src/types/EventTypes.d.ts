import { Types } from '@cornerstonejs/core';
import { Annotation } from './AnnotationTypes';
import IPoints from './IPoints';
import ITouchPoints from './ITouchPoints';
import IDistance from './IDistance';
import { SetToolBindingsType } from './ISetToolModeOptions';
import { Swipe } from '../enums/Touch';
import { ToolModes } from '../enums';
import { InterpolationROIAnnotation } from './ToolSpecificAnnotationTypes';
import { ChangeTypes } from '../enums';
declare type NormalizedInteractionEventDetail = {
    eventName: string;
    renderingEngineId: string;
    viewportId: string;
    camera: Record<string, unknown>;
    element: HTMLDivElement;
};
declare type MouseCustomEventDetail = NormalizedInteractionEventDetail & {
    event: Record<string, unknown> | MouseEvent;
};
declare type TouchCustomEventDetail = NormalizedInteractionEventDetail & {
    event: Record<string, unknown> | TouchEvent;
};
declare type MousePointsDetail = {
    startPoints: IPoints;
    lastPoints: IPoints;
    currentPoints: IPoints;
    deltaPoints: IPoints;
};
declare type TouchPointsDetail = {
    startPoints: ITouchPoints;
    lastPoints: ITouchPoints;
    currentPoints: ITouchPoints;
    startPointsList: ITouchPoints[];
    lastPointsList: ITouchPoints[];
    currentPointsList: ITouchPoints[];
    deltaPoints: IPoints;
    deltaDistance: IDistance;
};
declare type InteractionEventDetail = NormalizedInteractionEventDetail & (MouseCustomEventDetail | TouchCustomEventDetail) & (MousePointsDetail | TouchPointsDetail);
declare type InteractionStartEventDetail = InteractionEventDetail;
declare type InteractionEndEventDetail = InteractionEventDetail;
declare type ToolModeChangedEventDetail = {
    toolGroupId: string;
    toolName: string;
    mode: ToolModes;
    toolBindingsOptions?: SetToolBindingsType;
};
declare type ToolActivatedEventDetail = {
    toolGroupId: string;
    toolName: string;
    toolBindingsOptions: SetToolBindingsType;
};
declare type AnnotationAddedEventDetail = {
    viewportId?: string;
    renderingEngineId?: string;
    annotation: Annotation;
};
declare type AnnotationCompletedEventDetail = {
    annotation: Annotation;
    changeType?: ChangeTypes.Completed;
};
declare type AnnotationModifiedEventDetail = {
    viewportId: string;
    renderingEngineId: string;
    annotation: Annotation;
    changeType?: ChangeTypes;
};
declare type AnnotationRemovedEventDetail = {
    annotation: Annotation;
    annotationManagerUID: string;
};
declare type AnnotationSelectionChangeEventDetail = {
    added: Array<string>;
    removed: Array<string>;
    selection: Array<string>;
};
declare type AnnotationLockChangeEventDetail = {
    added: Array<Annotation>;
    removed: Array<Annotation>;
    locked: Array<Annotation>;
};
declare type AnnotationVisibilityChangeEventDetail = {
    lastHidden: Array<string>;
    lastVisible: Array<string>;
    hidden: Array<string>;
};
declare type AnnotationRenderedEventDetail = {
    element: HTMLDivElement;
    viewportId: string;
    renderingEngineId: string;
};
declare type AnnotationInterpolationCompletedEventDetail = {
    annotation: InterpolationROIAnnotation;
    element: HTMLDivElement;
    viewportId: string;
    renderingEngineId: string;
};
declare type AnnotationInterpolationRemovedEventDetail = {
    annotations: Array<InterpolationROIAnnotation>;
    element: HTMLDivElement;
    viewportId: string;
    renderingEngineId: string;
};
declare type ContourAnnotationCompletedEventDetail = AnnotationCompletedEventDetail & {
    contourHoleProcessingEnabled: boolean;
};
declare type SegmentationDataModifiedEventDetail = {
    segmentationId: string;
    modifiedSlicesToUse?: number[];
};
declare type SegmentationRenderedEventDetail = {
    viewportId: string;
    toolGroupId: string;
};
declare type SegmentationRepresentationModifiedEventDetail = {
    toolGroupId: string;
    segmentationRepresentationUID: string;
};
declare type SegmentationRemovedEventDetail = {
    segmentationId: string;
};
declare type SegmentationRepresentationRemovedEventDetail = {
    toolGroupId: string;
    segmentationRepresentationUID: string;
};
declare type SegmentationModifiedEventDetail = {
    segmentationId: string;
};
declare type KeyDownEventDetail = {
    element: HTMLDivElement;
    viewportId: string;
    renderingEngineId: string;
    key: string;
    keyCode: number;
};
declare type KeyUpEventDetail = KeyDownEventDetail;
declare type MouseDownEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail & {
    mouseButton: number;
};
declare type TouchStartEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & TouchPointsDetail;
declare type MouseDragEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail & {
    mouseButton: number;
};
declare type TouchDragEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & TouchPointsDetail;
declare type MouseMoveEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & {
    currentPoints: IPoints;
};
declare type MouseUpEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail & {
    mouseButton: number;
};
declare type TouchEndEventDetail = NormalizedInteractionEventDetail & TouchPointsDetail & TouchCustomEventDetail;
declare type MouseDownActivateEventDetail = NormalizedInteractionEventDetail & MousePointsDetail & MouseCustomEventDetail & {
    mouseButton: number;
};
declare type TouchStartActivateEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & TouchPointsDetail;
declare type MouseClickEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail & {
    mouseButton: number;
};
declare type MouseDoubleClickEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & MousePointsDetail;
declare type TouchTapEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & {
    currentPointsList: ITouchPoints[];
    currentPoints: ITouchPoints;
    taps: number;
};
declare type TouchSwipeEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & {
    swipe: Swipe;
};
declare type TouchPressEventDetail = NormalizedInteractionEventDetail & TouchCustomEventDetail & {
    startPointsList: ITouchPoints[];
    lastPointsList: ITouchPoints[];
    startPoints: ITouchPoints;
    lastPoints: ITouchPoints;
};
declare type MouseWheelEventDetail = NormalizedInteractionEventDetail & MouseCustomEventDetail & {
    detail: Record<string, any>;
    wheel: {
        spinX: number;
        spinY: number;
        pixelX: number;
        pixelY: number;
        direction: number;
    };
    points: IPoints;
};
declare type VolumeScrollOutOfBoundsEventDetail = {
    volumeId: string;
    viewport: Types.IVolumeViewport;
    desiredStepIndex: number;
    currentStepIndex: number;
    delta: number;
    numScrollSteps: number;
    currentImageId: string;
};
declare type NormalizedMouseEventType = Types.CustomEventType<MouseCustomEventDetail>;
declare type NormalizedTouchEventType = Types.CustomEventType<TouchCustomEventDetail>;
declare type ToolModeChangedEventType = Types.CustomEventType<ToolModeChangedEventDetail>;
declare type ToolActivatedEventType = Types.CustomEventType<ToolActivatedEventDetail>;
declare type AnnotationAddedEventType = Types.CustomEventType<AnnotationAddedEventDetail>;
declare type AnnotationCompletedEventType = Types.CustomEventType<AnnotationCompletedEventDetail>;
declare type AnnotationModifiedEventType = Types.CustomEventType<AnnotationModifiedEventDetail>;
declare type AnnotationRemovedEventType = Types.CustomEventType<AnnotationRemovedEventDetail>;
declare type AnnotationSelectionChangeEventType = Types.CustomEventType<AnnotationSelectionChangeEventDetail>;
declare type AnnotationRenderedEventType = Types.CustomEventType<AnnotationRenderedEventDetail>;
declare type AnnotationLockChangeEventType = Types.CustomEventType<AnnotationLockChangeEventDetail>;
declare type AnnotationVisibilityChangeEventType = Types.CustomEventType<AnnotationVisibilityChangeEventDetail>;
declare type AnnotationInterpolationCompletedEventType = Types.CustomEventType<AnnotationInterpolationCompletedEventDetail>;
declare type AnnotationInterpolationRemovedEventType = Types.CustomEventType<AnnotationInterpolationRemovedEventDetail>;
declare type SegmentationDataModifiedEventType = Types.CustomEventType<SegmentationDataModifiedEventDetail>;
declare type SegmentationRepresentationModifiedEventType = Types.CustomEventType<SegmentationRepresentationModifiedEventDetail>;
declare type SegmentationRemovedEventType = Types.CustomEventType<SegmentationRemovedEventDetail>;
declare type SegmentationRepresentationRemovedEventType = Types.CustomEventType<SegmentationRepresentationRemovedEventDetail>;
declare type SegmentationRenderedEventType = Types.CustomEventType<SegmentationRenderedEventDetail>;
declare type SegmentationModifiedEventType = Types.CustomEventType<SegmentationModifiedEventDetail>;
declare type KeyDownEventType = Types.CustomEventType<KeyDownEventDetail>;
declare type KeyUpEventType = Types.CustomEventType<KeyUpEventDetail>;
declare type MouseDownEventType = Types.CustomEventType<MouseDownEventDetail>;
declare type TouchTapEventType = Types.CustomEventType<TouchTapEventDetail>;
declare type TouchSwipeEventType = Types.CustomEventType<TouchSwipeEventDetail>;
declare type TouchPressEventType = Types.CustomEventType<TouchPressEventDetail>;
declare type TouchStartEventType = Types.CustomEventType<TouchStartEventDetail>;
declare type InteractionEventType = Types.CustomEventType<InteractionEventDetail>;
declare type InteractionStartType = Types.CustomEventType<InteractionStartEventDetail>;
declare type InteractionEndType = Types.CustomEventType<InteractionEndEventDetail>;
declare type MouseDownActivateEventType = Types.CustomEventType<MouseDownActivateEventDetail>;
declare type TouchStartActivateEventType = Types.CustomEventType<TouchStartActivateEventDetail>;
declare type MouseDragEventType = Types.CustomEventType<MouseDragEventDetail>;
declare type TouchDragEventType = Types.CustomEventType<TouchDragEventDetail>;
declare type MouseUpEventType = Types.CustomEventType<MouseUpEventDetail>;
declare type TouchEndEventType = Types.CustomEventType<TouchEndEventDetail>;
declare type MouseClickEventType = Types.CustomEventType<MouseClickEventDetail>;
declare type MouseMoveEventType = Types.CustomEventType<MouseMoveEventDetail>;
declare type MouseDoubleClickEventType = Types.CustomEventType<MouseDoubleClickEventDetail>;
declare type MouseWheelEventType = Types.CustomEventType<MouseWheelEventDetail>;
declare type VolumeScrollOutOfBoundsEventType = Types.CustomEventType<VolumeScrollOutOfBoundsEventDetail>;
export { InteractionStartType, InteractionEndType, InteractionEventType, NormalizedInteractionEventDetail, NormalizedMouseEventType, NormalizedTouchEventType, ToolModeChangedEventDetail, ToolModeChangedEventType, ToolActivatedEventDetail, ToolActivatedEventType, AnnotationAddedEventDetail, AnnotationAddedEventType, AnnotationCompletedEventDetail, AnnotationCompletedEventType, AnnotationModifiedEventDetail, AnnotationModifiedEventType, AnnotationRemovedEventDetail, AnnotationRemovedEventType, AnnotationSelectionChangeEventDetail, AnnotationSelectionChangeEventType, AnnotationRenderedEventDetail, AnnotationRenderedEventType, AnnotationLockChangeEventDetail, AnnotationVisibilityChangeEventDetail, AnnotationLockChangeEventType, AnnotationVisibilityChangeEventType, AnnotationInterpolationCompletedEventDetail, AnnotationInterpolationCompletedEventType, AnnotationInterpolationRemovedEventDetail, AnnotationInterpolationRemovedEventType, ContourAnnotationCompletedEventDetail, SegmentationDataModifiedEventType, SegmentationRepresentationModifiedEventDetail, SegmentationRepresentationModifiedEventType, SegmentationRepresentationRemovedEventDetail, SegmentationRepresentationRemovedEventType, SegmentationRemovedEventType, SegmentationRemovedEventDetail, SegmentationDataModifiedEventDetail, SegmentationRenderedEventType, SegmentationRenderedEventDetail, SegmentationModifiedEventType, SegmentationModifiedEventDetail, KeyDownEventDetail, KeyDownEventType, KeyUpEventDetail, KeyUpEventType, MouseDownEventDetail, TouchStartEventDetail, MouseDownEventType, TouchStartEventType, MouseDownActivateEventDetail, TouchStartActivateEventDetail, MouseDownActivateEventType, TouchStartActivateEventType, MouseDragEventDetail, TouchDragEventDetail, MouseDragEventType, TouchDragEventType, MouseUpEventDetail, TouchEndEventDetail, MouseUpEventType, TouchEndEventType, MouseClickEventDetail, MouseClickEventType, TouchTapEventDetail, TouchTapEventType, TouchSwipeEventDetail, TouchSwipeEventType, TouchPressEventDetail, TouchPressEventType, MouseMoveEventDetail, MouseMoveEventType, MouseDoubleClickEventDetail, MouseDoubleClickEventType, MouseWheelEventDetail, MouseWheelEventType, VolumeScrollOutOfBoundsEventDetail, VolumeScrollOutOfBoundsEventType, };
