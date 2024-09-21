declare type SegmentDropdownType = Function & {
    segmentationId?: string;
    segmentIndex?: number;
    updateActiveSegmentIndex?: (segmentIndex: number) => void;
};
declare const addSegmentIndexDropdown: SegmentDropdownType;
export default addSegmentIndexDropdown;
