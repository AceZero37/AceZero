const { toSuperscript, gif, getUser, splitMessage, sym, cooldown, SimpleEmbed} = require('../../functioon/function');

const space = '\u2006\u2006\u2006\u2006';
const SL = '\u2006\u2006';

const cooldowns = new Map();
let CDT = 25_000;
var getId = [];
var cdId = [];
var prem = [];

// Configuration for all animal ranks
const RANK_CONFIG = [
    { id: 1, label: 'C', slots: 5, maxSlots: 5, points: 1 },
    { id: 2, label: 'U', slots: 5, maxSlots: 5, points: 5 },
    { id: 3, label: 'R', slots: 5, maxSlots: 5, points: 20 },
    { id: 4, label: 'E', slots: 5, maxSlots: 5, points: 250 },
    { id: 5, label: 'M', slots: 5, maxSlots: 5, points: 3000 },
    { id: 11, label: 'P', slots: 5, maxSlots: 5, points: 500 },
    { id: 10, label: 'CP', slots: 99, maxSlots: 5, points: 25000 },
    { id: 6, label: 'L', slots: 5, maxSlots: 5, points: 10000 },
    { id: 7, label: 'G', slots: 5, maxSlots: 5, points: 20000 },
    { id: 12, label: 'O', slots: 5, maxSlots: 5, points: 30000 },
    { id: 13, label: 'X', slots: 5, maxSlots: 5, points: 200000 },
    { id: 8, label: 'F', slots: 5, maxSlots: 5, points: 100000 },
    { id: 9, label: 'S', slots: 10, maxSlots: 5, points: 500 },
    { id: 26, label: 'VC', slots: 10, maxSlots: 5, points: 10000 },
    { id: 14, label: 'V', slots: 5, maxSlots: 5, points: 500000 },
    { id: 19, label: 'DS', slots: 5, maxSlots: 5, points: 500000 },
    { id: 17, label: 'OPM', slots: 5, maxSlots: 5, points: 500000 },
    { id: 15, label: 'JJK', slots: 5, maxSlots: 5, points: 500000 },
    { id: 16, label: 'OP', slots: 5, maxSlots: 5, points: 500000 },
    { id: 18, label: 'MS', slots: 5, maxSlots: 5, points: 500000 },
    { id: 21, label: 'NT', slots: 5, maxSlots: 5, points: 1 },
    { id: 23, label: 'CM', slots: 5, maxSlots: 5, points: 500000 },
    { id: 27, label: 'SL', slots: 5, maxSlots: 5, points: 500000 },
    { id: 25, label: 'KN8', slots: 5, maxSlots: 5, points: 500000 },
    { id: 22, label: 'NM', slots: 5, maxSlots: 5, points: 500000 },
    { id: 20, label: 'CG', slots: 5, maxSlots: 5, points: 500000 },
    { id: 24, label: 'KOF', slots: 5, maxSlots: 5, points: 500000 }
];

module.exports = {
    name: 'z',
    async execute(client, message, args) {
        try {
            const user = message.author;
            const userData = await getUser(user.id);

            if (userData.premium.premium_bool && !prem.includes(user.id)) {
                prem.push(user.id);
            }

            if (cooldown(user.id, getId, cdId, CDT, message, cooldowns, prem)) {
                return;
            }

            let messageAnimal = `**🌿 🌱 🌳${user.displayName}'s zoo!🌳 🌿 🌱**\n`;
            
            // Find max amount for superscript formatting
            let store_number = 0;
            let check_zero = false;
            
            for (let i = 1; i <= 27; i++) {
                for (let y = 1; y <= 99; y++) {
                    const amount = userData.sat[`sat_${i}_${y}`];
                    if (amount > 0) {
                        check_zero = true;
                        if (amount > store_number) {
                            store_number = amount;
                        }
                    }
                }
            }

            // Build zoo display and calculate totals
            const totals = {};
            let zoo_point = 0;

            for (const rank of RANK_CONFIG) {
                const { id, label, slots, maxSlots, points } = rank;
                
                // Check if rank has any animals
                let rank_bool = false;
                for (let i = 1; i <= slots; i++) {
                    if (userData.sat[`sat_${id}_${i}`] > 0 || userData.sat[`sat_${id}_${i}_h`] > 0) {
                        rank_bool = true;
                        break;
                    }
                }

                if (!rank_bool) continue;

                // Calculate total for this rank
                let total = 0;
                for (let i = 1; i <= slots; i++) {
                    total += userData.sat[`sat_${id}_${i}_h`] || 0;
                }
                totals[label] = total;
                zoo_point += total * points;

                // Add rank header
                messageAnimal += `${gif[`animal_rank_${id}`]}${space}`;

                // Add animals
                let slotCount = 0;
                for (let i = 1; i <= slots; i++) {
                    const amount = userData.sat[`sat_${id}_${i}`];
                    const hasHistory = userData.sat[`sat_${id}_${i}_h`] > 0;

                    if (amount > 0) {
                        if (slotCount === maxSlots) {
                            messageAnimal += `\n${gif.blank_gif}${space}`;
                            slotCount = 0;
                        }
                        messageAnimal += `${gif[`rank_${id}_${i}`]}${toSuperscript(amount, store_number)}${SL}`;
                        slotCount++;
                    } else if (hasHistory) {
                        if (slotCount === maxSlots) {
                            messageAnimal += `\n${gif.blank_gif}${space}`;
                            slotCount = 0;
                        }
                        if (check_zero) {
                            messageAnimal += `${gif[`rank_${id}_${i}`]}${toSuperscript(0, store_number)}${SL}`;
                        } else {
                            messageAnimal += `${gif[`rank_${id}_${i}`]}${SL}`;
                        }
                        slotCount++;
                    } else if (id <= 3) {
                        // Only show locks for C, U, R ranks
                        if (check_zero) {
                            messageAnimal += `${gif.animal_lock}${toSuperscript(0, store_number)}${SL}`;
                        } else {
                            messageAnimal += `${gif.animal_lock}${SL}`;
                        }
                    }
                }

                messageAnimal += '\n';
            }

            // Build summary text
            const summaryParts = RANK_CONFIG
                .filter(rank => totals[rank.label] !== undefined)
                .map(rank => `${rank.label}-${totals[rank.label]}`);

            const text_zoo = `**Zoo Points: __${zoo_point.toLocaleString()}__\n    ${summaryParts.join(', ')}**`;

            // Send message
            if (messageAnimal.length + text_zoo.length < 2000) {
                messageAnimal += text_zoo;
                message.channel.send(messageAnimal);
            } else {
                const chunks = splitMessage(messageAnimal);
                for (const chunk of chunks) {
                    message.channel.send(chunk);
                }
                message.channel.send(text_zoo);
            }
        } catch (error) {
            console.error(`zoo error ${error}`);
        }
    },
};