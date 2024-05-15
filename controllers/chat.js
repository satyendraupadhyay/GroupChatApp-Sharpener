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

        if(!userId || !message){
            res.status(400).json({ msg: 'All fields are required '});
            return;
        }

        const chat = await Chat.create({
            message,
            userId
        });

        res.status(200).json(chat);
    
}

exports.getAllChats = async (req, res) => {
    
    const lastmessageid = req.query.lastmessageid;
    const chats = await Chat.findAll({
        where: { id: { [Op.gt]: lastmessageid } }, // id > lastmessageid
        attributes: ['id', 'message'],
        include: [{
            model: User,
            attributes: ['username']
        }]
    });
    res.status(200).json(chats);
    
}