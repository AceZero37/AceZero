const { cooldown, customEmbed, checkOwnAnimal, getAnimalIdByName, checkRankAnimalById, checkPointAnimalById, checkSellAnimalById, getAnimalNameByName, gif, sym, SimpleEmbed, getUser, getAnimalTypeAndRecommendations, getWeaponDisplayName, getPassiveDisplayName, getPassive } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'dex',
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

            const animal_name = args[0];

            if (!animal_name) {
                return message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, please specify an animal name! Use: ${sym}dex {animal_name}${sym}`)] });
            }

            const animal_id = getAnimalIdByName(animal_name);
            const name = getAnimalNameByName(animal_name);

            if (!await checkOwnAnimal(name, user.id)) {
                message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>** you do not own this animal!`)] });
                return;
            }

            if (animal_id) {
                const sat = gif[`rank_${animal_id}`];
                const animal_rank = checkRankAnimalById(animal_id);
                const sell = checkSellAnimalById(animal_id);
                const Points = checkPointAnimalById(animal_id);

                const hp = gif[`rank_${animal_id}_hp`];
                const str = gif[`rank_${animal_id}_str`];
                const pr = gif[`rank_${animal_id}_pr`];
                const wp = gif[`rank_${animal_id}_wp`];
                const mag = gif[`rank_${animal_id}_mag`];
                const mr = gif[`rank_${animal_id}_mr`];

                // Get animal type and recommendations
                const animalInfo = getAnimalTypeAndRecommendations(animal_id);
                const animalType = animalInfo.type;

                // Weapon emojis mapping
                const weaponEmojis = {
                    'great_sword': gif.great_sword_gif,
                    'bow': gif.bow_gif,
                    'poison_dagger': gif.poison_dagger_gif,
                    'healing_stuff': gif.healing_stuff_gif,
                    'spirit_stuff': gif.spirit_stuff_gif,
                    'energy_stuff': gif.energy_stuff_gif,
                    'wang_of_absorption': gif.wang_of_absorption_gif,
                    'resurrection_staff': gif.resurrection_staff_gif,
                    'culling_scythe': gif.culling_scythe_gif,
                    'rune_of_the_forgotten': gif.rune_of_the_forgotten_gif,
                    'crune_of_celebration': gif.crune_of_celebration_gif,
                    'defender_aegis': gif.defender_aegis_gif,
                    'orb_of_potency': gif.orb_of_potency_gif,
                    'rune_of_luck': gif.rune_of_luck_gif,
                    'vampiric_staff': gif.vampiric_staff_gif,
                    'flame_stuff': gif.flame_stuff_gif,
                    'arcane_scepter': gif.arcane_scepter_gif,
                    'glacial_axe': gif.glacial_axe_gif,
                    'vanguards_banner': gif.vanguards_banner_gif,
                    'staff_of_purity': gif.staff_of_purity_gif,
                    'leeching_scythe': gif.leeching_scythe_gif,
                    'foul_fish': gif.foul_fish_gif
                };

                // Build recommended weapons string with emojis
                const recommendedWeapons = animalInfo.recommendedWeapons
                    .slice(0, 3)
                    .map(w => `${weaponEmojis[w] || '⚔️'} ${getWeaponDisplayName(w)}`)
                    .join('\n');

                // Build recommended passives string with emojis
                const passiveEmojis = {
                    'physical_Resistance_effect': gif.physical_Resistance_effect_gif,
                    'magic_Resistance_effect': gif.magic_Resistance_effect_gif,
                    'strength_effect': gif.strength_effect_gif,
                    'magic_effect': gif.magic_effect_gif,
                    'health_point_effect': gif.health_point_effect_gif,
                    'weapon_point_effect': gif.weapon_point_effect_gif,
                    'lifesteal_effect': gif.lifesteal_effect_gif,
                    'regeneration_effect': gif.regeneration_effect_gif,
                    'sacrifice_Effect': gif.sacrifice_Effect_gif,
                    'thorns_Effect': gif.thorns_Effect_gif,
                    'discharge_Effect': gif.discharge_Effect_gif,
                    'sprout_Effect': gif.sprout_Effect_gif,
                    'enrage_Effect': gif.enrage_Effect_gif,
                    'kamikaze_Effect': gif.kamikaze_Effect_gif,
                    'safeguard_Effect': gif.safeguard_Effect_gif,
                    'energize_Effect': gif.energize_Effect_gif,
                    'critical_Effect': gif.critical_Effect_gif,
                    'absolve_Effect': gif.absolve_Effect_gif,
                    'snail_Effect': gif.snail_Effect_gif,
                    'mana_tap_Effect': gif.mana_tap_Effect_gif,
                    'knowledge_Effect': gif.knowledge_Effect_gif
                };

                const recommendedPassives = animalInfo.recommendedPassives
                    .slice(0, 4)
                    .map(p => `${passiveEmojis[p] || '✨'} ${getPassiveDisplayName(p)}`)
                    .join('\n');

                // Calculate total stats
                const totalStats = parseInt(hp) + parseInt(str) + parseInt(pr) + parseInt(wp) + parseInt(mag) + parseInt(mr);

                const embed = customEmbed()
                    .setTitle(`${sat} ${name}`)
                    .setColor('Blue')
                    .setDescription(`━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **BASIC INFO**
**Rank:** ${animal_rank}
**Sell Price:** ${sell}
**Points:** ${Points}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
${animalType.emoji} **TYPE: ${animalType.name.toUpperCase()}**
*${animalType.description}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **BASE STATS** (Total: ${totalStats})
${gif.state_hp} HP: ${sym}${hp}${sym}  ${gif.state_str} STR: ${sym}${str}${sym}  ${gif.state_pr} PR: ${sym}${pr}${sym}
${gif.state_wp} WP: ${sym}${wp}${sym}  ${gif.state_mag} MAG: ${sym}${mag}${sym}  ${gif.state_mr} MR: ${sym}${mr}${sym}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚔️ **RECOMMENDED WEAPONS**
${recommendedWeapons}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ **RECOMMENDED PASSIVES**
${recommendedPassives}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 **TIP:** ${animalType.name === 'Tank' ? 'Focus on defense and HP passives to maximize survivability!' :
                            animalType.name === 'DPS' ? 'Equip weapons with high STR scaling for maximum damage!' :
                                animalType.name === 'Mage' ? 'Prioritize MAG and WP for sustained magical damage!' :
                                    animalType.name === 'Support' ? 'Healing weapons and regeneration passives work best!' :
                                        animalType.name === 'Assassin' ? 'High burst weapons with lifesteal for survivability!' :
                                            animalType.name === 'Hybrid' ? 'Flexible build - mix damage and utility!' :
                                                'Balance offense and defense for versatile performance!'}`)
                    .setFooter({ text: `Animal Dex | ${animalType.name} Type`, iconURL: user.displayAvatarURL() })
                    .setTimestamp();

                message.channel.send({ embeds: [embed] });
            } else {
                message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, could not find animal "${animal_name}"!`)] });
            }
            return;

        } catch (error) {
            console.log(`error dex: ${error}`);
        }
    },
};