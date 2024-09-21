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
  addDropdownToToolbar,
  addSliderToToolbar,
  readDicomRegData,
} from './utils/demo/helpers';
import * as cornerstoneTools from '@cornerstonejs/tools';
import { mat4 } from 'gl-matrix';
import vtkColormaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';

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
} = cornerstoneTools;

const { MouseBindings } = csToolsEnums;
const { ViewportType, BlendModes } = Enums;

const { createCameraPositionSynchronizer, createVOISynchronizer } =
  synchronizers;

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

const ViewportTypeEnum = {
  CTVIEWPORT: 0,
  PTVIEWPORT: 1,
  FUSIONVIEWPORT: 2,
  THREEDVIEWPORT: 4,
}
let ctImageIds, ptImageIds, ctVolume, ptVolume;
let registrationMatrix = mat4.create();
let expandedElement = null; // To track which element is expanded
let opacity = 125;
let viewportColors, viewportReferenceLineControllable, viewportReferenceLineDraggableRotatable, viewportReferenceLineSlabThicknessControlsOn;
let elements;
let threeDviewPort: HTMLElement;
let selectedElement : HTMLElement;
let is3DOpen = false;

// Color Map Section
let colorMaps = [];
const currentSelectColormapNames = ['Grayscale', 'Black-Body Radiation'];
let colorMapSelect : HTMLSelectElement;

let selectedStudy;
let studyList = [
{
  wadoRsRoot: 'http://127.0.0.1:800/dicom-web',
  CT1StudyInstanceUID: '1.2.156.112736.1.2.2.1097583607.12296.1695818166.610',
  CT1SeriesInstanceUID: '1.2.840.113729.1.4237.9996.2023.9.15.17.48.36.250.10076',
  CT1Date: '02/24/2024 10:05 AM',
  CT2StudyInstanceUID: '1.2.156.112736.1.2.2.1279709348.4668.1704737711.457',
  CT2SeriesInstanceUID: '1.2.156.112736.1.3.2.1279709348.4668.1704737828.462',
  CT2Date: '02/29/2024 01:15 PM',
  CT2RegSeriesInstanceUID:'1.2.156.112736.1.3.2.1279709348.4668.1704737855.630',
},
{
  wadoRsRoot: 'http://127.0.0.1:800/dicom-web',
  CT1StudyInstanceUID: '1.2.156.112736.1.2.2.1097583607.12296.1695818166.610',
  CT1SeriesInstanceUID: '1.2.840.113729.1.4237.9996.2023.9.15.17.48.36.250.10076',
  CT1Date: '02/24/2024 10:05 AM',
  CT2StudyInstanceUID: '1.2.156.112736.1.2.2.1279709348.4668.1704737390.276',
  CT2SeriesInstanceUID: '1.2.156.112736.1.3.2.1279709348.4668.1704737485.281',
  CT2Date: '03/07/2024 10:26 AM',
  CT2RegSeriesInstanceUID:'1.2.156.112736.1.3.2.1279709348.4668.1704737512.449',
}
]

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

const optionsValues = [WindowLevelTool.toolName, CrosshairsTool.toolName];

const resizeObserver = new ResizeObserver(() => {
  renderingEngine = getRenderingEngine(renderingEngineId);
  if (renderingEngine) {
    renderingEngine.resize(true, false);
  }
});


function initToolBar(){
  addDropdownToToolbar({
    options: { values: optionsValues, defaultValue: WindowLevelTool.toolName },
    id: 'select-toolbar',
    onSelectedValueChange: (toolNameAsStringOrNumber) => {
      const toolName = String(toolNameAsStringOrNumber);

      [ctToolGroupId, ptToolGroupId, fusionToolGroupId].forEach((toolGroupId) => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

        // Set the other tools disabled so we don't get conflicts.
        // Note we only strictly need to change the one which is currently active.

        if (toolName === WindowLevelTool.toolName) {
          // Set crosshairs passive so they are still interactable
          toolGroup.setToolPassive(CrosshairsTool.toolName);
          toolGroup.setToolActive(WindowLevelTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Primary }],
          });
        } else {
          toolGroup.setToolDisabled(WindowLevelTool.toolName);
          toolGroup.setToolActive(CrosshairsTool.toolName, {
            bindings: [{ mouseButton: MouseBindings.Primary }],
          });
        }
      });
    },
  });
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
  loadColorMapTool();
  addButtonToToolbar({
    title: '3D View',
    id: 'button-3d',
    onClick: () => {
      open3DView();
    },
  });
}

async function open3DView(){
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
    preset: 'CT-Bone',
  });
  threeD.render();
}
function initViewPort(){
  const viewportGrid = document.createElement('div');
  viewportGrid.id = 'master-viewport-grid';

  const wholeContent = document.getElementById('whole-content');
  const content = document.getElementById('content');
  content.style.display = 'row';
  const element1_1 = document.createElement('div');
  const element1_2 = document.createElement('div');
  const element1_3 = document.createElement('div');
  const element2_1 = document.createElement('div');
  const element2_2 = document.createElement('div');
  const element2_3 = document.createElement('div');
  const element3_1 = document.createElement('div');
  const element3_2 = document.createElement('div');
  const element3_3 = document.createElement('div');
  // 3D view element only
  threeDviewPort = document.createElement('div');
  // Place main 3x3 viewports
  element1_1.style.gridColumnStart = '1';
  element1_1.style.gridRowStart = '1';
  element1_2.style.gridColumnStart = '2';
  element1_2.style.gridRowStart = '1';
  element1_3.style.gridColumnStart = '3';
  element1_3.style.gridRowStart = '1';
  element2_1.style.gridColumnStart = '1';
  element2_1.style.gridRowStart = '2';
  element2_2.style.gridColumnStart = '2';
  element2_2.style.gridRowStart = '2';
  element2_3.style.gridColumnStart = '3';
  element2_3.style.gridRowStart = '2';
  element3_1.style.gridColumnStart = '1';
  element3_1.style.gridRowStart = '3';
  element3_2.style.gridColumnStart = '2';
  element3_2.style.gridRowStart = '3';
  element3_3.style.gridColumnStart = '3';
  element3_3.style.gridRowStart = '3';

  elements = [
    element1_1,
    element1_2,
    element1_3,
    element2_1,
    element2_2,
    element2_3,
    element3_1,
    element3_2,
    element3_3,
  ];

  for(let elementIndex = 0; elementIndex<elements.length; elementIndex++){
    const element = elements[elementIndex];
    element.id = `viewport${elementIndex}`;
    element.oncontextmenu = (e) => e.preventDefault();
    element.ondblclick = () => toggleViewportSize(element);
    element.onclick = () => selectGridElement(element);
    viewportGrid.appendChild(element);
    resizeObserver.observe(element);
  }
  content.appendChild(viewportGrid);
  threeDviewPort.id = 'viewport-3d';
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
      expandedElement.style.zIndex = '';  // Reset z-index
    }
    if (!element.dataset.originalGridColumn) {
      element.dataset.originalGridColumnStart = element.style.gridColumnStart;
      element.dataset.originalGridRowStart = element.style.gridRowStart;
    }
    // Expand the clicked element to span all rows and columns
    element.style.gridColumn = '1 / 4';  // Span all 3 columns
    element.style.gridRow = '1 / 4';  // Span all 3 rows
    element.style.zIndex = '1000';  // Bring the element to the front
    element.style.width = '100%';  // Ensure it takes full width
    element.style.height = '100%';
    expandedElement = element;
  }
  const renderEngine = getRenderingEngine(renderingEngineId);
  renderEngine.resize(true);
}


function getViewPortByElement(elementID: string){
  // Each viewport has a ID `viewport${index}`
  if(elementID=='viewport-3d'){
    return ViewportTypeEnum.THREEDVIEWPORT;
  }
  const viewportNumber = parseInt(elementID.charAt(elementID.length-1));

  if(viewportNumber<=2){
    /// it is CT viewport
    return ViewportTypeEnum.CTVIEWPORT;
  } else if(viewportNumber<=5){
    /// it is PT viewport
    return ViewportTypeEnum.PTVIEWPORT;
  }
  return ViewportTypeEnum.FUSIONVIEWPORT;
}

function selectGridElement(element :HTMLElement){
  if(selectedElement){
    selectedElement.dataset.isSelected= 'false';
  }
  selectedElement = element;
  selectedElement.dataset.isSelected= 'true';
  let viewPortSelect = getViewPortByElement(element.id);
  if(viewPortSelect==ViewportTypeEnum.CTVIEWPORT){
    colorMapSelect.value = currentSelectColormapNames[ViewportTypeEnum.CTVIEWPORT];
  }
  if(viewPortSelect==ViewportTypeEnum.PTVIEWPORT){
    colorMapSelect.value = currentSelectColormapNames[ViewportTypeEnum.PTVIEWPORT];
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
  cornerstoneTools.addTool(MIPJumpToClickTool);
  cornerstoneTools.addTool(VolumeRotateMouseWheelTool);
  cornerstoneTools.addTool(CrosshairsTool);
  cornerstoneTools.addTool(TrackballRotateTool);

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
  fusionToolGroup.addTool(WindowLevelTool.toolName);

  [ctToolGroup, ptToolGroup, fusionToolGroup].forEach((toolGroup) => {
    toolGroup.setToolActive(WindowLevelTool.toolName, {
      bindings: [
        {
          mouseButton: MouseBindings.Primary, // Left Click
        },
      ],
    });
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
  setViewportColormap([viewportIds.CT.AXIAL, viewportIds.CT.SAGITTAL, viewportIds.CT.CORONAL], ctVolumeId, currentSelectColormapNames[0]);

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
  setViewportColormap([viewportIds.PT.AXIAL, viewportIds.PT.SAGITTAL, viewportIds.PT.CORONAL], ptVolumeId, currentSelectColormapNames[1]);

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
    viewportIds.FUSION.CORONAL,
  ], ctVolumeId, currentSelectColormapNames[0]);
  setViewportColormap([
    viewportIds.FUSION.AXIAL,
    viewportIds.FUSION.SAGITTAL,
    viewportIds.FUSION.CORONAL,
  ], ptVolumeId, currentSelectColormapNames[1]);
  initializeCameraSync(renderingEngine);
  renderingEngine.render();
}

function initializeCameraSync(renderingEngine) {
  // The fusion scene is the target as it is scaled to both volumes.
  // TODO -> We should have a more generic way to do this,
  // So that when all data is added we can synchronize zoom/position before interaction.

  const axialCtViewport = renderingEngine.getViewport(viewportIds.CT.AXIAL);
  const sagittalCtViewport = renderingEngine.getViewport(
    viewportIds.CT.SAGITTAL
  );
  const coronalCtViewport = renderingEngine.getViewport(viewportIds.CT.CORONAL);

  const axialPtViewport = renderingEngine.getViewport(viewportIds.PT.AXIAL);
  const sagittalPtViewport = renderingEngine.getViewport(
    viewportIds.PT.SAGITTAL
  );
  const coronalPtViewport = renderingEngine.getViewport(viewportIds.PT.CORONAL);

  const axialFusionViewport = renderingEngine.getViewport(
    viewportIds.FUSION.AXIAL
  );
  const sagittalFusionViewport = renderingEngine.getViewport(
    viewportIds.FUSION.SAGITTAL
  );
  const coronalFusionViewport = renderingEngine.getViewport(
    viewportIds.FUSION.CORONAL
  );

  initCameraSynchronization(axialFusionViewport, axialCtViewport);
  initCameraSynchronization(axialFusionViewport, axialPtViewport);

  initCameraSynchronization(sagittalFusionViewport, sagittalCtViewport);
  initCameraSynchronization(sagittalFusionViewport, sagittalPtViewport);

  initCameraSynchronization(coronalFusionViewport, coronalCtViewport);
  initCameraSynchronization(coronalFusionViewport, coronalPtViewport);

  renderingEngine.render();
}

function initCameraSynchronization(sViewport, tViewport) {
  // Initialise the sync as they viewports will have
  // Different initial zoom levels for viewports of different sizes.

  const camera = sViewport.getCamera();

  tViewport.setCamera(camera);
}

async function loadStudy(study){
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
}

// Load Study List
function setStudyListView(){
  const studyListElement = document.getElementById('study-list');
  for (let index = 0; index < studyList.length; index++) {
    const study = studyList[index];
    var studyElement = document.createElement('li');
    studyElement.id = `study-item-${index}`
    studyElement.textContent = `${study.CT1Date} - ${study.CT2Date}`;
    studyElement.ondblclick = () => loadStudy(index);
    studyListElement.appendChild(studyElement)
  }
}

function onColorSelection(colorValue){
  if(selectedElement!=null){
    const selectedViewPort = getViewPortByElement(selectedElement.id);
    if(selectedViewPort==ViewportTypeEnum.CTVIEWPORT){
      setViewportColormap([viewportIds.CT.AXIAL, viewportIds.CT.SAGITTAL, viewportIds.CT.CORONAL,viewportIds.FUSION.AXIAL, viewportIds.FUSION.SAGITTAL, viewportIds.FUSION.CORONAL], ctVolumeId, colorValue);
      currentSelectColormapNames[ViewportTypeEnum.CTVIEWPORT] = colorValue;
    } else
    if(selectedViewPort==ViewportTypeEnum.PTVIEWPORT){
      setViewportColormap([viewportIds.PT.AXIAL, viewportIds.PT.SAGITTAL, viewportIds.PT.CORONAL,viewportIds.FUSION.AXIAL, viewportIds.FUSION.SAGITTAL, viewportIds.FUSION.CORONAL], ptVolumeId, colorValue);
      currentSelectColormapNames[ViewportTypeEnum.PTVIEWPORT] = colorValue;
    }
  }
}
// set color for viewport
function setViewportColormap(viewportIds : string[], volumeId, colormapName) {
  const renderingEngine = getRenderingEngine(renderingEngineId);
  viewportIds.forEach(vpId => {
    const viewport = <Types.IVolumeViewport>(
      renderingEngine.getViewport(vpId)
    );
    viewport.setProperties({ colormap: { name: colormapName } }, volumeId);
    viewport.render();
  });

}
// Load Color Map tool
function loadColorMapTool(){
  colorMaps = vtkColormaps.rgbPresetNames.map((presetName) =>
    vtkColormaps.getPresetByName(presetName));
    
  colorMapSelect = document.getElementById('colormap-select') as HTMLSelectElement;
  colorMaps.forEach(element => {
    var option =  document.createElement('option');
    option.text = element.Name;
    option.value =element.Name;
    colorMapSelect.appendChild(option);
  });
  colorMapSelect.onchange = function() {
    onColorSelection(colorMapSelect.value);
  };
}

async function run() {
  // Init Cornerstone and related libraries
  await initDemo();
  setUseSharedArrayBuffer(true);
  initToolBar();
  initViewPort();
  setStudyListView();
  // Instantiate a rendering engine
  renderingEngine = new RenderingEngine(renderingEngineId);
  // Get Cornerstone imageIds and fetch metadata into RAM
  await setUpDisplay();
  selectedStudy = studyList[0];
  await loadStudy(selectedStudy);
  // Tools and synchronizers can be set up in any order.
  setUpToolGroups();
  setUpSynchronizers();
}

run();
