const { battleWithWeapon, labelButton, twoButton, ButtonStyle, getRandomInt, gif, cooldown, getUser, sym, SimpleEmbed, customEmbed, getAnimalIdByName, xpToLevel, sleep, getSatImage, AttachmentBuilder, getAnimalNameByName, checkOwnAnimal, stateHP, stateMAG, stateMR, statePR, stateSTR, stateWP, resistance, getRank, getWeaponRank, getPassive, activeWeapon, getCollectionButton, battleAllEntity, getUserClanTag, getUserClanDisplay, getAnimalType, getPetTypeCounterMultiplier, getWeaponCounterMultiplier, getEntityType } = require('../../functioon/function');
const { getAllUserIdsRank } = require('../../msc/Handler/userManage');

const cooldowns = new Map();
let CDT = 30_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'br',
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

            const Sat = userData.sat;

            if (!getAnimalNameByName(userData.sat.team.team_equipe1)) { userData.sat.team.team_equipe1 = ''; }
            if (!getAnimalNameByName(userData.sat.team.team_equipe2)) { userData.sat.team.team_equipe2 = ''; }
            if (!getAnimalNameByName(userData.sat.team.team_equipe3)) { userData.sat.team.team_equipe3 = ''; }

            let a1 = '';
            if (userData.sat.team.team_equipe1) { a1 = `[1]${gif[`rank_${getAnimalIdByName(userData.sat.team.team_equipe1)}`]} `; };
            let a2 = '';
            if (userData.sat.team.team_equipe2) { a2 = `[2]${gif[`rank_${getAnimalIdByName(userData.sat.team.team_equipe2)}`]} `; };
            let a3 = '';
            if (userData.sat.team.team_equipe3) { a3 = `[3]${gif[`rank_${getAnimalIdByName(userData.sat.team.team_equipe3)}`]} `; };
            const Team = Sat.team;

            let streak = 0;

            if (userData.sat.team.team_set == 1) {
                streak = userData.sat.team.streak;
            } else if (userData.sat.team.team_set == 2) {
                streak = userData.sat.team.streak_two;
            }

            if (!Team.team_equipe1 && !Team.team_equipe2 && !Team.team_equipe3) { message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>** Create a team with the command ${sym}team add {animal}${sym}`)] }); return; }
            const mgs = await message.channel.send({ embeds: [SimpleEmbed(`**${a1}${a2}${a3}Ready...**`).setColor('#8EC3FF')] });

            let setLvl = 0;

            let satAlllvl = 0;
            let eneAlllvl = 0;
            let messageOurTeam = '';
            let messageEnemyTeam = '';
            let ourTeamName = 'Player team';
            if (Team.team_name) { ourTeamName = `${Team.team_name}`; }
            let sats = 1;
            let enemyTeamName = 'Enemy team';
            let enes = 1;

            let oppoid = 0;

            let sat1 = {
                png: gif.empty_png,
                name: '',
                lvl: '',
                hp: '',
                left_hp: '',
                str: '',
                pr: '',
                wp: '',
                left_wp: '',
                mag: '',
                mr: '',
                main_hp: '',
                main_wp: '',
                bool: false,
                weapon: gif.weapon_empty,
                weapon_bool: false,
                increase_hp_point: '',
                increase_demage_point: '',
                resurrection_revive_heal: 0,
                culling_bool: false,
                culling_round: 0,
                culling_point: '',
                demage_point: '',
                mag_point: '',
                defend_up_bool: false,
                defend_up_round: 0,
                defend_up_defend_pr: 0,
                defend_up_defend_mr: 0,
                poison_bool: false,
                poison_round: 0,
                poison_demage: 0,
                weapon_name: '',
                weapon_rank: '',
                weapon_passive: '',
                weapon_passive_two: '',
                rank: '0_0',
            };
            let sat2 = {
                png: gif.empty_png,
                name: '',
                lvl: '',
                hp: '',
                left_hp: '',
                str: '',
                pr: '',
                wp: '',
                left_wp: '',
                mag: '',
                mr: '',
                main_hp: '',
                main_wp: '',
                bool: false,
                weapon: gif.weapon_empty,
                weapon_bool: false,
                increase_hp_point: '',
                increase_demage_point: '',
                resurrection_revive_heal: 0,
                culling_bool: false,
                culling_round: 0,
                culling_point: '',
                demage_point: '',
                mag_point: '',
                defend_up_bool: false,
                defend_up_round: 0,
                defend_up_defend_pr: 0,
                defend_up_defend_mr: 0,
                poison_bool: false,
                poison_round: 0,
                poison_demage: 0,
                weapon_name: '',
                weapon_rank: '',
                weapon_passive: '',
                weapon_passive_two: '',
                rank: '0_0',
            };
            let sat3 = {
                png: gif.empty_png,
                name: '',
                lvl: '',
                hp: '',
                left_hp: '',
                str: '',
                pr: '',
                wp: '',
                left_wp: '',
                mag: '',
                mr: '',
                main_hp: '',
                main_wp: '',
                bool: false,
                weapon: gif.weapon_empty,
                weapon_bool: false,
                increase_hp_point: '',
                increase_demage_point: '',
                resurrection_revive_heal: 0,
                culling_bool: false,
                culling_round: 0,
                culling_point: '',
                demage_point: '',
                mag_point: '',
                defend_up_bool: false,
                defend_up_round: 0,
                defend_up_defend_pr: 0,
                defend_up_defend_mr: 0,
                poison_bool: false,
                poison_round: 0,
                poison_demage: 0,
                weapon_name: '',
                weapon_rank: '',
                weapon_passive: '',
                weapon_passive_two: '',
                rank: '0_0',
            };

            let ene1 = {
                png: gif.empty_png,
                name: '',
                lvl: '',
                hp: '',
                left_hp: '',
                str: '',
                pr: '',
                wp: '',
                left_wp: '',
                mag: '',
                mr: '',
                main_hp: '',
                main_wp: '',
                bool: false,
                weapon: gif.weapon_empty,
                weapon_bool: false,
                increase_hp_point: '',
                increase_demage_point: '',
                resurrection_revive_heal: 0,
                culling_bool: false,
                culling_round: 0,
                culling_point: '',
                demage_point: '',
                mag_point: '',
                defend_up_bool: false,
                defend_up_round: 0,
                defend_up_defend_pr: 0,
                defend_up_defend_mr: 0,
                poison_bool: false,
                poison_round: 0,
                poison_demage: 0,
                weapon_name: '',
                weapon_rank: '',
                weapon_passive: '',
                weapon_passive_two: '',
                rank: '0_0',
            };
            let ene2 = {
                png: gif.empty_png,
                name: '',
                lvl: '',
                hp: '',
                left_hp: '',
                str: '',
                pr: '',
                wp: '',
                left_wp: '',
                mag: '',
                mr: '',
                main_hp: '',
                main_wp: '',
                bool: false,
                weapon: gif.weapon_empty,
                weapon_bool: false,
                increase_hp_point: '',
                increase_demage_point: '',
                resurrection_revive_heal: 0,
                culling_bool: false,
                culling_round: 0,
                culling_point: '',
                demage_point: '',
                mag_point: '',
                defend_up_bool: false,
                defend_up_round: 0,
                defend_up_defend_pr: 0,
                defend_up_defend_mr: 0,
                poison_bool: false,
                poison_round: 0,
                poison_demage: 0,
                weapon_name: '',
                weapon_rank: '',
                weapon_passive: '',
                weapon_passive_two: '',
                rank: '0_0',
            };
            let ene3 = {
                png: gif.empty_png,
                name: '',
                lvl: '',
                hp: '',
                left_hp: '',
                str: '',
                pr: '',
                wp: '',
                left_wp: '',
                mag: '',
                mr: '',
                main_hp: '',
                main_wp: '',
                bool: false,
                weapon: gif.weapon_empty,
                weapon_bool: false,
                increase_hp_point: '',
                increase_demage_point: '',
                resurrection_revive_heal: 0,
                culling_bool: false,
                culling_round: 0,
                culling_point: '',
                demage_point: '',
                mag_point: '',
                defend_up_bool: false,
                defend_up_round: 0,
                defend_up_defend_pr: 0,
                defend_up_defend_mr: 0,
                poison_bool: false,
                poison_round: 0,
                poison_demage: 0,
                weapon_name: '',
                weapon_rank: '',
                weapon_passive: '',
                weapon_passive_two: '',
                rank: '0_0',
            };

            let randomIndex = getAllUserIdsRank()[Math.floor(Math.random() * getAllUserIdsRank().length)];
            while (randomIndex == user.id) {
                randomIndex = getAllUserIdsRank()[Math.floor(Math.random() * getAllUserIdsRank().length)];
            }
            let ene_streak = 0;

            if (Sat.team.team_equipe1) {
                let P_id = getAnimalIdByName(Sat.team.team_equipe1);
                if (!Sat.team.team_equipe1) { P_id = '0_0'; }
                const xp = parseInt(Sat[`sat_${P_id}_xp`]);
                let lvl = xpToLevel(xp);
                if (setLvl > 0) {
                    lvl = setLvl;
                }
                sat1.png = `${gif[`rank_${P_id}_png`]}`;
                if (!sat1.png) {
                    sat1.png = gif.empty_png;
                }
                sat1.rank = P_id;
                sat1.name = getAnimalNameByName(Sat.team.team_equipe1);
                sat1.lvl = `Lvl ${lvl}`;
                sat1.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                sat1.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                sat1.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                sat1.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                sat1.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                sat1.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                sat1.bool = true;

                let item = ' - no weapon';
                for (const allwp of userData.wp) {
                    const str = `${allwp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    let passive_two_gif = '';
                    if (passive_two) { passive_two_gif = getPassive(passive_two) }

                    if (boolStr.toLowerCase() == Sat.team.team_equipe1.toLowerCase()) {
                        item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(passive)}${passive_two_gif}`;
                        sat1 = activeWeapon(sat1, name, passive, percen, rank);
                        sat1.weapon = gif[`${name}_png`];
                        sat1.weapon_name = name;
                        sat1.weapon_rank = rank;
                        sat1.weapon_passive = passive;
                        sat1.weapon_passive_two = passive_two;
                        sat1.weapon_bool = true;
                    }
                }

                sat1.main_hp = sat1.hp;
                sat1.main_wp = sat1.wp;

                messageOurTeam += `L. ${lvl} ${gif[`rank_${P_id}`]}${item}\n`;
                sats += 1;
                satAlllvl += lvl;
            }

            if (Sat.team.team_equipe2) {
                let P_id = getAnimalIdByName(Sat.team.team_equipe2);
                if (!Sat.team.team_equipe2) { P_id = '0_0'; }
                const xp = parseInt(Sat[`sat_${P_id}_xp`]);
                let lvl = xpToLevel(xp);
                if (setLvl > 0) {
                    lvl = setLvl;
                }

                if (!sat1.bool) {
                    sat1.png = `${gif[`rank_${P_id}_png`]}`;
                    if (!sat1.png) {
                        sat1.png = gif.empty_png;
                    }
                    sat1.rank = P_id;
                    sat1.name = getAnimalNameByName(Sat.team.team_equipe2);
                    sat1.lvl = `Lvl ${lvl}`;
                    sat1.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                    sat1.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                    sat1.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                    sat1.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                    sat1.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                    sat1.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                    sat1.main_hp = sat1.hp;
                    sat1.main_wp = sat1.wp;
                    sat1.bool = true;

                } else {
                    sat2.png = `${gif[`rank_${P_id}_png`]}`;
                    if (!sat2.png) {
                        sat2.png = gif.empty_png;
                    }
                    sat2.rank = P_id;
                    sat2.name = getAnimalNameByName(Sat.team.team_equipe2);
                    sat2.lvl = `Lvl ${lvl}`;
                    sat2.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                    sat2.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                    sat2.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                    sat2.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                    sat2.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                    sat2.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                    sat2.bool = true;
                }

                let item = ' - no weapon';
                for (const allwp of userData.wp) {
                    const str = `${allwp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    let passive_two_gif = '';
                    if (passive_two) { passive_two_gif = getPassive(passive_two) }

                    if (boolStr.toLowerCase() == Sat.team.team_equipe2.toLowerCase()) {
                        item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(passive)}${passive_two_gif}`;
                        sat2 = activeWeapon(sat2, name, passive, percen, rank);
                        sat2.weapon = gif[`${name}_png`];
                        sat2.weapon_name = name;
                        sat2.weapon_rank = rank;
                        sat2.weapon_passive = passive;
                        sat2.weapon_passive_two = passive_two;
                        sat2.weapon_bool = true;
                    }
                }

                sat2.main_hp = sat2.hp;
                sat2.main_wp = sat2.wp;

                messageOurTeam += `L. ${lvl} ${gif[`rank_${P_id}`]}${item}\n`;
                sats += 1;
                satAlllvl += lvl;
            }

            if (Sat.team.team_equipe3) {
                let P_id = getAnimalIdByName(Sat.team.team_equipe3);
                if (!Sat.team.team_equipe3) { P_id = '0_0'; }
                const xp = parseInt(Sat[`sat_${P_id}_xp`]);
                let lvl = xpToLevel(xp);
                if (setLvl > 0) {
                    lvl = setLvl;
                }

                if (!sat1.bool) {
                    sat1.png = `${gif[`rank_${P_id}_png`]}`;
                    if (!sat1.png) {
                        sat1.png = gif.empty_png;
                    }
                    sat1.rank = P_id;
                    sat1.name = getAnimalNameByName(Sat.team.team_equipe2);
                    sat1.lvl = `Lvl ${lvl}`;
                    sat1.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                    sat1.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                    sat1.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                    sat1.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                    sat1.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                    sat1.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                    sat1.main_hp = sat1.hp;
                    sat1.main_wp = sat1.wp;
                    sat1.bool = true;
                } else if (!sat2.bool) {
                    sat2.png = `${gif[`rank_${P_id}_png`]}`;
                    if (!sat2.png) {
                        sat2.png = gif.empty_png;
                    }
                    sat2.rank = P_id;
                    sat2.name = getAnimalNameByName(Sat.team.team_equipe2);
                    sat2.lvl = `Lvl ${lvl}`;
                    sat2.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                    sat2.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                    sat2.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                    sat2.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                    sat2.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                    sat2.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                    sat2.main_hp = sat2.hp;
                    sat2.main_wp = sat2.wp;
                    sat2.bool = true;
                } else {
                    sat3.png = `${gif[`rank_${P_id}_png`]}`;
                    if (!sat3.png) {
                        sat3.png = gif.empty_png;
                    }
                    sat3.rank = P_id;
                    sat3.name = getAnimalNameByName(Sat.team.team_equipe3);
                    sat3.lvl = `Lvl ${lvl}`;
                    sat3.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                    sat3.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                    sat3.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                    sat3.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                    sat3.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                    sat3.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                    sat3.bool = true;
                }

                let item = ' - no weapon';
                for (const allwp of userData.wp) {
                    const str = `${allwp}`;
                    const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                    let passive_two_gif = '';
                    if (passive_two) { passive_two_gif = getPassive(passive_two) }

                    if (boolStr.toLowerCase() == Sat.team.team_equipe3.toLowerCase()) {
                        item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(passive)}${passive_two_gif}`;
                        sat3 = activeWeapon(sat3, name, passive, percen, rank);
                        sat3.weapon = gif[`${name}_png`];
                        sat3.weapon_name = name;
                        sat3.weapon_rank = rank;
                        sat3.weapon_passive = passive;
                        sat3.weapon_passive_two = passive_two;
                        sat3.weapon_bool = true;
                    }
                }

                sat3.main_hp = sat3.hp;
                sat3.main_wp = sat3.wp;

                messageOurTeam += `L. ${lvl} ${gif[`rank_${P_id}`]}${item}\n`;
                sats += 1;
                satAlllvl += lvl;
            }

            const oppoData = await getUser(randomIndex);//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (!oppoData) { return message.reply('Try again!'); }

            if (!getAnimalNameByName(oppoData.sat.team.team_equipe1)) { oppoData.sat.team.team_equipe1 = ''; }
            if (!getAnimalNameByName(oppoData.sat.team.team_equipe2)) { oppoData.sat.team.team_equipe2 = ''; }
            if (!getAnimalNameByName(oppoData.sat.team.team_equipe3)) { oppoData.sat.team.team_equipe3 = ''; }

            try { await oppoData.save(); } catch (error) { }

            if (!oppoData.sat.team.team_equipe1 && !oppoData.sat.team.team_equipe2 && !oppoData.sat.team.team_equipe3) {
                return message.reply('Try again');
            }

            if (oppoData && oppoData.sat.team.team_equipe1 || oppoData.sat.team.team_equipe2 || oppoData.sat.team.team_equipe3) {
                oppoid = oppoData.userId;
                ene_streak = oppoData.sat.team.streak;
                if (oppoData.sat.team.team_name) { enemyTeamName = `${oppoData.sat.team.team_name}`; }
                if (oppoData.sat.team.team_equipe1 != '') {
                    let P_id = getAnimalIdByName(oppoData.sat.team.team_equipe1);
                    if (!oppoData.sat.team.team_equipe1) { P_id = '0_0'; }
                    const xp = parseInt(oppoData.sat[`sat_${P_id}_xp`]);
                    let lvl = xpToLevel(xp);
                    if (setLvl > 0) {
                        lvl = setLvl;
                    }

                    ene1.png = `${gif[`rank_${P_id}_png`]}`;
                    if (!ene1.png) {
                        ene1.png = gif.empty_png;
                    }
                    ene1.rank = P_id;
                    ene1.name = getAnimalNameByName(oppoData.sat.team.team_equipe1);
                    ene1.lvl = `Lvl ${lvl}`;
                    ene1.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                    ene1.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                    ene1.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                    ene1.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                    ene1.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                    ene1.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                    ene1.bool = true;

                    let item = ' - no weapon';
                    for (const allwp of oppoData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                        let passive_two_gif = '';
                        if (passive_two) { passive_two_gif = getPassive(passive_two) }

                        if (boolStr.toLowerCase() == oppoData.sat.team.team_equipe1.toLowerCase()) {
                            item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(passive)}${passive_two_gif}`;
                            ene1 = activeWeapon(ene1, name, passive, percen, rank);
                            ene1.weapon = gif[`${name}_png`];
                            ene1.weapon_name = name;
                            ene1.weapon_rank = rank;
                            ene1.weapon_passive = passive;
                            ene1.weapon_passive_two = passive_two;
                            ene1.weapon_bool = true;
                        }
                    }

                    ene1.main_hp = ene1.hp;
                    ene1.main_wp = ene1.wp;

                    messageEnemyTeam += `L. ${lvl} ${gif[`rank_${P_id}`]}${item}\n`;
                    enes += 1;
                    eneAlllvl += lvl;
                }
                if (oppoData.sat.team.team_equipe2 != '') {
                    let P_id = getAnimalIdByName(oppoData.sat.team.team_equipe2);
                    if (!oppoData.sat.team.team_equipe2) { P_id = '0_0'; }
                    const xp = parseInt(oppoData.sat[`sat_${P_id}_xp`]);
                    let lvl = xpToLevel(xp);
                    if (setLvl > 0) {
                        lvl = setLvl;
                    }

                    if (!ene1.bool) {
                        ene1.png = `${gif[`rank_${P_id}_png`]}`;
                        if (!ene1.png) {
                            ene1.png = gif.empty_png;
                        }
                        ene1.rank = P_id;
                        ene1.name = getAnimalNameByName(oppoData.sat.team.team_equipe2);
                        ene1.lvl = `Lvl ${lvl}`;
                        ene1.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        ene1.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        ene1.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                        ene1.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        ene1.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        ene1.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                        ene1.main_hp = ene1.hp;
                        ene1.main_wp = ene1.wp;
                        ene1.bool = true;
                    } else {
                        ene2.png = `${gif[`rank_${P_id}_png`]}`;
                        if (!ene2.png) {
                            ene2.png = gif.empty_png;
                        }
                        ene2.rank = P_id;
                        ene2.name = getAnimalNameByName(oppoData.sat.team.team_equipe2);
                        ene2.lvl = `Lvl ${lvl}`;
                        ene2.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        ene2.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        ene2.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                        ene2.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        ene2.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        ene2.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                        ene2.bool = true;
                    }
                    let item = ' - no weapon';
                    for (const allwp of oppoData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                        let passive_two_gif = '';
                        if (passive_two) { passive_two_gif = getPassive(passive_two) }

                        if (boolStr.toLowerCase() == oppoData.sat.team.team_equipe2.toLowerCase()) {
                            item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(passive)}${passive_two_gif}`;
                            ene2 = activeWeapon(ene2, name, passive, percen, rank);
                            ene2.weapon = gif[`${name}_png`];
                            ene2.weapon_name = name;
                            ene2.weapon_rank = rank;
                            ene2.weapon_passive = passive;
                            ene2.weapon_passive_two = passive_two;
                            ene2.weapon_bool = true;
                        }
                    }

                    ene2.main_hp = ene2.hp;
                    ene2.main_wp = ene2.wp;

                    messageEnemyTeam += `L. ${lvl} ${gif[`rank_${P_id}`]}${item}\n`;
                    enes += 1;
                    eneAlllvl += lvl;
                }
                if (oppoData.sat.team.team_equipe3 != '') {
                    let P_id = getAnimalIdByName(oppoData.sat.team.team_equipe3);
                    if (!oppoData.sat.team.team_equipe3) { P_id = '0_0'; }
                    const xp = parseInt(oppoData.sat[`sat_${P_id}_xp`]);
                    let lvl = xpToLevel(xp);
                    if (setLvl > 0) {
                        lvl = setLvl;
                    }

                    if (!ene1.bool) {
                        ene1.png = `${gif[`rank_${P_id}_png`]}`;
                        if (!ene1.png) {
                            ene1.png = gif.empty_png;
                        }
                        ene1.rank = P_id;
                        ene1.name = getAnimalNameByName(oppoData.sat.team.team_equipe3);
                        ene1.lvl = `Lvl ${lvl}`;
                        ene1.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        ene1.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        ene1.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                        ene1.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        ene1.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        ene1.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                        ene1.main_hp = ene1.hp;
                        ene1.main_wp = ene1.wp;
                        ene1.bool = true;
                    } else if (!ene2.bool) {
                        ene2.png = `${gif[`rank_${P_id}_png`]}`;
                        if (!ene2.png) {
                            ene2.png = gif.empty_png;
                        }
                        ene2.rank = P_id;
                        ene2.name = getAnimalNameByName(oppoData.sat.team.team_equipe3);
                        ene2.lvl = `Lvl ${lvl}`;
                        ene2.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        ene2.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        ene2.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                        ene2.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        ene2.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        ene2.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                        ene2.main_hp = ene2.hp;
                        ene2.main_wp = ene2.wp;
                        ene2.bool = true;
                    } else {
                        ene3.png = `${gif[`rank_${P_id}_png`]}`;
                        if (!ene3.png) {
                            ene3.png = gif.empty_png;
                        }
                        ene3.rank = P_id;
                        ene3.name = getAnimalNameByName(oppoData.sat.team.team_equipe3);
                        ene3.lvl = `Lvl ${lvl}`;
                        ene3.hp = stateHP(parseInt(`${gif[`rank_${P_id}_hp`]}`), lvl);
                        ene3.str = stateSTR(parseInt(`${gif[`rank_${P_id}_str`]}`), lvl);
                        ene3.pr = statePR(parseInt(`${gif[`rank_${P_id}_pr`]}`), lvl);
                        ene3.wp = stateWP(parseInt(`${gif[`rank_${P_id}_wp`]}`), lvl);
                        ene3.mag = stateMAG(parseInt(`${gif[`rank_${P_id}_mag`]}`), lvl);
                        ene3.mr = stateMR(parseInt(`${gif[`rank_${P_id}_mr`]}`), lvl);
                        ene3.bool = true;
                    }
                    let item = ' - no weapon';
                    for (const allwp of oppoData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');

                        let passive_two_gif = '';
                        if (passive_two) { passive_two_gif = getPassive(passive_two) }

                        if (boolStr.toLowerCase() == oppoData.sat.team.team_equipe3.toLowerCase()) {
                            item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(passive)}${passive_two_gif}`;
                            ene3 = activeWeapon(ene3, name, passive, percen, rank);
                            ene3.weapon = gif[`${name}_png`];
                            ene3.weapon_name = name;
                            ene3.weapon_rank = rank;
                            ene3.weapon_passive = passive;
                            ene3.weapon_passive_two = passive_two;
                            ene3.weapon_bool = true;
                        }
                    }

                    ene3.main_hp = ene3.hp;
                    ene3.main_wp = ene3.wp;

                    messageEnemyTeam += `L. ${lvl} ${gif[`rank_${P_id}`]}${item}\n`;
                    enes += 1;
                    eneAlllvl += lvl;
                }
            }

            let rankName = 'Mental';
            let color = '#9e9e9e';

            if (userData.elo >= 500000) {
                rankName = 'Vainglorious';
                color = '#00dbf9';
            } else if (userData.elo >= 100000) {
                rankName = 'Ace';
                color = '#fd00e9';
            } else if (userData.elo >= 50000) {
                rankName = 'Gem';
                color = '#00fc68';
            } else if (userData.elo >= 10000) {
                rankName = 'Penta';
                color = '#0089f8';
            } else if (userData.elo >= 5000) {
                rankName = 'Either';
                color = '#f2d000';
            }

            // Get clan tags for both players
            const userClanTag = await getUserClanTag(user.id);
            const oppoClanTag = await getUserClanTag(oppoid);

            // Build display names with clan tags
            const userDisplayName = userClanTag ? `${user.displayName}` : user.displayName;

            // Build team names with clan info (team name first, then clan below)
            const userTeamDisplay = userClanTag ? `${ourTeamName}\n${userClanTag}` : ourTeamName;
            const enemyTeamDisplay = oppoClanTag ? `${enemyTeamName}\n${oppoClanTag}` : enemyTeamName;

            const end_round = getRandomInt(5, 51);
            if (userData.sat.team.setting_battle == 'normal') {
                const attachment = new AttachmentBuilder(await getSatImage(sat1, sat2, sat3, ene1, ene2, ene3, streak, ene_streak, user.id, oppoid), { name: 'sat1.png' });
                const embed = customEmbed()
                    .setAuthor({ name: `${user.displayName} goes into Rank with ${rankName}!`, iconURL: user.displayAvatarURL() })
                    .setColor(color)
                    .setImage(`attachment://sat1.png`)
                    .addFields(
                        { name: `${userTeamDisplay}`, value: `${messageOurTeam}`, inline: true },
                        { name: `${enemyTeamDisplay}`, value: `${messageEnemyTeam}`, inline: true },
                    )
                    .setFooter({ text: `Turn 1/${end_round}` })
                mgs.edit({ embeds: [embed], files: [attachment] });
                await sleep(2000);
            }

            let round = 1;
            let end = 1;

            while (true) {

                if (sat1.bool) {
                    sat1.left_hp = sat1.hp;
                    sat1.left_wp = sat1.wp;
                }
                if (sat2.bool) {
                    sat2.left_hp = sat2.hp;
                    sat2.left_wp = sat2.wp;
                }
                if (sat3.bool) {
                    sat3.left_hp = sat3.hp;
                    sat3.left_wp = sat3.wp;
                }

                if (ene1.bool) {
                    ene1.left_hp = ene1.hp;
                    ene1.left_wp = ene1.wp;
                }
                if (ene2.bool) {
                    ene2.left_hp = ene2.hp;
                    ene2.left_wp = ene2.wp;
                }
                if (ene3.bool) {
                    ene3.left_hp = ene3.hp;
                    ene3.left_wp = ene3.wp;
                }


                if (sat1.weapon_bool && sat1.hp > 0) {
                    for (const allwp of userData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
                        if (boolStr.toLowerCase() == Sat.team.postion1.toLowerCase()) {
                            sat1 = battleWithWeapon(sat1, name, passive, passive_two, rank);
                        }
                    }
                }
                if (sat2.weapon_bool && sat2.hp > 0) {
                    for (const allwp of userData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
                        if (boolStr.toLowerCase() == Sat.team.postion2.toLowerCase()) {
                            sat2 = battleWithWeapon(sat2, name, passive, passive_two, rank);
                        }
                    }
                }
                if (sat3.weapon_bool && sat3.hp > 0) {
                    for (const allwp of userData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
                        if (boolStr.toLowerCase() == Sat.team.postion3.toLowerCase()) {
                            sat3 = battleWithWeapon(sat3, name, passive, passive_two, rank);
                        }
                    }
                }

                if (ene1.weapon_bool && ene1.hp > 0) {
                    for (const allwp of oppoData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
                        if (boolStr.toLowerCase() == oppoData.sat.team.postion1.toLowerCase()) {
                            ene1 = battleWithWeapon(ene1, name, passive, passive_two, rank);
                        }
                    }
                }
                if (ene2.weapon_bool && ene2.hp > 0) {
                    for (const allwp of oppoData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
                        if (boolStr.toLowerCase() == oppoData.sat.team.postion2.toLowerCase()) {
                            ene2 = battleWithWeapon(ene2, name, passive, passive_two, rank);
                        }
                    }
                }
                if (ene3.weapon_bool && ene3.hp > 0) {
                    for (const allwp of oppoData.wp) {
                        const str = `${allwp}`;
                        const [id, name, rank, passive, percen, boolStr, passive_two] = str.split(' ');
                        if (boolStr.toLowerCase() == oppoData.sat.team.postion3.toLowerCase()) {
                            ene3 = battleWithWeapon(ene3, name, passive, passive_two, rank);
                        }
                    }
                }

                // ==================== OWO-STYLE COMBAT ====================
                // Each animal has TWO options:
                // 1. Physical Attack (STR → reduced by PR, no WP cost)
                // 2. Use Weapon (costs WP, weapon damage → reduced by MR)

                const WEAPON_WP_COST = 50; // WP cost per weapon use

                // BATTLE DAMAGE MULTIPLIER - Makes battles last 10+ turns like OwO
                // 0.10 = 10% of calculated damage (ensures longer battles)
                const BATTLE_DAMAGE_MULTIPLIER = 0.10;

                // Maximum damage per hit (prevents one-shot kills)
                // Cap at 15% of target's max HP per attack
                const MAX_DAMAGE_PERCENT = 0.15;

                // Helper: Choose action and attack
                function owoAttack(attacker, defenders) {
                    if (!attacker.bool || attacker.hp <= 0) return;

                    // Get alive defenders
                    const aliveDefenders = defenders.filter(d => d.bool && d.hp > 0);
                    if (aliveDefenders.length === 0) return;

                    // Pick random target
                    const target = aliveDefenders[getRandomInt(0, aliveDefenders.length - 1)];

                    // Decide: Use weapon OR physical attack
                    const hasWeapon = attacker.weapon_bool === true;
                    const hasWP = attacker.wp >= WEAPON_WP_COST;
                    const hasWeaponDamage = (attacker.demage_point > 0) || (attacker.mag_point > 0);

                    let damage = 0;

                    if (hasWeapon && hasWP && hasWeaponDamage) {
                        // USE WEAPON - costs WP, uses weapon damage, reduced by MR
                        attacker.wp -= WEAPON_WP_COST;
                        const weaponDmg = attacker.demage_point > 0 ? attacker.demage_point : attacker.mag_point;
                        // Apply MR reduction (skip if true_damage)
                        if (attacker.true_damage) {
                            damage = weaponDmg; // True damage ignores resistance
                        } else {
                            damage = parseInt(weaponDmg * (1 - target.mr / 100));
                        }
                        damage = parseInt(damage * (0.9 + Math.random() * 0.2)); // ±10% variance
                    } else {
                        // PHYSICAL ATTACK - no WP cost, uses STR, reduced by PR
                        damage = resistance(attacker.str, target.pr, target.main_hp);
                    }

                    // Apply BATTLE_DAMAGE_MULTIPLIER to make battles last longer
                    damage = parseInt(damage * BATTLE_DAMAGE_MULTIPLIER);

                    // Cap damage at MAX_DAMAGE_PERCENT of target's max HP
                    const maxDamage = parseInt(target.main_hp * MAX_DAMAGE_PERCENT);
                    if (damage > maxDamage) {
                        damage = maxDamage;
                    }

                    // Apply damage (minimum 1)
                    damage = Math.max(1, damage);
                    target.hp -= damage;
                    if (target.hp < 0) target.hp = 0;
                }

                // Player team attacks enemy team
                const playerTeam = [sat1, sat2, sat3];
                const enemyTeam = [ene1, ene2, ene3];

                owoAttack(sat1, enemyTeam);
                owoAttack(sat2, enemyTeam);
                owoAttack(sat3, enemyTeam);

                // Enemy team attacks player team
                owoAttack(ene1, playerTeam);
                owoAttack(ene2, playerTeam);
                owoAttack(ene3, playerTeam);

                battleAllEntity([sat1, sat2, sat3, ene1, ene2, ene3], sat1, sat2, sat3, ene1, ene2, ene3);

                if (sat1.hp) {
                    if (sat1.hp <= 0) {
                        sat1.hp = 0;
                        sat1.bool = false;
                    }
                    if (sat1.wp <= 0) {
                        sat1.wp = 0;
                    }
                }
                if (sat2.hp) {
                    if (sat2.hp <= 0) {
                        sat2.hp = 0;
                        sat2.bool = false;
                    }
                    if (sat2.wp <= 0) {
                        sat2.wp = 0;
                    }
                }
                if (sat3.hp) {
                    if (sat3.hp <= 0) {
                        sat3.hp = 0;
                        sat3.bool = false;
                    }
                    if (sat3.wp <= 0) {
                        sat3.wp = 0;
                    }
                }

                if (ene1.hp) {
                    if (ene1.hp <= 0) {
                        ene1.hp = 0;
                        ene1.bool = false;
                    }
                    if (ene1.wp <= 0) {
                        ene1.wp = 0;
                    }
                }
                if (ene2.hp) {
                    if (ene2.hp <= 0) {
                        ene2.hp = 0;
                        ene2.bool = false;
                    }
                    if (ene2.wp <= 0) {
                        ene2.wp = 0;
                    }
                }
                if (ene3.hp) {
                    if (ene3.hp <= 0) {
                        ene3.hp = 0;
                        ene3.bool = false;
                    }
                    if (ene3.wp <= 0) {
                        ene3.wp = 0;
                    }
                }

                if (end <= 1 && userData.sat.team.setting_battle == 'normal') {
                    const attachment = new AttachmentBuilder(await getSatImage(sat1, sat2, sat3, ene1, ene2, ene3, streak, ene_streak, user.id, oppoid), { name: `sat${round}.png` });
                    const fighting = customEmbed()
                        .setAuthor({ name: `${user.displayName} goes into Rank with ${rankName}!`, iconURL: user.displayAvatarURL() })
                        .setColor(color)
                        .setImage(`attachment://sat${round}.png`)
                        .addFields(
                            { name: `${userTeamDisplay}`, value: `${messageOurTeam}`, inline: true },
                            { name: `${enemyTeamDisplay}`, value: `${messageEnemyTeam}`, inline: true },
                        )
                        .setFooter({ text: `Turn ${round + 1}/${end_round}` })
                    mgs.edit({ embeds: [fighting], files: [attachment] });
                    await sleep(2000);
                    end += 1;
                }
                if (ene1.hp == 0 && ene2.hp == 0 && ene3.hp == 0) { break; };
                if (sat1.hp == 0 && sat2.hp == 0 && sat3.hp == 0) { break; };
                round += 1;
                if (round >= end_round) {
                    break;
                }
            }
            // Calculate remaining HP for each team
            const playerTotalHP = (sat1.hp || 0) + (sat2.hp || 0) + (sat3.hp || 0);
            const enemyTotalHP = (ene1.hp || 0) + (ene2.hp || 0) + (ene3.hp || 0);

            // Determine outcome: TIE only if both teams dead OR equal HP at round limit
            const bothTeamsDead = playerTotalHP === 0 && enemyTotalHP === 0;
            const playerWins = enemyTotalHP === 0 && playerTotalHP > 0;
            const playerLoses = playerTotalHP === 0 && enemyTotalHP > 0;
            const timeoutTie = round >= end_round && playerTotalHP === enemyTotalHP;
            const timeoutPlayerWins = round >= end_round && playerTotalHP > enemyTotalHP;
            const timeoutPlayerLoses = round >= end_round && playerTotalHP < enemyTotalHP;

            if (bothTeamsDead || timeoutTie) {
                // TRUE TIE: Both teams dead OR equal HP at timeout
                const attachment = new AttachmentBuilder(await getSatImage(sat1, sat2, sat3, ene1, ene2, ene3, streak, ene_streak, user.id, oppoid), { name: 'sattie.png' });
                const result = customEmbed()
                    .setAuthor({ name: `${user.displayName} goes into Rank with ${rankName}!`, iconURL: user.displayAvatarURL() })
                    .setColor(color)
                    .setImage(`attachment://sattie.png`)
                    .addFields(
                        { name: `${userTeamDisplay}`, value: `${messageOurTeam}`, inline: true },
                        { name: `${enemyTeamDisplay}`, value: `${messageEnemyTeam}`, inline: true },
                    )
                    .setFooter({ text: `Both ties in ${round} turns! Your team gained 10 elo!` })
                mgs.edit({ embeds: [result], files: [attachment] });
                userData.elo += 10;

            } else if (playerLoses || timeoutPlayerLoses) {

                let lose_elo = 0;

                if (userData.elo > 0) {
                    if (userData.elo < oppoData.elo) {
                        lose_elo = 100;
                    } else {
                        lose_elo = 200;
                    }

                    if (userData.elo < 200 || userData.elo < 100) {
                        lose_elo = userData.elo;
                    }
                }

                const attachment = new AttachmentBuilder(await getSatImage(sat1, sat2, sat3, ene1, ene2, ene3, streak, ene_streak, user.id, oppoid), { name: 'satlose.png' });
                const result = customEmbed()
                    .setAuthor({ name: `${user.displayName} goes into Rank with ${rankName}!`, iconURL: user.displayAvatarURL() })
                    .setColor('Red')
                    .setImage(`attachment://satlose.png`)
                    .addFields(
                        { name: `${userTeamDisplay}`, value: `${messageOurTeam}`, inline: true },
                        { name: `${enemyTeamDisplay}`, value: `${messageEnemyTeam}`, inline: true },
                    )
                    .setFooter({ text: `You lost in ${round} turns! and lose ${lose_elo} elo` })
                mgs.edit({ embeds: [result], files: [attachment] });
                userData.elo -= lose_elo;

            } else {

                let win_elo = 0;

                if (userData.elo > oppoData.elo) {
                    win_elo = 50;
                } else {
                    win_elo = 100;
                }

                if (userData.sat.team.streak > userData.sat.team.higher_streak) { userData.sat.team.higher_streak = userData.sat.team.streak; }

                const attachment = new AttachmentBuilder(await getSatImage(sat1, sat2, sat3, ene1, ene2, ene3, streak, ene_streak, user.id, oppoid), { name: 'satwin.png' });
                const result = customEmbed()
                    .setAuthor({ name: `${user.displayName} goes into Rank with ${rankName}!`, iconURL: user.displayAvatarURL() })
                    .setColor('Green')
                    .setImage(`attachment://satwin.png`)
                    .addFields(
                        { name: `${userTeamDisplay}`, value: `${messageOurTeam}`, inline: true },
                        { name: `${enemyTeamDisplay}`, value: `${messageEnemyTeam}`, inline: true },
                    )
                    .setFooter({ text: `You won in ${round} turns! and you got ${win_elo} elo!` })
                mgs.edit({ embeds: [result], files: [attachment] });
                userData.elo += win_elo;
            }

            try { await userData.save(); } catch (error) { }

            return;
        } catch (error) {
            console.log(`Error battle like owo: ${error} line: ${error.stack}`);
        }
    },
};