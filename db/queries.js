const promise = require('bluebird');

const options = {
  promiseLib: promise
};

const pgp = require('pg-promise')(options);
const messagesConnectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/narwhal_messages';
const usersConnectionString = process.env.USERS_DATABASE_URL || 'postgres://localhost:5432/narwhal_users';
const dbMessages = pgp(messagesConnectionString);
const dbUsers = pgp(usersConnectionString);

const messages = {
  // Add a message to a topic
  createMessage: async(userId, topicId, messageText) => {
    try {
      return await dbMessages.one('INSERT INTO topic_message(message_text, topic_id, author_id) ' +
          'VALUES(${messageText}, ${topicId}, ${userId}) ' +
          'RETURNING id, message_text, topic_id, author_id, create_date, last_update_date', 
        {
          messageText: messageText,
          topicId: topicId,
          userId: userId
        });
    } catch (e) {
      console.log(e);
    }
  },

  // Return the last 200 messages for a topic
  getMessageHistoryForTopic: async(topicId) => {
    try {
      const messageResults = await dbMessages.any('SELECT id, message_text, topic_id, author_id, create_date, last_update_date ' +
          'FROM topic_message WHERE topic_id = ${topicId} ORDER BY create_date LIMIT 200',  { topicId: topicId }
      );
      const userIds = messageResults.map((message) => {
        return [message.author_id];
      });
      const users = await dbUsers.any('SELECT id, username FROM users WHERE id IN ($1)', [1, userIds]);
      const messages = [];
      for (let message of messageResults) {
        for (let user of users) {
          if (message.author_id = user.id) {
            message.username = user.username;
            messages.push(message);
          }
        }
      }
      return messages;
    } catch (e) {
      console.log(e);
    }
  }
};

module.exports = {
  messages: messages
};
