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

        console.log('Request body:', req.body); // Log the request body

        if (!groupName) {
            console.error('Group name is required');
            return res.status(400).json({ msg: 'Group name is required' });
        }

        console.log('Creating group with name:', groupName);

        // Create the group
        const group = await Group.create({ groupName });

        console.log('Group created with ID:', group.id);

        // Add the current user as the admin of the group
        await Admin.create({
            userId: user.id,
            groupId: group.id
        });

        console.log('Admin created for group:', group.id, 'with user ID:', user.id);

        // Find the users by their IDs
        const users = await User.findAll({
            where: {
                id: selectedUsers
            }
        });

        console.log('Users found:', users.map(u => u.id));

        // Add users to the group
        await group.addUsers(users);

        console.log('Users added to group:', group.id);

        res.status(201).json(group);
    } catch (err) {
        console.error('POST CREATE GROUP ERROR:', err);
        res.status(500).json({ error: err.message, msg: 'Could not create group' });
    }
};
