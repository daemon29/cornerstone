const studyList = [
  {
    wadoRsRoot: "http://localhost:800/dicom-web",
    CT1StudyInstanceUID: "1.2.156.112736.1.2.2.1097583607.12296.1695818166.610",
    CT1SeriesInstanceUID:
      "1.2.840.113729.1.4237.9996.2023.9.15.17.48.36.250.10076",
    CT1SEG:{
      StudyInstanceUID: "1.2.156.112736.1.2.2.1097583607.12296.1695818166.610",
      SeriesInstanceUID:"2.25.213554271536925681455938993743687803887",
      SOPInstanceUID:"2.25.785621413420210661154836003517139088711"
    },
    CT2StudyInstanceUID: "1.2.156.112736.1.2.2.1279709348.4668.1704737711.457",
    CT2SeriesInstanceUID: "1.2.156.112736.1.3.2.1279709348.4668.1704737828.462",
    CT2RegSeriesInstanceUID:
      "1.2.156.112736.1.3.2.1279709348.4668.1704737855.630",
    StudyInfo: {
      Title: "Study 1",
      ReferringPhysician: "Physician",
      StudyDate: "29-Feb-2024",
      AccessionNumber: "",
      SeriesList: [
        {
          ImageDate: "24-Feb-2024",
          ImageTime: "10:05 AM",
          ImagingList: [
            {
              Modalities: "CT",
              NumberOfSeries: 125,
            },
            {
              Modalities: "SEG",
              NumberOfSeries: 4,
            },
          ],
        },
        {
          ImageDate: "29-Feb-2024",
          ImageTime: "01:15 PM",
          ImagingList: [
            {
              Modalities: "CT",
              NumberOfSeries: 76,
            },
            {
              Modalities: "REG",
              NumberOfSeries: 1,
            },
          ],
        },
      ],
    },
  },
  {
    wadoRsRoot: "http://localhost:800/dicom-web",
    CT1StudyInstanceUID: "1.2.156.112736.1.2.2.1097583607.12296.1695818166.610",
    CT1SeriesInstanceUID:
      "1.2.840.113729.1.4237.9996.2023.9.15.17.48.36.250.10076",
    CT1SEG:{
      StudyInstanceUID: "1.2.156.112736.1.2.2.1097583607.12296.1695818166.610",
      SeriesInstanceUID:"2.25.213554271536925681455938993743687803887",
      SOPInstanceUID:"2.25.785621413420210661154836003517139088711"
    },
    CT2StudyInstanceUID: "1.2.156.112736.1.2.2.1279709348.4668.1704737390.276",
    CT2SeriesInstanceUID: "1.2.156.112736.1.3.2.1279709348.4668.1704737485.281",
    CT2RegSeriesInstanceUID:
      "1.2.156.112736.1.3.2.1279709348.4668.1704737512.449",
    StudyInfo: {
      Title: "Study 2",
      ReferringPhysician: "Physician",
      StudyDate: "07-Mar-2024",
      AccessionNumber: "",
      SeriesList: [
        {
          ImageDate: "24-Feb-2024",
          ImageTime: "10:05 AM",
          ImagingList: [
            {
              Modalities: "CT",
              NumberOfSeries: 125,
            },
            {
              Modalities: "SEG",
              NumberOfSeries: 4,
            },
          ],
        },
        {
          ImageDate: "07-Mar-2024",
          ImageTime: "10:26 AM",
          ImagingList: [
            {
              Modalities: "CT",
              NumberOfSeries: 78,
            },
            {
              Modalities: "REG",
              NumberOfSeries: 1,
            },
          ],
        },
      ],
    },
  },
];
const seriesList = [
  {
    wadoRsRoot: "http://localhost:800/dicom-web",
    Title: "Pelvis CT 1",
    StudyInstanceUID: "1.2.156.112736.1.2.2.1097583607.12296.1695818166.610",
    ReferringPhysician: "Physician",
    StudyDate: "24-Feb-2024",
    AccessionNumber: "",
    SeriesList: [
      {
        SeriesDate: "24-Feb-2024",
        SeriesTime: "10:05 AM",
        Modality: "CT",
        NumberOfSeries: 126,
        SeriesInstanceUID:
          "1.2.840.113729.1.4237.9996.2023.9.15.17.48.36.250.10076",
      },
      {
        SeriesDate: "24-Feb-2024",
        SeriesTime: "10:05 AM",
        Modality: "SEG",
        NumberOfSeries: 4,
        SeriesInstanceUID: "2.25.213554271536925681455938993743687803887",
        SOPInstanceUID: "2.25.785621413420210661154836003517139088711",
    
      },
    ],
  },
  {
    wadoRsRoot: "http://localhost:800/dicom-web",
    Title: "Pelvis CT 2",
    StudyInstanceUID: "1.2.156.112736.1.2.2.1279709348.4668.1704737711.457",
    ReferringPhysician: "Physician",
    StudyDate: "29-Feb-2024",
    AccessionNumber: "",
    SeriesList: [
      {
        SeriesDate: "29-Feb-2024",
        SeriesTime: "01:15 PM",
        Modality: "CT",
        NumberOfSeries: 76,
        SeriesInstanceUID:
          "1.2.156.112736.1.3.2.1279709348.4668.1704737828.462",
      },
    ],
  },
  {
    wadoRsRoot: "http://localhost:800/dicom-web",
    Title: "Pelvis CT 3",
    StudyInstanceUID: "1.2.156.112736.1.2.2.1279709348.4668.1704737390.276",
    ReferringPhysician: "Physician",
    StudyDate: "07-Mar-2024",
    AccessionNumber: "",
    SeriesList: [
      {
        SeriesDate: "07-Mar-2024",
        SeriesTime: "10:26 AM",
        Modality: "CT",
        NumberOfSeries: 78,
        SeriesInstanceUID:
          "1.2.156.112736.1.3.2.1279709348.4668.1704737485.281",
      },
    ],
  },
];
const patientInfo = {
  PatientName: "Jackson Todd",
  PatientID: "26SAMPLE",
  PatientBirthDate: "05-Sep-1955",
  PatientSex: "O",
};

export { studyList, patientInfo , seriesList};
