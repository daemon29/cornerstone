import { VolumeActor } from './IActor';
import BlendModes from '../enums/BlendModes';
import { mat4 } from 'gl-matrix';
declare type VolumeInputCallback = (params: {
    volumeActor: VolumeActor;
    volumeId: string;
}) => unknown;
interface IVolumeInput {
    volumeId: string;
    actorUID?: string;
    visibility?: boolean;
    callback?: VolumeInputCallback;
    blendMode?: BlendModes;
    slabThickness?: number;
    matrix?: mat4;
}
export type { IVolumeInput, VolumeInputCallback };
//# sourceMappingURL=IVolumeInput.d.ts.map