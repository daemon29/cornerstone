import { ContourSegmentationData, PolySegConversionOptions } from '../../../../types';
export declare function convertContourToVolumeLabelmap(contourRepresentationData: ContourSegmentationData, options?: PolySegConversionOptions): Promise<{
    volumeId: string;
}>;
export declare function convertContourToStackLabelmap(contourRepresentationData: ContourSegmentationData, options?: PolySegConversionOptions): Promise<{
    imageIdReferenceMap: Map<any, any>;
}>;
