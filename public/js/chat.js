const STORED_CHATS_LENGTH = 10;

const token = localStorage.getItem('token');
const decodedToken = parseJwt(token);
const username = decodedToken.username;
const userId = decodedToken.userId;

const usernameNav = document.getElementById('username-nav');
const chatList = document.getElementById('chat-list');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');
const logoutBtn = document.getElementById('logout-btn');

function showUserInfoInDOM(){
    usernameNav.innerText = username;
}

function showMyChatInDom(message) {
    const li = document.createElement('li');
    li.innerText = `${username}: ${message}`;
    li.id = userId;
    li.className = 'list-group-item bg-light';
    li.classList.add('text-success');
    chatList.appendChild(li);
    messageInput.value = '';
}

function addMessage() {
    const chat = {
        userId,
        message: messageInput.value
    }
    axios.post(`/chat`, chat)
    .then((res) => {
        const message = res.data.message;
        const messageId = res.data.id;
        const chat = {
            id: messageId,
            message,
            user: {username}
        };
        const oldChats = localStorage.getItem('oldChats') ? JSON.parse(localStorage.getItem('oldChats')) : [];
        oldChats.push(chat);
        const chats = oldChats.slice(oldChats.length - STORED_CHATS_LENGTH);
        localStorage.setItem('oldChats', JSON.stringify(chats));
        showMyChatInDom(message);

    })
    .catch((err) => {
        const msg = err.response.data.msg ? err.response.data.msg : 'Could not add chat :(';
    })
}

function showChatInDOM(chat) {
    const li = document.createElement('li');
    li.innerText = `${chat.user.username}: ${chat.message}`;
    li.id = chat.userId;
    li.className = 'list-group-item bg-light';
    if(username === chat.user.username){
        li.classList.add('text-success');
    }
    chatList.appendChild(li);
}

function showMessage(){
    const oldChats = localStorage.getItem('oldChats') ? JSON.parse(localStorage.getItem('oldChats')) : [];
    const lastmessageid = oldChats.length > 0 ? oldChats[oldChats.length-1].id : -1;

    axios.get(`/all-chats?lastmessageid=${lastmessageid}`)
    .then((res) => {
        const newChats = res.data;
        const totalChats = [...oldChats, ...newChats];
        const chats = totalChats.slice(totalChats.length - STORED_CHATS_LENGTH);
        localStorage.setItem('oldChats', JSON.stringify(chats));
        
        chats.forEach((chat) => {
            showChatInDOM(chat)
        });
    })
    .catch((err) => {
        const msg = err.response.data.msg ? err.response.data.msg : 'Could not fetch chats :(';
        
    });
}

function logout(){
    if(confirm('Are you sure you want to logout ?')){
        localStorage.clear();
        window.location.href = '/';
    }
}


function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', () => {
    showUserInfoInDOM();
    showMessage();
    sendBtn.addEventListener('click', addMessage);
    logoutBtn.addEventListener('click', logout);
});