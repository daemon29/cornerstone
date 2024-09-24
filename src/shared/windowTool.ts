import { WindowLevelTool } from "@cornerstonejs/tools";

function loadWindowLevelTool(onToolSelect?: (toolName: string) => void){
    const windowLevelTool = document.getElementById('WindowLevel');
    windowLevelTool.onclick = function() {
        onToolSelect(WindowLevelTool.toolName);
    };
}

export {
    loadWindowLevelTool,
}