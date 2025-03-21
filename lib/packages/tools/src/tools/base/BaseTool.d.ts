import { Types } from '@cornerstonejs/core';
import ToolModes from '../../enums/ToolModes';
import StrategyCallbacks from '../../enums/StrategyCallbacks';
import { InteractionTypes, ToolProps, PublicToolProps } from '../../types';
export interface IBaseTool {
    toolGroupId: string;
    supportedInteractionTypes: InteractionTypes[];
    mode: ToolModes;
    configuration: {
        preventHandleOutsideImage?: boolean;
        strategies?: Record<string, any>;
        defaultStrategy?: string;
        activeStrategy?: string;
        strategyOptions?: Record<string, unknown>;
    };
}
declare abstract class BaseTool implements IBaseTool {
    static toolName: any;
    supportedInteractionTypes: InteractionTypes[];
    configuration: Record<string, any>;
    toolGroupId: string;
    mode: ToolModes;
    constructor(toolProps: PublicToolProps, defaultToolProps: ToolProps);
    getToolName(): string;
    applyActiveStrategy(enabledElement: Types.IEnabledElement, operationData: unknown): any;
    applyActiveStrategyCallback(enabledElement: Types.IEnabledElement, operationData: unknown, callbackType: StrategyCallbacks | string): any;
    setConfiguration(newConfiguration: Record<string, any>): void;
    setActiveStrategy(strategyName: string): void;
    protected getTargetVolumeId(viewport: Types.IViewport): string | undefined;
    protected getTargetIdImage(targetId: string, renderingEngine: Types.IRenderingEngine): Types.IImageData | Types.CPUIImageData | Types.IImageVolume;
    protected getTargetId(viewport: Types.IViewport): string | undefined;
}
export default BaseTool;
