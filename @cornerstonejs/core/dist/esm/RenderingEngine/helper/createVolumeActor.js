import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import { loadVolume } from '../../loaders/volumeLoader';
import createVolumeMapper from './createVolumeMapper';
import { triggerEvent } from '../../utilities';
import { Events } from '../../enums';
import setDefaultVolumeVOI from './setDefaultVolumeVOI';
import { mat4 } from 'gl-matrix';
async function createVolumeActor(props, element, viewportId, suppressEvents = false, useNativeDataType = false, matrix) {
    const { volumeId, callback, blendMode } = props;
    const imageVolume = await loadVolume(volumeId);
    if (!imageVolume) {
        throw new Error(`imageVolume with id: ${imageVolume.volumeId} does not exist`);
    }
    const { imageData, vtkOpenGLTexture } = imageVolume;
    const volumeMapper = createVolumeMapper(imageData, vtkOpenGLTexture);
    if (blendMode) {
        volumeMapper.setBlendMode(blendMode);
    }
    const volumeActor = vtkVolume.newInstance();
    volumeActor.setMapper(volumeMapper);
    const numberOfComponents = imageData
        .getPointData()
        .getScalars()
        .getNumberOfComponents();
    if (matrix) {
        volumeActor.setPosition(matrix[3],matrix[7], matrix[11]);
    }
    if (numberOfComponents === 3) {
        volumeActor.getProperty().setIndependentComponents(false);
    }
    await setDefaultVolumeVOI(volumeActor, imageVolume, useNativeDataType);
    if (callback) {
        callback({ volumeActor, volumeId });
    }
    if (!suppressEvents) {
        triggerVOIModified(element, viewportId, volumeActor, volumeId);
    }
    return volumeActor;
}
function triggerVOIModified(element, viewportId, volumeActor, volumeId) {
    const voiRange = volumeActor
        .getProperty()
        .getRGBTransferFunction(0)
        .getRange();
    const voiModifiedEventDetail = {
        viewportId,
        range: {
            lower: voiRange[0],
            upper: voiRange[1],
        },
        volumeId,
    };
    triggerEvent(element, Events.VOI_MODIFIED, voiModifiedEventDetail);
}
export default createVolumeActor;
//# sourceMappingURL=createVolumeActor.js.map