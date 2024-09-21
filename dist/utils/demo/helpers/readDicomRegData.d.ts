export default function readDicomRegData({ StudyInstanceUID, SeriesInstanceUID, SOPInstanceUID, wadoRsRoot, client, convertMultiframe, }: {
    StudyInstanceUID: any;
    SeriesInstanceUID: any;
    SOPInstanceUID?: any;
    wadoRsRoot: any;
    client?: any;
    convertMultiframe?: boolean;
}): Promise<mat4>;
import { mat4 } from "gl-matrix";
