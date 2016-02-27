var Botkit = require('botkit');
var google = require('googleapis');
var GoogleSpreadsheets = require('google-spreadsheets');
var Sheets = require('edit-google-spreadsheet');

var tokens = require('./tokens');
var utils = require('./utils');

if (!tokens) {
    tokens = {
        slack: process.env.slacktoken
    };
}
if (!tokens.slack) {
    console.log('Must supply a Slack token');
    process.exit(1);
}

var drive = google.drive('v3');

var key = require('./drive_auth.json');
var jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive'],
    null);

jwtClient.authorize(function(err, tokens) {
  if (err) {
    console.log('Unable to authenticate with Google', err);
    process.exit(1);
  }
});


var controller = Botkit.slackbot();
var bot = controller.spawn({
    token: tokens.slack
});

/**
 * This is a user object for the bot.
 * @see https://api.slack.com/types/user
 */
var self = {};
/**
 * Mapping from user ID to user object.
 * @see https://api.slack.com/types/user
 */
var users = {};
/**
 * Mapping from channel ID to channel object.
 * @see https://api.slack.com/types/channel
 */
var channels = {};
/**
 * Mapping from im ID to im object.
 * @see https://api.slack.com/types/im
 */
 var ims = {};

bot.startRTM(function(err, bot, payload) {
    if (err) { throw new Error('Could not connect to Slack. :('); }
    self = payload.self;
    payload.users.forEach(function(user) {
        users[user.id] = user;
    });
    payload.channels.forEach(function(channel) {
        channels[channel.id] = channel;
    });
    payload.ims.forEach(function(im) {
        ims[im.id] = im;
    });
});

/** @const {!Array<string>} List of all message types */
var ALL_TYPES = [
    /* This event is fired for any message of any kind that is
     * received and can be used as a catch all. */
    'message_received',

    /* Ambient messages are messages that the bot can hear in a
     * channel, but that do not mention the bot in any way. */
    'ambient',

    /* Direct mentions are messages that begin with the bot's name,
     * as in "@bot hello". */
    'direct_mention',

    /* Mentions are messages that contain the bot's name,
     * but not at the beginning, as in "hello @bot". */
    'mention',

    /* Direct messages are sent via private 1:1 direct message channels */
    'direct_message',
];

controller.hears(
    ['!drivelist'],
    ALL_TYPES,
    function(bot, message) {
      say(bot, message, 'Listing files...');
      listFiles().then(function(resp) {
        say(bot, message, JSON.stringify(resp));
      });
    });

controller.hears(
  ['!actions (.*)'],
  ALL_TYPES,
  function(bot, message) {
    var cycle = 'Cycle ' + message.match[1];
    say(bot, message, 'Loading action log...');
    Sheets.load({
      oauth2: key,
      spreadsheetName: 'Action Log',
      worksheetName: cycle,
    }, function(err, sheet) {
      console.log(err);
      console.log(sheet);
    });
    // fetchActionLog(message.match[1]).then(function(rows) {
    //   for (var i in rows) {
    //     var row = rows[i];
    //     console.log(row);
    //     say(bot, message, row.content);
    //   }
    // });
  });

controller.on('channel_joined', function(bot, message) {
    utils.natural(bot, message.channel.id)
        .wait(500)
        .say('Oh.')
        .wait(1000)
        .say('Hello there!')
        .say('Thanks for having me.');
});

function say(bot, message, text) {
  return bot.say({
    text: text,
    channel: message.channel
  });
}

function listFiles() {
  var promise = new Promise(function(resolve, reject){
    drive.files.list({ auth: jwtClient }, function(err, resp) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(resp);
      }
    });
  });
  return promise;
}

function getFileId(name) {
  return listFiles().then(function(resp) {
    for (var i in resp.files) {
      if (resp.files[i].name == name) {
        return resp.files[i].id;
      }
    }
  });
}

function getFile(id) {
  var promise = new Promise(function(resolve, reject) {
    drive.files.get({ auth: jwtClient, fileId: id }, function(err, resp) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(resp);
      }
    });
  });
  return promise;
}

function fetchActionLog(cycle) {
  var promise = new Promise(function(resolve, reject) {
    getFileId('Action Log').then(function(id) {
      getFile(id).then(function(resp) {
        GoogleSpreadsheets({ auth: jwtClient, key: resp.id }, function(err, spread) {
          var sheet;
          if (cycle && cycle != '') {
            for (var i in spread.worksheets) {
              if (spread.worksheets[i].title == 'Cycle ' + cycle) {
                sheet = spread.worksheets[i];
              }
            }
          } else {
            sheet = spread.worksheets[spread.worksheets.length - 1];
          }
          sheet.rows({start: 0}, function(err, rows) {
            if (err) {
              console.err(err);
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });
      });
    });
  });
  return promise;
}