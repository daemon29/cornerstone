function loadLabelMapTool(onClick?:()=>void){
    const labelMap = document.getElementById("button-labelmap") as HTMLButtonElement;
    labelMap.onclick = onClick;
}

function setLabelMapEnable(enable: boolean){
    const labelMap = document.getElementById("button-labelmap") as HTMLButtonElement;
    labelMap.disabled=!enable;
}

export {
    loadLabelMapTool,
    setLabelMapEnable,
}