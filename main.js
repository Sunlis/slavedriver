var Botkit = require('botkit');

if (!process.env.slacktoken) {
	console.log('Error: Specify slacktoken in environment');
	process.exit(1);
}

var controller = Botkit.slackbot();
var bot = controller.spawn({
	token: process.env.slacktoken
});
bot.startRTM(function(err, bot, payload) {
	if (err) {
		throw new Error('Could not connect to Slack.');
	}
});

controller.hears(
	['foo'],
	['direct_message', 'direct_mention', 'mention', 'ambient'],
	function(bot, message) {
		bot.reply(message, 'bar');
	});