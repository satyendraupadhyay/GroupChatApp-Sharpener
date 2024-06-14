// Decoding the Token: & save username & id
const token = localStorage.getItem('token');
const decodedToken = parseJwt(token);
const username = decodedToken.username;
const userId = decodedToken.userId;

// DOM Element References:
// Modal
const modalFooterContainer = document.getElementById('modalFooterContainer');
// NavBar
const usernameNav = document.getElementById('username-nav');
const logoutBtn = document.getElementById('logout-btn');

// Card footer send btn & chat bar
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');

// Groups
const groupList = document.getElementById('group-list'); // left grp
const chatContainer = document.getElementById('chat-container'); // right chats
const chatCardHeader = document.querySelector('.right-column .card-header');
const newGroupForm = document.getElementById('createGroupForm'); // modal
const groupNameInput = document.getElementById('groupName');

// Success & Error Msg Functions
function showErrorInDOM(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.role = 'alert';
    errorDiv.innerText = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function showSuccessInDOM(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.role = 'alert';
    successDiv.innerText = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Chat Functions
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
    };
    axios.post(`/chat`, chat, { headers: {Authorization: token} })
        .then((res) => {
            const message = res.data.message;
            const messageId = res.data.id;
            const chat = {
                id: messageId,
                message,
                user: { username }
            };
            const oldChats = localStorage.getItem('oldChats') ? JSON.parse(localStorage.getItem('oldChats')) : [];
            oldChats.push(chat);
            const chats = oldChats.slice(oldChats.length - STORED_CHATS_LENGTH);
            localStorage.setItem('oldChats', JSON.stringify(chats));
            showMyChatInDom(message);
        })
        .catch((err) => {
            const msg = err.response.data.msg ? err.response.data.msg : 'Could not add chat :(';
            showErrorInDOM(msg);
        });
}

function showChatInDOM(chat) {
    const li = document.createElement('li');
    li.innerText = `${chat.user.username}: ${chat.message}`;
    li.id = chat.userId;
    li.className = 'list-group-item bg-light';
    if (username === chat.user.username) {
        li.classList.add('text-success');
    }
    chatList.appendChild(li);
}

function showMessage() {
    const oldChats = localStorage.getItem('oldChats') ? JSON.parse(localStorage.getItem('oldChats')) : [];
    const lastmessageid = oldChats.length > 0 ? oldChats[oldChats.length - 1].id : -1;

    axios.get(`/all-chats?lastmessageid=${lastmessageid}`, { headers: {Authorization: token} })
        .then((res) => {
            const newChats = res.data;
            const totalChats = [...oldChats, ...newChats];
            const chats = totalChats.slice(totalChats.length - STORED_CHATS_LENGTH);
            localStorage.setItem('oldChats', JSON.stringify(chats));

            chats.forEach((chat) => {
                showChatInDOM(chat);
            });
        })
        .catch((err) => {
            const msg = err.response.data.msg ? err.response.data.msg : 'Could not fetch chats :(';
            showErrorInDOM(msg);
        });
}

// Group Functions
function handleGroupListClick(event) {
    // Remove 'active' class from all list items
    const listItems = groupList.querySelectorAll('.list-group-item');
    listItems.forEach(item => {
        item.classList.remove('active');
    });
    // Add 'active' class to the clicked list item
    const clickedItem = event.target;
    clickedItem.classList.add('active');

    // Update card header of chat section with group name
    chatCardHeader.textContent = clickedItem.textContent;

    // Fetch and display chat messages for the selected group
    const groupName = clickedItem.textContent;
    addMessage();
}

function showGroups() {
    axios.get(`/user/groups`, { headers: {Authorization: token} })
        .then((res) => {
            const groups = res.data.groups;
            groups.forEach((group) => {
                addGroupInDOM(group);
            });
        })
        .catch((err) => {
            console.log(err);
            showErrorInDOM('Could not fetch groups :(');
        });
}

function addGroupInDOM(group) {
    const newGroupItem = document.createElement('li');
    newGroupItem.classList.add('list-group-item', 'clickable');
    newGroupItem.textContent = group.groupName;
    groupList.appendChild(newGroupItem);
    $('#createGroupModal').modal('hide');
}

function createGroup(event) {
    event.preventDefault();
    const groupName = groupNameInput.value.trim();
    if (!groupName) {
        showErrorInDOM("Group name cannot be empty.");
        return;
    }

    // Collect selected user IDs
    const selectedUsers = [];
    const checkboxes = document.querySelectorAll('.form-check-input');
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            selectedUsers.push(checkbox.id); // Assuming the id is the username or user ID
        }
    });

    // Create the group object
    const group = {
        groupName,
        users: selectedUsers
    };

    axios.post(`/user/createGroup`, group, { headers: {Authorization: token} })
        .then((res) => {
            const group = res.data;
            addGroupInDOM(group);
            showSuccessInDOM('Group Created!');
            groupNameInput.value = '';
        })
        .catch((err) => {
            let msg = "Could not create group :(";
            if (err.response && err.response.data && err.response.data.msg) {
                msg = err.response.data.msg;
            }
            showErrorInDOM(msg);
        });
}

function showUsersInModal() {
    axios.get(`/user/user`, { headers: {Authorization: token} })
        .then((res) => {
            const users = res.data.users;

            users.forEach((user) => {
                const modalFooterFormDiv = document.createElement('div');
                modalFooterFormDiv.className = 'form-check';

                const modalFooterFormDivInput = document.createElement('input');
                modalFooterFormDivInput.className = "form-check-input";
                modalFooterFormDivInput.setAttribute('type', 'checkbox');
                modalFooterFormDivInput.setAttribute('id', `${user.username}`);

                const modalFooterFormDivLabel = document.createElement('label');
                modalFooterFormDivLabel.className = 'form-check-label';
                modalFooterFormDivLabel.setAttribute('for', `${user.username}`);
                modalFooterFormDivLabel.textContent = user.username

                modalFooterFormDiv.appendChild(modalFooterFormDivLabel);
                modalFooterFormDiv.appendChild(modalFooterFormDivInput);
                modalFooterContainer.appendChild(modalFooterFormDiv);
            });
                $('#createGroupModal').modal('hide');
        })
        .catch((err) => {
            console.log(err);
            showErrorInDOM('Could not fetch groups :(');
        });
}

// Other Functions
function showUserInfoInDOM() {
    usernameNav.innerText = username;
}

function logout() {
    if (confirm('Are you sure you want to logout ?')) {
        localStorage.clear();
        window.location.href = '/home';
    }
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    showUserInfoInDOM();
    showMessage();
    showGroups();
    showUsersInModal()
    sendBtn.addEventListener('click', addMessage);
    groupList.addEventListener('click', handleGroupListClick);
    newGroupForm.addEventListener('submit', createGroup);
    logoutBtn.addEventListener('click', logout);

    const commonGroupItem = document.querySelector('#group-list .list-group-item:first-child');
    if (commonGroupItem) {
        commonGroupItem.click();
    }
});
