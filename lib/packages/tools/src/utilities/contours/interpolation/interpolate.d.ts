import type { Types } from '@cornerstonejs/core';
import type { InterpolationViewportData } from '../../../types/InterpolationTypes';
export declare type PointsXYZI = Types.PointsXYZ & {
    I?: boolean[];
    kIndex?: number;
};
export declare type PointsArray3 = Types.PointsManager<Types.Point3> & {
    I?: boolean[];
};
declare function interpolate(viewportData: InterpolationViewportData): void;
export default interpolate;
