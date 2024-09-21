import { Enums } from '@cornerstonejs/tools';
/**
 * This is a shared version of the tool bindings used for segmentation contours,
 * until the final primary only binding can be completed.
 * TODO - delete this helper in favour of bindings on tools themselves.
 */
declare const contourSegmentationToolBindings: ({
    mouseButton: Enums.MouseBindings;
    modifierKey?: undefined;
} | {
    mouseButton: Enums.MouseBindings;
    modifierKey: Enums.KeyboardBindings;
})[];
export default contourSegmentationToolBindings;
