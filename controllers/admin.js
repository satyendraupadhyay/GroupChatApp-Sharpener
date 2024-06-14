const {Op} = require('sequelize');

const User = require('../models/user');
const Admin = require('../models/admin');

exports.deleteGroupMember = async (req, res) => {
    try{

        const memberEmail = req.query.email;
        const group = req.group;
        const user = req.user;

        if (user.email === memberEmail) {
            res.status(400).json({msg: 'You cannot remove yourself from the group, pls use leave group feature'})
            return;
        }

        const member = await User.findOne({
            where: {email: memberEmail}
        });

        if (!member) {
            res.status(400).json({msg: 'member not found'});
            return;
        }

        const memberAdminCheck = await Admin.findOne({
            where: {
                [Op.and]: [
                    {userId: member.id},
                    {groupId: group.id}
                ]
            }
        });

        if(!memberAdminCheck) {
            res.status(400).json({msg: 'Admin cannot remove another admin from the group'});
            return;
        }

        await group.removeUser(member);

        res.status(200).json({
            msg: `Member <${member.username}> removed from the group <${group.groupname}> by admin <${user.username}>`
        })


    } catch(err) {
        console.log('DELETE GROUP MEMBER ERROR');
        res.status(500).json({error: err, msg: 'Could not delete group member'});
    }
}

exports.postPromoteGroupMemberToAdmin = async (req, res) => {
    try{
        const memberEmail = req.body.memberEmail;
        const group = req.group;
        const user = req.user;

        if(!memberEmail) {
            res.status(400).json({msg: 'Member email not found'});
            return;
        }

        if(user.email === memberEmail) {
            res.status(400).json({msg: 'You cannot remove yourself from the group, use leave group feature'});
            return;
        }

        const member = await User.findOne({
            where: {
                [Op.and]: [
                    {userId: member.id},
                    {groupId: group.id}
                ]
            }
        });

        if(memberAdminCheck) {
            res.status(400).json({msg: 'Member is already an admin'});
            return;
        }

        await Admin.create({
            userId: member.id,
            groupId: group.id
        });

        res.status(201).json({msg: `Member <${member.username}> promoted to admin by <${user.username}>`});
    } catch (err) {
        console.log('POST PROMOTE GROUP MEMBER TO ADMIN ERROR');
        res.status(500).json({error: err, msg: "Could not promote group member to admin"});
    }
}