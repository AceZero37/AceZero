const { getUser, getRandomInt, gif, SimpleEmbed, sym, cooldown, sleep } = require('../../functioon/function');

const khqr = require('bakong-khqr');
const axios = require('axios');
const crypto = require('crypto');

const BAKONG_BASE_URL = 'https://api-bakong.nbc.gov.kh/v1';
const BAKONG_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiZTgxMGQ2MmIwNzIxNDUxIn0sImlhdCI6MTc2NjkzNTIxOSwiZXhwIjoxNzc0NzExMjE5fQ.J6WEgFwL9iICNfJt6cIyZnwY5wlDALXVCZ1Wgq76XSw';
const MERCHANT_ID = 'sovan_narith@wing';
const CURRENCY = 'USD';

const cooldowns = new Map();
let CDT = 9_000;
var getId = [];
var cdId = [];
var prem = [];

async function generateQR(amount, description = 'Deposit') {
    const { BakongKHQR } = require('bakong-khqr');
    const khqrInstance = new BakongKHQR();
    const qrString = khqrInstance.generate({
        bakongAccountId: MERCHANT_ID,
        amount: amount,
        currency: CURRENCY,
        description: description
    });
    return qrString;
}

async function generateDeeplink(qrString) {
    try {
        const response = await axios.post(`${BAKONG_BASE_URL}/generate_deeplink_by_qr`, {
            qr: qrString,
            sourceInfo: {
                appIconUrl: 'https://example.com/icon.png', // Replace with actual icon URL
                appName: 'Yukio Bot',
                appDeepLinkCallback: 'https://example.com/callback' // Replace with actual callback URL
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.data.shortLink;
    } catch (error) {
        console.log('Error generating deeplink:', error);
        return null;
    }
}

function getMD5(qrString) {
    return crypto.createHash('md5').update(qrString).digest('hex');
}

async function checkTransaction(md5) {
    try {
        const response = await axios.post(`${BAKONG_BASE_URL}/check_transaction_by_md5`, {
            md5: md5
        }, {
            headers: {
                'Authorization': `Bearer ${BAKONG_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.log('Error checking transaction:', error);
        return null;
    }
}

module.exports = {
    name: 'cf',
    async execute(client, message, args) {
        try{
            const user = message.author;

            const userData = await getUser(user.id);

            if (args[0] === 'deposit') {
                const amount = parseFloat(args[1]);
                if (!amount || amount <= 0) {
                    return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> please provide a valid amount to deposit.`)] });
                }
                const qrString = await generateQR(amount, `Deposit for ${user.username}`);
                const deeplink = await generateDeeplink(qrString);
                if (!deeplink) {
                    return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> error generating payment link.`)] });
                }
                const embed = SimpleEmbed(`<@${user.id}> To deposit ${amount} USD, click this link to pay: ${deeplink}\n\nAfter payment, use \`!cf check ${getMD5(qrString)}\` to verify and receive your cash.`);
                return message.channel.send({ embeds: [embed] });
            }

            if (args[0] === 'check') {
                const md5 = args[1];
                if (!md5) {
                    return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> please provide the MD5 hash.`)] });
                }
                const result = await checkTransaction(md5);
                if (!result || result.responseCode !== 0) {
                    return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> transaction not found or failed.`)] });
                }
                const transaction = result.data;
                if (transaction.toAccountId !== MERCHANT_ID || transaction.currency !== CURRENCY) {
                    return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> invalid transaction.`)] });
                }
                const amount = parseFloat(transaction.amount);
                // Credit the user
                userData.balance += amount * 1000; // Assuming 1 USD = 1000 virtual cash
                await userData.save();
                return message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> deposit successful! Added ${amount * 1000} cash to your balance.`)] });
            }

            if(userData.premium.premium_bool){
                if(!prem.includes(user.id)){
                    prem.push(user.id);
                }
            }

            if(cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)){
                return;
            };

            var guess = '';
            var coin = '';

            let bet = args[0];
            let bet_cash = parseInt(args[0]);

            if(!bet){
                return;
            }else if(parseInt(bet)){
                guess = 'head';
                const choice = args[1];
                if(choice == 't'){
                    guess = 'tail';
                }else if(choice == 'h'){
                    guess = 'head';
                }
            }else if(bet == 'all'){
                bet = userData.balance;
                guess = 'head';
                const choice = args[1];
                if(choice == 't'){
                    guess = 'tail';
                }else if(choice == 'h'){
                    guess = 'head';
                }
            }else{
                message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> wrong syntax!`)] });
                return;
            }

            if(guess == 'head'){
                const head = getRandomInt(1, 8);
                if(head <= 3){
                    coin = 'head';
                }else{
                    coin = 'tail'
                }
            }else if(guess == 'tail'){
                const tail = getRandomInt(1, 8);
                if(tail <= 3){
                    coin = 'tail';
                }else{
                    coin = 'head';
                }
            }

            const msg = await message.channel.send({ embeds: [SimpleEmbed(`<@${user.id}> you choose ${guess} and wait...${gif.coin_flip_gif}`)] });
            await sleep(2000);

            if(bet == `${bet_cash}k` || bet == `${bet_cash}K`){
                bet = bet_cash * 1000;
            }

            if(bet >= 250000){
                bet = 250000 
            };

            if(userData.balance < bet || userData.balance <= 0){
                message.reply({ embeds: [SimpleEmbed(`<@${user.id}>** You don't have enough cash!**`)] });
                return;
            }

            userData.balance -= bet;
            try{ await userData.save(); }catch(error){}

            if(guess == coin){
                msg.edit({ embeds: [SimpleEmbed(`<@${user.id}> Coin: ${coin} You won ${gif.cash} **${bet.toLocaleString()}**$ and you chose ${guess}`)] });
                const cash = bet*=2;
                userData.balance += parseInt(cash);   
                try{
                    await userData.save();
                }catch(error){}
                return;        
            }else{
                msg.edit({ embeds: [SimpleEmbed(`<@${user.id}> Coin: ${coin} You lost ${gif.cash} ${bet.toLocaleString()}$ and you chose ${guess}`)] });
                try{
                    await userData.save();
                }catch(error){}
                return;
            }
        }catch(error){
            console.log(`coin flip error ${error}`);
        }
    },
};