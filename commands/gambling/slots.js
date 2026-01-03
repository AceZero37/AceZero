const { getUser, getRandomInt, gif, sleep, sym, cooldown, SimpleEmbed } = require('../../functioon/function');

const cooldowns = new Map();
const CDT = 9_000; 
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 's',
    async execute(client, message, args) {
        try {
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

            let bet = parseInt(args[0]);
            let bet_cash = args[0];
            if (args[0] === 'all') {
                bet = userData.balance;
            } else if (!bet) {
                return;
            }

            if(bet_cash == `${bet}k` || bet_cash == `${bet}K`){
                bet *= 1000;
            }

            if (bet >= 250000) {
                bet = 250000;
            }

            if (userData.balance < bet || userData.balance <= 0) {
                return message.reply({ embeds: [SimpleEmbed(`<@${user.id}>** You don't have enough cash!**`)] });
            }

            userData.balance -= bet;
            await userData.save();

            const box = gif.box_slots_gif;
            const one = gif.one_slots_gif;
            const two = gif.two_slots_gif;
            const three = gif.three_slots_gif;
            const five = gif.five_slots_gif;
            const four1 = gif.jackpot_1_slots_gif;
            const four2 = gif.jackpot_2_slots_gif;
            const four3 = gif.jackpot_3_slots_gif;

            let slot1 = getRandomInt(1, 6);
            let slot2 = getRandomInt(1, 6);
            let slot3 = getRandomInt(1, 6);

            let machine =
				'**  `___SLOTS___`**\n` ` ' +
				box + ' ' + box + ' ' + box + ' ` `   **' + user.displayName + '**\n' +
				'  `|         |`   You bet ' + bet.toLocaleString() + gif.cash + '\n' +
				'  `|         |`';

            const slotsMessage = await message.channel.send(machine);

            let luck = getRandomInt(1, 1001) / 10;

            if (luck <= 20) {
                slot1 = slot2 = slot3 = 1;

            }else if (luck <= 40) {
                slot1 = slot2 = slot3 = 2;

            } else if (luck <= 45) {
                slot1 = slot2 = slot3 = 3;

            } else if (luck <= 47.5) {
                slot1 = slot2 = slot3 = 5;

            } else if (luck <= 48.5) {
                slot1 = slot2 = slot3 = 4;
            } 

            if (slot1 === 4 && slot2 === 4 && slot3 === 4) {
                const jackpot = getRandomInt(1, 10);
                if (jackpot !== 1) {
                    slot1 = slot2 = slot3 = getRandomInt(1, 4);
                }
            }

            if(slot1 == 1) { slot1 = one; } else if(slot1 == 2) { slot1 = two; } else if(slot1 == 3) { slot1 = three; } else if(slot1 == 4) { slot1 = four1; } else if(slot1 == 5) { slot1 = five; };
            if(slot2 == 1) { slot2 = one; } else if(slot2 == 2) { slot2 = two; } else if(slot2 == 3) { slot2 = three; } else if(slot2 == 4) { slot2 = four2; } else if(slot2 == 5) { slot2 = five; };
            if(slot3 == 1) { slot3 = one; } else if(slot3 == 2) { slot3 = two; } else if(slot3 == 3) { slot3 = three; } else if(slot3 == 4) { slot3 = four3; } else if(slot3 == 5) { slot3 = five; };

            setTimeout(async function () {
                machine =
                '**  `___SLOTS___`**\n` ` ' +
				slot1 + ' ' + box + ' ' + box + ' ` `   **' + user.displayName + '**\n' +
				'  `|         |`   You bet ' + bet.toLocaleString() + gif.cash + '\n' +
				'  `|         |`';
                try{ await slotsMessage.edit(machine); }catch(error){}

                setTimeout(async function () {
                    machine =
                    '**  `___SLOTS___`**\n` ` ' +
					slot1 + ' ' + slot2 + ' ' + box + ' ` `   **' + user.displayName + '**\n' +
					'  `|         |`   You bet ' + bet.toLocaleString() + gif.cash + '\n' +
					'  `|         |`';
                    try{ await slotsMessage.edit(machine); }catch(error){}

                    setTimeout(async function () {
                        const calculateWinnings = (multiplier) => bet * multiplier;

                        let winnings = 0;
                        if (slot1 === slot2 && slot2 === slot3) {
                            switch (slot1) {
                                case one: winnings = calculateWinnings(1); break;
                                case two: winnings = calculateWinnings(2); break;
                                case three: winnings = calculateWinnings(3); break;
                                case five: winnings = calculateWinnings(5); break;
                            }
                        } else if (slot1 === four1 && slot2 === four2 && slot3 === four3) {
                            winnings = calculateWinnings(10);
                        }

                        if (winnings > 0) {
                            userData.balance += winnings;
                            try{ 
                                await slotsMessage.edit(
                                    '**  `___SLOTS___`**\n` ` ' +
									slot1 + ' ' + slot2 + ' ' + slot3 + ' ` `   **' + user.displayName + '**\n' +
									'  `|         |`   You bet ' + bet.toLocaleString() + gif.cash + '\n' +
									'  `|         |`   and won ' + winnings.toLocaleString() + gif.cash
                                ); 
                            }catch(error){}
        
                        } else {
                            try{ 
                                await slotsMessage.edit(
                                    '**  `___SLOTS___`**\n` ` ' +
									slot1 + ' ' + slot2 + ' ' + slot3 + ' ` `   **' + user.displayName + '**\n' +
									'  `|         |`   You bet ' + bet.toLocaleString() + gif.cash + '\n' +
									'  `|         |`   and lost it all.... :c'
                                ); 
                            }catch(error){}
                        }

                        try { await userData.save(); }catch(error){}
                    }, 1000);

                }, 700);

            }, 1000);

        } catch (error) {
            console.log(`slots error ${error.stack}`);
        }
    }
};