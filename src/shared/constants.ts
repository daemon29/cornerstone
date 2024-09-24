const studyList = [
{
    wadoRsRoot: 'http://localhost:800/dicom-web',
    CT1StudyInstanceUID: '1.2.156.112736.1.2.2.1097583607.12296.1695818166.610',
    CT1SeriesInstanceUID: '1.2.840.113729.1.4237.9996.2023.9.15.17.48.36.250.10076',
    CT2StudyInstanceUID: '1.2.156.112736.1.2.2.1279709348.4668.1704737711.457',
    CT2SeriesInstanceUID: '1.2.156.112736.1.3.2.1279709348.4668.1704737828.462',
    CT2RegSeriesInstanceUID:'1.2.156.112736.1.3.2.1279709348.4668.1704737855.630',
    StudyInfo: {
        Title: "Study 1",
        ReferringPhysician: "John Doe",
        StudyDate: '29-Feb-2024',
        AccessionNumber: 20240229,
        SeriesList: [
            {
                ImageDate: '24-Feb-2024',
                ImageTime: '10:05 AM',
                ImagingList:[
                {
                    Modalities: "CT",
                    NumberOfSeries: 126,
                },
                {
                    Modalities: "RTSTRUCT",
                    NumberOfSeries: 8,
                }
                ],
            },
            {
                ImageDate: '29-Feb-2024',
                ImageTime: '01:15 PM',
                ImagingList:[
                  {
                    Modalities: "CT",
                    NumberOfSeries: 76,
                  },
                  {
                    Modalities: "REG",
                    NumberOfSeries: 1,
                  }
                ],
            }
        ]
    }
},
{
    wadoRsRoot: 'http://localhost:800/dicom-web',
    CT1StudyInstanceUID: '1.2.156.112736.1.2.2.1097583607.12296.1695818166.610',
    CT1SeriesInstanceUID: '1.2.840.113729.1.4237.9996.2023.9.15.17.48.36.250.10076',
    CT2StudyInstanceUID: '1.2.156.112736.1.2.2.1279709348.4668.1704737390.276',
    CT2SeriesInstanceUID: '1.2.156.112736.1.3.2.1279709348.4668.1704737485.281',
    CT2RegSeriesInstanceUID:'1.2.156.112736.1.3.2.1279709348.4668.1704737512.449',
    StudyInfo: {
        Title: "Study 2",
        ReferringPhysician: "John Doe",
        StudyDate: '07-Mar-2024',
        AccessionNumber: 20240307,
        SeriesList: [
            {
                ImageDate: '24-Feb-2024',
                ImageTime: '10:05 AM',
                ImagingList:[
                {
                    Modalities: "CT",
                    NumberOfSeries: 126,
                },
                {
                    Modalities: "RTSTRUCT",
                    NumberOfSeries: 8,
                }
                ],
            },
            {
                ImageDate: '07-Mar-2024',
                ImageTime: '10:26 AM',
                ImagingList:[
                  {
                    Modalities: "CT",
                    NumberOfSeries: 79,
                  },
                  {
                    Modalities: "REG",
                    NumberOfSeries: 1,
                  }
                ],
            }
        ]
    }
}
];

const patientInfo = {
    PatientName: "Demo ART Workflow2",
    PatientID: "21SAMPLE",
    PatientBirthDate: "05-Sep-1955",
    PatientSex: "O",
}

export {
    studyList,
    patientInfo,
}