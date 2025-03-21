import type { Types } from '@cornerstonejs/core';
import * as Enums from '../enums';
import { ContourConfig, ContourRenderingConfig, ContourSegmentationData } from './ContourTypes';
import type { LabelmapConfig, LabelmapRenderingConfig, LabelmapSegmentationData } from './LabelmapTypes';
import { SurfaceSegmentationData, SurfaceRenderingConfig } from './SurfaceTypes';
export declare type SegmentSpecificRepresentationConfig = {
    [key: number | string]: RepresentationConfig;
};
export declare type RepresentationConfig = {
    LABELMAP?: LabelmapConfig;
    CONTOUR?: ContourConfig;
    SURFACE?: any;
};
export declare type SegmentationRepresentationConfig = {
    renderInactiveSegmentations: boolean;
    representations: RepresentationConfig;
};
export declare type SegmentationRepresentationData = {
    LABELMAP?: LabelmapSegmentationData;
    CONTOUR?: ContourSegmentationData;
    SURFACE?: SurfaceSegmentationData;
};
export declare type Segmentation = {
    segmentationId: string;
    type: Enums.SegmentationRepresentations;
    label: string;
    activeSegmentIndex: number;
    segmentsLocked: Set<number>;
    cachedStats: {
        [key: string]: number;
    };
    segmentLabels: {
        [key: string]: string;
    };
    representationData: SegmentationRepresentationData;
};
export declare type ToolGroupSpecificRepresentationState = {
    segmentationRepresentationUID: string;
    segmentationId: string;
    type: Enums.SegmentationRepresentations;
    active: boolean;
    segmentsHidden: Set<number>;
    colorLUTIndex: number;
    polySeg?: {
        enabled: boolean;
        options?: any;
    };
};
export declare type ToolGroupSpecificLabelmapRepresentation = ToolGroupSpecificRepresentationState & {
    config: LabelmapRenderingConfig;
    segmentationRepresentationSpecificConfig?: RepresentationConfig;
    segmentSpecificConfig?: SegmentSpecificRepresentationConfig;
};
export declare type ToolGroupSpecificContourRepresentation = ToolGroupSpecificRepresentationState & {
    config: ContourRenderingConfig;
    segmentationRepresentationSpecificConfig?: RepresentationConfig;
    segmentSpecificConfig?: SegmentSpecificRepresentationConfig;
};
export declare type ToolGroupSpecificSurfaceRepresentation = ToolGroupSpecificRepresentationState & {
    config: SurfaceRenderingConfig;
    segmentationRepresentationSpecificConfig?: RepresentationConfig;
    segmentSpecificConfig?: SegmentSpecificRepresentationConfig;
};
export declare type ToolGroupSpecificRepresentation = ToolGroupSpecificLabelmapRepresentation | ToolGroupSpecificContourRepresentation;
export declare type ToolGroupSpecificRepresentations = Array<ToolGroupSpecificRepresentation>;
export declare type SegmentationState = {
    colorLUT: Types.ColorLUT[];
    segmentations: Segmentation[];
    globalConfig: SegmentationRepresentationConfig;
    toolGroups: {
        [key: string]: {
            segmentationRepresentations: ToolGroupSpecificRepresentations;
            config: SegmentationRepresentationConfig;
        };
    };
};
export declare type SegmentationPublicInput = {
    segmentationId: string;
    representation: {
        type: Enums.SegmentationRepresentations;
        data?: LabelmapSegmentationData | ContourSegmentationData | SurfaceSegmentationData;
    };
};
export declare type RepresentationPublicInput = {
    segmentationId: string;
    type: Enums.SegmentationRepresentations;
    options?: RepresentationPublicInputOptions;
};
export declare type RepresentationPublicInputOptions = {
    segmentationRepresentationUID?: string;
    colorLUTOrIndex?: Types.ColorLUT | number;
    polySeg?: {
        enabled: boolean;
        options?: any;
    };
};
