import { Types } from '@cornerstonejs/core';
declare type FloodFillResult = {
    flooded: Types.Point2[] | Types.Point3[];
    boundaries: Types.Point2[] | Types.Point3[];
};
declare type FloodFillGetter3D = (x: number, y: number, z: number) => unknown;
declare type FloodFillGetter2D = (x: number, y: number) => unknown;
declare type FloodFillGetter = FloodFillGetter2D | FloodFillGetter3D;
declare type FloodFillOptions = {
    onFlood?: (x: number, y: number, z?: number) => void;
    onBoundary?: (x: number, y: number, z?: number) => void;
    equals?: (a: any, b: any) => boolean;
    diagonals?: boolean;
};
export { FloodFillResult, FloodFillGetter, FloodFillOptions };
