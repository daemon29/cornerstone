declare const getCalibratedLengthUnitsAndScale: (image: any, handles: any) => {
    units: string;
    areaUnits: string;
    scale: number;
};
declare const getCalibratedProbeUnitsAndValue: (image: any, handles: any) => {
    units: string[];
    values: any[];
    calibrationType?: undefined;
} | {
    units: string[];
    values: any[];
    calibrationType: string;
};
declare const getCalibratedAspect: (image: any) => any;
export { getCalibratedLengthUnitsAndScale, getCalibratedAspect, getCalibratedProbeUnitsAndValue, };
