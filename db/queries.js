const promise = require('bluebird');

const options = {
  promiseLib: promise
};

const pgp = require('pg-promise')(options);
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/narwhal_messages';
const db = pgp(connectionString);

const messages = {
  // Add a message to a specific topic
  createMessage: async(userId, topicId, messageText) => {
    try {
      return await db.one('INSERT INTO topic_message(message_text, topic_id, author_id) ' +
          'VALUES(${messageText}, ${topicId}, ${userId}) ' +
          'RETURNING id, message_text', 
        {
          messageText: messageText,
          topicId: topicId,
          userId: userId
        });
    } catch (e) {
      console.log(e);
    }
  },

  // Return the last 200 messages for a specific topic
  getMessageHistoryForTopic: async(topicId) => {
    try {
      return await db.any('SELECT * FROM topic_message WHERE topic_id = ${topicId} ORDER BY create_date LIMIT 200',  { topicId: topicId });
    } catch (e) {
      console.log(e);
    }
  }
};

module.exports = {
  messages: messages
};
