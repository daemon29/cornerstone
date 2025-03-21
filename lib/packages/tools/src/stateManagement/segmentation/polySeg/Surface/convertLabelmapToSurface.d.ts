import { Types } from '@cornerstonejs/core';
import { LabelmapSegmentationData } from '../../../../types/LabelmapTypes';
export declare function convertLabelmapToSurface(labelmapRepresentationData: LabelmapSegmentationData, segmentIndex: number, isVolume?: boolean): Promise<Types.SurfaceData>;
