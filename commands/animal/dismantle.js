const { getWeaponRankById, getWeaponNameById, gif, getUser, getRankGif, sym, cooldown, SimpleEmbed} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'dismantle',
    aliases: ['dmt'], // <-- All aliases here
    async execute(client, message, args) {
        try{
            const user = message.author;

            const userData = await getUser(user.id);

            // Check shard balance
            if(!args[0]){
                message.reply({ 
                    embeds: [SimpleEmbed(`**<@${user.id}>** has ${gif.shard_gif} **${userData.shard.toLocaleString()}** shards!`)] 
                });
                return;
            }

            if(userData.premium.premium_bool){
                if(!prem.includes(user.id)){
                    prem.push(user.id);
                }
            }

            if(cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };

            const weapon_sell = args[0];

            if(weapon_sell){
                let weapon_id = weapon_sell.toLowerCase();
                const rank_weapon = ['cw', 'uw', 'rw', 'ew', 'mw', 'lw', 'fw'];

                if(rank_weapon.includes(`${weapon_id}`)){
                    let messageSellWeapon = ``;
                    let show_rank = '';
                    let shard = 0;

                    if(weapon_id == 'cw'){
                        show_rank = `${gif.animal_rank_1} **Common**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'common'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                shard += 1;
                            }
                            index += 1;
                        }
                        if(shard == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'uw'){
                        show_rank = `${gif.animal_rank_2} **Uncommon**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'uncommon'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                shard += 3;
                            }
                            index += 1;
                        }
                        if(shard == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'rw'){
                        show_rank = `${gif.animal_rank_3} **Rare**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'rare'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                shard += 5;
                            }
                            index += 1;
                        }
                        if(shard == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'ew'){
                        show_rank = `${gif.animal_rank_4} **Epic**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'epic'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                shard += 25;
                            }
                            index += 1;
                        }
                        if(shard == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'mw'){
                        show_rank = `${gif.animal_rank_5} **Mythical**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(let wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'mythical'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                shard += 300;
                            }
                            index += 1;
                        }
                        if(shard == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'lw'){
                        show_rank = `${gif.animal_rank_6} **Legendary**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'legendary'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                shard += 1000;
                            }
                            index += 1;
                        }
                        if(shard == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'fw'){
                        show_rank = `${gif.animal_rank_8} **Febled**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'febled'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                shard += 5000;
                            }
                            index += 1;
                        }
                        if(shard == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }

                    message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You dismantle all your ${show_rank} weapons for ${gif.shard_gif} **${shard.toLocaleString()}**!\n\n**Dismantled:** ${messageSellWeapon}`)] });
                    userData.shard += shard;
                    await userData.save();
                    return;
                }else if(!rank_weapon.includes(`${weapon_id}`)){
                        weapon_id = args[0].toUpperCase();
                        let index = 0;
                        for(const wp of userData.wp){
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(weapon_id == id){
                                let shard = 0;
                                if(rank == 'common'){
                                    shard = 1; 
                                }else if(rank == 'uncommon'){
                                    shard = 3;
                                }else if(rank == 'rare'){
                                    shard = 5;
                                }else if(rank == 'epic'){
                                    shard = 25;
                                }else if(rank == 'mythical'){
                                    shard = 300;
                                }else if(rank == 'legendary'){
                                    shard = 1000;
                                }else if(rank == 'febled'){
                                    shard = 5000;
                                }
                                userData.wp.splice(index, 1);
                                userData.shard += shard;
                                message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You dismantle **${rank}** **${await getWeaponNameById(id, user.id)}** ${getRankGif(rank)} ${await getWeaponRankById(id, user.id)} for **${shard.toLocaleString()}** ${gif.shard_gif}!`)] });
                                await userData.save();
                                return;
                            }
                        index += 1;
                    }
                    if(index == userData.wp.length){
                        message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have a weapon with this id!`)] });
                        return;
                    }
                }
            }
        }catch(error){
            console.log(`dmt error ${error}`);
        }
    },
};