const {
    getUser,
    gif,
    AttachmentBuilder,
    createCanvas,
    loadImage,
    cooldown
} = require('../../functioon/function');

const cooldowns = new Map();
const CDT = 5_000;
let getId = [];
let cdId = [];
let prem = [];

module.exports = {
    name: 'rank',
    async execute(client, message, args) {
        try {
            const user = message.author;

            const userData = await getUser(user.id);

            // premium check
            if (userData.premium && userData.premium.premium_bool) {
                if (!prem.includes(user.id)) {
                    prem.push(user.id);
                }
            }

            // cooldown check
            if (cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)) {
                return;
            }

            const canvas = createCanvas(1243, 374);
            const ctx = canvas.getContext('2d');

            // ---------- BACKGROUND ----------
            let backgroundImage = gif.backgroundImage;

            if (userData.lvl_bg === 'jjk') {
                backgroundImage = gif.jjk_bg;
            } else if (userData.lvl_bg === 'op') {
                backgroundImage = gif.op_bg;
            } else if (userData.lvl_bg === 'opm') {
                backgroundImage = gif.opm_bg;
            } else if (userData.lvl_bg === 'ds') {
                backgroundImage = gif.ds_bg;
            } else if (userData.lvl_bg === 'cg') {
                backgroundImage = gif.cg_bg;
            } else if (userData.lvl_bg === 'nt') {
                backgroundImage = gif.nt_bg;
            } else if (userData.lvl_bg === 'nm') {
                backgroundImage = gif.nm_bg;
            } else if (userData.lvl_bg === 'ms') {
                backgroundImage = gif.ms_bg;
            } else if (userData.lvl_bg === 'cm') {
                backgroundImage = gif.cm_bg;
            } else if (userData.lvl_bg === 'kof') {
                backgroundImage = gif.kof_bg;
            } else if (userData.lvl_bg === 'kn8') {
                backgroundImage = gif.kn8_bg;
            }

            const background = await loadImage(backgroundImage);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // subtle dark overlay to make text pop (new style)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // main info panel (new style)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(360, 40, 840, 290);

            // ---------- ELO & RANK ----------
            const elo = parseInt(userData.elo, 10) || 0;

            // default rank (low elo)
            let rankImage = gif.Worrior_rank_gif;
            let rankName = 'Worrior';
            let color = '#9e9e9e';

            // You can tune these thresholds however you like
            if (elo >= 500000) {
                rankImage = gif.Mythic_glory_rank_gif;
                rankName = 'Mythic Glory';
                color = '#ffb300';
            } else if (elo >= 250000) {
                rankImage = gif.mythic_rank_gif;
                rankName = 'Mythic';
                color = '#ff4081';
            } else if (elo >= 150000) {
                rankImage = gif.legend_rank_gif;
                rankName = 'Legend';
                color = '#00e5ff';
            } else if (elo >= 100000) {
                rankImage = gif.epic_rank_gif;
                rankName = 'Epic';
                color = '#7c4dff';
            } else if (elo >= 50000) {
                rankImage = gif.grand_master_rank_gif;
                rankName = 'Grand Master';
                color = '#ff9100';
            } else if (elo >= 25000) {
                rankImage = gif.master_rank_gif;
                rankName = 'Master';
                color = '#4caf50';
            } else if (elo >= 10000) {
                rankImage = gif.elite_rank_gif;
                rankName = 'Elite';
                color = '#2196f3';
            }

            // rank icon
            const rank = await loadImage(rankImage);
            ctx.drawImage(rank, 50, 40, 300, 300);

            // ---------- TEXT (new style) ----------
            // username
            ctx.font = 'bold 60px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(user.username, 380, 60);

            // rank name
            ctx.font = 'bold 50px Arial';
            ctx.fillStyle = color;
            ctx.fillText(rankName.toUpperCase(), 380, 135);

            // elo text
            ctx.font = 'bold 42px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`ELO: ${elo.toLocaleString()}`, 380, 205);

            // small subtitle
            ctx.font = '28px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText('Keep playing to reach the next rank!', 380, 260);

            // ---------- BORDER (new style, uses rank color) ----------
            const borderGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            borderGradient.addColorStop(0, color);
            borderGradient.addColorStop(0.5, '#ffffff');
            borderGradient.addColorStop(1, color);

            ctx.fillStyle = borderGradient;

            // left / right
            ctx.fillRect(0, 0, 30, canvas.height);
            ctx.fillRect(canvas.width - 30, 0, 30, canvas.height);

            // top / bottom
            ctx.fillRect(0, 0, canvas.width, 30);
            ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

            // ---------- SEND ----------
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'rank.png' });
            await message.channel.send({ files: [attachment] });
        } catch (error) {
            console.log(`rank error ${error}`);
        }
    },
};
