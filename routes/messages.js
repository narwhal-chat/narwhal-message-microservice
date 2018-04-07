const express = require('express');
const router = express.Router();

const db = require('../db/queries');

router.post('/new-message', async (req, res, next) => {
  try {
    console.log(req.body);
    const results = await db.messages.createMessage(req.body.userId, req.body.topicId, req.body.messageText);
    res.json(results);
  } catch (e) {
    res.sendStatus(400);
  }
});

router.get('/history/:topicId', async (req, res, next) => {
  try {
    const results = await db.messages.getMessageHistoryForTopic(req.params.topicId);
    res.json(results);
  } catch (e) {
    res.sendStatus(400);
  }
});

module.exports = router;
