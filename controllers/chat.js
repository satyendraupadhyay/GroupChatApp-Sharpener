const path = require('path');

const Chat = require('../models/chat');
const User = require('../models/user');

exports.getChat = (req, res) => {
    res.sendFile(path.join(__dirname,'..','views','chat.html'));
}

exports.postChat = async (req, res) => {
    
        const userId = req.body.userId;
        const message = req.body.message;

        console.log(userId);
        console.log(message);

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
    
        const chats = await Chat.findAll({
            include: [{
                model: User,
                attributes: ['username']
            }]
        });
        res.status(200).json(chats);
    
}