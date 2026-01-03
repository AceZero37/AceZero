const { SimpleEmbed, gif, sym, prefix, cooldown, getUser } = require('../../functioon/function');

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

module.exports = {
    name: 'help',
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

            const commands = args[0];
            if(commands){
                if(commands == 'Dragon' || commands == 'dragon'){
                    message.channel.send({ embeds: [SimpleEmbed(`all command need prefix main ${sym}${prefix}${sym}\n\nType: ${sym}egg equipe { animal_name }${sym} to equipe your animal\nType: ${sym}upgrade { animal_name } { esen_amount }${sym} to upgrade your animal\nType: ${sym}egg open${sym} to open your egg\n\nType: ${sym}fight${sym} to take a sword ( Battle )\n\nType: ${sym}item${sym} to show all item\nType: ${sym}item equipe {item_name}${sym} to equipe your item\nType: ${sym}item unequipe${sym} to unequipe your item\n\nType: ${sym}hold${sym} to show item holding\nType: ${sym}hold { item_name }${sym} to holding an item\nType: ${sym}hold unhold${sym} to unhold an item`).setTitle('Command Animal')] });
                    return;
                }else if(commands == 'Animal' || commands == 'animal'){
                    message.channel.send({ embeds: [SimpleEmbed(`all command need prefix main ${sym}${prefix}${sym}\n\nType: ${sym}battle or b${sym} to take your animal to battle\nType: ${sym}battlerank or br${sym} to take your animal to battle rank\nType: ${sym}wc { amount_item }${sym} to open your weaponcrate\n\nType: ${sym}d { animal_name }${sym} to view state of animal\n\nType: ${sym}dmt { weapon_id } or { weapon_rank }${sym} to dismantle weapon\nType: ${sym}hunt or h${sym} to hunt animal\nType: ${sym}inventory or inv${sym} to open your inventory\n\nType: ${sym}killingbot or kb${sym} to start auto hunt animal\nType: ${sym}lb { amount_item }${sym} to open lootbox\nType: ${sym}quest or q${sym} to view your daily quest\n\nType: ${sym}rank${sym} to check your rank\nType: ${sym}sell { animal_rank } or { weapon_id } or { weapon_rank }${sym} to sell animal or weapon\nType: ${sym}team or tm${sym} to check your animal team\nType: ${sym}use${sym} to use item in your inventory\n\nType: ${sym}weapon or w${sym} to view all your weapon\nType: ${sym}zoo${sym} to check your zoo animals`).setTitle('Command Animal')] });
                    return;
                }else if(commands == 'Farm' || commands == 'farm'){
                    message.channel.send({ embeds: [SimpleEmbed(`all command need prefix main ${sym}${prefix}${sym}\n\nType: ${sym}boat or bt${sym} to view daily boat\nType: ${sym}hang or ha${sym} to open your hang(store)\nType: ${sym}psa${sym} to open your daily market\n\nType: ${sym}rongjak or r${sym} to open your factory\n\nType: ${sym}teas ot t${sym} to open your home's farm`).setTitle('Command Animal')] });
                    return;
                }
            }

            message.channel.send({ embeds: [SimpleEmbed(`Type any Commands with main prefix ${sym}${prefix}${sym} as Headling\nType: ${sym}help { catagory_name }${sym} to all commnads in that Catagory`)
            .setAuthor({ name: `${client.user.displayName}`, iconURL: client.user.displayAvatarURL() })
            .setTitle('Help Commands')
            .addFields(
                { name: `🥇: Rank`, value: '`top`' },
                { name: `${gif.cash}: Economy`, value: '`Cash` `give` `daily` `shop` `buy`' },
                { name: `🎲: Gambling`, value: '`coinflip` `slots` `klaklok` `blackjack` `pav` `pokdeng`' },
                { name: `🎮: Game`, value: '`race` `guess` `bankrob`' },
                // { name: `${gif.Rutr_gif}: Dragon`, value: '`egg` `fight` `upgrade` `item` `holder item`' },
                { name: `🌱: Animal`, value: '`hunt` `inventory` `lootbox` `crate` `sell` `use` `zoo` `team` `battle` `weapon`' },
                // { name: `🎉: Giveaway`, value: '`gstart`' },
                { name: `📱: Social`, value: '`level` `avatar`' },
                // { name: `🏢: Work`, value: '`work` `apply` `resign` `job`' },
                // { name: `${gif.pickage_gif}: Mining`, value: '`storage` `mine` `tool` `box` `transfer` `break` `trade`' },
                { name: `⚙️: Utilitys`, value: '`ping` `help` `state` `prefix`' },
                )
            .setImage('https://cdn.discordapp.com/attachments/1210959391382310922/1211904017534296064/7bd11dd8d28fdbeaf863a8f32b06e0d6abafcd56r1-1280-720v2_uhq.jpg?ex=65efe491&is=65dd6f91&hm=53ca81043585e1114fa9a80543141c79142cb8bea2b8ff7404e4017e63e91715&')
            .setTimestamp()
            ] });
        }catch(error){
            console.log(`help error ${error}`);
        }
    },
};