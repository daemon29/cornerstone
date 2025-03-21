import { RawSurfacesData } from './surfaceComputationStrategies';
import { PolySegConversionOptions } from '../../../../types';
export declare function createAndCacheSurfacesFromRaw(segmentationId: string, rawSurfacesData: RawSurfacesData, options?: PolySegConversionOptions): Promise<{
    geometryIds: Map<number, string>;
}>;
