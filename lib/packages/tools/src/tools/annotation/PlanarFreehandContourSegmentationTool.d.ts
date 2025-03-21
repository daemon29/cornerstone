import type { PublicToolProps } from '../../types';
import type { AnnotationRenderContext } from '../../types';
import PlanarFreehandROITool from './PlanarFreehandROITool';
declare class PlanarFreehandContourSegmentationTool extends PlanarFreehandROITool {
    static toolName: any;
    constructor(toolProps: PublicToolProps);
    protected isContourSegmentationTool(): boolean;
    protected renderAnnotationInstance(renderContext: AnnotationRenderContext): boolean;
}
export default PlanarFreehandContourSegmentationTool;
