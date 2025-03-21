import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import type { Types } from '@cornerstonejs/core';
export declare function getPoint(points: any, idx: any): Types.Point3;
export declare function getPolyDataPointIndexes(polyData: vtkPolyData): any[];
export declare function getPolyDataPoints(polyData: vtkPolyData): any[];
