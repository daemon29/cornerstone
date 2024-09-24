import { CrosshairsTool } from "@cornerstonejs/tools";

function loadCrosshairsTool(onToolSelect?: (toolName: string) => void){
    const crosshairTool = document.getElementById('Crosshairs');
    crosshairTool.onclick = function() {
        onToolSelect(CrosshairsTool.toolName);
    };
}

export {
    loadCrosshairsTool,
}