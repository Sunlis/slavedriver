NaturalConvo = function(bot, channel) {
    this.promise = new Promise(function(resolve, reject) {
        resolve();
    });
    this.bot = bot;
    this.channel = channel;
};

/** @const {number} Characters per minute */
NaturalConvo.CPM = 900;

NaturalConvo.prototype.say = function(message, extraDelay) {
    var that = this;
    extraDelay = extraDelay || 0;
    var delay = that.computeDelay_(message, extraDelay);

    that.promise = that.promise.then(function(){
        var promise = new Promise(function(resolve, reject) {
            setTimeout(function() {
                that.bot.say({
                    text: message,
                    channel: that.channel
                });
                resolve();
            }, delay);
        });
        return promise;
    });
    return that;
};

NaturalConvo.prototype.wait = function(delay) {
    var that = this;

    that.promise = that.promise.then(function() {
        var promise = new Promise(function(resolve, reject) {
            setTimeout(resolve, delay);
        });
        return promise;
    });

    return that;
};

NaturalConvo.prototype.computeDelay_ = function(message, extra) {
    var base = (message.length * ((1/NaturalConvo.CPM)*60*1000)) + extra;
    var randomFactor = ((Math.random() * 0.2) + 0.9);
    return Math.max(300, base * randomFactor);
};

exports.natural = function(bot, channel) {
    return new NaturalConvo(bot, channel);
};
