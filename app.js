const express = require('express');
const bodyParser = require('body-parser');
const client = require('@mailchimp/mailchimp_marketing');
require('dotenv').config();
// import 'dotenv/config';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const express = require('express');
// const bodyParser = require('body-parser');
// const request = require('request');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

client.setConfig({
  apiKey: process.env.MAILCHIMP_KEY,
  server: process.env.MAILCHIMP_KEY.split('-')[1],
});
const audienceId = process.env.AUDIENCE_ID;

const fileDir = `${__dirname}/src/pages`;

app.get('/', (req, res) => {
  res.redirect('/signup');
});

app.get('/signup', (req, res) => {
  res.sendFile(fileDir + '/signup.html');
});
app.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const payload = {
      members: [
        {
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
        },
      ],
    };
    const response = await client.lists.batchListMembers(audienceId, payload);
    if (response.errors.length > 0) {
      throw Error(response.errors[0].error);
    }
    console.log(JSON.stringify(response.new_members));
    res.redirect('/success');
  } catch (err) {
    console.log(JSON.stringify(err.message));
    res.redirect('/error');
  }
});

app.get('/success', (req, res) => {
  res.sendFile(fileDir + '/success.html');
});

app.get('/error', (req, res) => {
  res.sendFile(fileDir + '/failure.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listening to port ${port}`);
});
