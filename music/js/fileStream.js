
export function createFileStream(link) {
    if(document.getElementById(link)) return false;
    const iframe = document.createElement('iframe');
    iframe.src = link;
    iframe.style.display = "none";
    iframe.id = link;
    document.body.appendChild(iframe);
    return document.getElementById(link);
}

export function removeFileStream(link){
    if(!document.getElementById(link)) return false;
    const iframe = document.getElementById(link);
    document.body.removeChild(iframe);
}

export function readFile(link) {
    if(!document.getElementById(link)) return false;
    const iframe = document.getElementById(link);
    const iframecontent = iframe.contentWindow.document.body.textContent;
    return iframecontent;
}

export const SONGLIST_CLASS = ["title", "author", "src", "srcImage"];