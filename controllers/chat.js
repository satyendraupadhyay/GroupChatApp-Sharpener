const path = require('path');

const {Op} = require('sequelize');

const Chat = require('../models/chat');
const User = require('../models/user');

exports.getChat = (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','chat.html'));
}

exports.postChat = async (req, res) => {
    
        const userId = req.body.userId;
        const message = req.body.message;
        const groupId = req.body.groupId;

        if(!userId || !message){
            res.status(400).json({ msg: 'All fields are required '});
            return;
        }

        const chat = await Chat.create({
            message,
            userId,
            groupId
        });

        res.status(200).json(chat);
    
}

exports.getAllChats = async (req, res) => {
    const { groupId } = req.query;

    try {
        if (!groupId) {
            return res.status(400).json({ msg: 'Group ID is required' });
        }

        const chats = await Chat.findAll({
            where: { groupId },
            include: [{ model: User, attributes: ['username'] }]
        });

        res.status(200).json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Could not fetch chats' });
    }
};
