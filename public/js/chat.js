// Decoding the Token & saving username & id
const token = localStorage.getItem('token');
const { username, userId } = parseJwt(token);

// DOM Element References
const modalFooterContainer = document.getElementById('modalFooterContainer');
const usernameNav = document.getElementById('username-nav');
const logoutBtn = document.getElementById('logout-btn');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');
const groupList = document.getElementById('group-list');
const editChatCardHeader = document.getElementById('editGroupBtn');
const newGroupForm = document.getElementById('createGroupForm');
const groupNameInput = document.getElementById('groupName');
const groupChatContainer = document.getElementById('group-chat-container');
const groupChatCard = document.getElementById('group-chat-card');
const groupPlaceholderImage = document.getElementById('group-placeholder-image');

// Display Functions
function showError(message) {
    const errorDiv = createAlertDiv('danger', message);
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = createAlertDiv('success', message);
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function createAlertDiv(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.role = 'alert';
    alertDiv.innerText = message;
    return alertDiv;
}

function toggleCardAndImage(showCard) {
    groupChatCard.classList.toggle('d-none', !showCard);
    groupPlaceholderImage.classList.toggle('d-none', showCard);
}

function handleGroupListClick(event) {
    [...groupList.querySelectorAll('.list-group-item')].forEach(item => item.classList.remove('active'));
    const clickedItem = event.target;
    clickedItem.classList.add('active');
    selectedGroup = { id: clickedItem.dataset.groupId, name: clickedItem.textContent };
    localStorage.setItem('selectedGroupId', selectedGroup.id); // Save selected group ID
    editChatCardHeader.textContent = selectedGroup.name;
    toggleCardAndImage(!!selectedGroup);
    showMessages(selectedGroup.id);
}


function showChatInDOM(chat) {
    const chatDiv = document.createElement('div');
    chatDiv.className = `chat-message ${username === chat.user.username ? 'current-user' : 'other-user'}`;
    chatDiv.innerHTML = `<strong>${chat.user.username}:</strong> ${chat.message}`;
    chatContainer.appendChild(chatDiv); // Append instead of prepend

    // Scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showMyChatInDOM(message) {
    const chatDiv = document.createElement('div');
    chatDiv.className = 'chat-message current-user';
    chatDiv.innerHTML = `<strong>${username}:</strong> ${message}`;
    chatContainer.appendChild(chatDiv); // Append instead of prepend
    messageInput.value = '';

    // Scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// Fetch & Display Functions
function addMessage(event) {
    event.preventDefault();
    const chat = { userId, message: messageInput.value, groupId: selectedGroup.id };
    axios.post(`/chat`, chat, { headers: { Authorization: token } })
        .then(res => showMyChatInDOM(res.data.message))
        .catch(err => showError(err.response?.data?.msg || 'Could not add chat :('));
}

function showMessages(groupId) {
    axios.get(`/all-chats?groupId=${groupId}`, { headers: { Authorization: token } })
        .then(res => {
            chatContainer.innerHTML = '';
            res.data.forEach(showChatInDOM);
        })
        .catch(err => showError(err.response?.data?.msg || 'Could not fetch chats :('));
}

function showGroups() {
    axios.get(`/user/groups`, { headers: { Authorization: token } })
        .then(res => {
            res.data.groups.forEach(addGroupInDOM);

            // Select saved group after all groups are added to the DOM
            const savedGroupId = localStorage.getItem('selectedGroupId');
            if (savedGroupId) {
                const savedGroupItem = groupList.querySelector(`[data-group-id="${savedGroupId}"]`);
                if (savedGroupItem) {
                    savedGroupItem.click();
                } else {
                    toggleCardAndImage(false);
                }
            } else {
                toggleCardAndImage(false);
            }
        })
        .catch(() => showError('Could not fetch groups :('));
}


function addGroupInDOM(group) {
    if (!groupList.querySelector(`[data-group-id="${group.id}"]`)) {
        const groupItem = document.createElement('li');
        groupItem.classList.add('list-group-item', 'clickable');
        groupItem.dataset.groupId = group.id;
        groupItem.textContent = group.groupName;
        groupList.appendChild(groupItem);
        $('#createGroupModal').modal('hide');
    }
}

function createGroup(event) {
    event.preventDefault();
    const groupName = groupNameInput.value.trim();
    if (!groupName) return showError("Group name cannot be empty.");

    const selectedUsers = [...document.querySelectorAll('.form-check-input:checked')].map(cb => cb.value);
    const group = { groupName, selectedUsers };

    axios.post(`/user/createGroup`, group, { headers: { Authorization: token } })
        .then(res => {
            addGroupInDOM(res.data);
            showSuccess('Group Created!');
            groupNameInput.value = '';
        })
        .catch(err => showError(err.response?.data?.msg || 'Could not create group :('));
}

function showUsersInModal() {
    axios.get(`/user/user`, { headers: { Authorization: token } })
        .then(res => res.data.users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'form-check';
            userDiv.innerHTML = `
                <input type="checkbox" class="form-check-input" id="${user.id}" value="${user.id}">
                <label for="${user.id}" class="form-check-label">${user.username}</label>`;
            modalFooterContainer.appendChild(userDiv);
        }))
        .catch(() => showError('Could not fetch users :('));
}

function editGroupModal() {
    if (!selectedGroup) return;
    document.getElementById('editGroupModal')?.remove();
    const modalHTML = `
        <div class="modal fade" id="editGroupModal" tabindex="-1" aria-labelledby="editGroupModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editGroupModalLabel">Members</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">Loading group members for: ${selectedGroup.name}...</div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="addMemberButton">Add members</button>
                        <button class="btn btn-danger" id="exitGroupButton">Exit group</button>
                    </div>
                </div>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    new bootstrap.Modal(document.getElementById('editGroupModal')).show();
    showGroupMembers();

    // Add event listener to the Exit Group button
    document.getElementById('exitGroupButton').addEventListener('click', exitGroup);
}

function exitGroup() {
    if (!selectedGroup) return;

    if (confirm('Are you sure you want to exit and delete this group?')) {
        axios.delete(`/group/${selectedGroup.id}`, { headers: { Authorization: token } })
            .then(() => {
                showSuccess('Group deleted successfully');
                localStorage.removeItem(`chats_${selectedGroup.id}`);
                localStorage.removeItem('selectedGroupId');
                window.location.reload();
            })
            .catch(err => showError(err.response?.data?.msg || 'Could not delete group :('));
    }
}


function showGroupMembers() {
    axios.get('/group/members', { params: { groupId: selectedGroup.id } })
        .then(res => {
            const { admin, users } = res.data;
            const modalBody = document.querySelector('#editGroupModal .modal-body');
            modalBody.innerHTML = users.map(user => `
                <li class="list-group-item">${user}${user === admin ? '<span class="badge bg-primary ms-2">Admin</span>' : ''}</li>
            `).join('');
        })
        .catch(() => {
            document.querySelector('#editGroupModal .modal-body').innerHTML = 'Failed to load group members.';
        });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = '/home';
    }
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join(''));
    return JSON.parse(jsonPayload);
}

// Event Listeners
window.addEventListener('DOMContentLoaded', () => {
    usernameNav.innerText = username;
    showGroups();
    showUsersInModal();
    editChatCardHeader.addEventListener('click', editGroupModal);
    sendBtn.addEventListener('click', addMessage);
    groupList.addEventListener('click', handleGroupListClick);
    newGroupForm.addEventListener('submit', createGroup);
    logoutBtn.addEventListener('click', logout);

    const savedGroupId = localStorage.getItem('selectedGroupId');
    if (savedGroupId) {
        const savedGroupItem = groupList.querySelector(`[data-group-id="${savedGroupId}"]`);
        if (savedGroupItem) {
            savedGroupItem.click();
        } else {
            toggleCardAndImage(false);
        }
    } else {
        toggleCardAndImage(false);
    }

    // Add event listener for load more button
    document.getElementById('load-more-btn').addEventListener('click', loadMoreMessages);
});
