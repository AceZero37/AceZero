const { sleep, gif, getUser, getRandomInt, sym, cooldown, generateRandomId, SimpleEmbed } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 5_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'crate',
    async execute(client, message, args) {
        try {
            const user = message.author;

            const userData = await getUser(user.id);

            if (userData.premium.premium_bool) {
                if (!prem.includes(user.id)) {
                    prem.push(user.id);
                }
            }

            if (cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)) {
                return;
            };

            const Gem = userData.gem;
            let amount = args[0];

            if (amount == 'all') {
                amount = userData.gem['100'];
            } else if (parseInt(amount)) {
                amount = parseInt(amount);
            } else {
                amount = 1;
            }

            if (amount > 20) {
                amount = 20;
            }

            if (amount < 1) {
                amount = 1;
            }

            if (userData.gem['100'] <= 0 || amount > userData.gem['100']) {
                message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not own this item!`)] });
                return;
            }

            userData.gem['100'] -= amount;
            try { await userData.save(); } catch (error) { }

            const mgs = await message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you opening ${amount} weapons \n\n${gif.crate_opening_gif} all you got ...`)] });

            let messageWeapon = '';
            for (let i = 1; i <= amount; i++) {
                const weapon_ran = getRandomInt(1, 22);
                let rank_ran = getRandomInt(1, 101);
                let weapon_id = generateRandomId(6);

                for (const wp of userData.wp) {
                    const str = `${wp}`;
                    const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                    if (weapon_id == id) { weapon_id = generateRandomId(6); }
                }

                const passive_ran = getRandomInt(1, 22);
                const passive_ran_two = getRandomInt(1, 4);

                if (userData.wp.length >= 1) {
                    for (const allwp of userData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr] = str.split(' ');

                        if (`${weapon_id}` == id) {
                            weapon_id = generateRandomId(6);
                        }
                    }
                }

                let rank = '';
                let rank_gif = '';
                let weapon = '';
                let passive = '';
                let passive_two = '';

                if (rank_ran > 0 && rank_ran <= 20) {
                    rank = 'common';
                    rank_gif = gif.animal_rank_1;
                } else if (rank_ran >= 21 && rank_ran <= 40) {
                    rank = 'uncommon';
                    rank_gif = gif.animal_rank_2;
                } else if (rank_ran >= 41 && rank_ran <= 60) {
                    rank = 'rare';
                    rank_gif = gif.animal_rank_3;
                } else if (rank_ran >= 61 && rank_ran <= 80) {
                    rank = 'epic';
                    rank_gif = gif.animal_rank_4;
                } else if (rank_ran >= 81 && rank_ran <= 94) {
                    rank = 'mythical';
                    rank_gif = gif.animal_rank_5;
                } else if (rank_ran >= 95 && rank_ran <= 99) {
                    const legendary_ran = getRandomInt(1, 10000);
                    if (legendary_ran == 1) {
                        rank = 'legendary';
                        rank_gif = gif.animal_rank_6;
                    } else {
                        rank_ran = getRandomInt(1, 95);
                        if (rank_ran > 0 && rank_ran <= 20) {
                            rank = 'common';
                            rank_gif = gif.animal_rank_1;
                        } else if (rank_ran >= 21 && rank_ran <= 40) {
                            rank = 'uncommon';
                            rank_gif = gif.animal_rank_2;
                        } else if (rank_ran >= 41 && rank_ran <= 60) {
                            rank = 'rare';
                            rank_gif = gif.animal_rank_3;
                        } else if (rank_ran >= 61 && rank_ran <= 80) {
                            rank = 'epic';
                            rank_gif = gif.animal_rank_4;
                        } else if (rank_ran >= 81 && rank_ran <= 94) {
                            rank = 'mythical';
                            rank_gif = gif.animal_rank_5;
                        }
                    }
                } else if (rank_ran >= 100 && rank_ran <= 100) {
                    const febled_ran = getRandomInt(1, 100000);
                    if (febled_ran == 1) {
                        rank = 'febled';
                        rank_gif = gif.animal_rank_8;
                    } else {
                        rank_ran = getRandomInt(1, 95);
                        if (rank_ran > 0 && rank_ran <= 20) {
                            rank = 'common';
                            rank_gif = gif.animal_rank_1;
                        } else if (rank_ran >= 21 && rank_ran <= 40) {
                            rank = 'uncommon';
                            rank_gif = gif.animal_rank_2;
                        } else if (rank_ran >= 41 && rank_ran <= 60) {
                            rank = 'rare';
                            rank_gif = gif.animal_rank_3;
                        } else if (rank_ran >= 61 && rank_ran <= 80) {
                            rank = 'epic';
                            rank_gif = gif.animal_rank_4;
                        } else if (rank_ran >= 81 && rank_ran <= 94) {
                            rank = 'mythical';
                            rank_gif = gif.animal_rank_5;
                        }
                    }
                }

                if (weapon_ran == 1) {
                    weapon = 'great_sword';
                } else if (weapon_ran == 2) {
                    weapon = 'defender_aegis';
                } else if (weapon_ran == 3) {
                    weapon = 'wang_of_absorption';
                } else if (weapon_ran == 4) {
                    weapon = 'bow';
                } else if (weapon_ran == 5) {
                    weapon = 'energy_stuff';
                } else if (weapon_ran == 6) {
                    weapon = 'healing_stuff';
                } else if (weapon_ran == 7) {
                    weapon = 'orb_of_potency';
                    if (passive_ran_two == 1) {
                        passive_two = 'lifesteal_effect';
                    } else if (passive_ran_two == 2) {
                        passive_two = 'regeneration_effect';
                    } else if (passive_ran == 3) {
                        passive_two = 'sacrifice_Effect';
                    }
                } else if (weapon_ran == 8) {
                    weapon = 'spirit_stuff';
                } else if (weapon_ran == 9) {
                    weapon = 'resurrection_staff';
                } else if (weapon_ran == 10) {
                    weapon = 'culling_scythe';
                } else if (weapon_ran == 11) {
                    weapon = 'poison_dagger';
                } else if (weapon_ran == 12) {
                    weapon = 'rune_of_the_forgotten';
                    passive = 'empty'; // no passive - show empty icon
                } else if (weapon_ran == 13) {
                    weapon = 'rune_of_luck';
                } else if (weapon_ran == 14) {
                    weapon = 'vampiric_staff';
                } else if (weapon_ran == 15) {
                    weapon = 'flame_stuff';
                } else if (weapon_ran == 16) {
                    weapon = 'arcane_scepter';
                } else if (weapon_ran == 17) {
                    weapon = 'glacial_axe';
                } else if (weapon_ran == 18) {
                    weapon = 'vanguards_banner';
                } else if (weapon_ran == 19) {
                    weapon = 'staff_of_purity';
                } else if (weapon_ran == 20) {
                    weapon = 'leeching_scythe';
                } else if (weapon_ran == 21) {
                    weapon = 'foul_fish';
                }

                // Only assign passive for weapons that have passives (skip rune_of_the_forgotten)
                if (weapon !== 'rune_of_the_forgotten') {
                    if (passive_ran == 1) {
                        passive = 'physical_Resistance_effect';
                    } else if (passive_ran == 2) {
                        passive = 'magic_Resistance_effect';
                    } else if (passive_ran == 3) {
                        passive = 'strength_effect';
                    } else if (passive_ran == 4) {
                        passive = 'magic_effect';
                    } else if (passive_ran == 5) {
                        passive = 'health_point_effect';
                    } else if (passive_ran == 6) {
                        passive = 'weapon_point_effect';
                    } else if (passive_ran == 7) {
                        passive = 'lifesteal_effect';
                    } else if (passive_ran == 8) {
                        passive = 'regeneration_effect';
                    } else if (passive_ran == 9) {
                        passive = 'sacrifice_Effect';
                    } else if (passive_ran == 10) {
                        passive = 'thorns_Effect';
                    } else if (passive_ran == 11) {
                        passive = 'discharge_Effect';
                    } else if (passive_ran == 12) {
                        passive = 'sprout_Effect';
                    } else if (passive_ran == 13) {
                        passive = 'enrage_Effect';
                    } else if (passive_ran == 14) {
                        passive = 'kamikaze_Effect';
                    } else if (passive_ran == 15) {
                        passive = 'safeguard_Effect';
                    } else if (passive_ran == 16) {
                        passive = 'energize_Effect';
                    } else if (passive_ran == 17) {
                        passive = 'critical_Effect';
                    } else if (passive_ran == 18) {
                        passive = 'absolve_Effect';
                    } else if (passive_ran == 19) {
                        passive = 'snail_Effect';
                    } else if (passive_ran == 20) {
                        passive = 'mana_tap_Effect';
                    } else if (passive_ran == 21) {
                        passive = 'knowledge_Effect';
                    }
                }

                const weapon_gif = gif[`${weapon}_${rank}_gif`];
                const information_weapon = `${weapon_id} ${weapon} ${rank} ${passive} ${rank_ran} false ${passive_two}`;
                console.log(`Crate opened: ${information_weapon}`); // Debug log
                userData.wp.push(`${information_weapon}`);

                messageWeapon += `${weapon_gif}`;
            }

            await sleep(3000);
            mgs.edit({ embeds: [SimpleEmbed(`**Now <@${user.id}>** opened ${amount} weapons \n\n${gif.box_gem_opened_gif} all you got ${messageWeapon}`)] });
            try {
                await userData.save();
                console.log(`Saved ${amount} weapons for user ${user.id}. Total wp: ${userData.wp.length}`);
            } catch (error) {
                console.log(`Save error for user ${user.id}: ${error}`);
            }
            return;
        } catch (error) {
            console.log(`crate error ${error}`);
        }
    },
};
