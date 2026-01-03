const { SimpleEmbed, gif, sym, prefix } = require('../functioon/function');

module.exports = {
    name: 'help',
    description: 'Shows a list of all commands or info about a specific command.',
    execute: async (interaction, client) => {
        await interaction.reply( { embeds: [SimpleEmbed(`Type any Commands with main prefix ${sym}${prefix}${sym} as Headling\nType: ${sym}help { catagory_name }${sym} to all commnads in that Catagory`)
        .setAuthor({ name: `${client.user.displayName}`, iconURL: client.user.displayAvatarURL() })
        .setTitle('Help Commands')
        .addFields(
            { name: `🥇: Rank`, value: '`top`' },
            { name: `${gif.cash}: Economy`, value: '`Cash` `give` `daily` `shop` `buy`' },
            { name: `🎲: Gambling`, value: '`coinflip` `slots` `klaklok` `blackjack` `pav` `pokdeng`' },
            { name: `🎮: Game`, value: '`race` `guess` `bankrob`' },
            { name: `${gif.Rutr_gif}: Dragon`, value: '`egg` `fight` `upgrade` `item` `holder item`' },
            // { name: `🌱: Animal`, value: '`hunt` `inventory` `lootbox` `crate` `sell` `use` `zoo` `team` `battle` `weapon`' },
            // { name: `🎉: Giveaway`, value: '`gstart`' },
            { name: `📱: Social`, value: '`level` `avatar`' },
            // { name: `🏢: Work`, value: '`work` `apply` `resign` `job`' },
            // { name: `${gif.pickage_gif}: Mining`, value: '`storage` `mine` `tool` `box` `transfer` `break` `trade`' },
            { name: `⚙️: Utilitys`, value: '`ping` `help` `state` `prefix`' },
            )
        .setImage('https://cdn.discordapp.com/attachments/1210959391382310922/1211904017534296064/7bd11dd8d28fdbeaf863a8f32b06e0d6abafcd56r1-1280-720v2_uhq.jpg?ex=65efe491&is=65dd6f91&hm=53ca81043585e1114fa9a80543141c79142cb8bea2b8ff7404e4017e63e91715&')
        .setTimestamp()
        ] } );
    },
};
