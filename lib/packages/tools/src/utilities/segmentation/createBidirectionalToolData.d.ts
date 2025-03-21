import type { Types } from '@cornerstonejs/core';
import type { Annotation } from '../../types/AnnotationTypes';
export declare type BidirectionalData = {
    majorAxis: [Types.Point3, Types.Point3];
    minorAxis: [Types.Point3, Types.Point3];
    maxMajor: number;
    maxMinor: number;
    segmentIndex: number;
    label?: string;
    color?: string | number[];
    referencedImageId: string;
    sliceIndex: number;
};
export default function createBidirectionalToolData(bidirectionalData: BidirectionalData, viewport: any): Annotation;
