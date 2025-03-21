import { LabelmapSegmentationDataStack, LabelmapSegmentationDataVolume } from '../../../../types/LabelmapTypes';
import { PolySegConversionOptions } from '../../../../types';
export declare type RawLabelmapData = LabelmapSegmentationDataVolume | LabelmapSegmentationDataStack;
export declare function computeLabelmapData(segmentationId: string, options?: PolySegConversionOptions): Promise<RawLabelmapData>;
declare function computeLabelmapFromContourSegmentation(segmentationId: any, options?: PolySegConversionOptions): Promise<LabelmapSegmentationDataVolume | LabelmapSegmentationDataStack>;
export { computeLabelmapFromContourSegmentation };
