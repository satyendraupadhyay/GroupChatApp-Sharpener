const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const User = require('../models/user');
const Group = require('../models/group');
const Admin = require('../models/admin');

exports.authenticateUser = async (req, res, next) => {
    try{
        const token = req.headers.authorization;

        if(!token) {
            res.status(400).json({msg: 'token required'})
            return;
        }
        const userFromReq = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await User.findByPk(userFromReq.userId);

        req.user = user;
        next();

    } catch(err) {
        console.log('USER AUTHENTICATION ERROR');
        res.status(500).json({error: err, msg: 'Could not fetch user' });
    }
}

exports.authenticateUserGroup = async (req, res, next) => {
    try{
        const token = req.headers.authorization;
        const groupId = req.query.groupId;

        if(!token) {
            res.status(400).json({msg: 'token required'});
            return;
        }

        if (!groupId) {
            res.status(400).json({msg: 'groupId required'});
            return;
        }

        const userFromReq = jwt.verify(token, process.env.JWT_SECRET_KEY);

        const group = await Group.findOne({
            where: {id: groupId},
            include: [{
                model: User,
                where: {id: userFromReq.userId}
            }]
        });

        if (!group) {
            res.status(400).json({msg: 'User not authorized or Group not found'});
            return;
        }

        req.group = group;
        req.user = group.users[0];
        next();

    } catch(err) {
        console.log('USER GROUP AUTHENTICATION ERROR');
        res.status(500).json({error: err, msg: 'Could not verify user in the group'})

    }
}

exports.authenticateGroupAdmin = async (req, res, next) => {
    const token = req.headers.authorization;
    const groupId = req.query.groupId;

    if(!token) {
        res.status(400).json({msg: 'token required'});
        return;
    }

    if (!groupId) {
        res.status(400).json({msg: 'groupId required'});
        return;
    }

    const reqFromUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = reqFromUser.userId;

    const check = await Admin.findOne({
        where: {
            [Op.and]: [
                {groupId},
                {userId}
            ]
        },
        include: [{
            model: User
        }, {
            model: Group
        }]
    })

    if(!check) {
        res.status(400).json({msg: 'User needs to the admin'});
        return;
    }

    req.group = check.group;
    req.user = check.user;
    next();
}