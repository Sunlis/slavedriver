# slavedriver <img src="https://raw.githubusercontent.com/Sunlis/slavedriver/master/images/avatar.png" width="50" height="50"></img>
Slack Bot for the ED Aisling community

## Setup

To run locally:

1. Install node.js
2. Install project dependencies
  - `npm install`
  - This installs a few things, namely:
     - `botkit` - A nice wrapper for Slack message interaction (+ bonus conversational magic) ([Github](https://github.com/howdyai/botkit))
     - `googleapis` - The official JS Google API wrapper, which is used to talk with Google Drive. ([Github](https://github.com/google/google-api-nodejs-client))
     - `google-spreadsheet` - A nodeJS library for interacting with Google Sheets. ([Github](https://github.com/theoephraim/node-google-spreadsheet))
3. Create a `tokens.js` file.
 - This file will contain the API key for Slack (you'll get one in the next step).
 - Sample `tokens.js`:

    ```javascript
    var tokens = {
        slack: '123abc'
    };
    
    module.exports = tokens;
    ```

4. Make a Slack team for yourself - [https://slack.com/create](https://slack.com/create)
5. Create a bot for that Slack team - [https://my.slack.com/services/new/bot](https://my.slack.com/services/new/bot)
 - You'll get an API token. Paste that into your `tokens.js` as your slack token.
6. Get a `drive_auth.json` file for server OAuth.
 - Follow the steps on [https://support.google.com/cloud/answer/6158849?hl=en#serviceaccounts](https://support.google.com/cloud/answer/6158849?hl=en#serviceaccounts)
 - When given the option, be sure to download the auth file as a JSON file, and save it as `drive_auth.js` in the project root.
7. Briefly hesitate, unsure about whether you did all of the steps. Decide to move on anyway.
8. Run `node main.js`
9. Success?
10. Bug Sunlis about that thing that's breaking because of the step that he forgot to include.


### A note on `tokens.js` and `drive_auth.json`
This is to keep any API keys and "sensitive data" out of the repo (`tokens.js` and `drive_auth.json` are both ignored in `.gitignore`, so you can't accidentally check them in). This is for security reasons, because I don't want random Github browsers to be able to access my Slack teams and Google APIs.
