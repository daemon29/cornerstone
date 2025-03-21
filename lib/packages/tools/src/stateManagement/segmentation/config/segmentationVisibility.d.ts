declare function setSegmentationVisibility(toolGroupId: string, segmentationRepresentationUID: string, visibility: boolean): void;
declare function getSegmentationVisibility(toolGroupId: string, segmentationRepresentationUID: string): boolean | undefined;
declare function setSegmentsVisibility(toolGroupId: string, segmentationRepresentationUID: string, segmentIndices: number[], visibility: boolean): void;
declare function setSegmentVisibility(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number, visibility: boolean): void;
declare function getSegmentVisibility(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number): boolean;
export { setSegmentationVisibility, getSegmentationVisibility, setSegmentVisibility, setSegmentsVisibility, getSegmentVisibility, };
