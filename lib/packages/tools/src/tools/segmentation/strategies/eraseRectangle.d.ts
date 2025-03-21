import type { Types } from '@cornerstonejs/core';
import { LabelmapToolOperationData } from '../../../types';
declare type OperationData = LabelmapToolOperationData & {
    points: [Types.Point3, Types.Point3, Types.Point3, Types.Point3];
};
export declare function eraseInsideRectangle(enabledElement: Types.IEnabledElement, operationData: OperationData): void;
export declare function eraseOutsideRectangle(enabledElement: Types.IEnabledElement, operationData: OperationData): void;
export {};
