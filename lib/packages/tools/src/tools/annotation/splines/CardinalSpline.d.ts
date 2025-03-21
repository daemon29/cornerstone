import { CubicSpline } from './CubicSpline';
import { CardinalSplineProps } from '../../../types';
declare class CardinalSpline extends CubicSpline {
    private _scale;
    private _fixedScale;
    constructor(props?: CardinalSplineProps);
    get scale(): number;
    set scale(scale: number);
    get fixedScale(): boolean;
    protected getTransformMatrix(): number[];
}
export { CardinalSpline as default, CardinalSpline };
