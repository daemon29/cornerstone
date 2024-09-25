declare function createDivElement({ className, id, textContent }?: {
    className?: string;
    id?: string;
    textContent?: string;
}): HTMLElement;
declare function setStudyListView(studyList: any, onStudySelect: (selectedStudy: number) => void): void;
declare function selectStudy(studyIndex: number): void;
declare function loadPatientInfo(patientInfo: any): void;
declare function getViewPortByElement(elementID: string): number;
declare function loadSeriesList(studyList: any, onStudySelect: (selectedStudy: number) => void): void;
declare function setViewportColormap(viewportIds: string[], volumeId: any, colormapName: any, renderingEngineId: any): void;
export { createDivElement, setStudyListView, selectStudy, loadPatientInfo, getViewPortByElement, loadSeriesList, setViewportColormap, };
