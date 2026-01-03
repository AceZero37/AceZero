const {
  battleWithWeapon,
  labelButton,
  twoButton,
  ButtonStyle,
  getRandomInt,
  gif,
  cooldown,
  getUser,
  sym,
  SimpleEmbed,
  customEmbed,
  getAnimalIdByName,
  xpToLevel,
  sleep,
  getSatImage,
  AttachmentBuilder,
  getAnimalNameByName,
  checkOwnAnimal,
  stateHP,
  stateMAG,
  stateMR,
  statePR,
  stateSTR,
  stateWP,
  resistance,
  getRank,
  getWeaponRank,
  getPassive,
  activeWeapon,
  getCollectionButton,
  battleAllEntity,
  getAnimalType,
  getPetTypeCounterMultiplier,
  getWeaponCounterMultiplier,
  getEntityType,
} = require("../../functioon/function");
const moment = require("moment-timezone");

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

// Matchmaking queue - stores players waiting for matches
const matchmakingQueue = new Map(); // userId -> { userData, message, timestamp, teamLevel }

// Track users currently in battle
const usersInBattle = new Set(); // userId -> Set of user IDs currently battling

module.exports = {
  name: "bo",
  aliases: ["battleonline"],
  async execute(client, message, args) {
    try {
      const user = message.author;
      const userData = await getUser(user.id);

      if (!userData) {
        return message.reply("User data not found!");
      }

      if (userData.premium.premium_bool) {
        if (!prem.includes(user.id)) {
          prem.push(user.id);
        }
      }

      if (cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)) {
        return;
      }

      const choice = args[0];
      if (choice) {
        if (choice == "set") {
          const choice_two = args[1];
          if (choice_two == "normal") {
            userData.sat.team.setting_battle = "normal";
            message.channel.send({
              embeds: [
                SimpleEmbed(
                  `<@${user.id}> option battle has change to **NORMAL**`
                ),
              ],
            });
            try {
              await userData.save();
            } catch (error) { }
            return;
          } else if (choice_two == "fast") {
            userData.sat.team.setting_battle = "fast";
            message.channel.send({
              embeds: [
                SimpleEmbed(
                  `<@${user.id}> option battle has change to **FAST**`
                ),
              ],
            });
            try {
              await userData.save();
            } catch (error) { }
            return;
          }
        }
        if (choice == "cancel") {
          if (matchmakingQueue.has(user.id)) {
            const queueData = matchmakingQueue.get(user.id);
            if (queueData.timeoutId) {
              clearTimeout(queueData.timeoutId);
            }
            matchmakingQueue.delete(user.id);
            message.reply({
              embeds: [SimpleEmbed("❌ You have left the matchmaking queue.")],
            });
          } else {
            message.reply({
              embeds: [SimpleEmbed("❌ You are not in the matchmaking queue.")],
            });
          }
          return;
        }
      }

      // Check if user is already in a battle
      if (usersInBattle.has(user.id)) {
        return message.reply({
          embeds: [
            SimpleEmbed(
              "❌ You are already in a battle! Please wait for your current battle to finish."
            ).setColor("#FF0000"),
          ],
        });
      }

      // Check if user is already in queue
      if (matchmakingQueue.has(user.id)) {
        return message.reply({
          embeds: [
            SimpleEmbed(
              "❌ You are already searching for a match! Type `" +
              sym +
              "bo cancel` to cancel your search."
            ).setColor("#FF0000"),
          ],
        });
      }

      const Sat = userData.sat;

      // Validate team
      if (!getAnimalNameByName(userData.sat.team.team_equipe1)) {
        userData.sat.team.team_equipe1 = "";
      }
      if (!getAnimalNameByName(userData.sat.team.team_equipe2)) {
        userData.sat.team.team_equipe2 = "";
      }
      if (!getAnimalNameByName(userData.sat.team.team_equipe3)) {
        userData.sat.team.team_equipe3 = "";
      }

      if (
        !Sat.team.team_equipe1 &&
        !Sat.team.team_equipe2 &&
        !Sat.team.team_equipe3
      ) {
        message.reply({
          embeds: [
            SimpleEmbed(
              `**Now <@${user.id}>** Create a team with the command ${sym}team add {animal}${sym}`
            ),
          ],
        });
        return;
      }

      let a1 = "";
      if (userData.sat.team.team_equipe1) {
        a1 = `[1]${gif[`rank_${getAnimalIdByName(userData.sat.team.team_equipe1)}`]
          } `;
      }
      let a2 = "";
      if (userData.sat.team.team_equipe2) {
        a2 = `[2]${gif[`rank_${getAnimalIdByName(userData.sat.team.team_equipe2)}`]
          } `;
      }
      let a3 = "";
      if (userData.sat.team.team_equipe3) {
        a3 = `[3]${gif[`rank_${getAnimalIdByName(userData.sat.team.team_equipe3)}`]
          } `;
      }

      // Calculate team level for display purposes
      let teamLevel = 0;
      let teamCount = 0;
      if (Sat.team.team_equipe1) {
        const P_id = getAnimalIdByName(Sat.team.team_equipe1);
        const xp = parseInt(Sat[`sat_${P_id}_xp`]);
        teamLevel += xpToLevel(xp);
        teamCount++;
      }
      if (Sat.team.team_equipe2) {
        const P_id = getAnimalIdByName(Sat.team.team_equipe2);
        const xp = parseInt(Sat[`sat_${P_id}_xp`]);
        teamLevel += xpToLevel(xp);
        teamCount++;
      }
      if (Sat.team.team_equipe3) {
        const P_id = getAnimalIdByName(Sat.team.team_equipe3);
        const xp = parseInt(Sat[`sat_${P_id}_xp`]);
        teamLevel += xpToLevel(xp);
        teamCount++;
      }
      const avgTeamLevel = Math.floor(teamLevel / teamCount);

      console.log(
        `[MATCHMAKING] ${user.username} (${user.id}) is joining the queue...`
      );
      console.log(
        `[MATCHMAKING] Current queue size before join: ${matchmakingQueue.size}`
      );

      const mgs = await message.channel.send({
        embeds: [
          SimpleEmbed(
            `**${a1}${a2}${a3}Searching for opponent...**\n\n🔍 Team Level: ${avgTeamLevel}\n⏳ Players in queue: ${matchmakingQueue.size}\n\nType \`${sym}bo cancel\` to cancel search.`
          ).setColor("#FFA500"),
        ],
      });

      console.log(
        `[MATCHMAKING] Queue message sent successfully for ${user.username}`
      );

      // Check if there's already someone in queue to match with BEFORE adding self
      let opponent = null;
      let opponentUserId = null;

      for (const [queuedUserId, queuedData] of matchmakingQueue) {
        // Skip if the queued user is already in battle (shouldn't happen but safety check)
        if (usersInBattle.has(queuedUserId)) {
          continue;
        }

        // Match with the first available player (no level check)
        opponent = queuedData;
        opponentUserId = queuedUserId;
        console.log(
          `[MATCHMAKING] Found opponent: ${opponentUserId} for ${user.username}`
        );
        break;
      }

      if (!opponent) {
        // No match found, add to queue and wait
        matchmakingQueue.set(user.id, {
          userData: userData,
          message: mgs,
          timestamp: Date.now(),
          teamLevel: avgTeamLevel,
          channel: message.channel,
        });

        console.log(
          `[MATCHMAKING] ${user.username} added to queue. Current queue:`,
          Array.from(matchmakingQueue.keys())
        );

        // Update queue count for this player
        await mgs.edit({
          embeds: [
            SimpleEmbed(
              `**${a1}${a2}${a3}Searching for opponent...**\n\n🔍 Team Level: ${avgTeamLevel}\n⏳ Players in queue: ${matchmakingQueue.size}\n\nType \`${sym}bo cancel\` to cancel search.`
            ).setColor("#FFA500"),
          ],
        });
      }

      if (opponent) {
        // Match found! Remove opponent from queue (don't add self)
        matchmakingQueue.delete(opponentUserId);

        // Add both users to the "in battle" set
        usersInBattle.add(user.id);
        usersInBattle.add(opponentUserId);

        console.log(
          `[MATCHMAKING] Match confirmed! ${user.username} vs ${opponentUserId}`
        );
        console.log(
          `[MATCHMAKING] Queue after match:`,
          Array.from(matchmakingQueue.keys())
        );
        console.log(
          `[MATCHMAKING] Users now in battle:`,
          Array.from(usersInBattle)
        );

        // Clear timeout for opponent
        if (opponent.timeoutId) {
          clearTimeout(opponent.timeoutId);
          console.log(`[MATCHMAKING] Cleared timeout for ${opponentUserId}`);
        }

        // Notify both players
        await mgs.edit({
          embeds: [
            SimpleEmbed(
              `✅ **Match Found!**\n\nOpponent: <@${opponentUserId}>\nYour Team Level: ${avgTeamLevel}\nStarting battle...`
            ).setColor("#00FF00"),
          ],
        });
        try {
          await opponent.message.edit({
            embeds: [
              SimpleEmbed(
                `✅ **Match Found!**\n\nOpponent: <@${user.id}>\nYour Team Level: ${opponent.teamLevel}\nStarting battle...`
              ).setColor("#00FF00"),
            ],
          });
        } catch (err) {
          console.log(
            "[MATCHMAKING] Could not edit opponent message:",
            err.message
          );
        }

        console.log(
          `[MATCHMAKING] Starting battle between ${user.username} and ${opponentUserId}...`
        );
        await sleep(2000);

        // Start the battle using the normal battle logic
        // Pass BOTH messages so both users can see the battle
        try {
          await runBattle(
            client,
            message,
            user.id,
            userData,
            opponentUserId,
            opponent.userData,
            mgs,
            opponent.message
          );
        } catch (error) {
          console.error("[MATCHMAKING] Battle error:", error);
          await mgs.edit({
            embeds: [
              SimpleEmbed(`❌ Battle error: ${error.message}`).setColor(
                "#FF0000"
              ),
            ],
          });
          // Try to update opponent's message too
          try {
            await opponent.message.edit({
              embeds: [
                SimpleEmbed(`❌ Battle error: ${error.message}`).setColor(
                  "#FF0000"
                ),
              ],
            });
          } catch (err) { }
        } finally {
          // Always remove both users from battle set when done
          usersInBattle.delete(user.id);
          usersInBattle.delete(opponentUserId);
          console.log(
            `[MATCHMAKING] Battle finished. Removed users from battle set. Current battles:`,
            Array.from(usersInBattle)
          );
        }
      } else {
        // No immediate match found, wait in queue (already added above)
        console.log(
          `[MATCHMAKING] No opponent found. ${user.username} waiting in queue. Total players: ${matchmakingQueue.size}`
        );

        // Auto-remove from queue after 5 minutes
        const timeoutId = setTimeout(() => {
          if (matchmakingQueue.has(user.id)) {
            matchmakingQueue.delete(user.id);
            console.log(
              `[MATCHMAKING] Timeout: ${user.username} removed from queue`
            );
            mgs.edit({
              embeds: [
                SimpleEmbed(
                  "⏱️ **Search Timeout**\n\nNo opponent found within 5 minutes. Please try again."
                ).setColor("#808080"),
              ],
            });
          }
        }, 300000); // 5 minutes

        // Store timeout ID so we can cancel it if match is found
        matchmakingQueue.get(user.id).timeoutId = timeoutId;
        console.log(
          `[MATCHMAKING] Timeout set for ${user.username} (5 minutes)`
        );
      }

      try {
        await userData.save();
      } catch (error) { }

      return;
    } catch (error) {
      console.log(`Error battle online: ${error} line: ${error.stack}`);
    }
  },
};

async function runBattle(
  client,
  message,
  user1Id,
  userData1,
  user2Id,
  userData2,
  user1Message,
  user2Message
) {
  try {
    const user1 = await client.users.fetch(user1Id);
    const user2 = await client.users.fetch(user2Id);

    console.log(
      `[BATTLE] Starting battle with User1 message: ${!!user1Message}, User2 message: ${!!user2Message}`
    );

    let setLvl = 0;
    let satAlllvl = 0;
    let eneAlllvl = 0;
    let messageOurTeam = "";
    let messageEnemyTeam = "";
    let ourTeamName = "Player team";
    if (userData1.sat.team.team_name) {
      ourTeamName = `${userData1.sat.team.team_name}`;
    }
    let sats = 1;
    let enemyTeamName = "Enemy team";
    if (userData2.sat.team.team_name) {
      enemyTeamName = `${userData2.sat.team.team_name}`;
    }
    let enes = 1;

    let streak = 0;
    if (userData1.sat.team.team_set == 1) {
      streak = userData1.sat.team.streak;
    } else if (userData1.sat.team.team_set == 2) {
      streak = userData1.sat.team.streak_two;
    }

    let ene_streak = 0;
    if (userData2.sat.team.team_set == 1) {
      ene_streak = userData2.sat.team.streak;
    } else if (userData2.sat.team.team_set == 2) {
      ene_streak = userData2.sat.team.streak_two;
    }

    // Initialize entities (same as original battle.js)
    let sat1 = createEmptyEntity();
    let sat2 = createEmptyEntity();
    let sat3 = createEmptyEntity();
    let ene1 = createEmptyEntity();
    let ene2 = createEmptyEntity();
    let ene3 = createEmptyEntity();

    const Sat = userData1.sat;
    const oppoData = userData2;

    // Load Player 1 team (exact same logic as original)
    if (Sat.team.team_equipe1) {
      let P_id = getAnimalIdByName(Sat.team.team_equipe1);
      const xp = parseInt(Sat[`sat_${P_id}_xp`]);
      let lvl = xpToLevel(xp);

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

      let item = " - no weapon";
      for (const allwp of userData1.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr, passive_two] =
          str.split(" ");
        let passive_two_gif = "";
        if (passive_two) {
          passive_two_gif = getPassive(passive_two);
        }
        if (boolStr.toLowerCase() == Sat.team.team_equipe1.toLowerCase()) {
          item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(
            passive
          )}${passive_two_gif}`;
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
      const xp = parseInt(Sat[`sat_${P_id}_xp`]);
      let lvl = xpToLevel(xp);

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

      let item = " - no weapon";
      for (const allwp of userData1.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr, passive_two] =
          str.split(" ");
        let passive_two_gif = "";
        if (passive_two) {
          passive_two_gif = getPassive(passive_two);
        }
        if (boolStr.toLowerCase() == Sat.team.team_equipe2.toLowerCase()) {
          item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(
            passive
          )}${passive_two_gif}`;
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
      const xp = parseInt(Sat[`sat_${P_id}_xp`]);
      let lvl = xpToLevel(xp);

      if (!sat1.bool) {
        sat1.png = `${gif[`rank_${P_id}_png`]}`;
        if (!sat1.png) {
          sat1.png = gif.empty_png;
        }
        sat1.rank = P_id;
        sat1.name = getAnimalNameByName(Sat.team.team_equipe3);
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
        sat2.name = getAnimalNameByName(Sat.team.team_equipe3);
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

      let item = " - no weapon";
      for (const allwp of userData1.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr, passive_two] =
          str.split(" ");
        let passive_two_gif = "";
        if (passive_two) {
          passive_two_gif = getPassive(passive_two);
        }
        if (boolStr.toLowerCase() == Sat.team.team_equipe3.toLowerCase()) {
          item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(
            passive
          )}${passive_two_gif}`;
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

    // Load Player 2 team (exact same logic)
    if (oppoData.sat.team.team_equipe1 != "") {
      const P_id = getAnimalIdByName(oppoData.sat.team.team_equipe1);
      const xp = parseInt(oppoData.sat[`sat_${P_id}_xp`]);
      let lvl = xpToLevel(xp);

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

      let item = " - no weapon";
      for (const allwp of oppoData.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr, passive_two] =
          str.split(" ");
        let passive_two_gif = "";
        if (passive_two) {
          passive_two_gif = getPassive(passive_two);
        }
        if (
          boolStr.toLowerCase() == oppoData.sat.team.team_equipe1.toLowerCase()
        ) {
          item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(
            passive
          )}${passive_two_gif}`;
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

    if (oppoData.sat.team.team_equipe2 != "") {
      let P_id = getAnimalIdByName(oppoData.sat.team.team_equipe2);
      const xp = parseInt(oppoData.sat[`sat_${P_id}_xp`]);
      let lvl = xpToLevel(xp);

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
      let item = " - no weapon";
      for (const allwp of oppoData.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr, passive_two] =
          str.split(" ");
        let passive_two_gif = "";
        if (passive_two) {
          passive_two_gif = getPassive(passive_two);
        }
        if (
          boolStr.toLowerCase() == oppoData.sat.team.team_equipe2.toLowerCase()
        ) {
          item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(
            passive
          )}${passive_two_gif}`;
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

    if (oppoData.sat.team.team_equipe3 != "") {
      let P_id = getAnimalIdByName(oppoData.sat.team.team_equipe3);
      const xp = parseInt(oppoData.sat[`sat_${P_id}_xp`]);
      let lvl = xpToLevel(xp);

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
      let item = " - no weapon";
      for (const allwp of oppoData.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr, passive_two] =
          str.split(" ");
        let passive_two_gif = "";
        if (passive_two) {
          passive_two_gif = getPassive(passive_two);
        }
        if (
          boolStr.toLowerCase() == oppoData.sat.team.team_equipe3.toLowerCase()
        ) {
          item = ` - ${getRank(rank)}${getWeaponRank(name, rank)}${getPassive(
            passive
          )}${passive_two_gif}`;
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

    const end_round = getRandomInt(5, 51);

    // Display initial battle state for BOTH users
    if (userData1.sat.team.setting_battle == "normal") {
      const imageBuffer = await getSatImage(
        sat1,
        sat2,
        sat3,
        ene1,
        ene2,
        ene3,
        streak,
        ene_streak,
        user1Id,
        user2Id
      );
      const attachment = new AttachmentBuilder(imageBuffer, {
        name: "sat1.png",
      });
      const embed = customEmbed()
        .setAuthor({
          name: `${user1.username} VS ${user2.username}`,
          iconURL: user1.displayAvatarURL(),
        })
        .setColor("#8EC3FF")
        .setImage("attachment://sat1.png")
        .addFields(
          { name: `${ourTeamName}`, value: `${messageOurTeam}`, inline: true },
          {
            name: `${enemyTeamName}`,
            value: `${messageEnemyTeam}`,
            inline: true,
          }
        )
        .setFooter({ text: `Turn 1/${end_round}` });

      // Update User 1's message (User 2 who joined second)
      console.log("[BATTLE] Updating User 1 (second player) message...");
      await user1Message.edit({ embeds: [embed], files: [attachment] });

      // Update User 2's message (User 1 who was waiting)
      if (user2Message) {
        try {
          console.log("[BATTLE] Updating User 2 (first player) message...");
          const attachment2 = new AttachmentBuilder(imageBuffer, {
            name: "sat1.png",
          });
          await user2Message.edit({ embeds: [embed], files: [attachment2] });
        } catch (err) {
          console.log(
            "[BATTLE] Could not update User 2 initial message:",
            err.message
          );
        }
      }

      await sleep(2000);
    }

    // Battle loop (exact same as original)
    let round = 1;
    let end = 1;

    while (true) {
      // Save current HP/WP
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

      // Apply weapon effects for Player 1
      if (sat1.weapon_bool && sat1.hp > 0) {
        for (const allwp of userData1.wp) {
          const str = `${allwp}`;
          const [id, name, rank, passive, percen, boolStr, passive_two] =
            str.split(" ");
          if (boolStr.toLowerCase() == Sat.team.postion1.toLowerCase()) {
            sat1 = battleWithWeapon(sat1, name, passive, passive_two, rank);
          }
        }
      }
      if (sat2.weapon_bool && sat2.hp > 0) {
        for (const allwp of userData1.wp) {
          const str = `${allwp}`;
          const [id, name, rank, passive, percen, boolStr, passive_two] =
            str.split(" ");
          if (boolStr.toLowerCase() == Sat.team.postion2.toLowerCase()) {
            sat2 = battleWithWeapon(sat2, name, passive, passive_two, rank);
          }
        }
      }
      if (sat3.weapon_bool && sat3.hp > 0) {
        for (const allwp of userData1.wp) {
          const str = `${allwp}`;
          const [id, name, rank, passive, percen, boolStr, passive_two] =
            str.split(" ");
          if (boolStr.toLowerCase() == Sat.team.postion3.toLowerCase()) {
            sat3 = battleWithWeapon(sat3, name, passive, passive_two, rank);
          }
        }
      }

      // Apply weapon effects for Player 2
      if (ene1.weapon_bool && ene1.hp > 0) {
        for (const allwp of oppoData.wp) {
          const str = `${allwp}`;
          const [id, name, rank, passive, percen, boolStr, passive_two] =
            str.split(" ");
          if (
            boolStr.toLowerCase() == oppoData.sat.team.postion1.toLowerCase()
          ) {
            ene1 = battleWithWeapon(ene1, name, passive, passive_two, rank);
          }
        }
      }
      if (ene2.weapon_bool && ene2.hp > 0) {
        for (const allwp of oppoData.wp) {
          const str = `${allwp}`;
          const [id, name, rank, passive, percen, boolStr, passive_two] =
            str.split(" ");
          if (
            boolStr.toLowerCase() == oppoData.sat.team.postion2.toLowerCase()
          ) {
            ene2 = battleWithWeapon(ene2, name, passive, passive_two, rank);
          }
        }
      }
      if (ene3.weapon_bool && ene3.hp > 0) {
        for (const allwp of oppoData.wp) {
          const str = `${allwp}`;
          const [id, name, rank, passive, percen, boolStr, passive_two] =
            str.split(" ");
          if (
            boolStr.toLowerCase() == oppoData.sat.team.postion3.toLowerCase()
          ) {
            ene3 = battleWithWeapon(ene3, name, passive, passive_two, rank);
          }
        }
      }

      // Player 1 attacks - use the HIGHER of STR or MAG (not both)
      if (sat1.bool && sat1.hp > 0) {
        const target_ran = getRandomInt(1, enes);
        const useStr1 = sat1.str >= sat1.mag;
        if (target_ran == 1) {
          if (useStr1) {
            ene1.hp -= resistance(sat1.str, ene1.pr, ene1.main_hp);
          } else {
            ene1.hp -= resistance(sat1.mag, ene1.mr, ene1.main_hp);
          }
        } else if (target_ran == 2) {
          if (useStr1) {
            ene2.hp -= resistance(sat1.str, ene2.pr, ene2.main_hp);
          } else {
            ene2.hp -= resistance(sat1.mag, ene2.mr, ene2.main_hp);
          }
        } else if (target_ran == 3) {
          if (useStr1) {
            ene3.hp -= resistance(sat1.str, ene3.pr, ene3.main_hp);
          } else {
            ene3.hp -= resistance(sat1.mag, ene3.mr, ene3.main_hp);
          }
        }
      }
      if (sat2.bool && sat2.hp > 0) {
        const target_ran = getRandomInt(1, enes);
        const useStr2 = sat2.str >= sat2.mag;
        if (target_ran == 1) {
          if (useStr2) {
            ene1.hp -= resistance(sat2.str, ene1.pr, ene1.main_hp);
          } else {
            ene1.hp -= resistance(sat2.mag, ene1.mr, ene1.main_hp);
          }
        } else if (target_ran == 2) {
          if (useStr2) {
            ene2.hp -= resistance(sat2.str, ene2.pr, ene2.main_hp);
          } else {
            ene2.hp -= resistance(sat2.mag, ene2.mr, ene2.main_hp);
          }
        } else if (target_ran == 3) {
          if (useStr2) {
            ene3.hp -= resistance(sat2.str, ene3.pr, ene3.main_hp);
          } else {
            ene3.hp -= resistance(sat2.mag, ene3.mr, ene3.main_hp);
          }
        }
      }
      if (sat3.bool && sat3.hp > 0) {
        const target_ran = getRandomInt(1, enes);
        const useStr3 = sat3.str >= sat3.mag;
        if (target_ran == 1) {
          if (useStr3) {
            ene1.hp -= resistance(sat3.str, ene1.pr, ene1.main_hp);
          } else {
            ene1.hp -= resistance(sat3.mag, ene1.mr, ene1.main_hp);
          }
        } else if (target_ran == 2) {
          if (useStr3) {
            ene2.hp -= resistance(sat3.str, ene2.pr, ene2.main_hp);
          } else {
            ene2.hp -= resistance(sat3.mag, ene2.mr, ene2.main_hp);
          }
        } else if (target_ran == 3) {
          if (useStr3) {
            ene3.hp -= resistance(sat3.str, ene3.pr, ene3.main_hp);
          } else {
            ene3.hp -= resistance(sat3.mag, ene3.mr, ene3.main_hp);
          }
        }
      }

      // Player 2 attacks - use the HIGHER of STR or MAG (not both)
      if (ene1.bool && ene1.hp > 0) {
        const target_ran = getRandomInt(1, sats);
        const useStrE1 = ene1.str >= ene1.mag;
        if (target_ran == 1) {
          if (useStrE1) {
            sat1.hp -= resistance(ene1.str, sat1.pr, sat1.main_hp);
          } else {
            sat1.hp -= resistance(ene1.mag, sat1.mr, sat1.main_hp);
          }
        } else if (target_ran == 2) {
          if (useStrE1) {
            sat2.hp -= resistance(ene1.str, sat2.pr, sat2.main_hp);
          } else {
            sat2.hp -= resistance(ene1.mag, sat2.mr, sat2.main_hp);
          }
        } else if (target_ran == 3) {
          if (useStrE1) {
            sat3.hp -= resistance(ene1.str, sat3.pr, sat3.main_hp);
          } else {
            sat3.hp -= resistance(ene1.mag, sat3.mr, sat3.main_hp);
          }
        }
      }
      if (ene2.bool && ene2.hp > 0) {
        const target_ran = getRandomInt(1, sats);
        const useStrE2 = ene2.str >= ene2.mag;
        if (target_ran == 1) {
          if (useStrE2) {
            sat1.hp -= resistance(ene2.str, sat1.pr, sat1.main_hp);
          } else {
            sat1.hp -= resistance(ene2.mag, sat1.mr, sat1.main_hp);
          }
        } else if (target_ran == 2) {
          if (useStrE2) {
            sat2.hp -= resistance(ene2.str, sat2.pr, sat2.main_hp);
          } else {
            sat2.hp -= resistance(ene2.mag, sat2.mr, sat2.main_hp);
          }
        } else if (target_ran == 3) {
          if (useStrE2) {
            sat3.hp -= resistance(ene2.str, sat3.pr, sat3.main_hp);
          } else {
            sat3.hp -= resistance(ene2.mag, sat3.mr, sat3.main_hp);
          }
        }
      }
      if (ene3.bool && ene3.hp > 0) {
        const target_ran = getRandomInt(1, sats);
        const useStrE3 = ene3.str >= ene3.mag;
        if (target_ran == 1) {
          if (useStrE3) {
            sat1.hp -= resistance(ene3.str, sat1.pr, sat1.main_hp);
          } else {
            sat1.hp -= resistance(ene3.mag, sat1.mr, sat1.main_hp);
          }
        } else if (target_ran == 2) {
          if (useStrE3) {
            sat2.hp -= resistance(ene3.str, sat2.pr, sat2.main_hp);
          } else {
            sat2.hp -= resistance(ene3.mag, sat2.mr, sat2.main_hp);
          }
        } else if (target_ran == 3) {
          if (useStrE3) {
            sat3.hp -= resistance(ene3.str, sat3.pr, sat3.main_hp);
          } else {
            sat3.hp -= resistance(ene3.mag, sat3.mr, sat3.main_hp);
          }
        }
      }

      battleAllEntity(
        [sat1, sat2, sat3, ene1, ene2, ene3],
        sat1,
        sat2,
        sat3,
        ene1,
        ene2,
        ene3
      );

      // Update entity status
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

      // Display battle progress for BOTH users
      if (end <= 1 && userData1.sat.team.setting_battle == "normal") {
        const imageBuffer = await getSatImage(
          sat1,
          sat2,
          sat3,
          ene1,
          ene2,
          ene3,
          streak,
          ene_streak,
          user1Id,
          user2Id
        );
        const attachment = new AttachmentBuilder(imageBuffer, {
          name: `sat${round}.png`,
        });
        const fighting = customEmbed()
          .setAuthor({
            name: `${user1.username} VS ${user2.username}`,
            iconURL: user1.displayAvatarURL(),
          })
          .setColor("#8EC3FF")
          .setImage(`attachment://sat${round}.png`)
          .addFields(
            {
              name: `${ourTeamName}`,
              value: `${messageOurTeam}`,
              inline: true,
            },
            {
              name: `${enemyTeamName}`,
              value: `${messageEnemyTeam}`,
              inline: true,
            }
          )
          .setFooter({ text: `Turn ${round + 1}/${end_round}` });

        // Update User 1's message (second player)
        await user1Message.edit({ embeds: [fighting], files: [attachment] });

        // Update User 2's message (first player)
        if (user2Message) {
          try {
            const attachment2 = new AttachmentBuilder(imageBuffer, {
              name: `sat${round}.png`,
            });
            await user2Message.edit({
              embeds: [fighting],
              files: [attachment2],
            });
          } catch (err) {
            console.log(
              "[BATTLE] Could not update User 2 battle message:",
              err.message
            );
          }
        }

        await sleep(2000);
        end += 1;
      }

      // Check win conditions
      if (ene1.hp == 0 && ene2.hp == 0 && ene3.hp == 0) {
        break;
      }
      if (sat1.hp == 0 && sat2.hp == 0 && sat3.hp == 0) {
        break;
      }
      round += 1;
      if (round >= end_round) {
        break;
      }
    }

    // Determine results - compare remaining HP to decide winner
    let bonus = 0;
    if (streak >= 3000) {
      bonus += 33500;
    } else if (streak >= 2000) {
      bonus += 22500;
    } else if (streak >= 1000) {
      bonus += 12500;
    } else if (streak >= 500) {
      bonus += 5000;
    } else if (streak >= 100) {
      bonus += 2500;
    } else if (streak >= 50) {
      bonus += 1500;
    } else if (streak >= 10) {
      bonus += 500;
    }

    if (sats == 4 && enes == 4) {
      const allLevel = parseInt(eneAlllvl / 3 - satAlllvl / 3);
      if (allLevel > 0) {
        bonus += allLevel * 600 * round;
      }
    }

    // Calculate total remaining HP for both teams
    const sat_total_hp = (sat1.hp > 0 ? sat1.hp : 0) + (sat2.hp > 0 ? sat2.hp : 0) + (sat3.hp > 0 ? sat3.hp : 0);
    const ene_total_hp = (ene1.hp > 0 ? ene1.hp : 0) + (ene2.hp > 0 ? ene2.hp : 0) + (ene3.hp > 0 ? ene3.hp : 0);

    // Determine if this is a timeout situation (round limit reached)
    const isTimeout = round >= end_round;

    // Both teams completely dead = true tie
    const bothTeamsDead = (sat1.hp <= 0 && sat2.hp <= 0 && sat3.hp <= 0 && ene1.hp <= 0 && ene2.hp <= 0 && ene3.hp <= 0);

    // On timeout, compare HP to determine winner
    // True tie only if both teams dead OR equal HP on timeout
    if (bothTeamsDead || (isTimeout && sat_total_hp === ene_total_hp)) {
      // Tie
      bonus = 100;
      const imageBuffer = await getSatImage(
        sat1,
        sat2,
        sat3,
        ene1,
        ene2,
        ene3,
        streak,
        ene_streak,
        user1Id,
        user2Id
      );
      const attachment = new AttachmentBuilder(imageBuffer, {
        name: "sattie.png",
      });
      const result = customEmbed()
        .setAuthor({
          name: `${user1.username} VS ${user2.username}`,
          iconURL: user1.displayAvatarURL(),
        })
        .setColor("#8EC3FF")
        .setImage("attachment://sattie.png")
        .addFields(
          { name: `${ourTeamName}`, value: `${messageOurTeam}`, inline: true },
          {
            name: `${enemyTeamName}`,
            value: `${messageEnemyTeam}`,
            inline: true,
          }
        )
        .setFooter({
          text: bothTeamsDead
            ? `Both teams defeated in ${round} turns! Both teams gained 100 xp!`
            : `Time's up! Equal HP (${sat_total_hp.toLocaleString()} vs ${ene_total_hp.toLocaleString()})! Both teams gained 100 xp!`,
        });

      // Update User 1's message (second player)
      await user1Message.edit({ embeds: [result], files: [attachment] });

      // Update User 2's message (first player)
      if (user2Message) {
        try {
          const attachment2 = new AttachmentBuilder(imageBuffer, {
            name: "sattie.png",
          });
          await user2Message.edit({ embeds: [result], files: [attachment2] });
        } catch (err) {
          console.log(
            "[BATTLE] Could not update User 2 result message:",
            err.message
          );
        }
      }
    } else if ((sat1.hp <= 0 && sat2.hp <= 0 && sat3.hp <= 0) || (isTimeout && sat_total_hp < ene_total_hp)) {
      // Player 1 loses, Player 2 wins (either all dead OR timeout with less HP)
      bonus = 50;
      const imageBuffer = await getSatImage(
        sat1,
        sat2,
        sat3,
        ene1,
        ene2,
        ene3,
        streak,
        ene_streak,
        user1Id,
        user2Id
      );
      const attachment = new AttachmentBuilder(imageBuffer, {
        name: "satlose.png",
      });
      const result = customEmbed()
        .setAuthor({
          name: `${user1.username} VS ${user2.username}`,
          iconURL: user1.displayAvatarURL(),
        })
        .setColor("Red")
        .setImage("attachment://satlose.png")
        .addFields(
          { name: `${ourTeamName}`, value: `${messageOurTeam}`, inline: true },
          {
            name: `${enemyTeamName}`,
            value: `${messageEnemyTeam}`,
            inline: true,
          }
        )
        .setFooter({
          text: isTimeout
            ? `Time's up! <@${user2Id}> wins with ${ene_total_hp.toLocaleString()} HP remaining vs ${sat_total_hp.toLocaleString()} HP!`
            : `<@${user2Id}> wins in ${round} turns! <@${user1Id}> lost their streak of ${streak} wins...`,
        });

      // Update User 1's message (second player)
      await user1Message.edit({ embeds: [result], files: [attachment] });

      // Update User 2's message (first player)
      if (user2Message) {
        try {
          const attachment2 = new AttachmentBuilder(imageBuffer, {
            name: "satlose.png",
          });
          await user2Message.edit({ embeds: [result], files: [attachment2] });
        } catch (err) {
          console.log(
            "[BATTLE] Could not update User 2 result message:",
            err.message
          );
        }
      }

      // Reset Player 1 streak
      streak = 0;
      if (userData1.sat.team.team_set == 1) {
        userData1.sat.team.streak = 0;
      } else if (userData1.sat.team.team_set == 2) {
        userData1.sat.team.streak_two = 0;
      }

      // Increase Player 2 streak
      if (userData2.sat.team.team_set == 1) {
        userData2.sat.team.streak += 1;
        if (userData2.sat.team.streak > userData2.sat.team.higher_streak) {
          userData2.sat.team.higher_streak = userData2.sat.team.streak;
        }
      } else if (userData2.sat.team.team_set == 2) {
        userData2.sat.team.streak_two += 1;
        if (
          userData2.sat.team.streak_two > userData2.sat.team.higher_streak_two
        ) {
          userData2.sat.team.higher_streak_two = userData2.sat.team.streak_two;
        }
      }

      // Award XP to Player 2 (winner)
      await awardXP(userData2);
    } else {
      // Player 1 wins, Player 2 loses
      streak += 1;
      if (userData1.sat.team.team_set == 1) {
        userData1.sat.team.streak += 1;
        if (userData1.sat.team.streak > userData1.sat.team.higher_streak) {
          userData1.sat.team.higher_streak = userData1.sat.team.streak;
        }
      } else if (userData1.sat.team.team_set == 2) {
        userData1.sat.team.streak_two += 1;
        if (
          userData1.sat.team.streak_two > userData1.sat.team.higher_streak_two
        ) {
          userData1.sat.team.higher_streak_two = userData1.sat.team.streak_two;
        }
      }

      // Reset Player 2 streak
      if (userData2.sat.team.team_set == 1) {
        userData2.sat.team.streak = 0;
      } else if (userData2.sat.team.team_set == 2) {
        userData2.sat.team.streak_two = 0;
      }

      let show_result = "";
      if (isTimeout) {
        // Timeout win - show HP comparison
        show_result = `Time's up! <@${user1Id}> wins with ${sat_total_hp.toLocaleString()} HP vs ${ene_total_hp.toLocaleString()} HP! Streak: ${streak}`;
      } else if (bonus > 0) {
        show_result = `<@${user1Id}> wins in ${round} turns! Team gained 200 xp + ${bonus.toLocaleString()} bonus xp! Streak: ${streak}`;
      } else {
        bonus = 0;
        show_result = `<@${user1Id}> wins in ${round} turns! Team gained 200 xp! Streak: ${streak}`;
      }

      const imageBuffer = await getSatImage(
        sat1,
        sat2,
        sat3,
        ene1,
        ene2,
        ene3,
        streak,
        ene_streak,
        user1Id,
        user2Id
      );
      const attachment = new AttachmentBuilder(imageBuffer, {
        name: "satwin.png",
      });
      const result = customEmbed()
        .setAuthor({
          name: `${user1.username} VS ${user2.username}`,
          iconURL: user1.displayAvatarURL(),
        })
        .setColor("Green")
        .setImage("attachment://satwin.png")
        .addFields(
          { name: `${ourTeamName}`, value: `${messageOurTeam}`, inline: true },
          {
            name: `${enemyTeamName}`,
            value: `${messageEnemyTeam}`,
            inline: true,
          }
        )
        .setFooter({ text: `${show_result}` });

      // Update User 1's message (second player)
      await user1Message.edit({ embeds: [result], files: [attachment] });

      // Update User 2's message (first player)
      if (user2Message) {
        try {
          const attachment2 = new AttachmentBuilder(imageBuffer, {
            name: "satwin.png",
          });
          await user2Message.edit({ embeds: [result], files: [attachment2] });
        } catch (err) {
          console.log(
            "[BATTLE] Could not update User 2 result message:",
            err.message
          );
        }
      }

      // Award XP to Player 1 (winner)
      await awardXP(userData1, bonus);
    }

    // Save both players' data
    try {
      await userData1.save();
      await userData2.save();
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  } catch (error) {
    console.log(`Error in runBattle: ${error.stack}`);
    // Try to update both messages with error
    try {
      await user1Message.edit({
        embeds: [
          SimpleEmbed(`❌ Battle error: ${error.message}`).setColor("#FF0000"),
        ],
      });
    } catch (err) { }
    try {
      if (user2Message) {
        await user2Message.edit({
          embeds: [
            SimpleEmbed(`❌ Battle error: ${error.message}`).setColor(
              "#FF0000"
            ),
          ],
        });
      }
    } catch (err) { }
  }
}

function createEmptyEntity() {
  return {
    png: gif.empty_png,
    name: "",
    lvl: "",
    hp: "",
    left_hp: "",
    str: "",
    pr: "",
    wp: "",
    left_wp: "",
    mag: "",
    mr: "",
    main_hp: "",
    main_wp: "",
    bool: false,
    weapon: gif.weapon_empty,
    weapon_bool: false,
    increase_hp_point: "",
    increase_demage_point: "",
    resurrection_revive_heal: 0,
    culling_bool: false,
    culling_round: 0,
    culling_point: "",
    demage_point: "",
    mag_point: "",
    defend_up_bool: false,
    defend_up_round: 0,
    defend_up_defend_pr: 0,
    defend_up_defend_mr: 0,
    poison_bool: false,
    poison_round: 0,
    poison_demage: 0,
    weapon_name: "",
    weapon_rank: "",
    weapon_passive: "",
    weapon_passive_two: "",
    rank: "0_0",
  };
}

async function awardXP(userData, bonus = 0) {
  const Sat = userData.sat;

  let highLvl = 0;

  if (
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] >
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ] &&
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] >
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ]
  ) {
    const P_id = getAnimalIdByName(userData.sat.team.team_equipe1);
    const xp = parseInt(userData.sat[`sat_${P_id}_xp`]);
    highLvl = xpToLevel(xp);
  } else if (
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ] >
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] &&
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ] >
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ]
  ) {
    const P_id = getAnimalIdByName(userData.sat.team.team_equipe2);
    const xp = parseInt(userData.sat[`sat_${P_id}_xp`]);
    highLvl = xpToLevel(xp);
  } else if (
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ] >
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] &&
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ] >
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ]
  ) {
    const P_id = getAnimalIdByName(userData.sat.team.team_equipe3);
    const xp = parseInt(userData.sat[`sat_${P_id}_xp`]);
    highLvl = xpToLevel(xp);
  }

  // Give bonus XP to lowest level animal
  if (
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] <
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ] &&
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] <
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ]
  ) {
    userData.sat[
      `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] += parseInt(200 * highLvl);
  } else if (
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ] <
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] &&
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ] <
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ]
  ) {
    userData.sat[
      `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ] += parseInt(200 * highLvl);
  } else if (
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ] <
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe1)}_xp`
    ] &&
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ] <
    userData.sat[
    `sat_${getAnimalIdByName(userData.sat.team.team_equipe2)}_xp`
    ]
  ) {
    userData.sat[
      `sat_${getAnimalIdByName(userData.sat.team.team_equipe3)}_xp`
    ] += parseInt(200 * highLvl);
  }

  // Award XP to all team members
  if (userData.sat.team.team_equipe1) {
    const postion1_name = getAnimalNameByName(userData.sat.team.team_equipe1);
    userData.sat[`sat_${getAnimalIdByName(postion1_name)}_xp`] += bonus + 200;
  }
  if (userData.sat.team.team_equipe2) {
    const postion2_name = getAnimalNameByName(userData.sat.team.team_equipe2);
    userData.sat[`sat_${getAnimalIdByName(postion2_name)}_xp`] += bonus + 200;
  }
  if (userData.sat.team.team_equipe3) {
    const postion3_name = getAnimalNameByName(userData.sat.team.team_equipe3);
    userData.sat[`sat_${getAnimalIdByName(postion3_name)}_xp`] += bonus + 200;
  }
}
