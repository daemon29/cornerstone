import type { Types } from '@cornerstonejs/core';
declare function addColorLUT(colorLUT: Types.ColorLUT, colorLUTIndex: number): void;
declare function setColorLUT(toolGroupId: string, segmentationRepresentationUID: string, colorLUTIndex: number): void;
declare function getColorForSegmentIndex(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number): Types.Color;
declare function setColorForSegmentIndex(toolGroupId: string, segmentationRepresentationUID: string, segmentIndex: number, color: Types.Color): void;
export { getColorForSegmentIndex, addColorLUT, setColorLUT, setColorForSegmentIndex, };
