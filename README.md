# slavedriver <img src="https://raw.githubusercontent.com/Sunlis/slavedriver/master/images/avatar.png" width="50" height="50"></img>
Slack Bot for the ED Aisling community

## Setup

To run locally:

- Install node.js
- `npm install --save botkit` to install BotKit - a ncie wrapper for Slack message interaction (+ bonus conversational magic).
- `npm install --save googleapis` to install the official JS Google API wrapper, which is used to talk with Google Drive.
- `npm install --save google-spreadsheets` to install a Nods.JS library that can read Google Sheets data.
- `npm install --save winston, winston-google-spreadsheet` to install a logging library that can write to Sheets.
- Create a `tokens.js` file.
 - This is to keep any API keys out of the repo (`tokens.js` is ignored in `.gitignore`, so you can't accidentally check it in). This is for security reasons, because I don't want random Github browsers to be able to access my Slack teams and Google APIs.
 - If you need help getting these keys, poke Sunlis.
 - Sample tokens.js:

```javascript
var tokens = {
	slack: '123abc'
};

module.exports = tokens;
```

- You'll also need a `.json` file for server OAuth. See https://support.google.com/cloud/answer/6158849?hl=en#serviceaccounts
- Run `node main.js`
- Bug Sunlis about that thing that's breaking because of the step that he forgot to include.
