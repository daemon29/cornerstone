import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import { Types } from '@cornerstonejs/core';
import { SegmentationRepresentationConfig, ToolGroupSpecificRepresentation } from '../../../types/SegmentationStateTypes';
declare function getRepresentationRenderingConfig(): {
    ofun: vtkPiecewiseFunction;
    cfun: vtkColorTransferFunction;
};
declare function removeSegmentationRepresentation(toolGroupId: string, segmentationRepresentationUID: string, renderImmediate?: boolean): void;
declare function render(viewport: Types.IVolumeViewport | Types.IStackViewport, representation: ToolGroupSpecificRepresentation, toolGroupConfig: SegmentationRepresentationConfig): Promise<void>;
declare const _default: {
    getRepresentationRenderingConfig: typeof getRepresentationRenderingConfig;
    render: typeof render;
    removeSegmentationRepresentation: typeof removeSegmentationRepresentation;
};
export default _default;
export { getRepresentationRenderingConfig, render, removeSegmentationRepresentation, };
