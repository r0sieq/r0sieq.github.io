import { AppStorage, AppPages, AppEventListeners, setChatrooms } from "./ui.js";

export async function App(){
    AppPages.setPage(AppPages.messagesPage);
    setUserProfile();
    setChatrooms();
    AppEventListeners();
}

async function setUserProfile(){
    setUserProfilePicture(AppStorage.user.photoURL);
    setUserDisplayName(AppStorage.user.displayName);
    setUserUUID(AppStorage.user.email);
}
function setUserProfilePicture(path){ document.querySelector('nav-profile-picture').style.backgroundImage = `url(${path})`; }
function setUserDisplayName(name){ document.querySelector('nav-profile-username').textContent = name; }
function setUserUUID(uuid) { document.querySelector('nav-profile-uuid').textContent = uuid}

export async function sendMessage(author, receiver, content){
    const date = new Date();
    const dateArray = [date.getDay(), date.getMonth(), date.getFullYear(), date.getHours(), date.getMinutes()]

    for(const index in dateArray){ if(parseInt(dateArray[index]) < 10) dateArray[index] = `0${dateArray[index]}`}
    const displayDate = `${dateArray[0]}.${dateArray[1]}.${dateArray[2]} ${dateArray[3]}:${dateArray[4]}`;

    const db = firebase.firestore();
    const authorData = await db.collection('users').doc(author).get();
    const authorDisplayName = authorData.data().displayName
    await db.collection('users').doc(author).collection('rooms').doc(receiver).collection('messages').add({
        author: authorDisplayName,
        content: content,
        date: displayDate,
        numericDate: date.getTime(),
        type: 'sent'
    })
    await db.collection('users').doc(receiver).collection('rooms').doc(author).collection('messages').add({
        author: authorDisplayName,
        content: content,
        date: displayDate,
        numericDate: date.getTime(),
        type: 'received'
    })
}

