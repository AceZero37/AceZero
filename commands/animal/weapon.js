const { sym, gif, getUser, SimpleEmbed, getRandomInt, customEmbed, getAnimalIdByName, getAnimalNameByName, checkOwnAnimal, getRank, getWeaponRank, getPassive, getWeaponRankById, getWeaponEquipById, getWeaponNameById, getWeaponName, labelButton, twoButton, getCollectionButton, ButtonStyle, cooldown, threeButton, InteractionCollector, WEAPON_DATA, getWeaponData, getRankDamageMultiplier, getRankHealMultiplier } = require('../../functioon/function');
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

const cooldowns = new Map();
let CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'w',
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

            if (args[0] == 'm' || args[0] == 'metal') {
                message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you have **${userData.shard.toLocaleString()}** ${gif.shard_gif}Weapon Metals!`)] });
                return;
            }
            // REROLL RANK + PASSIVE (w rr)
            if (args[0] == 'rr') {
                let weapon_id = args[1];
                let reroll_type = args[2]; // 'p' for passive only, 's' for stats only, or undefined for both

                // Validate reroll type
                if (reroll_type && !['p', 's'].includes(reroll_type.toLowerCase())) {
                    return message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, invalid reroll type! Use:\n${sym}w rr {weaponID}${sym} - Reroll both rank and passive (100 Weapon Metals)\n${sym}w rr {weaponID} p${sym} - Reroll passive only (100 Weapon Metals)\n${sym}w rr {weaponID} s${sym} - Reroll stats/rank only (100 Weapon Metals)`)] });
                }

                // Normalize reroll type
                if (reroll_type) reroll_type = reroll_type.toLowerCase();

                // Set cost based on reroll type
                let reroll_cost = 100; // Default: both
                let reroll_label = 'RANK + PASSIVE';

                if (reroll_type === 'p') {
                    reroll_cost = 100;
                    reroll_label = 'PASSIVE ONLY';
                } else if (reroll_type === 's') {
                    reroll_cost = 100;
                    reroll_label = 'STATS/RANK ONLY';
                }

                if (userData.shard < reroll_cost) {
                    return message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you don't have enough Weapon Metals! (Need ${reroll_cost})`)] });
                }
                if (!weapon_id) {
                    return message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, invalid syntax! Please use the format:\n${sym}w rr {weaponID}${sym} - Reroll both (100)\n${sym}w rr {weaponID} p${sym} - Reroll passive (100)\n${sym}w rr {weaponID} s${sym} - Reroll stats (100)`)] });
                }

                weapon_id = args[1].toUpperCase();
                let index = 0;
                let weaponFound = false;

                for (const allwp of userData.wp) {
                    const str = `${allwp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    if (weapon_id == id) {
                        weaponFound = true;

                        // DON'T deduct shards yet - only on confirm
                        let rank_ran = getRandomInt(1, 101);
                        let passive_ran = getRandomInt(1, 22);
                        let new_rank = rank; // Keep current rank by default
                        let new_passive = passive; // Keep current passive by default

                        // Calculate new rank only if rerolling stats or both
                        if (!reroll_type || reroll_type === 's') {
                            // NEW HARDER ODDS
                            if (rank_ran > 0 && rank_ran <= 25) {
                                new_rank = 'common';
                            } else if (rank_ran >= 26 && rank_ran <= 50) {
                                new_rank = 'uncommon';
                            } else if (rank_ran >= 51 && rank_ran <= 70) {
                                new_rank = 'rare';
                            } else if (rank_ran >= 71 && rank_ran <= 85) {
                                new_rank = 'epic';
                            } else if (rank_ran >= 86 && rank_ran <= 96) {
                                // Mythical: 1/15 chance (6.67%)
                                const mythical_ran = getRandomInt(1, 16);
                                if (mythical_ran == 1) {
                                    new_rank = 'mythical';
                                } else {
                                    // Fall back to lower tiers
                                    rank_ran = getRandomInt(1, 86);
                                    if (rank_ran > 0 && rank_ran <= 25) {
                                        new_rank = 'common';
                                    } else if (rank_ran >= 26 && rank_ran <= 50) {
                                        new_rank = 'uncommon';
                                    } else if (rank_ran >= 51 && rank_ran <= 70) {
                                        new_rank = 'rare';
                                    } else if (rank_ran >= 71 && rank_ran <= 85) {
                                        new_rank = 'epic';
                                    }
                                }
                            } else if (rank_ran >= 97 && rank_ran <= 99) {
                                // Legendary: 1/200 chance (0.5%)
                                const legendary_ran = getRandomInt(1, 201);
                                if (legendary_ran == 1) {
                                    new_rank = 'legendary';
                                } else {
                                    // Fall back to lower tiers
                                    rank_ran = getRandomInt(1, 96);
                                    if (rank_ran > 0 && rank_ran <= 25) {
                                        new_rank = 'common';
                                    } else if (rank_ran >= 26 && rank_ran <= 50) {
                                        new_rank = 'uncommon';
                                    } else if (rank_ran >= 51 && rank_ran <= 70) {
                                        new_rank = 'rare';
                                    } else if (rank_ran >= 71 && rank_ran <= 85) {
                                        new_rank = 'epic';
                                    } else if (rank_ran >= 86 && rank_ran <= 96) {
                                        // Second mythical attempt
                                        const mythical_ran = getRandomInt(1, 16);
                                        if (mythical_ran == 1) {
                                            new_rank = 'mythical';
                                        } else {
                                            rank_ran = getRandomInt(1, 86);
                                            if (rank_ran > 0 && rank_ran <= 25) {
                                                new_rank = 'common';
                                            } else if (rank_ran >= 26 && rank_ran <= 50) {
                                                new_rank = 'uncommon';
                                            } else if (rank_ran >= 51 && rank_ran <= 70) {
                                                new_rank = 'rare';
                                            } else if (rank_ran >= 71 && rank_ran <= 85) {
                                                new_rank = 'epic';
                                            }
                                        }
                                    }
                                }
                            } else if (rank_ran >= 100 && rank_ran <= 100) {
                                // Febled: 1/1000 chance (0.1%)
                                const febled_ran = getRandomInt(1, 1001);
                                if (febled_ran == 1) {
                                    new_rank = 'febled';
                                } else {
                                    // Fall back to lower tiers
                                    rank_ran = getRandomInt(1, 96);
                                    if (rank_ran > 0 && rank_ran <= 25) {
                                        new_rank = 'common';
                                    } else if (rank_ran >= 26 && rank_ran <= 50) {
                                        new_rank = 'uncommon';
                                    } else if (rank_ran >= 51 && rank_ran <= 70) {
                                        new_rank = 'rare';
                                    } else if (rank_ran >= 71 && rank_ran <= 85) {
                                        new_rank = 'epic';
                                    } else if (rank_ran >= 86 && rank_ran <= 96) {
                                        const mythical_ran = getRandomInt(1, 16);
                                        if (mythical_ran == 1) {
                                            new_rank = 'mythical';
                                        } else {
                                            rank_ran = getRandomInt(1, 86);
                                            if (rank_ran > 0 && rank_ran <= 25) {
                                                new_rank = 'common';
                                            } else if (rank_ran >= 26 && rank_ran <= 50) {
                                                new_rank = 'uncommon';
                                            } else if (rank_ran >= 51 && rank_ran <= 70) {
                                                new_rank = 'rare';
                                            } else if (rank_ran >= 71 && rank_ran <= 85) {
                                                new_rank = 'epic';
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            // If not rerolling stats, keep current percent
                            rank_ran = parseInt(percen);
                        }

                        // Calculate new passive only if rerolling passive or both
                        // Skip for rune_of_the_forgotten as it has no passives
                        if (name === 'rune_of_the_forgotten') {
                            new_passive = 'empty'; // Rune of the Forgotten has no passives - show empty icon
                        } else if (!reroll_type || reroll_type === 'p') {
                            if (passive_ran == 1) {
                                new_passive = 'physical_Resistance_effect';
                            } else if (passive_ran == 2) {
                                new_passive = 'magic_Resistance_effect';
                            } else if (passive_ran == 3) {
                                new_passive = 'strength_effect';
                            } else if (passive_ran == 4) {
                                new_passive = 'magic_effect';
                            } else if (passive_ran == 5) {
                                new_passive = 'health_point_effect';
                            } else if (passive_ran == 6) {
                                new_passive = 'weapon_point_effect';
                            } else if (passive_ran == 7) {
                                new_passive = 'lifesteal_effect';
                            } else if (passive_ran == 8) {
                                new_passive = 'regeneration_effect';
                            } else if (passive_ran == 9) {
                                new_passive = 'sacrifice_Effect';
                            } else if (passive_ran == 10) {
                                new_passive = 'thorns_Effect';
                            } else if (passive_ran == 11) {
                                new_passive = 'discharge_Effect';
                            } else if (passive_ran == 12) {
                                new_passive = 'sprout_Effect';
                            } else if (passive_ran == 13) {
                                new_passive = 'enrage_Effect';
                            } else if (passive_ran == 14) {
                                new_passive = 'kamikaze_Effect';
                            } else if (passive_ran == 15) {
                                new_passive = 'safeguard_Effect';
                            } else if (passive_ran == 16) {
                                new_passive = 'energize_Effect';
                            } else if (passive_ran == 17) {
                                new_passive = 'critical_Effect';
                            } else if (passive_ran == 18) {
                                new_passive = 'absolve_Effect';
                            } else if (passive_ran == 19) {
                                new_passive = 'snail_Effect';
                            } else if (passive_ran == 20) {
                                new_passive = 'mana_tap_Effect';
                            } else if (passive_ran == 21) {
                                new_passive = 'knowledge_Effect';
                            }
                        }

                        let weapon_gif = gif[`${name}_${rank}_gif`];
                        let weapon_gif2 = gif[`${name}_${new_rank}_gif`];
                        let passive_gif = gif[`${passive}_gif`];
                        let passive_gif2 = gif[`${new_passive}_gif`];

                        // Build description based on reroll type
                        let description = '';
                        if (reroll_type === 'p') {
                            // Passive only - show rank unchanged
                            description = `${weapon_gif}**[CURRENT]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(rank)} ${percen}%\n**Wear: **${sym}DECENT${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif} **Current Passive**\n====================================\n${weapon_gif2}**[NEW]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(rank)} ${percen}% ${sym}(UNCHANGED)${sym}\n**Wear: **${sym}DECENT${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif2} **New Passive**`;
                        } else if (reroll_type === 's') {
                            // Stats only - show passive unchanged
                            description = `${weapon_gif}**[CURRENT]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(rank)} ${percen}%\n**Wear: **${sym}DECENT${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif} **Current Passive** ${sym}(UNCHANGED)${sym}\n====================================\n${weapon_gif2}**[NEW]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(new_rank)} ${rank_ran}%\n**Wear: **${sym}WORN${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif} **Passive** ${sym}(UNCHANGED)${sym}`;
                        } else {
                            // Both - original display
                            description = `${weapon_gif}**[CURRENT]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(rank)} ${percen}%\n**Wear: **${sym}DECENT${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif} **Current Passive**\n====================================\n${weapon_gif2}**[NEW]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(new_rank)} ${rank_ran}%\n**Wear: **${sym}WORN${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif2} **New Passive**`;
                        }

                        const embed = customEmbed()
                            .setAuthor({ name: `${user.displayName} is rerolling weapon! (${reroll_cost} Weapon Metals)`, iconURL: user.displayAvatarURL() })
                            .setColor('Aqua')
                            .setDescription(description)
                            .setFooter({ text: `REROLL || ${reroll_label}` });

                        const confirmButton = labelButton('confirm_button', '✅ Confirm', ButtonStyle.Success);
                        const cancelButton = labelButton('cancel_button', '❎ Cancel', ButtonStyle.Danger);
                        const rerollButton = labelButton('rerollButton', '🔄️ Reroll', ButtonStyle.Secondary);
                        const allButton = threeButton(confirmButton, cancelButton, rerollButton);

                        const mgs = await message.channel.send({ embeds: [embed], components: [allButton] });
                        const collector = getCollectionButton(mgs, 300_000);

                        collector.on('end', (collected, reason) => {
                            if (reason === 'time') {
                                confirmButton.setDisabled(true);
                                cancelButton.setDisabled(true);
                                rerollButton.setDisabled(true);
                                mgs.edit({ embeds: [embed.setColor('#3D3D3D')], components: [allButton] });
                                return;
                            }
                        });

                        collector.on('collect', async (interaction) => {
                            try {
                                const freshUserData = await getUser(user.id);

                                if (!interaction.isButton()) {
                                    return;
                                }
                                if (interaction.member.user.id !== user.id) {
                                    await interaction.reply({ content: 'This button is not for you!', ephemeral: true });
                                    return;
                                }

                                if (interaction.customId === 'confirm_button') {
                                    // Check shards again before confirming
                                    if (freshUserData.shard < reroll_cost) {
                                        confirmButton.setDisabled(true);
                                        cancelButton.setDisabled(true);
                                        rerollButton.setDisabled(true);
                                        await interaction.update({ embeds: [embed.setColor('Red').setDescription(`**<@${user.id}>** You don't have enough Weapon Metals! (Need ${reroll_cost})`)], components: [allButton] });
                                        collector.stop();
                                        return;
                                    }

                                    // Deduct shards on confirm
                                    freshUserData.shard -= reroll_cost;

                                    let weaponIndex = 0;
                                    for (const allwp of freshUserData.wp) {
                                        const str = `${allwp}`;
                                        const [wpId, wpName, wpRank, wpPassive, wpPercen, wpBoolStr, wpPassiveTwo] = str.split(' ');

                                        let passive_two_gif = '';
                                        if (wpPassiveTwo) { passive_two_gif = wpPassiveTwo }

                                        if (weapon_id == wpId) {
                                            freshUserData.wp.splice(weaponIndex, 1);
                                            const information_weapon = `${weapon_id} ${wpName} ${new_rank} ${new_passive} ${rank_ran} false ${passive_two_gif}`;
                                            freshUserData.wp.push(information_weapon);
                                            break;
                                        }
                                        weaponIndex += 1;
                                    }

                                    confirmButton.setDisabled(true);
                                    cancelButton.setDisabled(true);
                                    rerollButton.setDisabled(true);
                                    await interaction.update({ embeds: [embed.setColor('Green')], components: [allButton] });

                                    try {
                                        await freshUserData.save();
                                    } catch (error) {
                                        console.error('Error saving user data:', error);
                                    }
                                    collector.stop();
                                }

                                if (interaction.customId === 'rerollButton') {
                                    if (freshUserData.shard < reroll_cost) {
                                        confirmButton.setDisabled(true);
                                        cancelButton.setDisabled(true);
                                        rerollButton.setDisabled(true);
                                        collector.stop();
                                        return interaction.update({ embeds: [embed.setColor('Red').setDescription(`**<@${user.id}>** You don't have enough Weapon Metals! (Need ${reroll_cost})`)], components: [allButton] });
                                    }

                                    // Deduct shards for reroll
                                    freshUserData.shard -= reroll_cost;

                                    rank_ran = getRandomInt(1, 101);
                                    passive_ran = getRandomInt(1, 22);

                                    // Recalculate rank only if rerolling stats or both - USING NEW HARDER ODDS
                                    if (!reroll_type || reroll_type === 's') {
                                        if (rank_ran > 0 && rank_ran <= 25) {
                                            new_rank = 'common';
                                        } else if (rank_ran >= 26 && rank_ran <= 50) {
                                            new_rank = 'uncommon';
                                        } else if (rank_ran >= 51 && rank_ran <= 70) {
                                            new_rank = 'rare';
                                        } else if (rank_ran >= 71 && rank_ran <= 85) {
                                            new_rank = 'epic';
                                        } else if (rank_ran >= 86 && rank_ran <= 96) {
                                            const mythical_ran = getRandomInt(1, 16);
                                            if (mythical_ran == 1) {
                                                new_rank = 'mythical';
                                            } else {
                                                rank_ran = getRandomInt(1, 86);
                                                if (rank_ran > 0 && rank_ran <= 25) {
                                                    new_rank = 'common';
                                                } else if (rank_ran >= 26 && rank_ran <= 50) {
                                                    new_rank = 'uncommon';
                                                } else if (rank_ran >= 51 && rank_ran <= 70) {
                                                    new_rank = 'rare';
                                                } else if (rank_ran >= 71 && rank_ran <= 85) {
                                                    new_rank = 'epic';
                                                }
                                            }
                                        } else if (rank_ran >= 97 && rank_ran <= 99) {
                                            const legendary_ran = getRandomInt(1, 201);
                                            if (legendary_ran == 1) {
                                                new_rank = 'legendary';
                                            } else {
                                                rank_ran = getRandomInt(1, 96);
                                                if (rank_ran > 0 && rank_ran <= 25) {
                                                    new_rank = 'common';
                                                } else if (rank_ran >= 26 && rank_ran <= 50) {
                                                    new_rank = 'uncommon';
                                                } else if (rank_ran >= 51 && rank_ran <= 70) {
                                                    new_rank = 'rare';
                                                } else if (rank_ran >= 71 && rank_ran <= 85) {
                                                    new_rank = 'epic';
                                                } else if (rank_ran >= 86 && rank_ran <= 96) {
                                                    const mythical_ran = getRandomInt(1, 16);
                                                    if (mythical_ran == 1) {
                                                        new_rank = 'mythical';
                                                    } else {
                                                        rank_ran = getRandomInt(1, 86);
                                                        if (rank_ran > 0 && rank_ran <= 25) {
                                                            new_rank = 'common';
                                                        } else if (rank_ran >= 26 && rank_ran <= 50) {
                                                            new_rank = 'uncommon';
                                                        } else if (rank_ran >= 51 && rank_ran <= 70) {
                                                            new_rank = 'rare';
                                                        } else if (rank_ran >= 71 && rank_ran <= 85) {
                                                            new_rank = 'epic';
                                                        }
                                                    }
                                                }
                                            }
                                        } else if (rank_ran >= 100 && rank_ran <= 100) {
                                            const febled_ran = getRandomInt(1, 1001);
                                            if (febled_ran == 1) {
                                                new_rank = 'febled';
                                            } else {
                                                rank_ran = getRandomInt(1, 96);
                                                if (rank_ran > 0 && rank_ran <= 25) {
                                                    new_rank = 'common';
                                                } else if (rank_ran >= 26 && rank_ran <= 50) {
                                                    new_rank = 'uncommon';
                                                } else if (rank_ran >= 51 && rank_ran <= 70) {
                                                    new_rank = 'rare';
                                                } else if (rank_ran >= 71 && rank_ran <= 85) {
                                                    new_rank = 'epic';
                                                } else if (rank_ran >= 86 && rank_ran <= 96) {
                                                    const mythical_ran = getRandomInt(1, 16);
                                                    if (mythical_ran == 1) {
                                                        new_rank = 'mythical';
                                                    } else {
                                                        rank_ran = getRandomInt(1, 86);
                                                        if (rank_ran > 0 && rank_ran <= 25) {
                                                            new_rank = 'common';
                                                        } else if (rank_ran >= 26 && rank_ran <= 50) {
                                                            new_rank = 'uncommon';
                                                        } else if (rank_ran >= 51 && rank_ran <= 70) {
                                                            new_rank = 'rare';
                                                        } else if (rank_ran >= 71 && rank_ran <= 85) {
                                                            new_rank = 'epic';
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        // Keep current percent if only rerolling passive
                                        rank_ran = parseInt(percen);
                                    }

                                    // Recalculate passive only if rerolling passive or both
                                    // Skip for rune_of_the_forgotten as it has no passives
                                    if (name === 'rune_of_the_forgotten') {
                                        new_passive = 'empty'; // Rune of the Forgotten has no passives - show empty icon
                                    } else if (!reroll_type || reroll_type === 'p') {
                                        if (passive_ran == 1) {
                                            new_passive = 'physical_Resistance_effect';
                                        } else if (passive_ran == 2) {
                                            new_passive = 'magic_Resistance_effect';
                                        } else if (passive_ran == 3) {
                                            new_passive = 'strength_effect';
                                        } else if (passive_ran == 4) {
                                            new_passive = 'magic_effect';
                                        } else if (passive_ran == 5) {
                                            new_passive = 'health_point_effect';
                                        } else if (passive_ran == 6) {
                                            new_passive = 'weapon_point_effect';
                                        } else if (passive_ran == 7) {
                                            new_passive = 'lifesteal_effect';
                                        } else if (passive_ran == 8) {
                                            new_passive = 'regeneration_effect';
                                        } else if (passive_ran == 9) {
                                            new_passive = 'sacrifice_Effect';
                                        } else if (passive_ran == 10) {
                                            new_passive = 'thorns_Effect';
                                        } else if (passive_ran == 11) {
                                            new_passive = 'discharge_Effect';
                                        } else if (passive_ran == 12) {
                                            new_passive = 'sprout_Effect';
                                        } else if (passive_ran == 13) {
                                            new_passive = 'enrage_Effect';
                                        } else if (passive_ran == 14) {
                                            new_passive = 'kamikaze_Effect';
                                        } else if (passive_ran == 15) {
                                            new_passive = 'safeguard_Effect';
                                        } else if (passive_ran == 16) {
                                            new_passive = 'energize_Effect';
                                        } else if (passive_ran == 17) {
                                            new_passive = 'critical_Effect';
                                        } else if (passive_ran == 18) {
                                            new_passive = 'absolve_Effect';
                                        } else if (passive_ran == 19) {
                                            new_passive = 'snail_Effect';
                                        } else if (passive_ran == 20) {
                                            new_passive = 'mana_tap_Effect';
                                        } else if (passive_ran == 21) {
                                            new_passive = 'knowledge_Effect';
                                        }
                                    }

                                    weapon_gif2 = gif[`${name}_${new_rank}_gif`];
                                    passive_gif2 = gif[`${new_passive}_gif`];

                                    // Update description based on reroll type
                                    let new_description = '';
                                    if (reroll_type === 'p') {
                                        new_description = `${weapon_gif}**[CURRENT]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(rank)} ${percen}%\n**Wear: **${sym}DECENT${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif} **Current Passive**\n====================================\n${weapon_gif2}**[NEW]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(rank)} ${percen}% ${sym}(UNCHANGED)${sym}\n**Wear: **${sym}DECENT${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif2} **New Passive**`;
                                    } else if (reroll_type === 's') {
                                        new_description = `${weapon_gif}**[CURRENT]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(rank)} ${percen}%\n**Wear: **${sym}DECENT${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif} **Current Passive** ${sym}(UNCHANGED)${sym}\n====================================\n${weapon_gif2}**[NEW]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(new_rank)} ${rank_ran}%\n**Wear: **${sym}WORN${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif} **Passive** ${sym}(UNCHANGED)${sym}`;
                                    } else {
                                        new_description = `${weapon_gif}**[CURRENT]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(rank)} ${percen}%\n**Wear: **${sym}DECENT${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif} **Current Passive**\n====================================\n${weapon_gif2}**[NEW]**  ${await getWeaponNameById(id, user.id)}\n**ID: **${sym}${id}${sym}\n**Quality: **${getRank(new_rank)} ${rank_ran}%\n**Wear: **${sym}WORN${sym}\n**WP Cost: **0 ${gif.state_wp}\n**Description: **???\n\n${passive_gif2} **New Passive**`;
                                    }

                                    await interaction.update({ embeds: [embed.setColor('Aqua').setDescription(new_description)], components: [allButton] });

                                    try {
                                        await freshUserData.save();
                                    } catch (error) {
                                        console.error('Error saving user data:', error);
                                    }
                                }

                                if (interaction.customId === 'cancel_button') {
                                    // No shards to refund - they weren't deducted yet
                                    await interaction.update({ embeds: [SimpleEmbed(`<@${user.id}> has canceled Reroll`)], components: [] });
                                    collector.stop();
                                }
                            } catch (error) {
                                console.error('Collector error:', error);
                            }
                        });

                        return;
                    }
                    index += 1;
                }

                if (!weaponFound) {
                    return message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, weapon with ID ${weapon_id} not found!`)] });
                }
                return;
            }
            // ==================== WEAPON USE/INFO COMMAND ====================
            if (args[0] == 'use' || args[0] == 'u') {
                const weapon_id = args[1];

                if (!weapon_id) {
                    return message.channel.send({
                        embeds: [SimpleEmbed(`**Now <@${user.id}>**, invalid syntax! Please use: ${sym}w use {weaponID}${sym}`)]
                    });
                }

                let weaponFound = false;
                const weapon_id_upper = weapon_id.toUpperCase();

                for (const wp of userData.wp) {
                    const str = `${wp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    if (weapon_id_upper == id) {
                        weaponFound = true;

                        // Get weapon data from WEAPON_DATA configuration
                        const weaponData = getWeaponData(name);

                        // Rank multipliers using centralized functions
                        const rank_dmg_multiplier = getRankDamageMultiplier(rank);
                        const rank_heal_multiplier = getRankHealMultiplier(rank);

                        const quality_bonus = 1 + (parseInt(percen) / 100 * 0.05);
                        const final_dmg_multiplier = rank_dmg_multiplier * quality_bonus;
                        const final_heal_multiplier = rank_heal_multiplier * quality_bonus;

                        let weaponName = await getWeaponNameById(id, user.id);
                        let wpCost = '';
                        let damageInfo = '';
                        let weaponDescription = '';

                        // Use WEAPON_DATA if available
                        if (weaponData) {
                            // WP Cost from data
                            if (weaponData.wpCost.min === 0 && weaponData.wpCost.max === 0) {
                                wpCost = 'Passive (No Cost)';
                            } else if (weaponData.wpCost.min === weaponData.wpCost.max) {
                                wpCost = `${weaponData.wpCost.min} WP (Fixed)`;
                            } else {
                                wpCost = `${weaponData.wpCost.min}-${weaponData.wpCost.max} WP`;
                            }

                            weaponDescription = weaponData.description;

                            // Build damage info based on weapon type and data
                            const typeEmojis = {
                                'physical': '⚔️',
                                'magic': '🔮',
                                'heal': '💚',
                                'buff': '✨',
                                'resurrection': '🌟',
                                'support': '💫',
                                'passive': '🔷',
                                'dispel': '🌀'
                            };
                            const typeEmoji = typeEmojis[weaponData.type] || '⚔️';

                            const targetNames = {
                                'random_enemy': 'Random Enemy',
                                'all_enemies': 'All Enemies',
                                'lowest_hp_ally': 'Lowest HP Ally',
                                'lowest_wp_ally': 'Lowest WP Ally',
                                'all_allies': 'All Allies',
                                'dead_ally': 'Dead Ally',
                                'self': 'Self',
                                'enemy_and_ally': 'Enemy & Ally'
                            };
                            const targetName = targetNames[weaponData.target] || weaponData.target;

                            // Calculate scaled damage/heal
                            if (weaponData.damage) {
                                const statEmoji = weaponData.damage.stat === 'str' ? gif.state_str :
                                    weaponData.damage.stat === 'mag' ? gif.state_mag :
                                        weaponData.damage.stat === 'str+mag' ? `${gif.state_str}+${gif.state_mag}` :
                                            weaponData.damage.stat === 'str_or_mag' ? `${gif.state_str}/${gif.state_mag}` : '📊';
                                const statName = weaponData.damage.stat.toUpperCase().replace('_', ' or ').replace('+', ' + ');

                                const isHeal = weaponData.type === 'heal' || weaponData.type === 'resurrection';
                                const multiplier = isHeal ? final_heal_multiplier : final_dmg_multiplier;

                                const minDmg = (weaponData.damage.minPercent * multiplier).toFixed(1);
                                const maxDmg = (weaponData.damage.maxPercent * multiplier).toFixed(1);

                                damageInfo = `**Type:** ${typeEmoji} ${weaponData.type.charAt(0).toUpperCase() + weaponData.type.slice(1)}\n`;

                                if (isHeal) {
                                    damageInfo += `**Heal Amount:** ${minDmg}%-${maxDmg}% ${statEmoji}${statName}\n`;
                                } else {
                                    damageInfo += `**Base Damage:** ${weaponData.damage.minPercent}%-${weaponData.damage.maxPercent}% ${statName}\n`;
                                    damageInfo += `**Scaled Damage:** ${minDmg}%-${maxDmg}% ${statEmoji}${statName}\n`;
                                }
                                damageInfo += `**Target:** ${targetName}`;

                                // Add effect info if available
                                if (weaponData.effect) {
                                    const eff = weaponData.effect;
                                    if (eff.duration) {
                                        damageInfo += `\n**Duration:** ${eff.duration} turns`;
                                    }
                                    if (eff.type === 'poison') {
                                        const dotMin = (eff.dotMinPercent * multiplier).toFixed(1);
                                        const dotMax = (eff.dotMaxPercent * multiplier).toFixed(1);
                                        damageInfo += `\n**Poison DoT:** ${dotMin}%-${dotMax}% ${gif.state_mag}MAG/turn (TRUE DMG)`;
                                    }
                                    if (eff.type === 'defense_up') {
                                        damageInfo += `\n**Defense Buff:** +${eff.defenseMinPercent}-${eff.defenseMaxPercent}% PR & MR`;
                                    }
                                    if (eff.type === 'mortality') {
                                        damageInfo += `\n**Heal Reduction:** ${eff.healReductionMin}-${eff.healReductionMax}%`;
                                    }
                                    if (eff.type === 'overheal') {
                                        damageInfo += `\n**Overheal Cap:** +${eff.maxOverhealPercent}% Max HP`;
                                    }
                                    if (eff.type === 'wp_drain') {
                                        damageInfo += `\n**WP Drain:** ${eff.drainMinPercent}-${eff.drainMaxPercent}% of damage`;
                                    }
                                    if (eff.type === 'taunt') {
                                        damageInfo += `\n**Damage Reduction:** ${eff.damageReductionMin}-${eff.damageReductionMax}%`;
                                    }
                                    if (eff.type === 'true_damage') {
                                        damageInfo += `\n**Stat Boost:** +${eff.statBoostMin}-${eff.statBoostMax}% ALL stats`;
                                        damageInfo += `\n**Special:** Deals TRUE damage (ignores resistance)`;
                                    }
                                    if (eff.type === 'celebration') {
                                        damageInfo += `\n**HP Regen:** ${eff.hpHealMinPercent}-${eff.hpHealMaxPercent}% ${gif.state_pr}PR/turn`;
                                        damageInfo += `\n**WP Regen:** ${eff.wpRestoreMinPercent}-${eff.wpRestoreMaxPercent}% ${gif.state_mr}MR/turn`;
                                    }
                                    if (eff.type === 'double_passive') {
                                        damageInfo += `\n**Special:** This weapon has TWO passive slots!`;
                                    }
                                    if (eff.type === 'revive') {
                                        damageInfo += `\n**Special:** Brings back fallen allies`;
                                    }
                                    if (eff.type === 'multi_punch') {
                                        damageInfo += `\n**Multi-Hit:** ${eff.hits} punches`;
                                        damageInfo += `\n**Special:** Each punch randomly uses STR or MAG`;
                                    }
                                }
                            } else {
                                // No damage (buff/passive weapons)
                                damageInfo = `**Type:** ${typeEmoji} ${weaponData.type.charAt(0).toUpperCase() + weaponData.type.slice(1)}\n`;
                                damageInfo += `**Target:** ${targetName}`;

                                if (weaponData.effect) {
                                    const eff = weaponData.effect;
                                    if (eff.duration) {
                                        damageInfo += `\n**Duration:** ${eff.duration} turns`;
                                    }
                                    if (eff.type === 'taunt') {
                                        damageInfo += `\n**Damage Reduction:** ${eff.damageReductionMin}-${eff.damageReductionMax}%`;
                                        damageInfo += `\n**Special:** Forces enemies to attack this unit`;
                                    }
                                    if (eff.type === 'double_passive') {
                                        damageInfo += `\n**Special:** This weapon has TWO passive slots!`;
                                    }
                                    if (eff.type === 'celebration') {
                                        damageInfo += `\n**HP Regen:** ${eff.hpHealMinPercent}-${eff.hpHealMaxPercent}% ${gif.state_pr}PR/turn`;
                                        damageInfo += `\n**WP Regen:** ${eff.wpRestoreMinPercent}-${eff.wpRestoreMaxPercent}% ${gif.state_mr}MR/turn`;
                                    }
                                }
                            }
                        } else {
                            // Fallback for weapons not in WEAPON_DATA
                            wpCost = 'Unknown';
                            damageInfo = `**Type:** ❓ Unknown Weapon\n**Effect:** No damage information available`;
                            weaponDescription = 'No description available.';
                        }

                        const passiveDetails = {
                            'physical_Resistance_effect': `🛡️ **Physical Resistance:** +5-15% damage reduction`,
                            'magic_Resistance_effect': `✨ **Magic Resistance:** +5-15% magic damage reduction`,
                            'strength_effect': `💪 **Strength:** +5-15% physical damage`,
                            'magic_effect': `🔮 **Magic:** +5-15% magical damage`,
                            'health_point_effect': `❤️ **Health Points:** +5-15% max HP`,
                            'weapon_point_effect': `⚡ **Weapon Points:** +5-15% max WP`,
                            'lifesteal_effect': `🩸 **Lifesteal:** Heal 10-25% of damage dealt`,
                            'regeneration_effect': `💚 **Regeneration:** Restore 2-5% HP per turn`,
                            'sacrifice_Effect': `⚰️ **Sacrifice:** On death, heal team 50-75% of max HP/WP`,
                            'thorns_Effect': `🌵 **Thorns:** Reflect 15-35% of damage taken`,
                            'discharge_Effect': `⚡ **Discharge:** Deal 40-70% of max WP as magic damage when WP = 0`,
                            'sprout_Effect': `🌱 **Sprout:** Increase all incoming healing by 20-40%`,
                            'enrage_Effect': `🔥 **Enrage:** Every 10% of missing health increases damage dealt by 1-4%`,
                            'kamikaze_Effect': `💀 **Kamikaze:** On death, deal 50-75% of max HP as MAG damage to attacker`,
                            'safeguard_Effect': `🛡️ **Safeguard:** Negate 20-40% of damage dealt to you with WP`,
                            'energize_Effect': `⚡ **Energize:** Replenish 20-40 WP after every turn`,
                            'critical_Effect': `⚔️ **Critical:** 10-30% chance to deal 25-50% more damage`,
                            'absolve_Effect': `✨ **Absolve:** When healed, deal 60-80% of healed amount as MAG damage`,
                            'snail_Effect': `🐌 **Snail:** When you attack, snail slaps a random enemy for 5-15% of damage dealt`,
                            'mana_tap_Effect': `💎 **Mana Tap:** 15-30% of damage dealt is restored as WP`,
                            'knowledge_Effect': `📚 **Knowledge:** Gain 5-15% extra XP after each battle`
                        };

                        let passive_one_detail = passiveDetails[passive] || '❓ **Unknown Passive**';
                        let passive_two_detail = '';

                        if (passive_two && passive_two !== 'false' && passive_two !== '') {
                            passive_two_detail = `\n${passiveDetails[passive_two] || '❓ **Unknown Passive**'}`;
                        }

                        let equippedTo = `${sym}Not Equipped${sym}`;
                        let equippedIcon = '❌';

                        if (boolStr && boolStr != 'false') {
                            if (getAnimalNameByName(boolStr)) {
                                equippedTo = `${gif[`rank_${getAnimalIdByName(boolStr)}`]} **${boolStr}**`;
                                equippedIcon = '✅';
                            } else {
                                equippedTo = `**${boolStr}**`;
                                equippedIcon = '✅';
                            }
                        }

                        const weapon_gif = gif[`${name}_${rank}_gif`] || '⚔️';
                        const rank_gif = getRank(rank);
                        const quality_bonus_percent = ((quality_bonus - 1) * 100).toFixed(1);
                        const rank_bonus_percent = ((rank_dmg_multiplier - 1) * 100).toFixed(1);

                        const embed = customEmbed()
                            .setAuthor({
                                name: `${user.displayName}'s Weapon Details`,
                                iconURL: user.displayAvatarURL()
                            })
                            .setColor('Gold')
                            .setDescription(`${weapon_gif} **${weaponName}**
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${equippedIcon} **Equipped:** ${equippedTo}
🆔 **Weapon ID:** ${sym}${id}${sym}
${rank_gif} **Quality Rank:** ${rank.toUpperCase()} (${percen}%)

📊 **Rank Scaling:**
└─ Rank Bonus: +${rank_bonus_percent}%
└─ Quality Bonus: +${quality_bonus_percent}%
└─ Total Multiplier: **${final_dmg_multiplier.toFixed(3)}x**

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚔️ **COMBAT STATISTICS**
${damageInfo}
💎 **WP Cost:** ${wpCost}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📜 **DESCRIPTION**
${weaponDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ **PASSIVE ABILITIES**
${passive_one_detail}${passive_two_detail}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 **Quick Commands:**
• Equip: ${sym}w ${id} {animal}${sym}
• Unequip: ${sym}w unequip ${id}${sym}
• Reroll: ${sym}w rr ${id}${sym}`)
                            .setFooter({
                                text: `Weapon Arsenal | ${userData.shard.toLocaleString()} Weapon Metals`,
                                iconURL: user.displayAvatarURL()
                            })
                            .setTimestamp();

                        return message.channel.send({ embeds: [embed] });
                    }
                }

                if (!weaponFound) {
                    return message.channel.send({
                        embeds: [SimpleEmbed(`**Now <@${user.id}>**, weapon with ID ${sym}${weapon_id_upper}${sym} was not found in your arsenal!\n\n**Tip:** Use ${sym}w${sym} to view all your weapons!`)]
                    });
                }
            }

            if (args[0]) {
                if (args[0] == 'unequip') {
                    const weapon_id = args[1].toUpperCase();
                    if (!await getWeaponEquipById(weapon_id, user.id)) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, this weapon is not equipped on anyone!`)] }); return; };
                    let index = 0;
                    for (const allwp of userData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                        if (weapon_id == id) {
                            message.channel.send(`**🗡️ | ${user.displayName}**, Unequipped ${await getWeaponRankById(weapon_id, user.id)} ${await getWeaponNameById(weapon_id, user.id)} from ${gif[`rank_${getAnimalIdByName(boolStr)}`]} ${boolStr}!`);
                            const string = str.replace(`${boolStr}`, 'false');
                            userData.wp[index] = string;
                            try {
                                await userData.save();
                            } catch (error) { }
                            return;
                        }
                        index += 1;
                    }

                    return;
                }

                const weapon_id = args[0].toUpperCase();
                if (weapon_id) {
                    let index = 0;
                    let animal_name = args[1];

                    if (userData.sat.team.team_set == 1) {
                        if (['1', '2', '3'].includes(animal_name)) {
                            if (animal_name == 1) {
                                if (!userData.sat.team.postion1) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, Create a team first!`)] }); return; }
                                animal_name = `${userData.sat.team.postion1}`;
                            } else if (animal_name == 2) {
                                if (!userData.sat.team.postion2) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, Create a team first!`)] }); return; }
                                animal_name = `${userData.sat.team.postion2}`;
                            } else if (animal_name == 3) {
                                if (!userData.sat.team.postion3) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, Create a team first!`)] }); return; }
                                animal_name = `${userData.sat.team.postion3}`;
                            }
                        }
                    } else if (userData.sat.team.team_set == 2) {
                        if (['1', '2', '3'].includes(animal_name)) {
                            if (animal_name == 1) {
                                if (!userData.sat.team.postion4) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, Create a team first!`)] }); return; }
                                animal_name = `${userData.sat.team.postion4}`;
                            } else if (animal_name == 2) {
                                if (!userData.sat.team.postion5) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, Create a team first!`)] }); return; }
                                animal_name = `${userData.sat.team.postion5}`;
                            } else if (animal_name == 3) {
                                if (!userData.sat.team.postion6) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, Create a team first!`)] }); return; }
                                animal_name = `${userData.sat.team.postion6}`;
                            }
                        }
                    }

                    for (const wp of userData.wp) {
                        const str = `${wp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                        if (boolStr == animal_name) {
                            const string = str.replace(`${boolStr}`, `false`);
                            userData.wp[index] = string;
                        }

                        if (str.includes(`${weapon_id}`)) {
                            if (!getAnimalNameByName(animal_name)) { if (!await checkOwnAnimal(animal_name, user.id)) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>** you do not own this animal!`)] }); return; } }

                            message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, ${gif[`rank_${getAnimalIdByName(animal_name)}`]} **${animal_name}** is now equiped ${await getWeaponRankById(weapon_id, user.id)} ${await getWeaponNameById(weapon_id, user.id)}!`)] });
                            const string = str.replace(`${boolStr}`, `${animal_name}`);
                            userData.wp[index] = string;
                        }
                        index += 1;
                    }
                    try {
                        await userData.save();
                    } catch (error) { }
                    return;
                }
            }

            let Page = 1;
            if (userData.wp.length < 1) {
                const embed = customEmbed()
                    .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                    .setDescription(`These weapons belong to <@${user.id}>\nEquip:${sym}weapon {weaponID} {animal}${sym}\nUnequip:${sym}weapon unequip {weaponID}${sym}\ndismantle (shard): ${sym}dmt {weaponID}${sym}\nreroll stats : ${sym}rr {weaponID} s${sym}\nreroll pasive : ${sym}rr {weaponID} p${sym}\n\nNothing`)
                    .setColor('#8EC3FF')
                    .setFooter({ text: `Page 1/1` })
                message.channel.send({ embeds: [embed] });
            } else {
                var messageWeapons = [];

                // Auto-sort weapons by rank and percentage
                const rankOrder = { 'febled': 1, 'legendary': 2, 'mythical': 3, 'epic': 4, 'rare': 5, 'uncommon': 6, 'common': 7 };
                userData.wp.sort((a, b) => {
                    const partsA = a.split(' ');
                    const partsB = b.split(' ');
                    const rankA = partsA[2];
                    const rankB = partsB[2];
                    const percenA = parseInt(partsA[4]) || 0;
                    const percenB = parseInt(partsB[4]) || 0;

                    if (rankA !== rankB) {
                        return (rankOrder[rankA] || 8) - (rankOrder[rankB] || 8);
                    }
                    return percenB - percenA;
                });

                let index = 0;
                let messageWeapon = '';
                for (const wp of userData.wp) {
                    const str = `${wp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    let passive_two_gif = '';
                    if (passive_two) { passive_two_gif = getPassive(passive_two) }

                    let equiped = '';
                    if (boolStr != 'false') {
                        if (getAnimalNameByName(boolStr)) {
                            equiped = `➤ ${gif[`rank_${getAnimalIdByName(boolStr)}`]}`;
                        }
                    }

                    // Get rank indicator symbol
                    let rankIndicator = '';
                    if (rank === 'febled') rankIndicator = '<a:Fabled:1435687683790733342>';
                    else if (rank === 'legendary') rankIndicator = '<a:Legendary:1435688346180391042>';
                    else if (rank === 'mythical') rankIndicator = '<:Mythical:1435668318911463456>';
                    else if (rank === 'epic') rankIndicator = '<:Epic:1435668058965545082>';
                    else if (rank === 'rare') rankIndicator = '<:Rare:1435667745512624199>';
                    else if (rank === 'uncommon') rankIndicator = '<:Uncommon:1435667451387056229>';
                    else rankIndicator = '<:Common:1435665519444361236>';

                    messageWeapon += `${sym}${id}${sym} ${rankIndicator} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} **${getWeaponName(name)}** ${percen}% ${equiped}\n`;

                    index += 1;

                    if (index === 15) {
                        messageWeapons[Page - 1] = `${messageWeapon}`;
                        Page += 1;
                        index = 0;
                        messageWeapon = '';
                    }
                }

                if (messageWeapon !== '') {
                    messageWeapons.push(messageWeapon);
                }
                Page = messageWeapons.length;

                if (Page > 1) {
                    const weaponOptions = [
                        { label: 'All', value: 'all', emoji: '🌐' },
                        { label: 'Great Sword', value: 'great_sword', emoji: gif.great_sword_gif },
                        { label: 'Healing Staff', value: 'healing_stuff', emoji: gif.healing_stuff_gif },
                        { label: 'Bow', value: 'bow', emoji: gif.bow_gif },
                        { label: 'Rune of the Forgotten', value: 'rune_of_the_forgotten', emoji: gif.rune_of_the_forgotten_gif },
                        { label: 'Defenders Aegis', value: 'defender_aegis', emoji: gif.defender_aegis_gif },
                        { label: 'Orb of Potency', value: 'orb_of_potency', emoji: gif.orb_of_potency_gif },
                        { label: 'Poison Dagger', value: 'poison_dagger', emoji: gif.poison_dagger_gif },
                        { label: 'Wand of Absorption', value: 'wang_of_absorption', emoji: gif.wang_of_absorption_gif },
                        { label: 'Spirit Staff', value: 'spirit_stuff', emoji: gif.spirit_stuff_gif },
                        { label: 'Energy Staff', value: 'energy_stuff', emoji: gif.energy_stuff_gif },
                        { label: 'Resurrection Staff', value: 'resurrection_staff', emoji: gif.resurrection_staff_gif },
                        { label: 'Culling Scythe', value: 'culling_scythe', emoji: gif.culling_scythe_gif },
                        { label: 'Crune of Celebration', value: 'crune_of_celebration', emoji: gif.crune_of_celebration_gif },
                        { label: 'Vanguards Banner', value: 'vanguards_banner', emoji: gif.vanguards_banner_gif },
                        { label: 'Vampiric Staff', value: 'vampiric_staff', emoji: gif.vampiric_staff_gif },
                        { label: 'Staff of Purity', value: 'staff_of_purity', emoji: gif.staff_of_purity_gif },
                        { label: 'Rune of Luck', value: 'rune_of_luck', emoji: gif.rune_of_luck_gif },
                        { label: 'Leeching Scythe', value: 'leeching_scythe', emoji: gif.leeching_scythe_gif },
                        { label: 'Foul Fish', value: 'foul_fish', emoji: gif.foul_fish_gif },
                        { label: 'Flame Staff', value: 'flame_stuff', emoji: gif.flame_stuff_gif },
                        { label: 'Arcane Scepter', value: 'arcane_scepter', emoji: gif.arcane_scepter_gif },
                        { label: 'Glacial Axe', value: 'glacial_axe', emoji: gif.glacial_axe_gif }
                    ];

                    let name_choice = 'All';
                    let setAmount = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('set_amount_psa')
                                .setPlaceholder(`Select weapon types [1]`)
                                .setMinValues(1)
                                .setMaxValues(weaponOptions.length)
                                .addOptions(weaponOptions.map(opt => ({
                                    label: opt.label,
                                    value: opt.value,
                                    emoji: opt.emoji,
                                    description: `Filter by ${opt.label}`
                                })))
                        );

                    const interactionHandler = async (interaction) => {
                        try {
                            if (!interaction.isStringSelectMenu()) return;
                            if (interaction.member.user.id != user.id) return;
                            if (interaction.customId != 'set_amount_psa') return;
                            if (interaction.deferred || interaction.replied) return;

                            // Defer the update immediately to prevent timeout
                            await interaction.deferUpdate();

                            const selectedValues = interaction.values;
                            name_choice = selectedValues.includes('all') ? 'All' : `Selected [${selectedValues.length}]`;

                            messageWeapons = [];
                            messageWeapon = '';
                            left_page.setDisabled(true);
                            view_page = 1;
                            Page = 1;
                            let next_page = 0;

                            for (const wp of userData.wp) {
                                const str = `${wp}`;
                                const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                                // Filter check
                                if (!selectedValues.includes('all') && !selectedValues.includes(name)) continue;

                                let passive_two_gif = '';
                                if (passive_two) { passive_two_gif = getPassive(passive_two) }

                                let equiped = '';
                                if (boolStr != 'false') {
                                    if (getAnimalNameByName(boolStr)) {
                                        equiped = `➤ ${gif[`rank_${getAnimalIdByName(boolStr)}`]}`;
                                    }
                                }

                                // Get rank indicator symbol
                                let rankIndicator = '';
                                if (rank === 'febled') rankIndicator = '<a:Fabled:1435687683790733342>';
                                else if (rank === 'legendary') rankIndicator = '<a:Legendary:1435688346180391042>';
                                else if (rank === 'mythical') rankIndicator = '<:Mythical:1435668318911463456>';
                                else if (rank === 'epic') rankIndicator = '<:Epic:1435668058965545082>';
                                else if (rank === 'rare') rankIndicator = '<:Rare:1435667745512624199>';
                                else if (rank === 'uncommon') rankIndicator = '<:Uncommon:1435667451387056229>';
                                else rankIndicator = '<:Common:1435665519444361236>';

                                messageWeapon += `${sym}${id}${sym} ${rankIndicator} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} **${getWeaponName(name)}** ${percen}% ${equiped}\n`;

                                next_page += 1;
                                if (next_page > 15) { next_page = 1; Page += 1; }
                                if (next_page === 15) {
                                    messageWeapons[Page - 1] = `${messageWeapon}`;
                                    messageWeapon = '';
                                }
                            }

                            if (messageWeapon !== '') {
                                messageWeapons.push(messageWeapon);
                            }
                            if (messageWeapons.length === 0) {
                                messageWeapons.push('Nothing');
                            }

                            if (Page < 2) { right_page.setDisabled(true); } else { right_page.setDisabled(false); }

                            setAmount = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('set_amount_psa')
                                        .setPlaceholder(`Select weapon types [${selectedValues.length}]`)
                                        .setMinValues(1)
                                        .setMaxValues(weaponOptions.length)
                                        .addOptions(weaponOptions.map(opt => ({
                                            label: opt.label,
                                            value: opt.value,
                                            emoji: opt.emoji,
                                            description: `Filter by ${opt.label}`,
                                            default: selectedValues.includes(opt.value)
                                        })))
                                );

                            const embed = customEmbed()
                                .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                                .setDescription(`These weapons belong to <@${user.id}>\nEquip:${sym}weapon {weaponID} {animal}${sym}\nUnequip:${sym}weapon unequip {weaponID}${sym}\ndismantle (shard): ${sym}dmt {weaponID}${sym}\nreroll rank : ${sym}rr {weaponID} s${sym}\nreroll pasive : ${sym}rr {weaponID} p${sym}\n\n${messageWeapons[0]}`)
                                .setColor('#8EC3FF')
                                .setFooter({ text: `Page ${view_page}/${Page}` })

                            // Use editReply since we already deferred
                            await interaction.editReply({ embeds: [embed], components: [setAmount, all_button] });
                        } catch (error) {
                            console.error('Weapon filter interaction error:', error);
                        }

                        return;
                    };

                    client.on('interactionCreate', interactionHandler);
                    const interc = new InteractionCollector(client, {
                        time: 300_000
                    });
                    interc.on('end', () => {
                        client.removeListener('interactionCreate', interactionHandler);
                    });

                    let view_page = 1;
                    const embed = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setDescription(`These weapons belong to <@${user.id}>\nEquip:${sym}weapon {weaponID} {animal}${sym}\nUnequip:${sym}weapon unequip {weaponID}${sym}\ndismantle (shard): ${sym}dmt {weaponID}${sym}\nreroll rank : ${sym}rr {weaponID} s${sym}\nreroll pasive : ${sym}rr {weaponID} p${sym}\nSell: ${sym}sell {weaponID}${sym}\n\n${messageWeapons[0]}`)
                        .setColor('#8EC3FF')
                        .setFooter({ text: `Page ${view_page}/${Page}` })

                    const left_page = labelButton('left_page', '<', ButtonStyle.Success);
                    const right_page = labelButton('right_page', '>', ButtonStyle.Success);
                    const short_button = labelButton('short_button', 's', ButtonStyle.Primary);

                    const all_button = threeButton(left_page, right_page, short_button);

                    if (view_page == 1) { left_page.setDisabled(true); }

                    const mgs = await message.channel.send({ embeds: [embed], components: [setAmount, all_button] });

                    const collector = getCollectionButton(mgs, 300_000);

                    collector.on('end', () => {
                        try {
                            collector.stop();
                            const embed = customEmbed()
                                .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                                .setDescription(`These weapons belong to <@${user.id}>\nEquip:${sym}weapon {weaponID} {animal}${sym}\nUnequip:${sym}weapon unequip {weaponID}${sym}\ndismantle (shard): ${sym}dmt {weaponID}${sym}\nreroll rank : ${sym}rr {weaponID} s${sym}\nreroll pasive : ${sym}rr {weaponID} p${sym}\n\n${messageWeapons[view_page - 1]}`)
                                .setColor('Blurple')
                                .setFooter({ text: `Page ${view_page}/${Page}` })
                            mgs.edit({ embeds: [embed], components: [] });
                            return;
                        } catch (error) { }
                    })

                    collector.on('collect', async (interaction) => {
                        try {
                            if (interaction.member.user.id != user.id) {
                                await interaction.reply({ content: 'Not your button!', ephemeral: true });
                                return;
                            }

                            if (interaction.customId == 'right_page') {
                                if (view_page == Page - 1) { right_page.setDisabled(true); }
                                left_page.setDisabled(false);
                                view_page += 1;
                                const embed = customEmbed()
                                    .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                                    .setDescription(`These weapons belong to <@${user.id}>\nEquip:${sym}weapon {weaponID} {animal}${sym}\nUnequip:${sym}weapon unequip {weaponID}${sym}\ndismantle (shard): ${sym}dmt {weaponID}${sym}\nreroll rank : ${sym}rr {weaponID} s${sym}\nreroll pasive : ${sym}rr {weaponID} p${sym}\n\n${messageWeapons[view_page - 1]}`)
                                    .setColor('#8EC3FF')
                                    .setFooter({ text: `Page ${view_page}/${Page}` })
                                await interaction.update({ embeds: [embed], components: [setAmount, all_button] });
                            }
                            if (interaction.customId == 'left_page') {
                                if (view_page == 2) { left_page.setDisabled(true); }
                                right_page.setDisabled(false);
                                view_page -= 1;
                                const embed = customEmbed()
                                    .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                                    .setDescription(`These weapons belong to <@${user.id}>\nEquip:${sym}weapon {weaponID} {animal}${sym}\nUnequip:${sym}weapon unequip {weaponID}${sym}\ndismantle (shard): ${sym}dmt {weaponID}${sym}\nreroll rank : ${sym}rr {weaponID} s${sym}\nreroll pasive : ${sym}rr {weaponID} p${sym}\n\n${messageWeapons[view_page - 1]}`)
                                    .setColor('#8EC3FF')
                                    .setFooter({ text: `Page ${view_page}/${Page}` })
                                await interaction.update({ embeds: [embed], components: [setAmount, all_button] });
                            }
                            if (interaction.customId == 'short_button') {
                                messageWeapons.shift();
                                messageWeapon = '';

                                left_page.setDisabled(true);

                                view_page = 1;
                                Page = 1;

                                let amount_weapon_all = 0;
                                let weapon_f = [];
                                let weapon_l = [];
                                let weapon_m = [];
                                let weapon_e = [];
                                let weapon_r = [];
                                let weapon_u = [];
                                let weapon_c = [];

                                for (const wp of userData.wp) {
                                    const str = `${wp}`;
                                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                                    let passive_two_gif = '';
                                    if (passive_two) { passive_two_gif = getPassive(passive_two) }

                                    let equiped = '';
                                    if (boolStr != 'false') {
                                        if (getAnimalNameByName(boolStr)) {
                                            equiped = `➤ ${gif[`rank_${getAnimalIdByName(boolStr)}`]}`;
                                        }
                                    }

                                    // Get rank indicator symbol
                                    let rankIndicator = '';
                                    if (rank === 'febled') rankIndicator = '<a:Fabled:1435687683790733342>';
                                    else if (rank === 'legendary') rankIndicator = '<a:Legendary:1435688346180391042>';
                                    else if (rank === 'mythical') rankIndicator = '<:Mythical:1435668318911463456>';
                                    else if (rank === 'epic') rankIndicator = '<:Epic:1435668058965545082>';
                                    else if (rank === 'rare') rankIndicator = '<:Rare:1435667745512624199>';
                                    else if (rank === 'uncommon') rankIndicator = '<:Uncommon:1435667451387056229>';
                                    else rankIndicator = '<:Common:1435665519444361236>';

                                    const weaponLine = `${sym}${id}${sym} ${rankIndicator} ${getWeaponRank(name, rank)} ${getPassive(passive)}${passive_two_gif} **${getWeaponName(name)}** ${percen}% ${equiped}\n`;

                                    if (rank == 'common') {
                                        weapon_c.push(weaponLine);
                                    } else if (rank == 'uncommon') {
                                        weapon_u.push(weaponLine);
                                    } else if (rank == 'rare') {
                                        weapon_r.push(weaponLine);
                                    } else if (rank == 'epic') {
                                        weapon_e.push(weaponLine);
                                    } else if (rank == 'mythical') {
                                        weapon_m.push(weaponLine);
                                    } else if (rank == 'legendary') {
                                        weapon_l.push(weaponLine);
                                    } else if (rank == 'febled') {
                                        weapon_f.push(weaponLine);
                                    }
                                }

                                let next_page = 0;
                                let increase = 0;

                                let amount_weapon_f = weapon_f.length;
                                let amount_weapon_l = weapon_l.length;
                                let amount_weapon_m = weapon_m.length;
                                let amount_weapon_e = weapon_e.length;
                                let amount_weapon_r = weapon_r.length;
                                let amount_weapon_u = weapon_u.length;
                                let amount_weapon_c = weapon_c.length;

                                amount_weapon_all = (amount_weapon_f + amount_weapon_l + amount_weapon_m + amount_weapon_e + amount_weapon_r + amount_weapon_u + amount_weapon_c);

                                for (let i = 1; i <= amount_weapon_all; i++) {

                                    if (amount_weapon_f > 0) {
                                        messageWeapon += weapon_f[increase];
                                        amount_weapon_f -= 1;
                                        increase += 1;
                                        if (amount_weapon_f <= 0) { increase = 0; }

                                    } else if (amount_weapon_l > 0) {
                                        messageWeapon += weapon_l[increase];
                                        amount_weapon_l -= 1;
                                        increase += 1;
                                        if (amount_weapon_l <= 0) { increase = 0; }

                                    } else if (amount_weapon_m > 0) {
                                        messageWeapon += weapon_m[increase];
                                        amount_weapon_m -= 1;
                                        increase += 1;
                                        if (amount_weapon_m <= 0) { increase = 0; }

                                    } else if (amount_weapon_e > 0) {
                                        messageWeapon += weapon_e[increase];
                                        amount_weapon_e -= 1;
                                        increase += 1;
                                        if (amount_weapon_e <= 0) { increase = 0; }

                                    } else if (amount_weapon_r > 0) {
                                        messageWeapon += weapon_r[increase];
                                        amount_weapon_r -= 1;
                                        increase += 1;
                                        if (amount_weapon_r <= 0) { increase = 0; }

                                    } else if (amount_weapon_u > 0) {
                                        messageWeapon += weapon_u[increase];
                                        amount_weapon_u -= 1;
                                        increase += 1;
                                        if (amount_weapon_u <= 0) { increase = 0; }

                                    } else if (amount_weapon_c > 0) {
                                        messageWeapon += weapon_c[increase];
                                        amount_weapon_c -= 1;
                                        increase += 1;
                                        if (amount_weapon_c <= 0) { increase = 0; }
                                    }

                                    next_page += 1;
                                    if (next_page === 15) {
                                        messageWeapons[Page - 1] = `${messageWeapon}`;
                                        next_page = 0;
                                        Page += 1;
                                        messageWeapon = '';
                                    }
                                }

                                if (messageWeapon !== '') {
                                    messageWeapons.push(messageWeapon);
                                }
                                Page = messageWeapons.length;

                                if (Page > 1) { right_page.setDisabled(false); }

                                const embed = customEmbed()
                                    .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                                    .setDescription(`These weapons belong to <@${user.id}>\nEquip:${sym}weapon {weaponID} {animal}${sym}\nUnequip:${sym}weapon unequip {weaponID}${sym}\ndismantle (shard): ${sym}dmt {weaponID}${sym}\nreroll rank : ${sym}rr {weaponID} s${sym}\nreroll pasive : ${sym}rr {weaponID} p${sym}\n\n${messageWeapons[view_page - 1]}`)
                                    .setColor('#8EC3FF')
                                    .setFooter({ text: `Page ${view_page}/${Page}` })
                                await interaction.update({ embeds: [embed], components: [setAmount, all_button] });
                            }
                        } catch (error) { }
                    });

                } else {
                    const embed = customEmbed()
                        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
                        .setDescription(`These weapons belong to <@${user.id}>\nEquip:${sym}weapon {weaponID} {animal}${sym}\nUnequip:${sym}weapon unequip {weaponID}${sym}\ndismantle (shard): ${sym}dmt {weaponID}${sym}\nreroll rank : ${sym}rr {weaponID} s${sym}\nreroll pasive : ${sym}rr {weaponID} p${sym}\n\n${messageWeapons[0]}`)
                        .setColor('#8EC3FF')
                        .setFooter({ text: `Page 1/1` })
                    message.channel.send({ embeds: [embed] });
                }
            }

        } catch (error) {
            console.error(`Error in 'w' command: ${error}`);
        }

    },
};
