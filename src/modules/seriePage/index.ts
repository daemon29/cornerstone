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
  import { patientInfo, seriesList, studyList } from '../../shared/constants';
  import { createDivElement, loadPatientInfo, loadSeriesList, selectStudy, setStudyListView, setViewportColormap } from '../../shared/utils';
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

const viewportIds = ['CT_AXIAL','CT_SAGGITAL','CT_CORONAL','CT_3D'];

const optionsValues = [WindowLevelTool.toolName, CrosshairsTool.toolName, 'MeasureTool'];

const resizeObserver = new ResizeObserver(() => {
  renderingEngine = getRenderingEngine(renderingEngineId);
  if (renderingEngine) {
    renderingEngine.resize(true, false);
  }
});

function toggleSelectTool(toolName){
  optionsValues.forEach(element => {
    const button = document.getElementById(element);
    if (element==toolName) {
      button.dataset.isSelected = 'true';
    } else {
      button.dataset.isSelected = 'false';
    }
  });
}
function onSelectTool(toolName:string){
  const toolGroup = ToolGroupManager.getToolGroup(ctToolGroupId);
  switch (toolName) {
    case WindowLevelTool.toolName:
      toolGroup.setToolPassive(CrosshairsTool.toolName);
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });
      toggleSelectTool(toolName)
      break;
    case CrosshairsTool.toolName:
      toolGroup.setToolDisabled(WindowLevelTool.toolName);
      toolGroup.setToolActive(CrosshairsTool.toolName, {
      bindings: [{ mouseButton: MouseBindings.Primary }],
      });
      toggleSelectTool(toolName)
      break;
    case LengthTool.toolName:
    case HeightTool.toolName:
    case AngleTool.toolName:
    case EraserTool.toolName:
      const measureTools = [LengthTool.toolName,HeightTool.toolName,AngleTool.toolName,EraserTool.toolName];
      measureTools.indexOf(toolName) !== -1 && measureTools.splice(measureTools.indexOf(toolName), 1); // remove tool name from the list
      toolGroup.setToolDisabled(CrosshairsTool.toolName);
      toolGroup.setToolDisabled(WindowLevelTool.toolName);
      measureTools.forEach(element => {
        toolGroup.setToolPassive(element);
      });
        toolGroup.setToolActive(toolName, {
      bindings: [{ mouseButton: MouseBindings.Primary }],
      });
      toolGroup.setToolActive(EraserTool.toolName,{
        bindings:[{
          modifierKey: KeyboardBindings.Ctrl,
        }]
      })
      toggleSelectTool('MeasureTool')
      break;
    default:
      break;
  }
}

function initToolBar(){
  initLeftToolBar();
  initRightToolBar();
}
function initLeftToolBar(){
  loadMeasurementTool(onSelectTool);
  loadWindowLevelTool(onSelectTool);
  loadCrosshairsTool(onSelectTool);
}

function onColorSelection(colorValue){
  setViewportColormap([viewportIds[0],], ctVolumeId, colorValue, renderingEngineId);
}
function initRightToolBar(){

  loadColorMapTool(onColorSelection);
  addButtonToToolbar({
    title: '3D View',
    id: 'button-3d',
    onClick: () => {
      // TODO: 
      //select3DView();
    },
  });
}

function onStudySelect(index: number){
  if(index>=seriesList.length)
    return;

  selectStudy(index);
}

function initViewPort(){
  const viewportGrid = createDivElement({id:'master-viewport-grid-series'})
  const wholeContent = document.getElementById('whole-content-series');
  const content = document.getElementById('content-series');
  content.style.display = 'row';
  for (let index = 0; index < 3; index++) {
    const element = createDivElement({id:`viewport${index+1}`})
    element.style.gridColumnStart = String(index+1);
    element.oncontextmenu = (e) => e.preventDefault();
    //element.ondblclick = () => toggleViewportSize(element);
    //element.onclick = () => selectGridElement(element);
    //elements.push(element);
    viewportGrid.appendChild(element);
    resizeObserver.observe(element);
  }
  content.appendChild(viewportGrid);
  const threeDviewPort = createDivElement({id:'viewport-3d'});
  threeDviewPort.hidden = false;
  threeDviewPort.oncontextmenu = (e) => e.preventDefault();
  //threeDviewPort.onclick= ()=> selectGridElement(threeDviewPort);
  resizeObserver.observe(threeDviewPort);
  wholeContent.appendChild(threeDviewPort);
}

async function run() {
    // Init Cornerstone and related libraries
    await initDemo();
    setUseSharedArrayBuffer(true);
    initToolBar();
    initViewPort();
    loadPatientInfo(patientInfo)
    loadSeriesList(seriesList,onStudySelect)
    // initial study
    // Instantiate a rendering engine
    renderingEngine = new RenderingEngine(renderingEngineId);
    // Get Cornerstone imageIds and fetch metadata into RAM
    // Tools and synchronizers can be set up in any order.
  }
  
  run();
  