declare const labelmapTools: {
    toolMap: Map<any, any>;
    thresholdOptions: Map<any, any>;
    configuration: {
        preview: {
            enabled: boolean;
            previewColors: {
                0: number[];
                1: number[];
            };
        };
        strategySpecificConfiguration: {
            useCenterSegmentIndex: boolean;
        };
    };
    previewColors: {
        0: number[];
        1: number[];
    };
    preview: {
        enabled: boolean;
        previewColors: {
            0: number[];
            1: number[];
        };
    };
};
export default labelmapTools;
