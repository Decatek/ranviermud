var Localize = require('localize');

var l10n_dir = __dirname + '/../l10n/skills/';
var l10ncache = {};
/**
 * Localization helper
 * @return string
 */
var L = function (locale, cls, key /*, args... */)
{
	var l10n_file = l10n_dir + cls + '.yml';
	var l10n = l10ncache[cls+locale] || new Localize(require('js-yaml').load(require('fs').readFileSync(l10n_file).toString('utf8')), undefined, 'zz');
	l10n.setLocale(locale);
	return l10n.translate.apply(null, [].slice.call(arguments).slice(2));
};

exports.Skills = {
	warrior: {
		tackle: {
			type: 'active',
			level: 2,
			name: "Tackle",
			description: "Tackle your opponent for 120% weapon damage. Target's attacks are slower for 5 seconds following the attack.",
			activate: function (player, args, rooms, npcs)
			{
				if (!player.isInCombat()) {
					player.say(L(player.getLocale(), 'warrior', 'TACKLE_NOCOMBAT'));
					return true;
				}

				if (player.getAffects('cooldown_tackle')) {
					player.say(L(player.getLocale(), 'warrior', 'TACKLE_COOLDOWN'));
					return true;
				}
				
				var target = npcs.get(player.isInCombat());

				var damage = Math.min(target.getAttribute('max_health'), Math.ceil(player.getDamage().max * 1.2));

				player.say(L(player.getLocale(), 'warrior', 'TACKLE_DAMAGE', damage));
				var original_speed = target.getAttribute('speed');
				if (!target.getAffects('slow')) {
					target.addAffect('slow', {
						activate: function () {
						player.say("SETTING SPEED TO " + original_speed * 1.5);
							target.setAttribute('speed', original_speed * 1.5);
						},
						deactivate : function () {
							if (target && target.isInCombat()) {
								target.setAttribute('speed', original_speed);
								player.say(L(player.getLocale(), 'warrior', 'TACKLE_RECOVER'));
							}
						},
						duration: 3
					});
				}

				// Slap a cooldown on the player
				player.addAffect('cooldown_tackle', {
					duration: 4,
					deactivate: function () {
						player.say(L(player.getLocale(), 'warrior', 'TACKLE_COOLDOWN_END'));
					}
				});

				return true;
			}
		}
	},
	_configure: function (config)
	{
		npcs = config.npcs;
	}
};