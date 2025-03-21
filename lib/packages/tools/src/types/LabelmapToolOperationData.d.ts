import type { Types } from '@cornerstonejs/core';
import { LabelmapSegmentationDataStack, LabelmapSegmentationDataVolume } from './LabelmapTypes';
declare type LabelmapToolOperationData = {
    segmentationId: string;
    segmentIndex: number;
    previewColors?: Record<number, [number, number, number, number]>;
    segmentsLocked: number[];
    viewPlaneNormal: number[];
    viewUp: number[];
    strategySpecificConfiguration: any;
    segmentationRepresentationUID: string;
    points: Types.Point3[];
    preview: any;
    toolGroupId: string;
};
declare type LabelmapToolOperationDataStack = LabelmapToolOperationData & LabelmapSegmentationDataStack;
declare type LabelmapToolOperationDataVolume = LabelmapToolOperationData & LabelmapSegmentationDataVolume;
declare type LabelmapToolOperationDataAny = LabelmapToolOperationDataVolume | LabelmapToolOperationDataStack;
export { LabelmapToolOperationData, LabelmapToolOperationDataAny, LabelmapToolOperationDataStack, LabelmapToolOperationDataVolume, };
