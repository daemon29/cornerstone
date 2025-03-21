import { NamedStatistics } from '../../../types';
declare abstract class Calculator {
    static run: ({ value }: {
        value: any;
    }) => void;
    static getStatistics: () => NamedStatistics;
}
export default Calculator;
