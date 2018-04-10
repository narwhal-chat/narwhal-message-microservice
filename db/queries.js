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
      const messageResults = await dbMessages.one('INSERT INTO topic_message(message_text, topic_id, author_id) ' +
          'VALUES(${messageText}, ${topicId}, ${userId}) ' +
          'RETURNING id, message_text, topic_id, author_id, create_date, last_update_date', 
        {
          messageText: messageText,
          topicId: topicId,
          userId: userId
        });

      const user = await dbUsers.one('SELECT id, username, avatar FROM users WHERE id = ${userId}', { userId: messageResults.author_id });

      const message = [];
      if (messageResults.author_id === user.id) {
        messageResults.username = user.username;
        messageResults.avatar = user.avatar;
        message.push(messageResults);
      }

      return message;
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
        return message.author_id;
      });
      
      // Get each unique author ID
      const uniqueIds = [...new Set(userIds)];
      const userResults = await dbUsers.any('SELECT id, username, avatar FROM users WHERE id IN ($1:csv)', [uniqueIds]);
      // Convert user results to an object for faster lookup
      const users = userResults.reduce((acc, user) => {
        acc[user.id] = { id: user.id, username: user.username, avatar: user.avatar };
        return acc;
      }, {});

      const messages = [];
      for (let message of messageResults) {
        if (message.author_id === users[message.author_id].id) {
          message.username = users[message.author_id].username;
          message.avatar = users[message.author_id].avatar
          messages.push(message);
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
