import type { InterpolationViewportData, Annotation } from '../../../types';
export declare type ContourPair = [number, number];
declare function findAnnotationsForInterpolation(toolData: any, viewportData: InterpolationViewportData): {
    interpolationData: Map<number, Annotation[]>;
    interpolationList: any[];
};
export default findAnnotationsForInterpolation;
