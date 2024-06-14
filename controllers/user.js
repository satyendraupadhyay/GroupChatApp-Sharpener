const User = require('../models/user'); 
const Group = require('../models/group');
const Admin = require('../models/admin');

exports.getUserGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        return res.status(200).json({ groups, message: "All groups succesfully fetched" });
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
        const user = req.user;
        console.log(user);
        const groupName = req.body.groupName;

        if (!groupName) {
            console.error('Group name is required');
            return res.status(400).json({ msg: 'Group name is required' });
        }
        const group = await Group.create({ groupName });

        await user.addGroup(group);

        await Admin.create({
            userId: user.id,
            groupId: group.id
        });

        console.log('Group created:', group);
        res.status(201).json(group);
    } catch (err) {
        console.error('POST CREATE GROUP ERROR:', err);
        res.status(500).json({ error: err.message, msg: 'Could not create group' });
    }
}
