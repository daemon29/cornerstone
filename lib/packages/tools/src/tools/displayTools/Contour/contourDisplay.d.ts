import { StackViewport, Types } from '@cornerstonejs/core';
import { SegmentationRepresentationConfig, ToolGroupSpecificRepresentation } from '../../../types/SegmentationStateTypes';
declare function removeSegmentationRepresentation(toolGroupId: string, segmentationRepresentationUID: string, renderImmediate?: boolean): void;
declare function render(viewport: StackViewport | Types.IVolumeViewport, representationConfig: ToolGroupSpecificRepresentation, toolGroupConfig: SegmentationRepresentationConfig): Promise<void>;
declare const _default: {
    render: typeof render;
    removeSegmentationRepresentation: typeof removeSegmentationRepresentation;
};
export default _default;
