import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
  getRenderingEngine,
  setUseSharedArrayBuffer,
  cache,
  utilities,
  metaData
} from '@cornerstonejs/core';
import {
  initDemo,
  addButtonToToolbar,
  createImageIdsAndCacheMetaData,
  setCtTransferFunctionForVolumeActor,
  addSliderToToolbar,
  readDicomRegData,
} from '../../utils/demo/helpers';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { mat4 } from 'gl-matrix';
import { loadMeasurementTool } from '../../shared/measurementTool';
import { loadWindowLevelTool } from '../../shared/windowTool';
import { loadColorMapTool, setColorMapSelect } from '../../shared/colormapTool';
import { loadCrosshairsTool } from '../../shared/crosshairTool';
import { patientInfo, studyList } from '../../shared/constants';
import { createDivElement, getViewPortByElement, loadPatientInfo, selectStudy, setStudyListView, setViewportColormap } from '../../shared/utils';
import { ViewportTypeEnum } from '../../shared/enums';
import { getAllowedPatientId } from '../../shared/getAllowedPatientId';
import { api } from "dicomweb-client";
import * as cornerstoneAdapters from "@cornerstonejs/adapters";
import { loadLabelMapTool } from '../../shared/labelMapTool';
import { load3DTool } from "../../shared/3dTool";

const {
  ToolGroupManager,
  Enums: csToolsEnums,
  WindowLevelTool,
  PanTool,
  ZoomTool,
  StackScrollMouseWheelTool,
  synchronizers,
  VolumeRotateMouseWheelTool,
  CrosshairsTool,
  TrackballRotateTool,
  LengthTool, 
  HeightTool, 
  AngleTool, 
  EraserTool,
  SegmentationDisplayTool,
} = cornerstoneTools;

const { MouseBindings, KeyboardBindings} = csToolsEnums;
const { ViewportType, BlendModes } = Enums;
const { adaptersSEG } = cornerstoneAdapters;
const { Cornerstone3D } = adaptersSEG;

const { createCameraPositionSynchronizer, createVOISynchronizer } = synchronizers;

// Global variables
let renderingEngine;
const renderingEngineId = 'myRenderingEngine';
const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'; // Loader id which defines which volume loader to use
const ctVolumeName = 'CT_VOLUME_ID'; // Id of the volume less loader prefix
const ctVolumeId = `${volumeLoaderScheme}:${ctVolumeName}`; // VolumeId with loader id + volume id
const ptVolumeName = 'PT_VOLUME_ID';
const ptVolumeId = `${volumeLoaderScheme}:${ptVolumeName}`;
const ctToolGroupId = 'CT_TOOLGROUP_ID';
const ptToolGroupId = 'PT_TOOLGROUP_ID';
const fusionToolGroupId = 'FUSION_TOOLGROUP_ID';
const threeDToolGroupId = '3D_TOOLGROUP_ID';
const segmentationId = "MY_SEGMENTATION_ID";
let activeSegmentationRepresentationUID;

let ctImageIds, ptImageIds, ctVolume, ptVolume;
let registrationMatrix = mat4.create();
let expandedElement = null; // To track which element is expanded
let opacity = 125;
let viewportColors, viewportReferenceLineControllable, viewportReferenceLineDraggableRotatable, viewportReferenceLineSlabThicknessControlsOn;
const elements: HTMLElement[] = [];
let threeDviewPort: HTMLElement;
let selectedElement : HTMLElement;
let is3DOpen = false;

// Color Map Section
const currentSelectColormapNames = ['', 'Greens'];

let selectedStudy;
let selectedPreset = "CT-Bone";

const axialCameraSynchronizerId = 'AXIAL_CAMERA_SYNCHRONIZER_ID';
const sagittalCameraSynchronizerId = 'SAGITTAL_CAMERA_SYNCHRONIZER_ID';
const coronalCameraSynchronizerId = 'CORONAL_CAMERA_SYNCHRONIZER_ID';
const ctVoiSynchronizerId = 'CT_VOI_SYNCHRONIZER_ID';
const ptVoiSynchronizerId = 'PT_VOI_SYNCHRONIZER_ID';
const fusionVoiSynchronizerId = 'FUSION_VOI_SYNCHRONIZER_ID';

let axialCameraPositionSynchronizer, sagittalCameraPositionSynchronizer, coronalCameraPositionSynchronizer;
let ctVoiSynchronizer, ptVoiSynchronizer, fusionVoiSynchronizer;

const viewportIds = {
  CT: { AXIAL: 'CT1_AXIAL', SAGITTAL: 'CT1_SAGITTAL', CORONAL: 'CT1_CORONAL' },
  PT: { AXIAL: 'CT2_AXIAL', SAGITTAL: 'CT2_SAGITTAL', CORONAL: 'CT2_CORONAL' },
  FUSION: { AXIAL: 'FUSION_AXIAL', SAGITTAL: 'FUSION_SAGITTAL', CORONAL: 'FUSION_CORONAL'},
  THREED: '3D_VIEWPORT',
};

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
  switch (toolName) {
    case WindowLevelTool.toolName:
      [ctToolGroupId, ptToolGroupId, fusionToolGroupId].forEach((toolGroupId) => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
        toolGroup.setToolPassive(CrosshairsTool.toolName);
        toolGroup.setToolActive(WindowLevelTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        });
      });
      toggleSelectTool(toolName)
      break;
    case CrosshairsTool.toolName:
      [ctToolGroupId, ptToolGroupId, fusionToolGroupId].forEach((toolGroupId) => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
        toolGroup.setToolDisabled(WindowLevelTool.toolName);
        toolGroup.setToolActive(CrosshairsTool.toolName, {
          bindings: [{ mouseButton: MouseBindings.Primary }],
        });
      });
      toggleSelectTool(toolName)
      break;
    case LengthTool.toolName:
    case HeightTool.toolName:
    case AngleTool.toolName:
    case EraserTool.toolName:
      const measureTools = [LengthTool.toolName,HeightTool.toolName,AngleTool.toolName,EraserTool.toolName];
      measureTools.indexOf(toolName) !== -1 && measureTools.splice(measureTools.indexOf(toolName), 1); // remove tool name from the list

      [ctToolGroupId, ptToolGroupId, fusionToolGroupId].forEach((toolGroupId) => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
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
      });
      toggleSelectTool('MeasureTool')
      break;
    default:
      break;
  }
}
async function select3DView(){
  const wholeContent = document.getElementById('whole-content');
  const button3D = document.getElementById('button-3d');
  if(is3DOpen){
    wholeContent.style.gridTemplateColumns = wholeContent.dataset.gridTemplateColumns;
    threeDviewPort.hidden = true;
    is3DOpen=false;
    button3D.dataset.isSelected='false'
  }
  else if(selectedElement!=null){
    var viewedViewport=getViewPortByElement(selectedElement.id);
    if(viewedViewport==ViewportTypeEnum.CTVIEWPORT|| viewedViewport ==ViewportTypeEnum.FUSIONVIEWPORT){
      await load3DVolume(ctVolumeId);
    }
    if(getViewPortByElement(selectedElement.id)==ViewportTypeEnum.PTVIEWPORT){
      await load3DVolume(ptVolumeId);
    }
    button3D.dataset.isSelected='true'
    wholeContent.dataset.gridTemplateColumns = wholeContent.style.gridTemplateColumns;
    wholeContent.style.gridTemplateColumns = "1fr 350px";
    threeDviewPort.hidden = false;
    is3DOpen=true;
  }
}
function on3DPresetChange(newPreset: string){
  selectedPreset = newPreset;
  const threeD = renderingEngine.getViewport(viewportIds.THREED);
  threeD.setProperties({
    preset: selectedPreset,
  });
  threeD.render();
}
async function load3DVolume(volumeId){
  await setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId: volumeId,
      },
    ],
    [viewportIds.THREED]
  );
  let threeD = renderingEngine.getViewport(viewportIds.THREED);
  threeD.setProperties({
    preset: selectedPreset,
  });
  threeD.render();
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
function initRightToolBar(){
  addSliderToToolbar({
    title: 'opacity',
    id: 'slider-opacity',
    step: 1,
    range: [0, 255],
    defaultValue: opacity,
    onSelectedValueChange: (value) => {
      opacity = Number(value) / 255;
      const axialFusionViewport = renderingEngine.getViewport(viewportIds.FUSION.AXIAL);
      const coronalFusionViewport = renderingEngine.getViewport(viewportIds.FUSION.CORONAL);
      const sagittalFusionViewport = renderingEngine.getViewport(viewportIds.FUSION.SAGITTAL);
      const properties = {
        colormap: {
          opacity: opacity,  // Applying the opacity uniformly
        },
      };
      axialFusionViewport.setProperties(properties, ptVolumeId);
      coronalFusionViewport.setProperties(properties, ptVolumeId);
      sagittalFusionViewport.setProperties(properties, ptVolumeId);
      renderingEngine.render();
    },
  });
  loadColorMapTool(onColorSelection);
  load3DTool(select3DView,on3DPresetChange)

  loadLabelMapTool(onSelectLabelMap);
}
async function onSelectLabelMap(){
  const contourButton = document.getElementById("button-labelmap");
  if(contourButton.dataset.isSelected=='true'){
    await cornerstoneTools.segmentation.removeSegmentationsFromToolGroup(ctToolGroupId, [activeSegmentationRepresentationUID]);
    contourButton.dataset.isSelected='false';
    renderingEngine.render();
    return
  }
  const [segmentationRepresentationUID] =
   await cornerstoneTools.segmentation.addSegmentationRepresentations(ctToolGroupId, [
    {
      segmentationId,
      type: csToolsEnums.SegmentationRepresentations.Labelmap
    }
  ]);
  activeSegmentationRepresentationUID = segmentationRepresentationUID;
  contourButton.dataset.isSelected='true';
}

function initViewPort(){
  const viewportGrid = createDivElement({id:'master-viewport-grid'})
  const wholeContent = document.getElementById('whole-content');
  const content = document.getElementById('content');
  content.style.display = 'row';
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      const element = createDivElement({id:`viewport${(row - 1) * 3 + col}`})
      element.style.gridColumnStart = String(col);
      element.style.gridRowStart = String(row);
      element.oncontextmenu = (e) => e.preventDefault();
      element.ondblclick = () => toggleViewportSize(element);
      element.onclick = () => selectGridElement(element);
      elements.push(element);
      viewportGrid.appendChild(element);
      resizeObserver.observe(element);
    }    
  }
  content.appendChild(viewportGrid);

  threeDviewPort = createDivElement({id:'viewport-3d'});
  threeDviewPort.hidden = true;
  threeDviewPort.oncontextmenu = (e) => e.preventDefault();
  threeDviewPort.onclick= ()=> selectGridElement(threeDviewPort);
  resizeObserver.observe(threeDviewPort);
  wholeContent.appendChild(threeDviewPort);

  viewportColors = {
    [viewportIds.CT.AXIAL]: 'rgb(200, 0, 0)',
    [viewportIds.CT.SAGITTAL]: 'rgb(200, 200, 0)',
    [viewportIds.CT.CORONAL]: 'rgb(0, 200, 0)',
    [viewportIds.PT.AXIAL]: 'rgb(200, 0, 0)',
    [viewportIds.PT.SAGITTAL]: 'rgb(200, 200, 0)',
    [viewportIds.PT.CORONAL]: 'rgb(0, 200, 0)',
    [viewportIds.FUSION.AXIAL]: 'rgb(200, 0, 0)',
    [viewportIds.FUSION.SAGITTAL]: 'rgb(200, 200, 0)',
    [viewportIds.FUSION.CORONAL]: 'rgb(0, 200, 0)',
  };

  viewportReferenceLineControllable = [
    viewportIds.CT.AXIAL,
    viewportIds.CT.SAGITTAL,
    viewportIds.CT.CORONAL,
    viewportIds.PT.AXIAL,
    viewportIds.PT.SAGITTAL,
    viewportIds.PT.CORONAL,
    viewportIds.FUSION.AXIAL,
    viewportIds.FUSION.SAGITTAL,
    viewportIds.FUSION.CORONAL,
  ];

  viewportReferenceLineDraggableRotatable = [
    viewportIds.CT.AXIAL,
    viewportIds.CT.SAGITTAL,
    viewportIds.CT.CORONAL,
    viewportIds.PT.AXIAL,
    viewportIds.PT.SAGITTAL,
    viewportIds.PT.CORONAL,
    viewportIds.FUSION.AXIAL,
    viewportIds.FUSION.SAGITTAL,
    viewportIds.FUSION.CORONAL,
  ];

  viewportReferenceLineSlabThicknessControlsOn = [
    viewportIds.CT.AXIAL,
    viewportIds.CT.SAGITTAL,
    viewportIds.CT.CORONAL,
    viewportIds.PT.AXIAL,
    viewportIds.PT.SAGITTAL,
    viewportIds.PT.CORONAL,
    viewportIds.FUSION.AXIAL,
    viewportIds.FUSION.SAGITTAL,
    viewportIds.FUSION.CORONAL,
  ];
}

function toggleViewportSize(element: HTMLElement) {
  if(expandedElement==element){
    element.style.gridColumn = '';
    element.style.gridRow = '';
    element.style.gridColumn = element.dataset.originalGridColumnStart || '';
    element.style.gridRow = element.dataset.originalGridRowStart || '';
    element.style.zIndex = '';  // Reset z-index
    expandedElement = null;
  }else{
    if (expandedElement) {
      expandedElement.style.gridColumn = '';
      expandedElement.style.gridRow = '';
      element.style.zIndex = '';  // Reset z-index
    }
    if (!element.dataset.originalGridColumn) {
      element.dataset.originalGridColumnStart = element.style.gridColumnStart;
      element.dataset.originalGridRowStart = element.style.gridRowStart;
    }
    // Expand the clicked element to span all rows and columns
    element.style.gridColumn = '1 / 4';  // Span all 3 columns
    element.style.gridRow = '1 / 4';  // Span all 3 rows\
    element.style.zIndex = '10';
    element.style.width = '100%';  // Ensure it takes full width
    element.style.height = '100%';
    expandedElement = element;
  }
  const renderEngine = getRenderingEngine(renderingEngineId);
  renderEngine.resize(true);
}

function selectGridElement(element :HTMLElement){
  if(selectedElement){
    selectedElement.dataset.isSelected= 'false';
  }
  selectedElement = element;
  selectedElement.dataset.isSelected= 'true';
  let viewPortSelect = getViewPortByElement(element.id);
  if(viewPortSelect==ViewportTypeEnum.CTVIEWPORT){
    setColorMapSelect(currentSelectColormapNames[ViewportTypeEnum.CTVIEWPORT]);
  }
  if(viewPortSelect==ViewportTypeEnum.PTVIEWPORT){
    setColorMapSelect(currentSelectColormapNames[ViewportTypeEnum.PTVIEWPORT])
  }
}

function getReferenceLineColor(viewportId) {
  return viewportColors[viewportId];
}

function getReferenceLineControllable(viewportId) {
  const index = viewportReferenceLineControllable.indexOf(viewportId);
  return index !== -1;
}

function getReferenceLineDraggableRotatable(viewportId) {
  const index = viewportReferenceLineDraggableRotatable.indexOf(viewportId);
  return index !== -1;
}

function getReferenceLineSlabThicknessControlsOn(viewportId) {
  const index =
    viewportReferenceLineSlabThicknessControlsOn.indexOf(viewportId);
  return index !== -1;
}

function setUpToolGroups() {
  // Add tools to Cornerstone3D
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(PanTool);
  cornerstoneTools.addTool(ZoomTool);
  cornerstoneTools.addTool(StackScrollMouseWheelTool);
  cornerstoneTools.addTool(VolumeRotateMouseWheelTool);
  cornerstoneTools.addTool(CrosshairsTool);
  cornerstoneTools.addTool(TrackballRotateTool);
  cornerstoneTools.addTool(LengthTool);
  cornerstoneTools.addTool(AngleTool);
  cornerstoneTools.addTool(HeightTool);
  cornerstoneTools.addTool(EraserTool);
  cornerstoneTools.addTool(SegmentationDisplayTool);
  // Define tool groups for the main 9 viewports.
  // Crosshairs currently only supports 3 viewports for a toolgroup due to the
  // way it is constructed, but its configuration input allows us to synchronize
  // multiple sets of 3 viewports.
  const ctToolGroup = ToolGroupManager.createToolGroup(ctToolGroupId);
  const ptToolGroup = ToolGroupManager.createToolGroup(ptToolGroupId);
  const fusionToolGroup = ToolGroupManager.createToolGroup(fusionToolGroupId);
  const threeDToolGRoup = ToolGroupManager.createToolGroup(threeDToolGroupId);
  ctToolGroup.addViewport(viewportIds.CT.AXIAL, renderingEngineId);
  ctToolGroup.addViewport(viewportIds.CT.SAGITTAL, renderingEngineId);
  ctToolGroup.addViewport(viewportIds.CT.CORONAL, renderingEngineId);
  ptToolGroup.addViewport(viewportIds.PT.AXIAL, renderingEngineId);
  ptToolGroup.addViewport(viewportIds.PT.SAGITTAL, renderingEngineId);
  ptToolGroup.addViewport(viewportIds.PT.CORONAL, renderingEngineId);
  fusionToolGroup.addViewport(viewportIds.FUSION.AXIAL, renderingEngineId);
  fusionToolGroup.addViewport(viewportIds.FUSION.SAGITTAL, renderingEngineId);
  fusionToolGroup.addViewport(viewportIds.FUSION.CORONAL, renderingEngineId);
  threeDToolGRoup.addViewport(viewportIds.THREED,renderingEngineId);

  // Manipulation Tools
  [ctToolGroup, ptToolGroup].forEach((toolGroup) => {
    toolGroup.addTool(PanTool.toolName);
    toolGroup.addTool(ZoomTool.toolName);
    toolGroup.addTool(StackScrollMouseWheelTool.toolName);
    toolGroup.addTool(LengthTool.toolName);
    toolGroup.addTool(AngleTool.toolName);
    toolGroup.addTool(HeightTool.toolName);
    toolGroup.addTool(EraserTool.toolName);
    toolGroup.addTool(CrosshairsTool.toolName, {
      getReferenceLineColor,
      getReferenceLineControllable,
      getReferenceLineDraggableRotatable,
      getReferenceLineSlabThicknessControlsOn,
    });
  });

  // Config tool for 3D viewport tool group
  threeDToolGRoup.addTool(PanTool.toolName);
  threeDToolGRoup.addTool(ZoomTool.toolName);
  threeDToolGRoup.addTool(StackScrollMouseWheelTool.toolName);
  threeDToolGRoup.addTool(TrackballRotateTool.toolName);
  threeDToolGRoup.setToolActive(TrackballRotateTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Primary,
      },
    ],
  })
  threeDToolGRoup.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary, // Middle Click
      },
    ],
  });
  threeDToolGRoup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  });

  fusionToolGroup.addTool(PanTool.toolName);
  fusionToolGroup.addTool(ZoomTool.toolName);
  fusionToolGroup.addTool(StackScrollMouseWheelTool.toolName);
  fusionToolGroup.addTool(LengthTool.toolName);
  fusionToolGroup.addTool(AngleTool.toolName);
  fusionToolGroup.addTool(HeightTool.toolName);
  fusionToolGroup.addTool(EraserTool.toolName);
  fusionToolGroup.addTool(CrosshairsTool.toolName, {
    getReferenceLineColor,
    getReferenceLineControllable,
    getReferenceLineDraggableRotatable,
    getReferenceLineSlabThicknessControlsOn,
    // Only set CT volume to MIP in the fusion viewport
    filterActorUIDsToSetSlabThickness: [ctVolumeId],
  });

  // Here is the difference in the toolGroups used, that we need to specify the
  // volume to use for the WindowLevelTool for the fusion viewports
  ctToolGroup.addTool(WindowLevelTool.toolName);
  ptToolGroup.addTool(WindowLevelTool.toolName);
  ctToolGroup.addTool(SegmentationDisplayTool.toolName);
  ctToolGroup.setToolEnabled(SegmentationDisplayTool.toolName);

  fusionToolGroup.addTool(WindowLevelTool.toolName);

  [ctToolGroup, ptToolGroup, fusionToolGroup].forEach((toolGroup) => {
    // toolGroup.setToolActive(WindowLevelTool.toolName, {
    //   bindings: [
    //     {
    //       mouseButton: MouseBindings.Primary, // Left Click
    //     },
    //   ],
    // });
    toolGroup.setToolActive(PanTool.toolName, {
      bindings: [
        {
          mouseButton: MouseBindings.Auxiliary, // Middle Click
        },
      ],
    });
    toolGroup.setToolActive(ZoomTool.toolName, {
      bindings: [
        {
          mouseButton: MouseBindings.Secondary, // Right Click
        },
      ],
    });

    toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
    toolGroup.setToolPassive(CrosshairsTool.toolName);
  });
}

function setUpSynchronizers() {
  axialCameraPositionSynchronizer = createCameraPositionSynchronizer(
    axialCameraSynchronizerId
  );
  sagittalCameraPositionSynchronizer = createCameraPositionSynchronizer(
    sagittalCameraSynchronizerId
  );
  coronalCameraPositionSynchronizer = createCameraPositionSynchronizer(
    coronalCameraSynchronizerId
  );
  ctVoiSynchronizer = createVOISynchronizer(ctVoiSynchronizerId, {
    syncInvertState: false,
    syncColormap: false,
  });
  ptVoiSynchronizer = createVOISynchronizer(ptVoiSynchronizerId, {
    syncInvertState: false,
    syncColormap: false,
  });
  fusionVoiSynchronizer = createVOISynchronizer(fusionVoiSynchronizerId, {
    syncInvertState: false,
    syncColormap: false,
  });
  // Add viewports to camera synchronizers
  [
    viewportIds.CT.AXIAL,
    viewportIds.PT.AXIAL,
    viewportIds.FUSION.AXIAL,
  ].forEach((viewportId) => {
    axialCameraPositionSynchronizer.add({
      renderingEngineId,
      viewportId,
    });
  });
  [
    viewportIds.CT.SAGITTAL,
    viewportIds.PT.SAGITTAL,
    viewportIds.FUSION.SAGITTAL,
  ].forEach((viewportId) => {
    sagittalCameraPositionSynchronizer.add({
      renderingEngineId,
      viewportId,
    });
  });
  [
    viewportIds.CT.CORONAL,
    viewportIds.PT.CORONAL,
    viewportIds.FUSION.CORONAL,
  ].forEach((viewportId) => {
    coronalCameraPositionSynchronizer.add({
      renderingEngineId,
      viewportId,
    });
  });
  // Add viewports to VOI synchronizers
  [
    viewportIds.CT.AXIAL,
    viewportIds.CT.SAGITTAL,
    viewportIds.CT.CORONAL,
  ].forEach((viewportId) => {
    ctVoiSynchronizer.add({
      renderingEngineId,
      viewportId,
    });
  });
  [
    viewportIds.PT.AXIAL,
    viewportIds.PT.SAGITTAL,
    viewportIds.PT.CORONAL,
  ].forEach((viewportId) => {
    ptVoiSynchronizer.add({
      renderingEngineId,
      viewportId,
    });
  });
  [
    viewportIds.FUSION.AXIAL,
    viewportIds.FUSION.SAGITTAL,
    viewportIds.FUSION.CORONAL,
  ].forEach((viewportId) => {
    fusionVoiSynchronizer.add({
      renderingEngineId,
      viewportId,
    });
    ctVoiSynchronizer.addTarget({
      renderingEngineId,
      viewportId,
    });
    ptVoiSynchronizer.addTarget({
      renderingEngineId,
      viewportId,
    });
  });
}

async function setUpDisplay() {
  // Create the viewports
  const viewportInputArray = [
    {
      viewportId: viewportIds.CT.AXIAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[0],
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    },
    {
      viewportId: viewportIds.CT.SAGITTAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[1],
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
      },
    },
    {
      viewportId: viewportIds.CT.CORONAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[2],
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
      },
    },
    {
      viewportId: viewportIds.PT.AXIAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[3],
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    },
    {
      viewportId: viewportIds.PT.SAGITTAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[4],
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
      },
    },
    {
      viewportId: viewportIds.PT.CORONAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[5],
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
      },
    },
    {
      viewportId: viewportIds.FUSION.AXIAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[6],
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    },
    {
      viewportId: viewportIds.FUSION.SAGITTAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[7],
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
      },
    },
    {
      viewportId: viewportIds.FUSION.CORONAL,
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[8],
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
      },
    },
    {
      viewportId: viewportIds.THREED,
      type: ViewportType.VOLUME_3D,
      element: threeDviewPort,
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
      },
    },
  ];
  renderingEngine.setViewports(viewportInputArray);
}

async function setVolumesViewportsForStudy(){
  // Set the volumes to load
  ptVolume.load();
  ctVolume.load();
  // Set volumes on the viewports
  await setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId: ctVolumeId,
        callback: setCtTransferFunctionForVolumeActor,
      },
    ],
    [viewportIds.CT.AXIAL, viewportIds.CT.SAGITTAL, viewportIds.CT.CORONAL]
  );
  setViewportColormap([
    viewportIds.CT.AXIAL, viewportIds.CT.SAGITTAL, viewportIds.CT.CORONAL], 
    ctVolumeId, 
    currentSelectColormapNames[0],
    renderingEngineId,
  );
  await setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId: ptVolumeId,
        callback: setCtTransferFunctionForVolumeActor,
        matrix: registrationMatrix,
      },
    ],
    [viewportIds.PT.AXIAL, viewportIds.PT.SAGITTAL, viewportIds.PT.CORONAL]
  );
  setViewportColormap([
    viewportIds.PT.AXIAL, viewportIds.PT.SAGITTAL, viewportIds.PT.CORONAL],
    ptVolumeId,
    currentSelectColormapNames[1],
    renderingEngineId
  );
  await setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId: ctVolumeId,
        callback: setCtTransferFunctionForVolumeActor,
      },
      {
        volumeId: ptVolumeId,
        callback: setCtTransferFunctionForVolumeActor,
        matrix: registrationMatrix,
      },
    ],
    [
      viewportIds.FUSION.AXIAL,
      viewportIds.FUSION.SAGITTAL,
      viewportIds.FUSION.CORONAL,
    ]
  );
  renderingEngine.getViewport(viewportIds.FUSION.AXIAL).setBlendMode(BlendModes.AVERAGE_INTENSITY_BLEND);
  renderingEngine.getViewport(viewportIds.FUSION.CORONAL).setBlendMode(BlendModes.AVERAGE_INTENSITY_BLEND);
  renderingEngine.getViewport(viewportIds.FUSION.SAGITTAL).setBlendMode(BlendModes.AVERAGE_INTENSITY_BLEND);
  setViewportColormap([
    viewportIds.FUSION.AXIAL,
    viewportIds.FUSION.SAGITTAL,
    viewportIds.FUSION.CORONAL],
    ctVolumeId, currentSelectColormapNames[0],
    renderingEngineId
  );
  setViewportColormap([
    viewportIds.FUSION.AXIAL,
    viewportIds.FUSION.SAGITTAL,
    viewportIds.FUSION.CORONAL,], ptVolumeId, currentSelectColormapNames[1],
    renderingEngineId
);
  initializeCameraSync(renderingEngine);
  renderingEngine.render();
}

function initializeCameraSync(renderingEngine) {
  // The fusion scene is the target as it is scaled to both volumes.
  // TODO -> We should have a more generic way to do this,
  // So that when all data is added we can synchronize zoom/position before interaction.
  const axialCtViewport = renderingEngine.getViewport(viewportIds.CT.AXIAL);
  const sagittalCtViewport = renderingEngine.getViewport(viewportIds.CT.SAGITTAL);
  const coronalCtViewport = renderingEngine.getViewport(viewportIds.CT.CORONAL);
  const axialPtViewport = renderingEngine.getViewport(viewportIds.PT.AXIAL);
  const sagittalPtViewport = renderingEngine.getViewport(viewportIds.PT.SAGITTAL);
  const coronalPtViewport = renderingEngine.getViewport(viewportIds.PT.CORONAL);

  const axialFusionViewport = renderingEngine.getViewport(viewportIds.FUSION.AXIAL);
  const sagittalFusionViewport = renderingEngine.getViewport(viewportIds.FUSION.SAGITTAL);
  const coronalFusionViewport = renderingEngine.getViewport(viewportIds.FUSION.CORONAL);
  
  initCameraSynchronization(axialFusionViewport, axialCtViewport);
  initCameraSynchronization(axialFusionViewport, axialPtViewport);
  initCameraSynchronization(sagittalFusionViewport, sagittalCtViewport);
  initCameraSynchronization(sagittalFusionViewport, sagittalPtViewport);
  initCameraSynchronization(coronalFusionViewport, coronalCtViewport);
  initCameraSynchronization(coronalFusionViewport, coronalPtViewport);

  renderingEngine.render();
}

function initCameraSynchronization(sViewport, tViewport) {
  const camera = sViewport.getCamera();
  tViewport.setCamera(camera);
}

async function loadStudy(study){
  await cache.purgeVolumeCache();
  ctImageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID: study.CT1StudyInstanceUID,
    SeriesInstanceUID: study.CT1SeriesInstanceUID,
    wadoRsRoot: study.wadoRsRoot,});
  ptImageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID: study.CT2StudyInstanceUID,
    SeriesInstanceUID: study.CT2SeriesInstanceUID,
    wadoRsRoot: study.wadoRsRoot,
  });
  registrationMatrix = await readDicomRegData({
    StudyInstanceUID: study.CT2StudyInstanceUID,
    SeriesInstanceUID: study.CT2RegSeriesInstanceUID,
    wadoRsRoot:study.wadoRsRoot,
  });
  ctVolume = await volumeLoader.createAndCacheVolume(ctVolumeId, {
    imageIds: ctImageIds,
  });
  // Define a volume in memory
  ptVolume = await volumeLoader.createAndCacheVolume(ptVolumeId, {
    imageIds: ptImageIds,
  });
  await setVolumesViewportsForStudy();
  fetchSegmentation();

}

function onColorSelection(colorValue){
  if(selectedElement!=null){
    const selectedViewPort = getViewPortByElement(selectedElement.id);
    if(selectedViewPort==ViewportTypeEnum.CTVIEWPORT){
      setViewportColormap([viewportIds.CT.AXIAL, viewportIds.CT.SAGITTAL, viewportIds.CT.CORONAL,viewportIds.FUSION.AXIAL, viewportIds.FUSION.SAGITTAL, viewportIds.FUSION.CORONAL], 
        ctVolumeId, 
        colorValue,
        renderingEngineId
      );
      currentSelectColormapNames[ViewportTypeEnum.CTVIEWPORT] = colorValue;
    } else
    if(selectedViewPort==ViewportTypeEnum.PTVIEWPORT){
      setViewportColormap([viewportIds.PT.AXIAL, viewportIds.PT.SAGITTAL, viewportIds.PT.CORONAL,viewportIds.FUSION.AXIAL, viewportIds.FUSION.SAGITTAL, viewportIds.FUSION.CORONAL], 
        ptVolumeId, 
        colorValue,
        renderingEngineId,
      );
      currentSelectColormapNames[ViewportTypeEnum.PTVIEWPORT] = colorValue;
    }
  }
}
// set color for viewport


function onStudySelect(index: number){
  if(index>=studyList.length)
    return;
  selectedStudy = studyList[index];
  selectStudy(index);
  loadStudy(selectedStudy);
}

async function checkValidPatientID():Promise<boolean>{
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('patientId');
  const allowedPatientId = await getAllowedPatientId();
  const seriesLink = document.getElementById('seriePage');
  seriesLink.setAttribute('href', `seriePage?patientId=${patientId}`);
  return patientId==allowedPatientId;
}

async function fetchSegmentation() {
  if (!ctVolumeId) {
    return;
  }
  const url = selectedStudy.wadoRsRoot as string;
  const client = new api.DICOMwebClient({
    url: url,
    singlepart: false
  });
  const arrayBuffer = await client.retrieveInstance({
    studyInstanceUID: selectedStudy.CT1SEG.StudyInstanceUID,
    seriesInstanceUID: selectedStudy.CT1SEG.SeriesInstanceUID,
    sopInstanceUID: selectedStudy.CT1SEG.SOPInstanceUID,
  });
  await loadSegmentation(arrayBuffer);
}

async function loadSegmentation(arrayBuffer: ArrayBuffer) {
  const generateToolState =
    await Cornerstone3D.Segmentation.generateToolState(
      ctImageIds,
      arrayBuffer,
      metaData
    );

  const derivedVolume = await addSegmentationsToState(segmentationId);
  const derivedVolumeScalarData = derivedVolume.getScalarData();
  derivedVolumeScalarData.set(
    new Uint8Array(generateToolState.labelmapBufferArray[0])
  );
}

async function addSegmentationsToState(segmentationId: string) {
  const derivedVolume =
    await volumeLoader.createAndCacheDerivedSegmentationVolume(ctVolumeId, {
      volumeId: segmentationId
    });
  cornerstoneTools.segmentation.addSegmentations([
    {
      segmentationId,
      representation: {
        type: csToolsEnums.SegmentationRepresentations.Labelmap,
        data: {
          volumeId: segmentationId
        }
      }
    }
  ]);
  return derivedVolume;
}

async function run() {
  if(await checkValidPatientID()){
      // Init Cornerstone and related libraries
  await initDemo();
  setUseSharedArrayBuffer(false);
  initToolBar();
  initViewPort();
  loadPatientInfo(patientInfo)
  setStudyListView(studyList, onStudySelect);
  // initial study
  selectedStudy = studyList[0];
  selectStudy(0);
  // Instantiate a rendering engine
  renderingEngine = new RenderingEngine(renderingEngineId);
  // Get Cornerstone imageIds and fetch metadata into RAM
  await setUpDisplay();
  await loadStudy(selectedStudy);
  // Tools and synchronizers can be set up in any order.
  setUpToolGroups();
  setUpSynchronizers();
  selectGridElement(elements[0]);
  onSelectTool(WindowLevelTool.toolName);
  }
}
run();
document.getElementById('measure-select-button').addEventListener('click', function() {
  const dropdownOptions = document.getElementById('measure-select');
  dropdownOptions.classList.toggle('show');
});
document.getElementById('colormap-select-button').addEventListener('click', function() {
  const dropdownOptions = document.getElementById('colormap-select');
  dropdownOptions.classList.toggle('show');
});
document.getElementById('button-3d-dropdown').addEventListener('click', function() {
  const dropdownOptions = document.getElementById('button-3d-select');
  dropdownOptions.classList.toggle('show');
});
