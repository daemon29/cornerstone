import type { Types } from '@cornerstonejs/core';
import { ContourAnnotation } from './ContourAnnotation';
export declare type ContourSegmentationAnnotationData = {
    autoGenerated?: boolean;
    interpolationUID?: string;
    interpolationCompleted?: boolean;
    data: {
        segmentation: {
            segmentationId: string;
            segmentIndex: number;
        };
        contour: {
            originalPolyline?: Types.Point3[];
        };
    };
    metadata?: {
        originalToolName?: string;
    };
    handles?: {
        interpolationSources?: Types.PointsManager<Types.Point3>[];
    };
    onInterpolationComplete?: (annotation: ContourSegmentationAnnotation) => unknown;
};
export declare type ContourSegmentationAnnotation = ContourAnnotation & ContourSegmentationAnnotationData;
