const path = require('path');
const { Op } = require('sequelize');
const User = require('../models/user'); 
const Group = require('../models/group');
const Admin = require('../models/admin');

// Controller to delete a group
exports.deleteGroup = async (req, res) => {
    const { groupId } = req.params;

    try {
        // Find the group by ID
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ msg: 'Group not found' });
        }

        // Delete the group
        await group.destroy();

        return res.status(200).json({ msg: 'Group deleted successfully' });
    } catch (err) {
        console.error('DELETE GROUP ERROR:', err);
        return res.status(500).json({ msg: 'Could not delete group', error: err.message });
    }
};


exports.getGroupMembers = async (req, res) => {
    try {
        const groupId = req.query.groupId;

        const group = await Group.findByPk(groupId, {
            include: [
                {
                    model: Admin,
                    include: [
                        {
                            model: User,
                            attributes: ['username']
                        }
                    ]
                },
                {
                    model: User,
                    through: { attributes: [] }, // Exclude GroupUser attributes
                    attributes: ['username']
                }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const admin = group.admins[0]; // Assuming one admin per group
        const users = group.users;

        return res.status(200).json({
            message: "Success",
            admin: admin ? admin.user.username : null,
            users: users.map(user => user.username)
        });
    } catch (err) {
        console.error('GET GROUP MEMBERS ERROR:', err);
        res.status(500).json({ error: err.message, msg: 'Could not fetch group members' });
    }
};
