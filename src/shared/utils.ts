import { ViewportTypeEnum } from "./enums";

function createDivElement({
    className = '',
    id = '',
    textContent = ''
  } = {}): HTMLElement {
    const element = document.createElement('div');
    
    if (className) {
      element.className = className;
    }
    
    if (id) {
      element.id = id;
    }
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  }
// Load Study List
function setStudyListView(studyList,onStudySelect: (selectedStudy: number) => void){
    const studyListContainer = document.getElementById('study-list-container');
    for (let index = 0; index < studyList.length; index++) {
      const study = studyList[index];
      // Setup study item
      const studyItem = createDivElement({className:'study-item', id:`study-item-${index}`});
      // Setup study header
      const studyHeader = createDivElement({ className:'study-header'});
      const studyTitle = createDivElement({className:'study-title', textContent:study.StudyInfo.Title});
      const studyDate = createDivElement({className:'study-date', textContent:study.StudyInfo.StudyDate});
      studyHeader.appendChild(studyTitle);
      studyHeader.appendChild(studyDate);
      // Setup Series List
      const seriesList = createDivElement({className:'series-list'});
      study.StudyInfo.SeriesList.forEach(serie => {
        const imageItem = createDivElement({className:'image-item'});
        const imageDate = createDivElement({className:'image-date', textContent:`${serie.ImageDate} ${serie.ImageTime}`});
        let modalitiesText = serie.ImagingList.map(item => `${item.Modalities}(${item.NumberOfSeries})`).join(' ');
        const imageModality = createDivElement({className:'image-modality', textContent:modalitiesText});
        imageItem.appendChild(imageDate);
        imageItem.appendChild(imageModality);
        seriesList.appendChild(imageItem);
      });
      // Setup study footer
      const studyFooter = createDivElement({className: 'study-footer'});
      const referringPhysician = createDivElement({className: 'referring-physician', textContent:`Physician: ${study.StudyInfo.ReferringPhysician}`});
      const accessionNumber = createDivElement({className: 'accession-number', textContent:`Accession#: ${study.StudyInfo.AccessionNumber}`});
      studyFooter.appendChild(referringPhysician);
      studyFooter.appendChild(accessionNumber);
      // Finalize study item
      studyItem.appendChild(studyHeader);
      studyItem.appendChild(seriesList);
      studyItem.appendChild(studyFooter);
      studyItem.onclick = function() {
        onStudySelect(index);
    };
      studyListContainer.appendChild(studyItem);
    }
}
function selectStudy(studyIndex: number){
    var studyItemList = document.getElementsByClassName('study-item');
    for (let index = 0; index < studyItemList.length; index++) {
        const element = studyItemList[index] as HTMLElement;;
        if (element.id==`study-item-${studyIndex}`) {
            element.dataset.isSelected = 'true';
        } else {
            element.dataset.isSelected = 'false';
        }
    }
}
function calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString);
    const diffMs = Date.now() - birthDate.getTime();
    return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

function loadPatientInfo(patientInfo){
    const patientInfoContainer = document.getElementById("patient-info-container");
    const patientName = createDivElement({className:'patient-name', textContent: patientInfo.PatientName});
    const patientID = createDivElement({className:'patient-id',textContent:`PID: ${patientInfo.PatientID}`});
    const patientDOB = createDivElement({className:'patient-dob',textContent:patientInfo.PatientBirthDate});
    const age = calculateAge(patientInfo.PatientBirthDate);
    const patientAgeSex = createDivElement({className:'patient-age-gender',textContent:`${age} ${patientInfo.PatientSex}`});
    patientInfoContainer.appendChild(patientName);
    patientInfoContainer.appendChild(patientID);
    patientInfoContainer.appendChild(patientDOB);
    patientInfoContainer.appendChild(patientAgeSex);
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
export {
    createDivElement,
    setStudyListView,
    selectStudy,
    loadPatientInfo,
    getViewPortByElement,
}