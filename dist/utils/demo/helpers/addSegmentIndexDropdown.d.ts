declare type SegmentDropdownType = Function & {
    /** The segmentationId to apply to */
    segmentationId?: string;
    /** The segment index currently being used */
    segmentIndex?: number;
    /** A function to update the active segment index */
    updateActiveSegmentIndex?: (segmentIndex: number) => void;
};
/**
 * Ceate a segment index selector dropdown
 *
 */
declare const addSegmentIndexDropdown: SegmentDropdownType;
export default addSegmentIndexDropdown;
