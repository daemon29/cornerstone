declare const colorList: string[];
export default colorList;
declare function loadColorMapTool(onColorSelection: (selectedValue: string) => void): void;
declare function setColorMapSelect(color: string): void;
export { loadColorMapTool, setColorMapSelect, colorList, };
