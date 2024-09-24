declare function createDivElement({ className, id, textContent }?: {
    className?: string;
    id?: string;
    textContent?: string;
}): HTMLElement;
declare function setStudyListView(studyList: any, onStudySelect: (selectedStudy: number) => void): void;
declare function selectStudy(studyIndex: number): void;
declare function loadPatientInfo(patientInfo: any): void;
export { createDivElement, setStudyListView, selectStudy, loadPatientInfo, };
