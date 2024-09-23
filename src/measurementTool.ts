function loadMeasurementTool(onClick?: (toolName: string) => void){
    const measureTools = ["Length","Height","Angle", "Eraser"];
    const measurementTool = document.getElementById('measure-select') as HTMLSelectElement;
    measureTools.forEach(toolName => {
      var option =  document.createElement('option');
      option.text = toolName;
      option.value = `${toolName}`;
      measurementTool.appendChild(option);
    });
    measurementTool.onchange = function() {
      const measuremImage = document.getElementById('measure-img') as HTMLImageElement;
      onClick(measurementTool.value);
      measuremImage.src = `./assets/${measurementTool.value.toLowerCase()}.png`;
    };
}
export {
    loadMeasurementTool,
}