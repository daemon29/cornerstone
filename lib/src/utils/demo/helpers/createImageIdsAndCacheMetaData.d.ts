export default function createImageIdsAndCacheMetaData({ StudyInstanceUID, SeriesInstanceUID, SOPInstanceUID, wadoRsRoot, client, convertMultiframe, }: {
    StudyInstanceUID: any;
    SeriesInstanceUID: any;
    SOPInstanceUID?: any;
    wadoRsRoot: any;
    client?: any;
    convertMultiframe?: boolean;
}): string[];
