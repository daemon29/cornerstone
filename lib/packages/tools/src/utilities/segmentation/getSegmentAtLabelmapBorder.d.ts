import type { Types } from '@cornerstonejs/core';
declare type Options = {
    viewport?: Types.IViewport;
    searchRadius?: number;
};
export declare function getSegmentAtLabelmapBorder(segmentationId: string, worldPoint: Types.Point3, { viewport, searchRadius }: Options): number;
export {};
