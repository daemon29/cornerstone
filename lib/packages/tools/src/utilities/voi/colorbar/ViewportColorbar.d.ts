import { Types } from '@cornerstonejs/core';
import { Colorbar } from './Colorbar';
import type { ViewportColorbarProps, ColorbarVOIRange } from './types';
declare class ViewportColorbar extends Colorbar {
    private _element;
    private _volumeId;
    private _hideTicksTime;
    private _hideTicksTimeoutId;
    constructor(props: ViewportColorbarProps);
    get element(): HTMLDivElement;
    get enabledElement(): Types.IEnabledElement;
    protected getVOIMultipliers(): [number, number];
    protected onVoiChange(voiRange: ColorbarVOIRange): void;
    private static _getImageRange;
    private static _getVOIRange;
    private autoHideTicks;
    private showAndAutoHideTicks;
    private _stackNewImageCallback;
    private _imageVolumeModifiedCallback;
    private _viewportVOIModifiedCallback;
    private _viewportColormapModifiedCallback;
    private _addCornerstoneEventListener;
}
export { ViewportColorbar as default, ViewportColorbar };
