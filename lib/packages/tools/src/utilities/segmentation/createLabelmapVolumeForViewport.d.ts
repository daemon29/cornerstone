import type { Types } from '@cornerstonejs/core';
export default function createLabelmapVolumeForViewport(input: {
    viewportId: string;
    renderingEngineId: string;
    segmentationId?: string;
    options?: {
        volumeId: string;
        scalarData: Float32Array | Uint8Array | Uint16Array | Int16Array;
        targetBuffer: {
            type: 'Float32Array' | 'Uint8Array' | 'Uint16Array' | 'Int8Array';
        };
        metadata: Types.Metadata;
        dimensions: Types.Point3;
        spacing: Types.Point3;
        origin: Types.Point3;
        direction: Types.Mat3;
    };
}): Promise<string>;
