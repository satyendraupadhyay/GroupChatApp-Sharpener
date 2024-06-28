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

// Chat
const chatContainer = document.getElementById('chat-container'); // right chats

// Card footer send btn & chat bar
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');

// Groups
const groupList = document.getElementById('group-list'); // left grp
const editChatCardHeader = document.getElementById('editGroupBtn');
const chatCardHeaderEditBtn = document.createElement('button'); // Edit button
const newGroupForm = document.getElementById('createGroupForm'); // modal
const groupNameInput = document.getElementById('groupName');

// Modal Buttons
const addMemberButton = document.createElement('button');

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

// Selected Group
let selectedGroup = null; // Variable to store the currently selected group

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
    editChatCardHeader.textContent = clickedItem.textContent;

    // Save the selected group details
    selectedGroup = {
        id: clickedItem.dataset.groupId,
        name: clickedItem.textContent
    };

    // Fetch and display chat messages for the selected group
    const groupId = clickedItem.dataset.groupId;
    showMessage(groupId); // Fetch and display messages for the selected group
}


function showChatInDOM(chat) {
    const li = document.createElement('div');
    li.className = 'chat-message'; // Use custom chat-message class
    li.classList.add(username === chat.user.username ? 'current-user' : 'other-user');
    li.innerHTML = `<strong>${chat.user.username}:</strong> ${chat.message}`;
    chatContainer.appendChild(li);
}

function showMyChatInDom(message) {
    const li = document.createElement('div');
    li.className = 'chat-message current-user'; // Use custom chat-message and current-user class
    li.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatContainer.appendChild(li); // Append to chat container
    messageInput.value = ''; // Clear message input after sending
}

// Function to add a new message
function addMessage() {
    const chat = {
        userId,
        message: messageInput.value,
        groupId: selectedGroup.id
    };
    
    axios.post(`/chat`, chat, { headers: { Authorization: token } })
        .then((res) => {
            const message = res.data.message;
            const messageId = res.data.id;
            console.log(res);
            
            // Display the message in the chat container
            showMyChatInDom(message);
        })
        .catch((err) => {
            const msg = err.response && err.response.data && err.response.data.msg ? err.response.data.msg : 'Could not add chat :(';
            showErrorInDOM(msg);
        });
}

function showMessage(groupId) {
    axios.get(`/all-chats?groupId=${groupId}`, { headers: { Authorization: token } })
        .then((res) => {
            const chats = res.data;

            // Clear existing messages in chatContainer
            chatContainer.innerHTML = '';

            // Append each chat message to chatContainer
            chats.forEach((chat) => {
                showChatInDOM(chat);
            });
        })
        .catch((err) => {
            const msg = err.response && err.response.data && err.response.data.msg ? err.response.data.msg : 'Could not fetch chats :(';
            showErrorInDOM(msg);
        });
}

function editBtn() {
     editBtnModel();
    showGroupMembers();
}

function editBtnModel() {
    if (!selectedGroup) {
        return; // No group selected, exit the function
    }

    // Remove any existing modals to avoid duplicates
    const existingModal = document.getElementById('editGroupModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal structure
    const createEditBtnModal = document.createElement('div');
    createEditBtnModal.setAttribute('class', 'modal fade');
    createEditBtnModal.setAttribute('id', 'editGroupModal');
    createEditBtnModal.setAttribute('tabindex', '-1');
    createEditBtnModal.setAttribute('aria-labelledby', 'editGroupModalLabel');
    createEditBtnModal.setAttribute('aria-hidden', 'true');

    const createEditBtnModalDialog = document.createElement('div');
    createEditBtnModalDialog.setAttribute('class', 'modal-dialog');

    const createEditBtnModalDialogContent = document.createElement('div');
    createEditBtnModalDialogContent.setAttribute('class', 'modal-content');

    const createEditBtnModalDialogContentHeader = document.createElement('div');
    createEditBtnModalDialogContentHeader.setAttribute('class', 'modal-header');

    const createEditBtnModalDialogContentHeaderH5 = document.createElement('h5');
    createEditBtnModalDialogContentHeaderH5.setAttribute('class', 'modal-title');
    createEditBtnModalDialogContentHeaderH5.setAttribute('id', 'editGroupModalLabel');
    createEditBtnModalDialogContentHeaderH5.textContent = 'Members';

    const createEditBtnModalDialogContentHeaderBtn = document.createElement('button');
    createEditBtnModalDialogContentHeaderBtn.setAttribute('class', 'btn-close');
    createEditBtnModalDialogContentHeaderBtn.setAttribute('type', 'button');
    createEditBtnModalDialogContentHeaderBtn.setAttribute('data-bs-dismiss', 'modal');
    createEditBtnModalDialogContentHeaderBtn.setAttribute('aria-label', 'Close');

    createEditBtnModalDialogContentHeader.appendChild(createEditBtnModalDialogContentHeaderH5);
    createEditBtnModalDialogContentHeader.appendChild(createEditBtnModalDialogContentHeaderBtn);
    createEditBtnModalDialogContent.appendChild(createEditBtnModalDialogContentHeader);

    const createEditBtnModalDialogContentBody = document.createElement('div');
    createEditBtnModalDialogContentBody.setAttribute('class', 'modal-body');
    createEditBtnModalDialogContentBody.textContent = `Loading group members for: ${selectedGroup.name}...`;

    createEditBtnModalDialogContent.appendChild(createEditBtnModalDialogContentBody);

    const createEditBtnModalDialogContentFooter = document.createElement('div');
    createEditBtnModalDialogContentFooter.setAttribute('class', 'modal-footer');

    addMemberButton.setAttribute('class', 'btn btn-primary');
    addMemberButton.textContent = 'Add members';
    // addMemberButton.addEventListener('click', showAddMembersModal);

    const exitGrpButton = document.createElement('button');
    exitGrpButton.setAttribute('class', 'btn btn-danger');
    exitGrpButton.textContent = 'Exit group';

    createEditBtnModalDialogContentFooter.appendChild(addMemberButton);
    createEditBtnModalDialogContentFooter.appendChild(exitGrpButton);
    createEditBtnModalDialogContent.appendChild(createEditBtnModalDialogContentFooter);

    createEditBtnModalDialog.appendChild(createEditBtnModalDialogContent);
    createEditBtnModal.appendChild(createEditBtnModalDialog);

    document.body.appendChild(createEditBtnModal); // Append to body or appropriate parent

    // Show the modal
    const modalInstance = new bootstrap.Modal(createEditBtnModal);
    modalInstance.show(); 
}

function showGroupMembers() {
    axios.get('/group/members', { params: { groupId: selectedGroup.id } })
        .then(response => {
            const { admin, users } = response.data;

            // Find the modal body
            const modalBody = document.querySelector('#editGroupModal .modal-body');

            // Clear previous content
            modalBody.innerHTML = '';

            // Create the users list
            const usersList = document.createElement('ul');
            usersList.setAttribute('class', 'list-group');

            users.forEach(user => {
                const userItem = document.createElement('li');
                userItem.setAttribute('class', 'list-group-item');
                userItem.textContent = user;

                // If the user is the admin, append "(Admin)" to the username
                if (user === admin) {
                    const adminBadge = document.createElement('span');
                    adminBadge.setAttribute('class', 'badge bg-primary ms-2');
                    adminBadge.textContent = 'Admin';
                    userItem.appendChild(adminBadge);
                }

                usersList.appendChild(userItem);
            });

            modalBody.appendChild(usersList);
        })
        .catch(error => {
            console.error(error);
            const modalBody = document.querySelector('#editGroupModal .modal-body');
            modalBody.innerHTML = 'Failed to load group members.';
        });
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
    newGroupItem.dataset.groupId = group.id; // Save the group ID for future reference
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
            console.log(`Checkbox with ID ${checkbox.id} is checked`); // Debugging log
            selectedUsers.push(checkbox.value); // Assuming the id is the username or user ID
        } else {
            console.log(`Checkbox with ID ${checkbox.id} is not checked`); // Debugging log
        }
    });

    // Create the group object
    const group = {
        groupName,
        selectedUsers: selectedUsers
    };

    console.log(group);

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
                modalFooterFormDivInput.setAttribute('id', `${user.id}`);
                modalFooterFormDivInput.setAttribute('value', `${user.id}`);

                const modalFooterFormDivLabel = document.createElement('label');
                modalFooterFormDivLabel.className = 'form-check-label';
                modalFooterFormDivLabel.setAttribute('for', `${user.id}`);
                modalFooterFormDivLabel.textContent = user.username;

                modalFooterFormDiv.appendChild(modalFooterFormDivInput);
                modalFooterFormDiv.appendChild(modalFooterFormDivLabel);
                modalFooterContainer.appendChild(modalFooterFormDiv);
            });
            $('#createGroupModal').modal('hide');
        })
        .catch((err) => {
            console.log(err);
            showErrorInDOM('Could not fetch users :(');
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
    editChatCardHeader.addEventListener('click', editBtn);
    sendBtn.addEventListener('click', addMessage);
    groupList.addEventListener('click', handleGroupListClick);
    newGroupForm.addEventListener('submit', createGroup);
    logoutBtn.addEventListener('click', logout);

    const commonGroupItem = document.querySelector('#group-list .list-group-item:first-child');
    if (commonGroupItem) {
        commonGroupItem.click();
    }
    
});
