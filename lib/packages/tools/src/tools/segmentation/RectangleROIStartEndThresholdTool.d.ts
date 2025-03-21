import { Types } from '@cornerstonejs/core';
import { vec3 } from 'gl-matrix';
import { PublicToolProps, ToolProps, EventTypes, SVGDrawingHelper } from '../../types';
import { RectangleROIStartEndThresholdAnnotation } from '../../types/ToolSpecificAnnotationTypes';
import RectangleROITool from '../annotation/RectangleROITool';
declare class RectangleROIStartEndThresholdTool extends RectangleROITool {
    static toolName: any;
    _throttledCalculateCachedStats: any;
    editData: {
        annotation: any;
        viewportIdsToRender: string[];
        handleIndex?: number;
        newAnnotation?: boolean;
        hasMoved?: boolean;
    } | null;
    isDrawing: boolean;
    isHandleOutsideImage: boolean;
    constructor(toolProps?: PublicToolProps, defaultToolProps?: ToolProps);
    addNewAnnotation: (evt: EventTypes.InteractionEventType) => {
        highlighted: boolean;
        invalidated: boolean;
        metadata: {
            viewPlaneNormal: Types.Point3;
            enabledElement: Types.IEnabledElement;
            viewUp: Types.Point3;
            FrameOfReferenceUID: string;
            referencedImageId: any;
            toolName: string;
            volumeId: any;
            spacingInNormal: number;
        };
        data: {
            label: string;
            startCoordinate: number;
            endCoordinate: number;
            cachedStats: {
                pointsInVolume: any[];
                projectionPoints: any[];
                projectionPointsImageIds: any[];
                statistics: any[];
            };
            handles: {
                textBox: {
                    hasMoved: boolean;
                    worldPosition: Types.Point3;
                    worldBoundingBox: {
                        topLeft: Types.Point3;
                        topRight: Types.Point3;
                        bottomLeft: Types.Point3;
                        bottomRight: Types.Point3;
                    };
                };
                points: Types.Point3[];
                activeHandleIndex: any;
            };
            labelmapUID: any;
        };
    };
    _endCallback: (evt: EventTypes.InteractionEventType) => void;
    _computeProjectionPoints(annotation: RectangleROIStartEndThresholdAnnotation, imageVolume: Types.IImageVolume): void;
    _computePointsInsideVolume(annotation: any, targetId: any, imageVolume: any, enabledElement: any): void;
    _calculateCachedStatsTool(annotation: any, enabledElement: any): any;
    renderAnnotation: (enabledElement: Types.IEnabledElement, svgDrawingHelper: SVGDrawingHelper) => boolean;
    _getStartCoordinate(worldPos: Types.Point3, viewPlaneNormal: Types.Point3): number | undefined;
    _getEndCoordinate(worldPos: Types.Point3, spacingInNormal: number, viewPlaneNormal: Types.Point3): number | undefined;
    _getIndexOfCoordinatesForViewplaneNormal(viewPlaneNormal: Types.Point3): number;
    _getCoordinateForViewplaneNormal(pos: vec3 | number, viewPlaneNormal: Types.Point3): number | undefined;
}
export default RectangleROIStartEndThresholdTool;
