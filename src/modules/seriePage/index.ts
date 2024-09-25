import {
  RenderingEngine,
  Enums,
  setVolumesForViewports,
  volumeLoader,
  getRenderingEngine,
  Types,
  setUseSharedArrayBuffer,
  cache,
} from "@cornerstonejs/core";
import {
  initDemo,
  addButtonToToolbar,
  createImageIdsAndCacheMetaData,
  setCtTransferFunctionForVolumeActor,
  addSliderToToolbar,
  readDicomRegData,
  createElement,
} from "../../utils/demo/helpers";
import * as cornerstoneTools from "@cornerstonejs/tools";
import { mat4 } from "gl-matrix";
import { loadMeasurementTool } from "../../shared/measurementTool";
import { loadWindowLevelTool } from "../../shared/windowTool";
import { loadColorMapTool, setColorMapSelect } from "../../shared/colormapTool";
import { loadCrosshairsTool } from "../../shared/crosshairTool";
import { patientInfo, seriesList, studyList } from "../../shared/constants";
import {
  createDivElement,
  loadPatientInfo,
  loadSeriesList,
  selectStudy,
  setStudyListView,
  setViewportColormap,
} from "../../shared/utils";
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
} = cornerstoneTools;

const { MouseBindings, KeyboardBindings } = csToolsEnums;
const { ViewportType, BlendModes } = Enums;

const { createCameraPositionSynchronizer, createVOISynchronizer } =
  synchronizers;

// Global variables
let renderingEngine;
const renderingEngineId = "myRenderingEngineSerie";
const volumeLoaderScheme = "cornerstoneStreamingImageVolume"; // Loader id which defines which volume loader to use
const ctVolumeName = "CT_VOLUME_ID"; // Id of the volume less loader prefix
const ctVolumeId = `${volumeLoaderScheme}:${ctVolumeName}`; // VolumeId with loader id + volume id
const ctToolGroupId = "CT_TOOLGROUP_ID";
const threeDToolGroupId = "3D_TOOLGROUP_ID";

let ctImageIds, ctVolume;
let expandedElement: HTMLElement; // To track which element is expanded
let viewportColors,
  viewportReferenceLineControllable,
  viewportReferenceLineDraggableRotatable,
  viewportReferenceLineSlabThicknessControlsOn;
const currentSelectColormapName = "Grayscale";
const elements: HTMLElement[] = [];
let selectedElement: HTMLElement;
let threeDviewPort: HTMLElement;

let is3DOpen = false;

const ctVoiSynchronizerId = "CT_VOI_SYNCHRONIZER_ID";
let ctVoiSynchronizer;

let selectedStudy;

const viewportIds = ["CT_AXIAL", "CT_SAGGITAL", "CT_CORONAL", "CT_3D"];

const optionsValues = [
  WindowLevelTool.toolName,
  CrosshairsTool.toolName,
  "MeasureTool",
];

const resizeObserver = new ResizeObserver(() => {
  renderingEngine = getRenderingEngine(renderingEngineId);
  if (renderingEngine) {
    renderingEngine.resize(true, false);
  }
});

function toggleSelectTool(toolName) {
  optionsValues.forEach((element) => {
    const button = document.getElementById(element);
    if (element == toolName) {
      button.dataset.isSelected = "true";
    } else {
      button.dataset.isSelected = "false";
    }
  });
}
function onSelectTool(toolName: string) {
  const toolGroup = ToolGroupManager.getToolGroup(ctToolGroupId);
  switch (toolName) {
    case WindowLevelTool.toolName:
      toolGroup.setToolPassive(CrosshairsTool.toolName);
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });
      toggleSelectTool(toolName);
      break;
    case CrosshairsTool.toolName:
      toolGroup.setToolDisabled(WindowLevelTool.toolName);
      toolGroup.setToolActive(CrosshairsTool.toolName, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });
      toggleSelectTool(toolName);
      break;
    case LengthTool.toolName:
    case HeightTool.toolName:
    case AngleTool.toolName:
    case EraserTool.toolName:
      const measureTools = [
        LengthTool.toolName,
        HeightTool.toolName,
        AngleTool.toolName,
        EraserTool.toolName,
      ];
      measureTools.indexOf(toolName) !== -1 &&
        measureTools.splice(measureTools.indexOf(toolName), 1); // remove tool name from the list
      toolGroup.setToolDisabled(CrosshairsTool.toolName);
      toolGroup.setToolDisabled(WindowLevelTool.toolName);
      measureTools.forEach((element) => {
        toolGroup.setToolPassive(element);
      });
      toolGroup.setToolActive(toolName, {
        bindings: [{ mouseButton: MouseBindings.Primary }],
      });
      toolGroup.setToolActive(EraserTool.toolName, {
        bindings: [
          {
            modifierKey: KeyboardBindings.Ctrl,
          },
        ],
      });
      toggleSelectTool("MeasureTool");
      break;
    default:
      break;
  }
}

function initToolBar() {
  initLeftToolBar();
  initRightToolBar();
}
function initLeftToolBar() {
  loadMeasurementTool(onSelectTool);
  loadWindowLevelTool(onSelectTool);
  loadCrosshairsTool(onSelectTool);
}

function onColorSelection(colorValue) {
  setViewportColormap(
    [viewportIds[0], viewportIds[1], viewportIds[2]],
    ctVolumeId,
    colorValue,
    renderingEngineId
  );
}
function select3DView(){
    const wholeContent = document.getElementById('whole-content-series');
    const button3D = document.getElementById('button-3d');
    if(is3DOpen){
        threeDviewPort.hidden = true;
        is3DOpen=false;
        button3D.dataset.isSelected='false'
        wholeContent.style.gridTemplateRows = "1fr";
    } else {
        button3D.dataset.isSelected='true'
        wholeContent.style.gridTemplateRows = "1fr 1fr";
        threeDviewPort.hidden = false;
        is3DOpen = true;
    }
}
function initRightToolBar() {
  loadColorMapTool(onColorSelection);
  addButtonToToolbar({
    title: "3D View",
    id: "button-3d",
    onClick: () => {
      // TODO:
      select3DView();
    },
  });
}

async function setUpDisplay() {
  const viewportInputArray = [
    {
      viewportId: viewportIds[0],
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[0],
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    },
    {
      viewportId: viewportIds[1],
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[1],
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
      },
    },
    {
      viewportId: viewportIds[2],
      type: ViewportType.ORTHOGRAPHIC,
      element: elements[2],
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
      },
    },
    {
      viewportId: viewportIds[3],
      type: ViewportType.VOLUME_3D,
      element: elements[3],
      defaultOptions: {
        orientation: Enums.OrientationAxis.CORONAL,
      },
    },
  ];
  renderingEngine.setViewports(viewportInputArray);
}

async function setVolumesViewportsForStudy() {
  ctVolume.load();
  await setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId: ctVolumeId,
        callback: setCtTransferFunctionForVolumeActor,
      },
    ],
    [viewportIds[0], viewportIds[1], viewportIds[2], viewportIds[3]]
  );
  let threeD = renderingEngine.getViewport(viewportIds[3]);
  threeD.setProperties({
    preset: "CT-Bone",
  });
  threeD.render();
  renderingEngine.render();
}

async function loadStudy(study) {
  // Clean up volume cache so it can load new one
  cache.purgeVolumeCache();
  for (let index = 0; index < study.SeriesList.length; index++) {
    const element = study.SeriesList[index];
    switch (element.Modality) {
      case "CT":
        ctImageIds = await createImageIdsAndCacheMetaData({
          StudyInstanceUID: study.StudyInstanceUID,
          SeriesInstanceUID: element.SeriesInstanceUID,
          wadoRsRoot: study.wadoRsRoot,
        });
        break;
      case "RTSTRUCT":
        // RTStruct go here
        break;
      default:
        break;
    }
  }
  ctVolume = await volumeLoader.createAndCacheVolume(ctVolumeId, {
    imageIds: ctImageIds,
  });
  await setVolumesViewportsForStudy();
}

function onStudySelect(index: number) {
  if (index >= seriesList.length) return;
  selectedStudy = seriesList[index];
  selectStudy(index);
  loadStudy(selectedStudy);
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
      //element.style.gridColumn = '1 / 4';  // Span all 3 columns
      //element.style.gridRow = '1 / 4';  // Span all 3 rows
      element.style.zIndex = '1000';  // Bring the element to the front
      element.style.width = '100%';  // Ensure it takes full width
      element.style.height = '100%';
      expandedElement = element;
    }
    const renderEngine = getRenderingEngine(renderingEngineId);
    renderEngine.resize(true);
  }
function selectGridElement(element: HTMLElement) {
  if (selectedElement) {
    selectedElement.dataset.isSelected = "false";
  }
  selectedElement = element;
  selectedElement.dataset.isSelected = "true";
}
function initViewPort() {
  const viewportGrid = createDivElement({ id: "master-viewport-grid-series" });
  const wholeContent = document.getElementById("whole-content-series");
  const content = createDivElement({ id: "content-series" });
  content.style.display = "row";
  for (let index = 0; index < 3; index++) {
    const element = createDivElement({ id: `viewport${index + 1}` });
    element.style.gridColumnStart = String(index + 1);
    element.oncontextmenu = (e) => e.preventDefault();
    element.ondblclick = () => toggleViewportSize(element);
    element.onclick = () => selectGridElement(element);
    elements.push(element);
    viewportGrid.appendChild(element);
    resizeObserver.observe(element);
  }
  content.appendChild(viewportGrid);
  threeDviewPort = createDivElement({ id: "viewport-3d" });
  elements.push(threeDviewPort);
  threeDviewPort.hidden = true;
  threeDviewPort.oncontextmenu = (e) => e.preventDefault();
  threeDviewPort.onclick= ()=> selectGridElement(threeDviewPort);
  resizeObserver.observe(threeDviewPort);
  wholeContent.appendChild(threeDviewPort);
  wholeContent.appendChild(content);
  viewportColors = {
    [viewportIds[0]]: "rgb(200, 0, 0)",
    [viewportIds[1]]: "rgb(200, 200, 0)",
    [viewportIds[2]]: "rgb(0, 200, 0)",
  };
  viewportReferenceLineControllable = [
    viewportIds[0],
    viewportIds[1],
    viewportIds[2],
  ];
  viewportReferenceLineDraggableRotatable = [
    viewportIds[0],
    viewportIds[1],
    viewportIds[2],
  ];
  viewportReferenceLineSlabThicknessControlsOn = [
    viewportIds[0],
    viewportIds[1],
    viewportIds[2],
  ];
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
function setUpSynchronizers() {
  ctVoiSynchronizer = createVOISynchronizer(ctVoiSynchronizerId, {
    syncInvertState: false,
    syncColormap: false,
  });
  [viewportIds[0], viewportIds[1], viewportIds[2]].forEach((viewportId) => {
    ctVoiSynchronizer.add({
      renderingEngineId,
      viewportId,
    });
  });
}

function setUpToolGroups() {
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
  const ctToolGroup = ToolGroupManager.createToolGroup(ctToolGroupId);
  const threeDToolGRoup = ToolGroupManager.createToolGroup(threeDToolGroupId);

  ctToolGroup.addViewport(viewportIds[0], renderingEngineId);
  ctToolGroup.addViewport(viewportIds[1], renderingEngineId);
  ctToolGroup.addViewport(viewportIds[2], renderingEngineId);
  threeDToolGRoup.addViewport(viewportIds[3], renderingEngineId);
  ctToolGroup.addTool(PanTool.toolName);
  ctToolGroup.addTool(ZoomTool.toolName);
  ctToolGroup.addTool(StackScrollMouseWheelTool.toolName);
  ctToolGroup.addTool(WindowLevelTool.toolName);
  ctToolGroup.addTool(LengthTool.toolName);
  ctToolGroup.addTool(AngleTool.toolName);
  ctToolGroup.addTool(HeightTool.toolName);
  ctToolGroup.addTool(EraserTool.toolName);
  ctToolGroup.addTool(CrosshairsTool.toolName, {
    getReferenceLineColor,
    getReferenceLineControllable,
    getReferenceLineDraggableRotatable,
    getReferenceLineSlabThicknessControlsOn,
  });
  ctToolGroup.setToolActive(PanTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Auxiliary, // Middle Click
      },
    ],
  });
  ctToolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [
      {
        mouseButton: MouseBindings.Secondary, // Right Click
      },
    ],
  });
  ctToolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
  ctToolGroup.setToolPassive(CrosshairsTool.toolName);

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
  });
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
}
async function run() {
  // Init Cornerstone and related libraries
  await initDemo();
  setUseSharedArrayBuffer(false);
  initToolBar();
  initViewPort();
  loadPatientInfo(patientInfo);
  loadSeriesList(seriesList, onStudySelect);
  // initial study
  // Instantiate a rendering engine
  renderingEngine = new RenderingEngine(renderingEngineId);

  await setUpDisplay();
  setUpToolGroups();
  setUpSynchronizers();
}

run();
