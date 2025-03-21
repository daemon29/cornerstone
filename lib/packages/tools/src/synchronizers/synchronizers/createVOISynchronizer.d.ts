import Synchronizer from '../../store/SynchronizerManager/Synchronizer';
declare type VOISynchronizerOptions = {
    syncInvertState: boolean;
    syncColormap: boolean;
};
export default function createVOISynchronizer(synchronizerName: string, options: VOISynchronizerOptions): Synchronizer;
export {};
