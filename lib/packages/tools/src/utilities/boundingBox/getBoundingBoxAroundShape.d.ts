import type { Types } from '@cornerstonejs/core';
declare type BoundingBox = [Types.Point2, Types.Point2, null] | [Types.Point2, Types.Point2, Types.Point2];
export declare function getBoundingBoxAroundShapeIJK(points: Types.Point2[] | Types.Point3[], dimensions?: Types.Point2 | Types.Point3): BoundingBox;
export declare function getBoundingBoxAroundShapeWorld(points: Types.Point2[] | Types.Point3[], clipBounds?: Types.Point2 | Types.Point3): BoundingBox;
export {};
