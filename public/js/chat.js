const token = localStorage.getItem('token');
const decodedToken = parseJwt(token);
const username = decodedToken.username;
const userId = decodedToken.userId;

const usernameNav = document.getElementById('username-nav');
const chatList = document.getElementById('chat-list');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');

function showUserInfoInDOM(){
    usernameNav.innerText = username;
}

function addMessage() {
    const chat = {
        userId,
        message: messageInput.value
    }
    axios.post(`/chat`, chat)
    .then((res) => {
        const message = res.data.message;
        const li = document.createElement('li');
        li.innerText = `${username}: ${message}`;
        li.id = userId;
        li.className = 'list-group-item bg-light';
        li.classList.add('text-success');
        chatList.appendChild(li);
        messageInput.value = '';
    })
    .catch((err) => {
        const msg = err.response.data.msg ? err.response.data.msg : 'Could not add chat :(';
        
    })
}

function showMessage(){
    axios.get(`/all-chats`)
    .then((res) => {
        const chats = res.data;
        chats.forEach((chat) => {
            const li = document.createElement('li');
            li.innerText = `${chat.user.username}: ${chat.message}`;
            li.id = chat.userId;
            li.className = 'list-group-item bg-light';
            if(username === chat.user.username){
                li.classList.add('text-success');
            }
            chatList.appendChild(li);
        });
    })
    .catch((err) => {
        const msg = err.response.data.msg ? err.response.data.msg : 'Could not fetch chats :(';
        
    });
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
});