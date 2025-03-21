import { ToolGroupSpecificRepresentation } from '../../types/SegmentationStateTypes';
declare function getActiveSegmentationRepresentation(toolGroupId: string): ToolGroupSpecificRepresentation;
declare function getActiveSegmentation(toolGroupId: string): import("../../types/SegmentationStateTypes").Segmentation;
declare function setActiveSegmentationRepresentation(toolGroupId: string, segmentationRepresentationUID: string): void;
export { getActiveSegmentationRepresentation, getActiveSegmentation, setActiveSegmentationRepresentation, };
