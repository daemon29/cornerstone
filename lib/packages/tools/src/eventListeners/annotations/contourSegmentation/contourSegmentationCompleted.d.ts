import { Types } from '@cornerstonejs/core';
import { ContourSegmentationAnnotation } from '../../../types/ContourSegmentationAnnotation';
import { AnnotationCompletedEventType } from '../../../types/EventTypes';
export default function contourSegmentationCompletedListener(evt: AnnotationCompletedEventType): Promise<void>;
export declare function createPolylineHole(viewport: Types.IViewport, targetAnnotation: ContourSegmentationAnnotation, holeAnnotation: ContourSegmentationAnnotation): void;
