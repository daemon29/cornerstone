function loadMeasurementTool(onClick?: (toolName: string) => void){

    const measureTools = ["Length","Height","Angle", "Eraser"];
    const measurementTool = document.getElementById('measure-select') as HTMLUListElement;
    const measureToolButton = document.getElementById('MeasureTool') as HTMLButtonElement;
    measureToolButton.onclick = ()=>{
      if(measurementTool.dataset.measureTool!=null){
        onClick(measurementTool.dataset.measureTool);
      }
    }
    measureTools.forEach(toolName => {
      var option =  document.createElement('li');
      option.textContent = toolName;
      option.onclick=()=>{
        const measuremImage = document.getElementById('measure-img') as HTMLImageElement;
        measuremImage.src = `./assets/${toolName.toLowerCase()}.png`;
        measurementTool.classList.toggle('show');
        measurementTool.dataset.measureTool=toolName;
        if(onClick) onClick(toolName);
      }
      measurementTool.appendChild(option);
    });
}
export {
    loadMeasurementTool,
}