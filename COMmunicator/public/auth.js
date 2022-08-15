import { AppStorage, enableLoginMethods, handleLoginFail, handleLoginSuccess } from "./ui.js";
import { getComponent } from "./framework.js";



document.addEventListener('DOMContentLoaded', main)
function main(){
    const app = firebase.app();
    const db = firebase.firestore();
    /*
    console.log(db.collection('posts'), 'Collection');
    const myPost = db.collection('posts');
    myPost.onSnapshot(doc => {
        const data = doc;
        createPost(data.createdBy, data.createdAt, data.title, data.views, '')
    });
    showPosts();
    */
}

export function googleLogin(){
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
    .then(res => { 
        AppStorage.user = firebase.auth().currentUser;
        handleLoginSuccess()
    })
    .catch(() => { 
        handleLoginFail() 
    })
}

export function googleLogout(){
    firebase.auth().signOut().then(() => {console.log('user logout')});
}

export function facebookLogin(){
    return;
}

export function facebookLogout(){
    return;
}