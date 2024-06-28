const express = require('express');

const authentication = require('../middleware/auth');
const groupController = require('../controllers/group');

const router = express.Router();

router.get('/group/members', groupController.getGroupMembers);

module.exports = router;