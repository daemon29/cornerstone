import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import { vec2, vec3 } from 'gl-matrix';
import cache from '../cache';
import { MPR_CAMERA_VALUES, RENDERING_DEFAULTS, VIEWPORT_PRESETS, } from '../constants';
import { Events, ViewportStatus, VOILUTFunctionType, } from '../enums';
import ViewportType from '../enums/ViewportType';
import eventTarget from '../eventTarget';
import { getShouldUseCPURendering } from '../init';
import { loadVolume } from '../loaders/volumeLoader';
import { actorIsA, applyPreset, createSigmoidRGBTransferFunction, getVoiFromSigmoidRGBTransferFunction, imageIdToURI, invertRgbTransferFunction, triggerEvent, colormap as colormapUtils, isEqualNegative, getVolumeViewportScrollInfo, snapFocalPointToSlice, isEqual, } from '../utilities';
import { createVolumeActor } from './helpers';
import volumeNewImageEventDispatcher, { resetVolumeNewImageState, } from './helpers/volumeNewImageEventDispatcher';
import Viewport from './Viewport';
import vtkSlabCamera from './vtkClasses/vtkSlabCamera';
import transformWorldToIndex from '../utilities/transformWorldToIndex';
import { findMatchingColormap } from '../utilities/colormap';
import { getTransferFunctionNodes } from '../utilities/transferFunctionUtils';
class BaseVolumeViewport extends Viewport {
    constructor(props) {
        super(props);
        this.useCPURendering = false;
        this.useNativeDataType = false;
        this.perVolumeIdDefaultProperties = new Map();
        this.viewportProperties = {};
        this.setRotation = (rotation) => {
            const panFit = this.getPan(this.fitToCanvasCamera);
            const pan = this.getPan();
            const previousCamera = this.getCamera();
            const panSub = vec2.sub([0, 0], panFit, pan);
            this.setPan(panSub, false);
            const { flipVertical } = this.getCamera();
            const initialViewUp = flipVertical
                ? vec3.negate([0, 0, 0], this.initialViewUp)
                : this.initialViewUp;
            this.setCameraNoEvent({
                viewUp: initialViewUp,
            });
            this.rotateCamera(rotation);
            const afterPan = this.getPan();
            const afterPanFit = this.getPan(this.fitToCanvasCamera);
            const newCenter = vec2.sub([0, 0], afterPan, afterPanFit);
            const newOffset = vec2.add([0, 0], panFit, newCenter);
            this.setPan(newOffset, false);
            if (this._suppressCameraModifiedEvents) {
                return;
            }
            const camera = this.getCamera();
            const eventDetail = {
                previousCamera,
                camera,
                element: this.element,
                viewportId: this.id,
                renderingEngineId: this.renderingEngineId,
                rotation,
            };
            triggerEvent(this.element, Events.CAMERA_MODIFIED, eventDetail);
            this.viewportProperties.rotation = rotation;
        };
        this.getDefaultProperties = (volumeId) => {
            let volumeProperties;
            if (volumeId !== undefined) {
                volumeProperties = this.perVolumeIdDefaultProperties.get(volumeId);
            }
            if (volumeProperties !== undefined) {
                return volumeProperties;
            }
            return {
                ...this.globalDefaultProperties,
            };
        };
        this.getProperties = (volumeId) => {
            const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
            if (!applicableVolumeActorInfo) {
                return;
            }
            const { colormap: latestColormap, VOILUTFunction, interpolationType, invert, slabThickness, rotation, preset, } = this.viewportProperties;
            const voiRanges = this.getActors()
                .map((actorEntry) => {
                const volumeActor = actorEntry.actor;
                const volumeId = actorEntry.uid;
                const volume = cache.getVolume(volumeId);
                if (!volume) {
                    return null;
                }
                const cfun = volumeActor.getProperty().getRGBTransferFunction(0);
                const [lower, upper] = this.viewportProperties?.VOILUTFunction === 'SIGMOID'
                    ? getVoiFromSigmoidRGBTransferFunction(cfun)
                    : cfun.getRange();
                return { volumeId, voiRange: { lower, upper } };
            })
                .filter(Boolean);
            const voiRange = volumeId
                ? voiRanges.find((range) => range.volumeId === volumeId)?.voiRange
                : voiRanges[0]?.voiRange;
            const volumeColormap = this.getColormap(volumeId);
            const colormap = volumeId && volumeColormap ? volumeColormap : latestColormap;
            return {
                colormap: colormap,
                voiRange: voiRange,
                VOILUTFunction: VOILUTFunction,
                interpolationType: interpolationType,
                invert: invert,
                slabThickness: slabThickness,
                rotation: rotation,
                preset,
            };
        };
        this.getColormap = (volumeId) => {
            const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
            if (!applicableVolumeActorInfo) {
                return;
            }
            const { volumeActor } = applicableVolumeActorInfo;
            const cfun = volumeActor.getProperty().getRGBTransferFunction(0);
            const { nodes } = cfun.getState();
            const RGBPoints = nodes.reduce((acc, node) => {
                acc.push(node.x, node.r, node.g, node.b);
                return acc;
            }, []);
            const matchedColormap = findMatchingColormap(RGBPoints, volumeActor);
            return matchedColormap;
        };
        this.getRotation = () => {
            const { viewUp: currentViewUp, viewPlaneNormal, flipVertical, } = this.getCamera();
            const initialViewUp = flipVertical
                ? vec3.negate([0, 0, 0], this.initialViewUp)
                : this.initialViewUp;
            if (!initialViewUp) {
                return 0;
            }
            const initialToCurrentViewUpAngle = (vec3.angle(initialViewUp, currentViewUp) * 180) / Math.PI;
            const initialToCurrentViewUpCross = vec3.cross([0, 0, 0], initialViewUp, currentViewUp);
            const normalDot = vec3.dot(initialToCurrentViewUpCross, viewPlaneNormal);
            const value = normalDot >= 0
                ? initialToCurrentViewUpAngle
                : (360 - initialToCurrentViewUpAngle) % 360;
            return value;
        };
        this.getFrameOfReferenceUID = () => {
            return this._FrameOfReferenceUID;
        };
        this.canvasToWorld = (canvasPos) => {
            const vtkCamera = this.getVtkActiveCamera();
            vtkCamera.setIsPerformingCoordinateTransformation?.(true);
            const renderer = this.getRenderer();
            const offscreenMultiRenderWindow = this.getRenderingEngine().offscreenMultiRenderWindow;
            const openGLRenderWindow = offscreenMultiRenderWindow.getOpenGLRenderWindow();
            const size = openGLRenderWindow.getSize();
            const devicePixelRatio = window.devicePixelRatio || 1;
            const canvasPosWithDPR = [
                canvasPos[0] * devicePixelRatio,
                canvasPos[1] * devicePixelRatio,
            ];
            const displayCoord = [
                canvasPosWithDPR[0] + this.sx,
                canvasPosWithDPR[1] + this.sy,
            ];
            displayCoord[1] = size[1] - displayCoord[1];
            const worldCoord = openGLRenderWindow.displayToWorld(displayCoord[0], displayCoord[1], 0, renderer);
            vtkCamera.setIsPerformingCoordinateTransformation?.(false);
            return [worldCoord[0], worldCoord[1], worldCoord[2]];
        };
        this.worldToCanvas = (worldPos) => {
            const vtkCamera = this.getVtkActiveCamera();
            vtkCamera.setIsPerformingCoordinateTransformation?.(true);
            const renderer = this.getRenderer();
            const offscreenMultiRenderWindow = this.getRenderingEngine().offscreenMultiRenderWindow;
            const openGLRenderWindow = offscreenMultiRenderWindow.getOpenGLRenderWindow();
            const size = openGLRenderWindow.getSize();
            const displayCoord = openGLRenderWindow.worldToDisplay(...worldPos, renderer);
            displayCoord[1] = size[1] - displayCoord[1];
            const canvasCoord = [
                displayCoord[0] - this.sx,
                displayCoord[1] - this.sy,
            ];
            const devicePixelRatio = window.devicePixelRatio || 1;
            const canvasCoordWithDPR = [
                canvasCoord[0] / devicePixelRatio,
                canvasCoord[1] / devicePixelRatio,
            ];
            vtkCamera.setIsPerformingCoordinateTransformation?.(false);
            return canvasCoordWithDPR;
        };
        this.hasImageURI = (imageURI) => {
            const volumeActors = this.getActors().filter((actorEntry) => actorIsA(actorEntry, 'vtkVolume'));
            return volumeActors.some(({ uid }) => {
                const volume = cache.getVolume(uid);
                if (!volume || !volume.imageIds) {
                    return false;
                }
                const volumeImageURIs = volume.imageIds.map(imageIdToURI);
                return volumeImageURIs.includes(imageURI);
            });
        };
        this.getImageIds = (volumeId) => {
            const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
            if (!applicableVolumeActorInfo) {
                throw new Error(`No actor found for the given volumeId: ${volumeId}`);
            }
            const volumeIdToUse = applicableVolumeActorInfo.volumeId;
            const imageVolume = cache.getVolume(volumeIdToUse);
            if (!imageVolume) {
                throw new Error(`imageVolume with id: ${volumeIdToUse} does not exist in cache`);
            }
            return imageVolume.imageIds;
        };
        this.useCPURendering = getShouldUseCPURendering();
        this.useNativeDataType = this._shouldUseNativeDataType();
        if (this.useCPURendering) {
            throw new Error('VolumeViewports cannot be used whilst CPU Fallback Rendering is enabled.');
        }
        const renderer = this.getRenderer();
        const camera = vtkSlabCamera.newInstance();
        renderer.setActiveCamera(camera);
        switch (this.type) {
            case ViewportType.ORTHOGRAPHIC:
                camera.setParallelProjection(true);
                break;
            case ViewportType.VOLUME_3D:
                camera.setParallelProjection(true);
                break;
            case ViewportType.PERSPECTIVE:
                camera.setParallelProjection(false);
                break;
            default:
                throw new Error(`Unrecognized viewport type: ${this.type}`);
        }
        this.initializeVolumeNewImageEventDispatcher();
    }
    static get useCustomRenderingPipeline() {
        return false;
    }
    resetCamera(resetPan = true, resetZoom = true, resetToCenter = true, resetRotation = false, supressEvents = false, resetOrientation = true) {
        return super.resetCamera();
    }
    applyViewOrientation(orientation, resetCamera = true) {
        const { viewPlaneNormal, viewUp } = this._getOrientationVectors(orientation);
        const camera = this.getVtkActiveCamera();
        camera.setDirectionOfProjection(-viewPlaneNormal[0], -viewPlaneNormal[1], -viewPlaneNormal[2]);
        camera.setViewUpFrom(viewUp);
        this.initialViewUp = viewUp;
        if (resetCamera) {
            const resetPan = true, resetZoom = true, resetToCenter = true, resetRotation = false, suppressEvents = true, resetOrientation = false;
            this.resetCamera(resetPan, resetZoom, resetToCenter, resetRotation, suppressEvents, resetOrientation);
        }
    }
    initializeVolumeNewImageEventDispatcher() {
        const volumeNewImageHandlerBound = volumeNewImageHandler.bind(this);
        const volumeNewImageCleanUpBound = volumeNewImageCleanUp.bind(this);
        function volumeNewImageHandler(cameraEvent) {
            const { viewportId } = cameraEvent.detail;
            if (viewportId !== this.id || this.isDisabled) {
                return;
            }
            const viewportImageData = this.getImageData();
            if (!viewportImageData) {
                return;
            }
            volumeNewImageEventDispatcher(cameraEvent);
        }
        function volumeNewImageCleanUp(evt) {
            const { viewportId } = evt.detail;
            if (viewportId !== this.id) {
                return;
            }
            this.element.removeEventListener(Events.CAMERA_MODIFIED, volumeNewImageHandlerBound);
            eventTarget.removeEventListener(Events.ELEMENT_DISABLED, volumeNewImageCleanUpBound);
            resetVolumeNewImageState(viewportId);
        }
        this.element.removeEventListener(Events.CAMERA_MODIFIED, volumeNewImageHandlerBound);
        this.element.addEventListener(Events.CAMERA_MODIFIED, volumeNewImageHandlerBound);
        eventTarget.addEventListener(Events.ELEMENT_DISABLED, volumeNewImageCleanUpBound);
    }
    resetVolumeViewportClippingRange() {
        const activeCamera = this.getVtkActiveCamera();
        if (activeCamera.getParallelProjection()) {
            activeCamera.setClippingRange(-RENDERING_DEFAULTS.MAXIMUM_RAY_DISTANCE, RENDERING_DEFAULTS.MAXIMUM_RAY_DISTANCE);
        }
        else {
            activeCamera.setClippingRange(RENDERING_DEFAULTS.MINIMUM_SLAB_THICKNESS, RENDERING_DEFAULTS.MAXIMUM_RAY_DISTANCE);
        }
    }
    setVOILUTFunction(voiLUTFunction, volumeId, suppressEvents) {
        if (Object.values(VOILUTFunctionType).indexOf(voiLUTFunction) === -1) {
            voiLUTFunction = VOILUTFunctionType.LINEAR;
        }
        const { voiRange } = this.getProperties();
        this.setVOI(voiRange, volumeId, suppressEvents);
        this.viewportProperties.VOILUTFunction = voiLUTFunction;
    }
    setColormap(colormap, volumeId, suppressEvents) {
        const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
        if (!applicableVolumeActorInfo) {
            return;
        }
        const { volumeActor } = applicableVolumeActorInfo;
        const cfun = vtkColorTransferFunction.newInstance();
        let colormapObj = colormapUtils.getColormap(colormap.name);
        const { name } = colormap;
        if (!colormapObj) {
            colormapObj = vtkColorMaps.getPresetByName(name);
        }
        if (!colormapObj) {
            throw new Error(`Colormap ${colormap} not found`);
        }
        const range = volumeActor
            .getProperty()
            .getRGBTransferFunction(0)
            .getRange();
        cfun.applyColorMap(colormapObj);
        cfun.setMappingRange(range[0], range[1]);
        volumeActor.getProperty().setRGBTransferFunction(0, cfun);
        this.viewportProperties.colormap = colormap;
        if (!suppressEvents) {
            const eventDetail = {
                viewportId: this.id,
                colormap,
                volumeId,
            };
            triggerEvent(this.element, Events.COLORMAP_MODIFIED, eventDetail);
        }
    }
    setOpacity(colormap, volumeId) {
        const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
        if (!applicableVolumeActorInfo) {
            return;
        }
        const { volumeActor } = applicableVolumeActorInfo;
        const ofun = vtkPiecewiseFunction.newInstance();
        if (typeof colormap.opacity === 'number') {
            const range = volumeActor
                .getProperty()
                .getRGBTransferFunction(0)
                .getRange();
            ofun.addPoint(range[0], colormap.opacity);
            ofun.addPoint(range[1], colormap.opacity);
        }
        else {
            colormap.opacity.forEach(({ opacity, value }) => {
                ofun.addPoint(value, opacity);
            });
        }
        volumeActor.getProperty().setScalarOpacity(0, ofun);
        if (!this.viewportProperties.colormap) {
            this.viewportProperties.colormap = {};
        }
        this.viewportProperties.colormap.opacity = colormap.opacity;
    }
    setInvert(inverted, volumeId, suppressEvents) {
        const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
        if (!applicableVolumeActorInfo) {
            return;
        }
        const volumeIdToUse = applicableVolumeActorInfo.volumeId;
        const cfun = this._getOrCreateColorTransferFunction(volumeIdToUse);
        invertRgbTransferFunction(cfun);
        this.viewportProperties.invert = inverted;
        if (!suppressEvents) {
            const eventDetail = {
                ...this.getVOIModifiedEventDetail(volumeIdToUse),
                invertStateChanged: true,
            };
            triggerEvent(this.element, Events.VOI_MODIFIED, eventDetail);
        }
    }
    getVOIModifiedEventDetail(volumeId) {
        const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
        if (!applicableVolumeActorInfo) {
            throw new Error(`No actor found for the given volumeId: ${volumeId}`);
        }
        const volumeActor = applicableVolumeActorInfo.volumeActor;
        const transferFunction = volumeActor
            .getProperty()
            .getRGBTransferFunction(0);
        const range = transferFunction.getMappingRange();
        const matchedColormap = this.getColormap(volumeId);
        const { VOILUTFunction, invert } = this.getProperties(volumeId);
        return {
            viewportId: this.id,
            range: {
                lower: range[0],
                upper: range[1],
            },
            volumeId: applicableVolumeActorInfo.volumeId,
            VOILUTFunction: VOILUTFunction,
            colormap: matchedColormap,
            invert,
        };
    }
    _getOrCreateColorTransferFunction(volumeId) {
        const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
        if (!applicableVolumeActorInfo) {
            return null;
        }
        const { volumeActor } = applicableVolumeActorInfo;
        const rgbTransferFunction = volumeActor
            .getProperty()
            .getRGBTransferFunction(0);
        if (rgbTransferFunction) {
            return rgbTransferFunction;
        }
        const newRGBTransferFunction = vtkColorTransferFunction.newInstance();
        volumeActor.getProperty().setRGBTransferFunction(0, newRGBTransferFunction);
        return newRGBTransferFunction;
    }
    setInterpolationType(interpolationType, volumeId) {
        const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
        if (!applicableVolumeActorInfo) {
            return;
        }
        const { volumeActor } = applicableVolumeActorInfo;
        const volumeProperty = volumeActor.getProperty();
        volumeProperty.setInterpolationType(interpolationType);
        this.viewportProperties.interpolationType = interpolationType;
    }
    setVOI(voiRange, volumeId, suppressEvents = false) {
        const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
        if (!applicableVolumeActorInfo) {
            return;
        }
        const { volumeActor } = applicableVolumeActorInfo;
        const volumeIdToUse = applicableVolumeActorInfo.volumeId;
        let voiRangeToUse = voiRange;
        if (typeof voiRangeToUse === 'undefined') {
            const imageData = volumeActor.getMapper().getInputData();
            const range = imageData.getPointData().getScalars().getRange();
            const maxVoiRange = { lower: range[0], upper: range[1] };
            voiRangeToUse = maxVoiRange;
        }
        const { VOILUTFunction } = this.getProperties(volumeIdToUse);
        if (VOILUTFunction === VOILUTFunctionType.SAMPLED_SIGMOID) {
            const cfun = createSigmoidRGBTransferFunction(voiRangeToUse);
            volumeActor.getProperty().setRGBTransferFunction(0, cfun);
        }
        else {
            const { lower, upper } = voiRangeToUse;
            volumeActor
                .getProperty()
                .getRGBTransferFunction(0)
                .setRange(lower, upper);
        }
        if (!suppressEvents) {
            const eventDetail = {
                ...this.getVOIModifiedEventDetail(volumeIdToUse),
            };
            triggerEvent(this.element, Events.VOI_MODIFIED, eventDetail);
        }
        this.viewportProperties.voiRange = voiRangeToUse;
    }
    rotateCamera(rotation) {
        const rotationToApply = rotation - this.getRotation();
        this.getVtkActiveCamera().roll(-rotationToApply);
    }
    setDefaultProperties(ViewportProperties, volumeId) {
        if (volumeId == null) {
            this.globalDefaultProperties = ViewportProperties;
        }
        else {
            this.perVolumeIdDefaultProperties.set(volumeId, ViewportProperties);
        }
    }
    clearDefaultProperties(volumeId) {
        if (volumeId == null) {
            this.globalDefaultProperties = {};
            this.resetProperties();
        }
        else {
            this.perVolumeIdDefaultProperties.delete(volumeId);
            this.resetToDefaultProperties(volumeId);
        }
    }
    getViewReference(viewRefSpecifier = {}) {
        const target = super.getViewReference(viewRefSpecifier);
        const volumeId = this.getVolumeId(viewRefSpecifier);
        if (viewRefSpecifier?.forFrameOfReference !== false) {
            target.volumeId = volumeId;
        }
        if (typeof viewRefSpecifier?.sliceIndex !== 'number') {
            return target;
        }
        const { viewPlaneNormal } = target;
        const delta = viewRefSpecifier.sliceIndex - this.getSliceIndex();
        const { sliceRangeInfo } = getVolumeViewportScrollInfo(this, volumeId, true);
        const { sliceRange, spacingInNormalDirection, camera } = sliceRangeInfo;
        const { focalPoint, position } = camera;
        const { newFocalPoint } = snapFocalPointToSlice(focalPoint, position, sliceRange, viewPlaneNormal, spacingInNormalDirection, delta);
        target.cameraFocalPoint = newFocalPoint;
        return target;
    }
    isReferenceViewable(viewRef, options) {
        if (!viewRef.FrameOfReferenceUID) {
            return false;
        }
        if (!super.isReferenceViewable(viewRef, options)) {
            return false;
        }
        if (options?.withNavigation) {
            return true;
        }
        const currentSliceIndex = this.getSliceIndex();
        const { sliceIndex } = viewRef;
        if (Array.isArray(sliceIndex)) {
            return (sliceIndex[0] <= currentSliceIndex && currentSliceIndex <= sliceIndex[1]);
        }
        return sliceIndex === undefined || sliceIndex === currentSliceIndex;
    }
    scroll(delta = 1) {
        const volumeId = this.getVolumeId();
        const { sliceRangeInfo } = getVolumeViewportScrollInfo(this, volumeId, true);
        if (!sliceRangeInfo) {
            return;
        }
        const { sliceRange, spacingInNormalDirection, camera } = sliceRangeInfo;
        const { focalPoint, viewPlaneNormal, position } = camera;
        const { newFocalPoint, newPosition } = snapFocalPointToSlice(focalPoint, position, sliceRange, viewPlaneNormal, spacingInNormalDirection, delta);
        this.setCamera({
            focalPoint: newFocalPoint,
            position: newPosition,
        });
    }
    setViewReference(viewRef) {
        if (!viewRef) {
            return;
        }
        const volumeId = this.getVolumeId();
        const { viewPlaneNormal: refViewPlaneNormal, FrameOfReferenceUID: refFrameOfReference, cameraFocalPoint, viewUp, } = viewRef;
        let { sliceIndex } = viewRef;
        const { focalPoint, viewPlaneNormal, position } = this.getCamera();
        const isNegativeNormal = isEqualNegative(viewPlaneNormal, refViewPlaneNormal);
        const isSameNormal = isEqual(viewPlaneNormal, refViewPlaneNormal);
        if (typeof sliceIndex === 'number' &&
            viewRef.volumeId === volumeId &&
            (isNegativeNormal || isSameNormal)) {
            const { currentStepIndex, sliceRangeInfo, numScrollSteps } = getVolumeViewportScrollInfo(this, volumeId, true);
            const { sliceRange, spacingInNormalDirection } = sliceRangeInfo;
            if (isNegativeNormal) {
                sliceIndex = numScrollSteps - sliceIndex - 1;
            }
            const delta = sliceIndex - currentStepIndex;
            const { newFocalPoint, newPosition } = snapFocalPointToSlice(focalPoint, position, sliceRange, viewPlaneNormal, spacingInNormalDirection, delta);
            this.setCamera({ focalPoint: newFocalPoint, position: newPosition });
        }
        else if (refFrameOfReference === this.getFrameOfReferenceUID()) {
            if (refViewPlaneNormal && !isNegativeNormal && !isSameNormal) {
                this.setOrientation({ viewPlaneNormal: refViewPlaneNormal, viewUp });
                return this.setViewReference(viewRef);
            }
            if (cameraFocalPoint) {
                const focalDelta = vec3.subtract([0, 0, 0], cameraFocalPoint, focalPoint);
                const useNormal = refViewPlaneNormal ?? viewPlaneNormal;
                const normalDot = vec3.dot(focalDelta, useNormal);
                if (!isEqual(normalDot, 0)) {
                    vec3.scale(focalDelta, useNormal, normalDot);
                }
                const newFocal = vec3.add([0, 0, 0], focalPoint, focalDelta);
                const newPosition = vec3.add([0, 0, 0], position, focalDelta);
                this.setCamera({ focalPoint: newFocal, position: newPosition });
            }
        }
        else {
            throw new Error(`Incompatible view refs: ${refFrameOfReference}!==${this.getFrameOfReferenceUID()}`);
        }
    }
    setProperties({ voiRange, VOILUTFunction, invert, colormap, preset, interpolationType, slabThickness, rotation, } = {}, volumeId, suppressEvents = false) {
        if (this.globalDefaultProperties == null) {
            this.setDefaultProperties({
                voiRange,
                VOILUTFunction,
                invert,
                colormap,
                preset,
                slabThickness,
                rotation,
            });
        }
        if (colormap?.name) {
            this.setColormap(colormap, volumeId, suppressEvents);
        }
        if (colormap?.opacity != null) {
            this.setOpacity(colormap, volumeId);
        }
        if (voiRange !== undefined) {
            this.setVOI(voiRange, volumeId, suppressEvents);
        }
        if (typeof interpolationType !== 'undefined') {
            this.setInterpolationType(interpolationType);
        }
        if (VOILUTFunction !== undefined) {
            this.setVOILUTFunction(VOILUTFunction, volumeId, suppressEvents);
        }
        if (invert !== undefined && this.viewportProperties.invert !== invert) {
            this.setInvert(invert, volumeId, suppressEvents);
        }
        if (preset !== undefined) {
            this.setPreset(preset, volumeId, suppressEvents);
        }
        if (slabThickness !== undefined) {
            this.setSlabThickness(slabThickness);
            this.viewportProperties.slabThickness = slabThickness;
        }
        if (rotation !== undefined) {
            this.setRotation(rotation);
        }
    }
    resetToDefaultProperties(volumeId) {
        const properties = this.globalDefaultProperties;
        if (properties.colormap?.name) {
            this.setColormap(properties.colormap, volumeId);
        }
        if (properties.colormap?.opacity != null) {
            this.setOpacity(properties.colormap, volumeId);
        }
        if (properties.voiRange !== undefined) {
            this.setVOI(properties.voiRange, volumeId);
        }
        if (properties.VOILUTFunction !== undefined) {
            this.setVOILUTFunction(properties.VOILUTFunction, volumeId);
        }
        if (properties.invert !== undefined) {
            this.setInvert(properties.invert, volumeId);
        }
        if (properties.slabThickness !== undefined) {
            this.setSlabThickness(properties.slabThickness);
            this.viewportProperties.slabThickness = properties.slabThickness;
        }
        if (properties.rotation !== undefined) {
            this.setRotation(properties.rotation);
        }
        if (properties.preset !== undefined) {
            this.setPreset(properties.preset, volumeId, false);
        }
        this.render();
    }
    setPreset(presetNameOrObj, volumeId, suppressEvents) {
        const applicableVolumeActorInfo = this._getApplicableVolumeActor(volumeId);
        if (!applicableVolumeActorInfo) {
            return;
        }
        const { volumeActor } = applicableVolumeActorInfo;
        let preset = presetNameOrObj;
        if (typeof preset === 'string') {
            preset = VIEWPORT_PRESETS.find((preset) => {
                return preset.name === presetNameOrObj;
            });
        }
        if (!preset) {
            return;
        }
        applyPreset(volumeActor, preset);
        this.viewportProperties.preset = preset;
        this.render();
        if (!suppressEvents) {
            triggerEvent(this.element, Events.PRESET_MODIFIED, {
                viewportId: this.id,
                volumeId: applicableVolumeActorInfo.volumeId,
                actor: volumeActor,
                presetName: preset.name,
            });
        }
    }
    async setVolumes(volumeInputArray, immediate = false, suppressEvents = false) {
        const firstImageVolume = cache.getVolume(volumeInputArray[0].volumeId);
        if (!firstImageVolume) {
            throw new Error(`imageVolume with id: ${firstImageVolume.volumeId} does not exist`);
        }
        const FrameOfReferenceUID = firstImageVolume.metadata.FrameOfReferenceUID;
        await this._isValidVolumeInputArray(volumeInputArray, FrameOfReferenceUID);
        this._FrameOfReferenceUID = FrameOfReferenceUID;
        const volumeActors = [];
        for (let i = 0; i < volumeInputArray.length; i++) {
            const { volumeId, actorUID, slabThickness } = volumeInputArray[i];
            const actor = await createVolumeActor(volumeInputArray[i], this.element, this.id, suppressEvents, this.useNativeDataType);
            const uid = actorUID || volumeId;
            volumeActors.push({
                uid,
                actor,
                slabThickness,
                referenceId: volumeId,
            });
        }
        this._setVolumeActors(volumeActors);
        this.viewportStatus = ViewportStatus.PRE_RENDER;
        this.initializeColorTransferFunction(volumeInputArray);
        triggerEvent(this.element, Events.VOLUME_VIEWPORT_NEW_VOLUME, {
            viewportId: this.id,
            volumeActors,
        });
        if (immediate) {
            this.render();
        }
    }
    async addVolumes(volumeInputArray, immediate = false, suppressEvents = false) {
        const firstImageVolume = cache.getVolume(volumeInputArray[0].volumeId);
        if (!firstImageVolume) {
            throw new Error(`imageVolume with id: ${firstImageVolume.volumeId} does not exist`);
        }
        const volumeActors = [];
        await this._isValidVolumeInputArray(volumeInputArray, this._FrameOfReferenceUID);
        for (let i = 0; i < volumeInputArray.length; i++) {
            const { volumeId, visibility, actorUID, slabThickness } = volumeInputArray[i];
            const actor = await createVolumeActor(volumeInputArray[i], this.element, this.id, suppressEvents, this.useNativeDataType);
            if (visibility === false) {
                actor.setVisibility(false);
            }
            const uid = actorUID || volumeId;
            volumeActors.push({
                uid,
                actor,
                slabThickness,
                referenceId: volumeId,
            });
        }
        this.addActors(volumeActors);
        this.initializeColorTransferFunction(volumeInputArray);
        if (immediate) {
            this.render();
        }
    }
    removeVolumeActors(actorUIDs, immediate = false) {
        this.removeActors(actorUIDs);
        if (immediate) {
            this.render();
        }
    }
    setOrientation(_orientation, _immediate = true) {
        console.warn('Method "setOrientation" needs implementation');
    }
    initializeColorTransferFunction(volumeInputArray) {
        const selectedVolumeId = volumeInputArray[0].volumeId;
        const colorTransferFunction = this._getOrCreateColorTransferFunction(selectedVolumeId);
        if (!this.initialTransferFunctionNodes) {
            this.initialTransferFunctionNodes = getTransferFunctionNodes(colorTransferFunction);
        }
    }
    _getApplicableVolumeActor(volumeId) {
        if (volumeId !== undefined && !this.getActor(volumeId)) {
            return;
        }
        const actorEntries = this.getActors();
        if (!actorEntries.length) {
            return;
        }
        let volumeActor;
        if (volumeId) {
            volumeActor = this.getActor(volumeId)?.actor;
        }
        if (!volumeActor) {
            volumeActor = actorEntries[0].actor;
            volumeId = actorEntries[0].uid;
        }
        return { volumeActor, volumeId };
    }
    async _isValidVolumeInputArray(volumeInputArray, FrameOfReferenceUID) {
        // const numVolumes = volumeInputArray.length;
        // for (let i = 1; i < numVolumes; i++) {
        //     const volumeInput = volumeInputArray[i];
        //     const imageVolume = await loadVolume(volumeInput.volumeId);
        //     if (!imageVolume) {
        //         throw new Error(`imageVolume with id: ${imageVolume.volumeId} does not exist`);
        //     }
        //     if (FrameOfReferenceUID !== imageVolume.metadata.FrameOfReferenceUID) {
        //         throw new Error(`Volumes being added to viewport ${this.id} do not share the same FrameOfReferenceUID. This is not yet supported`);
        //     }
        // }
        return true;
    }
    getBounds() {
        const renderer = this.getRenderer();
        const bounds = renderer.computeVisiblePropBounds();
        return bounds;
    }
    flip(flipDirection) {
        super.flip(flipDirection);
    }
    hasVolumeId(volumeId) {
        const actorEntries = this.getActors();
        return actorEntries.some((actorEntry) => {
            return actorEntry.uid === volumeId;
        });
    }
    getImageData(volumeId) {
        const defaultActor = this.getDefaultActor();
        if (!defaultActor) {
            return;
        }
        const { uid: defaultActorUID } = defaultActor;
        volumeId = volumeId ?? defaultActorUID;
        const actorEntry = this.getActor(volumeId);
        if (!actorIsA(actorEntry, 'vtkVolume')) {
            return;
        }
        const actor = actorEntry.actor;
        const volume = cache.getVolume(volumeId);
        const vtkImageData = actor.getMapper().getInputData();
        return {
            dimensions: vtkImageData.getDimensions(),
            spacing: vtkImageData.getSpacing(),
            origin: vtkImageData.getOrigin(),
            direction: vtkImageData.getDirection(),
            scalarData: vtkImageData.getPointData().getScalars().isDeleted()
                ? null
                : vtkImageData.getPointData().getScalars().getData(),
            imageData: actor.getMapper().getInputData(),
            metadata: {
                Modality: volume?.metadata?.Modality,
            },
            scaling: volume?.scaling,
            hasPixelSpacing: true,
        };
    }
    _setVolumeActors(volumeActorEntries) {
        for (let i = 0; i < volumeActorEntries.length; i++) {
            this.viewportProperties.invert = false;
        }
        this.setActors(volumeActorEntries);
    }
    _getOrientationVectors(orientation) {
        if (typeof orientation === 'object') {
            if (orientation.viewPlaneNormal && orientation.viewUp) {
                return orientation;
            }
            else {
                throw new Error('Invalid orientation object. It must contain viewPlaneNormal and viewUp');
            }
        }
        else if (typeof orientation === 'string' &&
            MPR_CAMERA_VALUES[orientation]) {
            this.viewportProperties.orientation = orientation;
            return MPR_CAMERA_VALUES[orientation];
        }
        else {
            throw new Error(`Invalid orientation: ${orientation}. Valid orientations are: ${Object.keys(MPR_CAMERA_VALUES).join(', ')}`);
        }
    }
    getSlabThickness() {
        const actors = this.getActors();
        let slabThickness = RENDERING_DEFAULTS.MINIMUM_SLAB_THICKNESS;
        actors.forEach((actor) => {
            if (actor.slabThickness > slabThickness) {
                slabThickness = actor.slabThickness;
            }
        });
        return slabThickness;
    }
    getIntensityFromWorld(point) {
        const actorEntry = this.getDefaultActor();
        if (!actorIsA(actorEntry, 'vtkVolume')) {
            return;
        }
        const { actor, uid } = actorEntry;
        const imageData = actor.getMapper().getInputData();
        const volume = cache.getVolume(uid);
        const { dimensions } = volume;
        const index = transformWorldToIndex(imageData, point);
        const voxelIndex = index[2] * dimensions[0] * dimensions[1] +
            index[1] * dimensions[0] +
            index[0];
        return volume.getScalarData()[voxelIndex];
    }
    getVolumeId(specifier) {
        const actorEntries = this.getActors();
        if (!actorEntries) {
            return;
        }
        if (!specifier?.volumeId) {
            return actorEntries.find((actorEntry) => actorEntry.actor.getClassName() === 'vtkVolume')?.uid;
        }
        return actorEntries.find((actorEntry) => actorEntry.actor.getClassName() === 'vtkVolume' &&
            actorEntry.uid === specifier.volumeId)?.uid;
    }
    getReferenceId(specifier = {}) {
        let { volumeId, sliceIndex: sliceIndex } = specifier;
        if (!volumeId) {
            const actorEntries = this.getActors();
            if (!actorEntries) {
                return;
            }
            volumeId = actorEntries.find((actorEntry) => actorEntry.actor.getClassName() === 'vtkVolume')?.uid;
        }
        const currentIndex = this.getSliceIndex();
        sliceIndex ??= currentIndex;
        const { viewPlaneNormal, focalPoint } = this.getCamera();
        const querySeparator = volumeId.indexOf('?') > -1 ? '&' : '?';
        return `volumeId:${volumeId}${querySeparator}sliceIndex=${sliceIndex}&viewPlaneNormal=${viewPlaneNormal.join(',')}&focalPoint=${focalPoint.join(',')}`;
    }
}
export default BaseVolumeViewport;
//# sourceMappingURL=BaseVolumeViewport.js.map