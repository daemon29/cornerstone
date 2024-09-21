/**
/**
 * Uses dicomweb-client to fetch metadata of a study, cache it in cornerstone,
 * and return a list of imageIds for the frames.
 *
 * Uses the app config to choose which study to fetch, and which
 * dicom-web server to fetch it from.
 *
 * @returns {string[]} An array of imageIds for instances in the study.
 */
export default function createImageIdsAndCacheMetaData({ StudyInstanceUID, SeriesInstanceUID, SOPInstanceUID, wadoRsRoot, client, convertMultiframe, }: {
    StudyInstanceUID: any;
    SeriesInstanceUID: any;
    SOPInstanceUID?: any;
    wadoRsRoot: any;
    client?: any;
    convertMultiframe?: boolean;
}): string[];
