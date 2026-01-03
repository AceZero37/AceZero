const { getWeaponRankById, getWeaponNameById, gif, getUser, getRankGif, sym, cooldown, SimpleEmbed} = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 15_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'sell',
    async execute(client, message, args) {
        try{
            const user = message.author;

            const userData = await getUser(user.id);

            if(userData.premium.premium_bool){
                if(!prem.includes(user.id)){
                    prem.push(user.id);
                }
            }

            if(cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };

            const weapon_sell = args[0];
            const rank_includes = ['all', 'c', 'u', 'r', 'e', 'm', 'l', 'g', 'f', 's', 'cp', 'p', 'b', 'd', 'h', 'jjk', 'op', 'opm', 'ds', 'cg', 'nt', 'ms', 'cm', 'nm', 'kof', 'kn8'];

            if(!rank_includes.includes(`${weapon_sell}`) && weapon_sell){
                let weapon_id = weapon_sell.toLowerCase();
                const rank_weapon = ['cw', 'uw', 'rw', 'ew', 'mw', 'lw', 'fw'];

                if(rank_weapon.includes(`${weapon_id}`)){
                    let messageSellWeapon = ``;
                    let show_rank = '';
                    let cash = 0;

                    if(weapon_id == 'cw'){
                        show_rank = `${gif.animal_rank_1} **Common**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'common' && boolStr == 'false'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                cash += 100;
                            }
                            index += 1;
                        }
                        if(cash == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'uw'){
                        show_rank = `${gif.animal_rank_2} **Uncommon**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'uncommon' && boolStr == 'false'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                cash += 250;
                            }
                            index += 1;
                        }
                        if(cash == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'rw'){
                        show_rank = `${gif.animal_rank_3} **Rare**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'rare' && boolStr == 'false'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                cash += 400;
                            }
                            index += 1;
                        }
                        if(cash == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'ew'){
                        show_rank = `${gif.animal_rank_4} **Epic**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'epic' && boolStr == 'false'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                cash += 600;
                            }
                            index += 1;
                        }
                        if(cash == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'mw'){
                        show_rank = `${gif.animal_rank_5} **Mythical**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(let wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'mythical' && boolStr == 'false'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                cash += 5000;
                            }
                            index += 1;
                        }
                        if(cash == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'lw'){
                        show_rank = `${gif.animal_rank_6} **Legendary**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'legendary' && boolStr == 'false'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                cash += 15000;
                            }
                            index += 1;
                        }
                        if(cash == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }else if(weapon_id == 'fw'){
                        show_rank = `${gif.animal_rank_8} **Febled**`;
                        let index = 0;
                        let weapon_amount = 0;
                        for(const wp of userData.wp){
                            if(weapon_amount == 15){ break; }
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(rank.toLowerCase() == 'febled' && boolStr == 'false'){
                                messageSellWeapon += `${await getWeaponRankById(id, user.id)} `;
                                userData.wp.splice(index, 1);
                                weapon_amount += 1;
                                cash += 50000;
                            }
                            index += 1;
                        }
                        if(cash == 0){ message.reply({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, you do not have any weapons with this rank!`)] }); return; }
                    }

                    message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You sold all your ${show_rank} weapons for ${gif.cash} **${cash.toLocaleString()}**!\n\n**Sold:** ${messageSellWeapon}`)] });
                    userData.balance += cash;
                    await userData.save();
                    return;
                }else if(!rank_weapon.includes(`${weapon_id}`)){
                        weapon_id = args[0].toUpperCase();
                        let index = 0;
                        for(const wp of userData.wp){
                            const str = `${wp}`;
                            const [id, name, rank, passive, percen, boolStr] = str.split(' ');
                            if(weapon_id == id){
                
                                if(boolStr != 'false'){
                                    return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> Unequip weapon from animal before sell!`)] });
                                }

                                let cash = 0;
                                if(rank == 'common'){
                                    cash = 100; 
                                }else if(rank == 'uncommon'){
                                    cash = 250;
                                }else if(rank == 'rare'){
                                    cash = 400;
                                }else if(rank == 'epic'){
                                    cash = 600;
                                }else if(rank == 'mythical'){
                                    cash = 5000;
                                }else if(rank == 'legendary'){
                                    cash = 15000;
                                }else if(rank == 'febled'){
                                    cash = 50000;
                                }
                                userData.wp.splice(index, 1);
                                userData.balance += cash;
                                message.channel.send({ embeds: [SimpleEmbed(`**Now <@${user.id}>**, You sold **${rank}** **${await getWeaponNameById(id, user.id)}** ${getRankGif(rank)} ${await getWeaponRankById(id, user.id)} for **${cash.toLocaleString()}** ${gif.cash}!`)] });
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
            }else if(rank_includes.includes(`${args[0]}`)){
                    let total_cash = 0;
                    let messageSell = `**Now <@${user.id}>** sold `;
                    let choice_rank = args[0].toLowerCase();

                    if(choice_rank == 'jjk'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${15}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${15}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${15}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${15}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'kn8'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${25}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${25}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${25}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${25}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'kof'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${24}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${24}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${24}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${24}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'nm'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${22}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${22}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${22}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${22}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'cm'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${23}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${23}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${23}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${23}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'ms'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${18}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${18}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${18}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${18}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'nt'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${21}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${21}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${21}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${21}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'cg'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${20}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${20}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${20}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${20}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'ds'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${19}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${19}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${19}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${19}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'op'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${16}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${16}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${16}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${16}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'opm'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${17}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${17}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${17}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*500000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${17}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'c'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${1}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${1}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${1}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*1);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${1}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'u'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${2}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${2}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${2}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*3);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${2}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'r'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${3}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${3}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${3}_${y}`] -= 1;
                                    sat += 1;
                                    total_cash += (1*10);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${3}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'e'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${4}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${4}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${4}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*250);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${4}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'm'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            while(userData.sat[`sat_${5}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${5}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${5}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*5000);
                                }   
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${5}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'l'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${6}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${6}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${6}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*15000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${6}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'g'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${7}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${7}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${7}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*30000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${7}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'f'){
                        let sat = 0;
                        for(let y = 1; y <= 5; y++){
                            if(userData.sat[`sat_${8}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${8}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${8}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*250000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${8}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 's'){
                        let sat = 0;
                        for(let y = 1; y <= 11; y++){
                            if(userData.sat[`sat_${9}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${9}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${9}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*6000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${9}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'cp'){
                        let sat = 0;
                        for(let y = 1; y <= 11; y++){
                            if(userData.sat[`sat_${10}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${10}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${10}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*50000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${10}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'p'){
                        let sat = 0;
                        for(let y = 1; y <= 11; y++){
                            if(userData.sat[`sat_${11}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${11}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${11}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*1000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${11}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'b'){
                        let sat = 0;
                        for(let y = 1; y <= 11; y++){
                            if(userData.sat[`sat_${12}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${12}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${12}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*50000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${12}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'd'){
                        let sat = 0;
                        for(let y = 1; y <= 11; y++){
                            if(userData.sat[`sat_${13}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${13}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${13}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*300000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${13}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'h'){
                        let sat = 0;
                        for(let y = 1; y <= 11; y++){
                            if(userData.sat[`sat_${14}_${y}`] != 0){
                                const allAnimal = userData.sat[`sat_${14}_${y}`];
                                if(allAnimal){
                                    userData.sat[`sat_${14}_${y}`] -= allAnimal;
                                    sat += allAnimal;
                                    total_cash += (allAnimal*1000000);
                                }
                            }
                        }
                        if(sat != 0){
                            messageSell += `${gif[`animal_rank_${14}`]}**x`;
                            messageSell += `${sat}**`;
                        }

                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }

                    }else if(choice_rank == 'all'){
                        for(let i = 1; i <= 14; i++){
                            let sat = 0;
                            for(let y = 1; y <= 7; y++){
                                if(userData.sat[`sat_${i}_${y}`] != 0){
                                    const allAnimal = userData.sat[`sat_${i}_${y}`];
                                    if(allAnimal){
                                        userData.sat[`sat_${i}_${y}`] -= allAnimal;
                                        sat += allAnimal;
                                        if(i == 1){
                                            total_cash += (allAnimal*1);
                                        }else if(i == 2){
                                            total_cash += (allAnimal*3);
                                        }else if(i == 3){
                                            total_cash += (allAnimal*10);
                                        }else if(i == 4){
                                            total_cash += (allAnimal*250);
                                        }else if(i == 5){
                                            total_cash += (allAnimal*5000);
                                        }else if(i == 6){
                                            total_cash += (allAnimal*15000);
                                        }else if(i == 7){
                                            total_cash += (allAnimal*30000);
                                        }else if(i == 8){
                                            total_cash += (allAnimal*250000);
                                        }else if(i == 9){
                                            total_cash += (allAnimal*250);
                                        }else if(i == 10){
                                            total_cash += (allAnimal*50000);
                                        }else if(i == 11){
                                            total_cash += (allAnimal*1000);
                                        }else if(i == 12){
                                            total_cash += (allAnimal*50000);
                                        }else if(i == 13){
                                            total_cash += (allAnimal*300000);
                                        }else if(i == 14){
                                            total_cash += (allAnimal*1000000);
                                        }
                                    }
                                }
                            }
                            if(sat != 0){
                                messageSell += `${gif[`animal_rank_${i}`]}**x`;
                                messageSell += `${sat}**`;
                            }
                        }
                
                        userData.balance += total_cash;
                        await userData.save();
                
                        if(total_cash != 0){
                            messageSell += ` for a total of ${gif.cash} **${total_cash.toLocaleString()}**`;
                        }else{
                            messageSell += `nothing!`;
                        }
                    }else{
                        messageSell += `nothing!`;
                    }

                    message.channel.send({ embeds: [SimpleEmbed(messageSell)] });
            }
        }catch(error){
            console.log(`sell error ${error}`);
        }
    },
};