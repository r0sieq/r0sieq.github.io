/*
export async function getComponent(path) {
    const componentWindow = document.createElement('iframe');
    document.body.appendChild(componentWindow);
    componentWindow.src = path;
    waitForLoad(componentWindow);
    if(componentWindow.contentWindow) {
        const componentContent = componentWindow.contentWindow.document.body.innerHTML;
        console.log(componentContent)
        componentWindow.remove();
        return componentContent;
    } else if(componentWindow.contentDocument){
        const componentContent = componentWindow.contentDocument.body.innerHTML;
        console.log(componentContent)
        componentWindow.remove();
        return componentContent;
    }
}

async function waitForLoad(element){
    return new Promise( resolve => element.onload = () => resolve());
}
*/

export async function getComponent(path){
    const data = await fetch(path);
    return data.text();
}