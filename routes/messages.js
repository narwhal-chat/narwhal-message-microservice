const express = require('express');
const router = express.Router();

const db = require('../db/queries');



// router.get('/:userId', async (req, res, next) => {
//   try {
//     const results = await db.pods.getPodsForUser(req.params.userId);
//     res.json(results);
//   } catch (e) {
//     res.sendStatus(400);
//   }
// });

module.exports = router;
