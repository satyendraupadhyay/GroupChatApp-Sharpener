const User = require('../models/user'); 
const Group = require('../models/group');
const Admin = require('../models/admin');

exports.getUserGroups = async (req, res) => {
    try {

        const userId = req.user.id;

        const adminGroups = await Group.findAll({
            include: [{
                model: Admin,
                where: {userId}
            }]
        });

        const memberGroups = await Group.findAll({
            include: [{
                model: User,
                where: {id: userId},
                attributes: []
            }]
        });

        const allGroups = [...new Set([...adminGroups, ...memberGroups])];
        return res.status(200).json({ groups: allGroups, message: "All groups succesfully fetched" });
    } catch (err) {
        console.error('GET USER GROUPS ERROR:', err);
        res.status(500).json({ error: err.message, msg: 'Could not fetch current user groups' });
    }
}
  
exports.getUsers = async (req, res) => {
    try{
        const users = await User.findAll();
        return res.status(200).json({ users, message: "All users succesfully fetched" });
    } catch (err) {
        console.error('GET USER GROUPS ERROR:', err);
        res.status(500).json({ error: err.message, msg: 'Could not fetch current user' });
    }
}

exports.postCreateGroup = async (req, res) => {
    try {
        const user = req.user;  // Assuming req.user contains the authenticated user
        const { groupName, selectedUsers } = req.body;

        if (!groupName) {
            return res.status(400).json({ msg: 'Group name is required' });
        }

        // Create the group
        const group = await Group.create({ groupName });

        // Add the current user as the admin of the group
        await Admin.create({ userId: user.id, groupId: group.id });

        // Ensure the admin is always included in the selected users
        const uniqueUserIds = [...new Set([...selectedUsers, user.id])];

        // Find the users by their IDs and add them to the group
        const users = await User.findAll({ where: { id: uniqueUserIds } });
        await group.addUsers(users);

        res.status(201).json(group);
    } catch (err) {
        console.error('POST CREATE GROUP ERROR:', err);
        res.status(500).json({ error: err.message, msg: 'Could not create group' });
    }
};
