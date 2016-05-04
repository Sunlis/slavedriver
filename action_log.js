var async = require('async');
var GoogleSpreadsheet = require('google-spreadsheet');

var actionLog = new GoogleSpreadsheet('1VtVqiStkHL8fOOsBKsA6Ekn2PpCXCiqVX_TL6KxmrSI');
async.series([
	function setAuth(step) {
		actionLog.useServiceAccountAuth(require('./drive_auth.json'), step);
	},
	function getDocInfo(step) {
		actionLog.getInfo(function(err, info) {
			actionLog.info = info;
			step();
		});
	},
]);

var Action = function(date, cmdr, system, type, amount, units) {
	this.date = date;
	this.cmdr = cmdr;
	this.system = system;
	this.type = type;
	this.amount = amount;
	this.units = units;
};

Action.prototype.setDate = function(date) { this.date = date; return this; };
Action.prototype.setCmdr = function(cmdr) { this.cmdr = cmdr; return this; };
Action.prototype.setSystem = function(system) { this.system = system; return this; };
Action.prototype.setType = function(type) { this.type = type; return this; };
Action.prototype.setAmount = function(amount) { this.amount = amount; return this; };
Action.prototype.setUnits = function(units) { this.units = units; return this; };

Action.prototype.TYPES = Object.freeze({
	UNDERMINE: 'Undermine',
	PREPARE: 'Prepare',
	FORTIFY: 'Fortify',
	BGS: 'BGS',
});

/**
 * "Pretty print" the action.
 *
 * @return {string}
 */
Action.prototype.prettyPrint = function() {
	var pretty = [
	    '===== ' + (new Date(this.date)).toUTCString(),
	    'CMDR: ' + this.cmdr,
	    'System: ' + this.system,
	    'Action: ' + this.action,
	    'Amount: ' + this.amount + ' ' + this.units,
	];
	return pretty.join('\n');
};

var ActionLog = function() {};

/**
 * Fetch a list of cycle IDs that the bot knows about.
 *
 * @return {!Promise<Array<number>>}
 */
ActionLog.prototype.getCycles = function() {
	return new Promise(function(resolve, reject) {
		actionLog.getInfo(function(err, info) {
			if (err) {
				console.error(err);
				reject(err);
				return;
			}
			var cycles = [];
			for (var i = 0; i < info.worksheets.length; i++) {
				cycles.push(parseInt(info.worksheets[i].title, 10));
			}
			cycles.sort();
			resolve(cycles);
		});
	});
};

/**
 * Retrieve the sheet object for a given cycle number.
 *
 * @param {number} cycle
 * @return {!Promise<Object>}
 */
ActionLog.prototype.getSheetForCycle = function(cycle) {
	return new Promise(function(resolve, reject) {
		actionLog.getInfo(function(err, info) {
			if (err) {
				reject(err);
				return;
			}
			for (var i = 0; i < info.worksheets.length; i++) {
				if (parseInt(info.worksheets[i].title, 10) == cycle) {
					resolve(info.worksheets[i]);
					return;
				}
			}
			console.error('No sheet found');
			reject();
		});
	});
};

/**
 * Fetch the list of actions that have been logged in a given cycle.
 *
 * @param {number} cycle (optional) Default: latest cycle
 */
ActionLog.prototype.getActions = function(cycle) {
	return (new Promise(function(resolve, reject) {
		if (!cycle) {
			this.getCycles().then(function(cycles) {
				resolve(cycles[cycles.length - 1]);
			}.bind(this));
		} else {
			resolve(cycle);
		}
	})).then(function(cycle) {
		return this.getSheetForCycle(cycle).then(function(sheet) {
			return new Promise(function(resolve, reject) {
				sheet.getRows({}, function(err, rows) {
					if (err) {
						console.error(err);
						reject(err);
						return;
					}
					var actions = [];
					for (var i = 0; i < rows.length; i++) {
						var row = rows[i];
						var action = (new Action())
							.setDate(Date.parse(row.date))
							.setCmdr(row.cmdr)
							.setSystem(row.system)
							.setAction(row.action)
							.setAmount(row.amount)
							.setUnits(row.units);
						actions.push(action);
					}
					resolve(actions);
				});
			});
		});
	}.bind(this));
};

module.exports = (new ActionLog());
