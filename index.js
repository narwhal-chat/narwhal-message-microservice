const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3335;

const messages = require('./routes/messages');

// body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/messages', messages);

app.listen(port, () => {
  console.log('Listening on port: ', port);
});
