declare const studyList: {
    wadoRsRoot: string;
    CT1StudyInstanceUID: string;
    CT1SeriesInstanceUID: string;
    CT2StudyInstanceUID: string;
    CT2SeriesInstanceUID: string;
    CT2RegSeriesInstanceUID: string;
    StudyInfo: {
        Title: string;
        ReferringPhysician: string;
        StudyDate: string;
        AccessionNumber: number;
        SeriesList: {
            ImageDate: string;
            ImageTime: string;
            ImagingList: {
                Modalities: string;
                NumberOfSeries: number;
            }[];
        }[];
    };
}[];
declare const seriesList: {
    wadoRsRoot: string;
    Title: string;
    StudyInstanceUID: string;
    ReferringPhysician: string;
    StudyDate: string;
    AccessionNumber: number;
    SeriesList: {
        SeriesDate: string;
        SeriesTime: string;
        Modality: string;
        NumberOfSeries: number;
        SeriesInstanceUID: string;
    }[];
}[];
declare const patientInfo: {
    PatientName: string;
    PatientID: string;
    PatientBirthDate: string;
    PatientSex: string;
};
export { studyList, patientInfo, seriesList };
