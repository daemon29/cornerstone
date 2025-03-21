import { Types } from '@cornerstonejs/core';
import type { SplineLineSegment } from './SplineLineSegment';
export declare type SplineCurveSegment = {
    controlPoints: {
        p0: Types.Point2;
        p1: Types.Point2;
        p2: Types.Point2;
        p3: Types.Point2;
    };
    aabb: Types.AABB2;
    length: number;
    previousCurveSegmentsLength: number;
    lineSegments: SplineLineSegment[];
};
