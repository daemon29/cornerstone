import {
    RenderingEngine,
    Enums,
    setVolumesForViewports,
    volumeLoader,
    getRenderingEngine,
    Types,
    setUseSharedArrayBuffer,
  } from '@cornerstonejs/core';
  import {
    initDemo,
    addButtonToToolbar,
    createImageIdsAndCacheMetaData,
    setCtTransferFunctionForVolumeActor,
    addSliderToToolbar,
    readDicomRegData,
    createElement
  } from '../../utils/demo/helpers';
  import * as cornerstoneTools from '@cornerstonejs/tools';
  import { mat4 } from 'gl-matrix';
  import { loadMeasurementTool } from '../../shared/measurementTool';
  import { loadWindowLevelTool } from '../../shared/windowTool';
  import { loadColorMapTool, setColorMapSelect } from '../../shared/colormapTool';
  import { loadCrosshairsTool } from '../../shared/crosshairTool';
  import { patientInfo, studyList } from '../../shared/constants';
  import { createDivElement, loadPatientInfo, selectStudy, setStudyListView } from '../../shared/utils';
  const {
    ToolGroupManager,
    Enums: csToolsEnums,
    WindowLevelTool,
    PanTool,
    ZoomTool,
    StackScrollMouseWheelTool,
    synchronizers,
    MIPJumpToClickTool,
    VolumeRotateMouseWheelTool,
    CrosshairsTool,
    TrackballRotateTool,
    LengthTool, 
    HeightTool, 
    AngleTool, 
    EraserTool
  } = cornerstoneTools;
  
  const { MouseBindings, KeyboardBindings} = csToolsEnums;
  const { ViewportType, BlendModes } = Enums;
  
  const { createCameraPositionSynchronizer, createVOISynchronizer } = synchronizers;

  
// Global variables
let renderingEngine;
const renderingEngineId = 'myRenderingEngine';
const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'; // Loader id which defines which volume loader to use
const ctVolumeName = 'CT_VOLUME_ID'; // Id of the volume less loader prefix
const ctVolumeId = `${volumeLoaderScheme}:${ctVolumeName}`; // VolumeId with loader id + volume id
const ctToolGroupId = 'CT_TOOLGROUP_ID';
const threeDToolGroupId = '3D_TOOLGROUP_ID';

let expandedElement = null; // To track which element is expanded
let viewportColors, viewportReferenceLineControllable, viewportReferenceLineDraggableRotatable, viewportReferenceLineSlabThicknessControlsOn;
const currentSelectColormapName = 'Grayscale';


async function run() {
    // Init Cornerstone and related libraries
    await initDemo();
    setUseSharedArrayBuffer(true);
    //initToolBar();
    //initViewPort();
    loadPatientInfo(patientInfo)
    //setStudyListView(studyList, onStudySelect);
    // initial study
    // Instantiate a rendering engine
    renderingEngine = new RenderingEngine(renderingEngineId);
    // Get Cornerstone imageIds and fetch metadata into RAM
    // Tools and synchronizers can be set up in any order.
  }
  
  run();
  