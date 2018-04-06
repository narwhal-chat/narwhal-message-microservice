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
          'VALUES(${messageText, topicId, userId}) ' +
          'RETURNING id, messageText', 
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
      return await db.many('SELECT * FROM topic_message WHERE topic_id = ${topicId} ORDER BY create_date');
    } catch (e) {
      console.log(e);
    }
  }

  // createTopic: async (newTopic) => {
  //   try {
  //     const topic = await db.one('INSERT INTO topic(name, pod_id, author_id) ' +
  //         'VALUES(${name}, ${podId}, ${authorId}) ' +
  //         'RETURNING id, name', 
  //       {
  //         name: newTopic.name,
  //         podId: newTopic.podId,
  //         authorId: newTopic.userId
  //       });
  //     return topic;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // },
  
  // getPodsForUser: async (userId) => {
  //   try {
  //     const pods = await db.any('SELECT p.* FROM pod_user pu, pod p WHERE pu.pod_id = p.id AND pu.user_id = ${userId}', { userId: userId });
  //     return pods;
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
};

module.exports = {
  messages: messages
};
