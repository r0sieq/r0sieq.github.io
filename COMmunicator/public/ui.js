import { App, sendMessage} from './app.js';
import { googleLogin, googleLogout, facebookLogin, facebookLogout} from './auth.js';

export const AppStorage = {
    loginPage: null,
    user: null,
    currentReceiver: null
}

export const AppPages = {
    loginPage: document.querySelector('auth-page'),
    messagesPage: document.querySelector('app-page'),
    setPage(page){
        document.body.innerHTML = null;
        document.body.appendChild(page);
        return null; 
    },
    resetApp(){
        document.body.innerHTML = null;
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    AppPages.resetApp();
    AppPages.setPage(AppPages.loginPage);
    document.querySelectorAll('login-method').forEach( res => { res.setAttribute('disabled', 'false'); res.addEventListener('click', event => {
        event.stopImmediatePropagation();
        if(res.getAttribute('disabled') == 'true') return;
        handleClickAnimation(res);
        handleLogin(res);
    })})
})

function handleClickAnimation(button){
    button.classList.add('animated-click');
    button.addEventListener('animationend', () => { button.classList.remove('animated-click') })
}

function handleLogin(button){
    disableLoginMethods();
    startLoginLoadingAnimation();
    const method = button.lastElementChild.textContent;
    if(method.includes('Facebook')) facebookLogin();
    else if(method.includes('Google')) googleLogin();
}

export async function handleLoginSuccess(){
    await updateUserInDatabase()
    stopLoginLoadingAnimation();
    enableLoginMethods();
    App();
}

export function handleLoginFail(){
    enableLoginMethods();
    stopLoginLoadingAnimation();
}

export function disableLoginMethods(){
    document.querySelectorAll('login-method').forEach( res => { res.setAttribute('disabled', 'true')})
}

export function enableLoginMethods(){
    document.querySelectorAll('login-method').forEach(res => { res.setAttribute('disabled', 'false') })
}

export function startLoginLoadingAnimation(){
    const container = document.createElement('loading-container');
    const circle = document.createElement('loading-circle');
    const innercircle = document.createElement('loading-inner-circle');

    circle.appendChild(innercircle)
    container.appendChild(circle);
    document.querySelector('auth-window').appendChild(container)
}

export function stopLoginLoadingAnimation(){
    document.querySelector('loading-container')?.remove();
}

export async function updateUserInDatabase(){
    const db = firebase.firestore();
    await db.collection('users').doc(AppStorage.user.email).set({
        email: AppStorage.user.email,
        displayName: AppStorage.user.displayName,
        photoURL: AppStorage.user.photoURL
    })
    /*
    const rooms = await db.collection('users').doc(AppStorage.user.email).collection('rooms').get()
    console.log(rooms);
    if(rooms.empty){
        await db.collection('users').doc(AppStorage.user.email).collection('rooms').doc('r0sieq1337@gmail.com').set({
            exist: true
        })
    }
    */
    return;
}

export function AppEventListeners(){
    //dodawanie profilu
    document.querySelector('nav-profile-add').addEventListener('click', () => {
        const background = document.createElement('popup-container');
        const popupWindow = document.createElement('popup-window');

        const popupCloseButton = document.createElement('popup-close-button');
        popupCloseButton.addEventListener('click', () => closePopup());

        const popupNav = document.createElement('popup-nav');

        const popupNavInput = document.createElement('input');
        popupNavInput.type = "text";
        popupNavInput.placeholder = "Email znajomego..."

        const popupNavSearchButton = document.createElement('popup-search-button');
        popupNavSearchButton.addEventListener('click', async () => {
            if(popupNavInput.value == null || popupNavInput.value == '' || popupNavInput.value == popupNavInput.placeholder){
                handleInputError();
                return;
            }
            document.querySelector('popup-result-container').innerHTML = null;
            await searchForUser(popupNavInput.value);
        })


        popupNav.appendChild(popupNavInput);
        popupNav.appendChild(popupNavSearchButton);

        const popupResults = document.createElement('popup-result-container');

        popupWindow.appendChild(popupCloseButton);
        popupWindow.appendChild(popupNav);
        popupWindow.appendChild(popupResults);
        background.appendChild(popupWindow);
        document.body.appendChild(background);
    })
    //wysylanie wiadomosci
    document.addEventListener('keypress', e => {
        if(e.key == 'Enter') document.querySelector('message-input-send').click();
    })
    document.querySelector('message-input-send').addEventListener('click', () => {
        if(document.querySelector('message-input-text > input').value == null || document.querySelector('message-input-text > input').value == '' || document.querySelector('message-input-text > input').value == document.querySelector('message-input-text > input').placeholder) return;
        sendMessage(AppStorage.user.email, AppStorage.currentReceiver.email, document.querySelector('message-input-text > input').value)
        document.querySelector('message-input-text > input').value = null;
    })
}

export function closePopup(){
    document.querySelector('popup-container')?.remove()
}

export function handleInputError(){
    console.log('kutas kozla');
    document.querySelector('popup-nav > input').classList.add('input-error');
    document.querySelector('popup-nav > input').addEventListener('animationend', () => {
        document.querySelector('popup-nav > input').classList.remove('input-error');
    })
}

export async function searchForUser(searchedEmail){
    const db = firebase.firestore();
    const usersRef = db.collection('users');

    const query = await usersRef.where('email', '>=', searchedEmail).where('email', '<=', searchedEmail + '\uf8ff').get()

    let results = [];
    if(query.empty) {
        showNoResults();
        return;
    }
    query.forEach( res => {
        const data = res.data();
        console.log( data.displayName, data.photoURL, data.email )
        setUpResult(data);
    })
    return results;
}

export function setUpResult(data){
    const result = document.createElement('result');

    const profilePicture = document.createElement('result-profile-picture');
    profilePicture.style.backgroundImage = `url(${data.photoURL})`;

    const profileDetails = document.createElement('result-profile-details');

    const profileDisplayName = document.createElement('result-profile-username');
    profileDisplayName.textContent = data.displayName;

    const profileEmail = document.createElement('result-profile-email');
    profileEmail.textContent = data.email;

    profileDetails.appendChild(profileDisplayName);
    profileDetails.appendChild(profileEmail);
    result.appendChild(profilePicture);
    result.appendChild(profileDetails);
    if(AppStorage.user.email != data.email){
        const profileAdd = document.createElement('result-profile-add');
        profileAdd.addEventListener('click', () => createRoom(data))
        profileAdd.textContent = 'Wyślij wiadomość'
        result.appendChild(profileAdd);
    }
    document.querySelector('popup-result-container').appendChild(result);
}

export async function createRoom(data){
    closePopup();
    const db = firebase.firestore()
    const thisRoom = await db.collection('users').doc(AppStorage.user.email).collection('rooms').get()
    console.log(thisRoom)
    if(!thisRoom.empty) return 
    await db.collection('users').doc(AppStorage.user.email).collection('rooms').doc(data.email).set({
        displayName: data.displayName,
        email: data.email,
        photoURL: data.photoURL
    })
    setUpRoom(data)
}

export function setUpRoom(data){
    const chatroom = document.createElement('nav-chatroom');
    chatroom.addEventListener('click', () => {
        setUpMessages(data);
        document.querySelectorAll('nav-chatroom').forEach( res => res.setAttribute('active', 'false'))
        chatroom.setAttribute('active', 'true');
    })

    const chatroomProfilePicture = document.createElement('nav-chatroom-profile-picture');
    chatroomProfilePicture.style.backgroundImage = `url(${data.photoURL})`;

    const chatroomDetails = document.createElement('nav-chatroom-profile-details');

    const chatroomUsername = document.createElement('nav-chatroom-profile-username');
    chatroomUsername.textContent = data.displayName;

    const chatroomEmail = document.createElement('nav-chatroom-profile-email');
    chatroomEmail.textContent = data.email;

    chatroomDetails.appendChild(chatroomUsername);
    chatroomDetails.appendChild(chatroomEmail);

    chatroom.appendChild(chatroomProfilePicture);
    chatroom.appendChild(chatroomDetails);

    document.querySelector('nav-chatrooms').appendChild(chatroom);

    //tutaj trzeba dodać tworzenie wizualnie pokoju.
}

export async function setChatrooms(){
    const db = firebase.firestore();
    const rooms = await db.collection('users').doc(AppStorage.user.email).collection('rooms').get()
    rooms.forEach( data => {
        setUpRoom(data.data());
    })
}

export function showNoResults(){
    const noResultContainer = document.createElement('result-fail');
    
    const noResultText = document.createElement('result-fail-text');
    noResultText.textContent = 'Nie znaleziono pasujących wyników, spróbuj ponowie...';

    const noResultImage = document.createElement('result-fail-image');

    noResultContainer.appendChild(noResultText)
    noResultContainer.appendChild(noResultImage)
    document.querySelector('popup-result-container').appendChild(noResultContainer);
}

export async function setUpMessages(data){
    AppStorage.currentReceiver = data;
    const db = firebase.firestore();
    const messages = await db.collection('users').doc(AppStorage.user.email).collection('rooms').doc(data.email).collection('messages').orderBy('numericDate').get();
    document.querySelector('message-container').innerHTML = null;
    messages.forEach( message => {
        displayMessage(message.data())
    })
    await db.collection('users').doc(AppStorage.user.email).collection('rooms').doc(AppStorage.currentReceiver.email).collection('messages').orderBy('numericDate').onSnapshot(querySnapshot => {
        //
        // ZROBIĆ ZEBY AKTUALIZOWALO TYLKO OSTATNIA WIADOMOSC ZAMIAST WSZYSTKICH
        // sprobowac z querySnapshot.docs[querySnapshot.length - 1]
        querySnapshot.docs.forEach((snapMessage, i) => {
            if(i == querySnapshot.docs.length - 1) displayMessage(snapMessage.data())
        })
    })
}

export function displayMessage(data){
    if(messagesConflict(data)) return;
    const messageContainerFuncton = () => {
        if(data.type == 'sent') return document.createElement('message-sent')
        if(data.type == 'received') return document.createElement('message-received');
    }
    const messageContainer = messageContainerFuncton();

    const message = document.createElement('message');

    const messageAbout = document.createElement('message-about');

    const messageAuthor = document.createElement('message-author');
    messageAuthor.textContent = data.author;

    const messageDate = document.createElement('message-date');
    messageDate.textContent = data.date;

    const messageContent = document.createElement('message-content');
    messageContent.textContent = data.content;

    messageAbout.appendChild(messageAuthor);
    messageAbout.appendChild(messageDate);

    message.appendChild(messageAbout)
    message.appendChild(messageContent);

    messageContainer.appendChild(message);
    messageContainer.setAttribute('numericDate', data.numericDate);
    document.querySelector('message-container').appendChild(messageContainer);
}

export function messagesConflict(data){
    let conflict = false;
    document.querySelectorAll('message').forEach( res => {
        if(
            res.parentElement.getAttribute('numericDate') == data.numericDate &&
            res.lastElementChild.textContent == data.content
        ) conflict = true;
    })
    return conflict;
}