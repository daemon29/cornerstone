import { VolumeActor } from './../../types/IActor';
import BlendModes from '../../enums/BlendModes';
import { mat4 } from 'gl-matrix';
interface createVolumeActorInterface {
    volumeId: string;
    callback?: ({ volumeActor, volumeId, }: {
        volumeActor: VolumeActor;
        volumeId: string;
    }) => void;
    blendMode?: BlendModes;
}
declare function createVolumeActor(props: createVolumeActorInterface, element: HTMLDivElement, viewportId: string, suppressEvents?: boolean, useNativeDataType?: boolean, mattrix?: mat4): Promise<VolumeActor>;
export default createVolumeActor;
//# sourceMappingURL=createVolumeActor.d.ts.map