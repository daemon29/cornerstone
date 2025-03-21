import { Types } from '@cornerstonejs/core';
import { Spline } from './Spline';
import type { SplineCurveSegment } from '../../../types';
declare abstract class CubicSpline extends Spline {
    protected getPreviewCurveSegments(controlPointPreview: Types.Point2, closeSpline: boolean): SplineCurveSegment[];
    protected getSplineCurves(): SplineCurveSegment[];
    private _getNumCurveSegments;
    private _getPoint;
    private _getCurveSegmentPoints;
    private _getLineSegments;
    private _getCurveSegment;
}
export { CubicSpline as default, CubicSpline };
