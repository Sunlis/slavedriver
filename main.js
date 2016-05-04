var Botkit = require('botkit');
var google = require('googleapis');

var tokens = require('./tokens');
var utils = require('./utils');
var actionLog = require('./action_log');

if (!tokens) {
    tokens = {
        slack: process.env.slacktoken
    };
}
if (!tokens.slack) {
    console.log('Must supply a Slack token');
    process.exit(1);
}

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
    ['actions ([0-9]+)'],
    ALL_TYPES,
    function(bot, message) {
        actionLog.getActions(parseInt(message.match[1], 10)).then(function(actions) {
            for (var i = 0; i < actions.length; i++) {
                bot.reply(message, actions[i].prettyPrint());
            }
        }, function(err) {
            bot.reply(message, 'Something went wrong. Show this to someone who cares:');
            bot.reply(message, err.toString());
        });
    });

// TODO(sunlis): log command - to enter actions into the log
// TODO(sunlis): update command - to update the prep/fort/undermine status of a system
// TODO(sunlis): check command - to check the prep/fort/undermine status of a system


controller.on('channel_joined', function(bot, message) {
    utils.natural(bot, message.channel.id)
        .wait(500)
        .say('Oh.')
        .wait(1000)
        .say('Hello there!')
        .say('Thanks for having me.');
});
