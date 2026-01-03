const { Client, IntentsBitField, Collection, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ButtonStyle, AttachmentBuilder, InteractionCollector } = require('discord.js');
const { prefix } = require('../config');
const fs = require('fs');
const sym = '`';
const syms = sym;
const sym3 = '```';
const one_second = 1000;
const mongoose = require('mongoose');
const { userSchema } = require('../users/user');
const User = mongoose.model('User', userSchema);
const gif = require('../functioon/gif');
const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();

// Import Clan model for clan tag lookup
const { Clan } = require('../users/clan');

// Verify icon emoji
const VERIFY_ICON = '<a:verify:1441629070726267041>';

// Helper function to get user's clan display for battle
// Format: [emoji] ClanName [verify]
async function getUserClanTag(userId) {
    try {
        // Check if user is owner
        let clan = await Clan.findOne({ ownerId: userId });

        // If not owner, check if member
        if (!clan) {
            clan = await Clan.findOne({ members: { $in: [userId] } });
        }

        // Return clan info with emoji prefix and verify suffix
        if (clan) {
            const emojiPrefix = clan.clanEmoji ? `${clan.clanEmoji} ` : '';
            const verifyBadge = clan.isVerified ? ` ${VERIFY_ICON}` : '';
            return `${emojiPrefix}[ ${clan.clanName} ]${verifyBadge}`;
        }
        return '';
    } catch (error) {
        return '';
    }
}

// Helper function to get just the clan name (shorter version)
// Format: [emoji] ClanName [verify]
async function getUserClanTagShort(userId) {
    try {
        let clan = await Clan.findOne({ ownerId: userId });
        if (!clan) {
            clan = await Clan.findOne({ members: { $in: [userId] } });
        }
        // Return clan info with emoji prefix and verify suffix
        if (clan) {
            const emojiPrefix = clan.clanEmoji ? `${clan.clanEmoji} ` : '';
            const verifyBadge = clan.isVerified ? ` ${VERIFY_ICON}` : '';
            return `${emojiPrefix}[ ${clan.clanName} ]${verifyBadge}`;
        }
        return '';
    } catch (error) {
        return '';
    }
}


// ==================== WEAPON DATA CONFIGURATION ====================
// All weapons with their stats, WP costs, passives, and rank-based damage scaling
// Rank scaling multipliers: common=1.0, uncommon=1.114, rare=1.229, epic=1.343, mythical=1.457, legendary=1.571, febled=1.8
const WEAPON_DATA = {
    // ID 100: No Weapon (Base attack) - OwO Original
    no_weapon: {
        id: 100,
        name: 'No Weapon',
        internalName: 'no_weapon',
        wpCost: { min: 0, max: 0 },
        passives: 0,
        priceRange: { min: 0, max: 0 },
        description: 'Deals 100% of your STR to a random opponent.',
        type: 'physical',
        target: 'random_enemy',
        damage: { stat: 'str', minPercent: 100, maxPercent: 100 },
        effect: null
    },

    // ID 101: Great Sword - AoE Physical (NERFED)
    great_sword: {
        id: 101,
        name: 'Great Sword',
        internalName: 'great_sword',
        wpCost: { min: 100, max: 200 },
        passives: 1,
        priceRange: { min: 100, max: 200 },
        description: 'Deals 8-15% of your STR to all opponents.',
        type: 'physical',
        target: 'all_enemies',
        damage: { stat: 'str', minPercent: 8, maxPercent: 15 },
        effect: null
    },

    // ID 102: Healing Staff - Single Target Heal (BALANCED)
    healing_stuff: {
        id: 102,
        name: 'Healing Staff',
        internalName: 'healing_stuff',
        wpCost: { min: 150, max: 225 },
        passives: 1,
        priceRange: { min: 150, max: 225 },
        description: 'Heals 50-80% of your MAG to the lowest health ally. This weapon can overheal up to 50% of targets max HP.',
        type: 'heal',
        target: 'lowest_hp_ally',
        damage: { stat: 'mag', minPercent: 50, maxPercent: 80 },
        effect: { type: 'overheal', maxOverhealPercent: 50 }
    },

    // ID 103: Bow - Single Target Burst (BALANCED)
    bow: {
        id: 103,
        name: 'Bow',
        internalName: 'bow',
        wpCost: { min: 120, max: 220 },
        passives: 1,
        priceRange: { min: 120, max: 220 },
        description: 'Deals 50-80% of your STR to a random opponent.',
        type: 'physical',
        target: 'random_enemy',
        damage: { stat: 'str', minPercent: 50, maxPercent: 80 },
        effect: null
    },

    // ID 104: Rune of the Forgotten - Passive Stat Boost + True Damage (NERFED 150%)
    rune_of_the_forgotten: {
        id: 104,
        name: 'Rune of the Forgotten',
        internalName: 'rune_of_the_forgotten',
        wpCost: { min: 0, max: 0 },
        passives: 0,
        priceRange: { min: 0, max: 0 },
        description: 'Increase ALL stats by 1-3%, and changes your physical attacks to do 13% STR + 13% MAG as TRUE damage. This weapon does not have an active ability.',
        type: 'passive',
        target: 'self',
        damage: { stat: 'str+mag', minPercent: 13, maxPercent: 13 },
        effect: { type: 'true_damage', statBoostMin: 1, statBoostMax: 3 }
    },

    // ID 105: Defender's Aegis - Taunt + Damage Reduction (OwO Original)
    defender_aegis: {
        id: 105,
        name: "Defender's Aegis",
        internalName: 'defender_aegis',
        wpCost: { min: 150, max: 250 },
        passives: 1,
        priceRange: { min: 150, max: 250 },
        description: 'Adds a taunt buff to your animal for 2 turns that reduces incoming damage by 30-50% and forces all enemies that attack a single random enemy to attack this one instead. Always activates at the start of a turn, regardless of pet position.',
        type: 'buff',
        target: 'self',
        damage: null,
        effect: { type: 'taunt', duration: 2, damageReductionMin: 30, damageReductionMax: 50 }
    },

    // ID 106: Orb of Potency - Two Passives, No Active (OwO Original)
    orb_of_potency: {
        id: 106,
        name: 'Orb of Potency',
        internalName: 'orb_of_potency',
        wpCost: { min: 0, max: 0 },
        passives: 2,
        priceRange: { min: 0, max: 0 },
        description: 'This weapon has no active ability, but comes with two passives!',
        type: 'passive',
        target: 'self',
        damage: null,
        effect: { type: 'double_passive' }
    },

    // ID 107: Vampiric Staff - AoE Lifesteal (BALANCED)
    vampiric_staff: {
        id: 107,
        name: 'Vampiric Staff',
        internalName: 'vampiric_staff',
        wpCost: { min: 100, max: 200 },
        passives: 1,
        priceRange: { min: 100, max: 200 },
        description: 'Deal 15-25% of your MAG to ALL enemies and heal ALL allies by the damage dealt.',
        type: 'magic',
        target: 'all_enemies',
        damage: { stat: 'mag', minPercent: 15, maxPercent: 25 },
        effect: { type: 'vampiric_aoe', healAllies: true }
    },

    // ID 108: Poison Dagger - Physical + Poison DoT (BALANCED)
    poison_dagger: {
        id: 108,
        name: 'Poison Dagger',
        internalName: 'poison_dagger',
        wpCost: { min: 100, max: 200 },
        passives: 1,
        priceRange: { min: 100, max: 200 },
        description: 'Deals 40-60% of your STR to a random enemy and applies poison for 3 turns (poison deals 20-35% of MAG at end of turn as TRUE damage).',
        type: 'physical',
        target: 'random_enemy',
        damage: { stat: 'str', minPercent: 40, maxPercent: 60 },
        effect: { type: 'poison', duration: 3, dotStat: 'mag', dotMinPercent: 20, dotMaxPercent: 35, trueDamage: true }
    },

    // ID 109: Wand of Absorption - Magic Damage + WP Transfer (BALANCED)
    wang_of_absorption: {
        id: 109,
        name: 'Wand of Absorption',
        internalName: 'wang_of_absorption',
        wpCost: { min: 150, max: 250 },
        passives: 1,
        priceRange: { min: 150, max: 250 },
        description: 'Deal 45-60% of your MAG to a random enemy and transfer their WP to an ally equal to 15-25% of the damage done.',
        type: 'magic',
        target: 'random_enemy',
        damage: { stat: 'mag', minPercent: 45, maxPercent: 60 },
        effect: { type: 'wp_drain', drainMinPercent: 15, drainMaxPercent: 25, drainTarget: 'random_ally' }
    },

    // ID 110: Flame Staff - DoT with explosion (BALANCED)
    flame_stuff: {
        id: 110,
        name: 'Flame Staff',
        internalName: 'flame_stuff',
        wpCost: { min: 100, max: 200 },
        passives: 1,
        priceRange: { min: 100, max: 200 },
        description: 'Deals 40-55% of your MAG to a random enemy and applies flame for 3 turns. (Flame deals 12-20% of your MAG at end of turn. If Flame is applied to an already burning enemy, it triggers an explosion that deals 35-50% of your MAG)',
        type: 'magic',
        target: 'random_enemy',
        damage: { stat: 'mag', minPercent: 40, maxPercent: 55 },
        effect: { type: 'flame', duration: 3, dotMinPercent: 12, dotMaxPercent: 20, explosionMinPercent: 35, explosionMaxPercent: 50 }
    },

    // ID 111: Energy Staff - AoE Magic Damage (NERFED 150%)
    energy_stuff: {
        id: 111,
        name: 'Energy Staff',
        internalName: 'energy_stuff',
        wpCost: { min: 100, max: 200 },
        passives: 1,
        priceRange: { min: 100, max: 200 },
        description: 'Sends a wave of energy and deals 7-14% of your MAG to all opponents.',
        type: 'magic',
        target: 'all_enemies',
        damage: { stat: 'mag', minPercent: 7, maxPercent: 14 },
        effect: null
    },

    // ID 112: Spirit Staff - AoE Heal + Defense Up (OwO Original)
    spirit_stuff: {
        id: 112,
        name: 'Spirit Staff',
        internalName: 'spirit_stuff',
        wpCost: { min: 125, max: 225 },
        passives: 1,
        priceRange: { min: 125, max: 225 },
        description: 'Heal all allies for 30-50% of your MAG and applies Defense Up for 2 turns. (Defense up reduces incoming damage by 20-30%)',
        type: 'heal',
        target: 'all_allies',
        damage: { stat: 'mag', minPercent: 30, maxPercent: 50 },
        effect: { type: 'defense_up', duration: 2, defenseMinPercent: 20, defenseMaxPercent: 30 }
    },

    // ID 113: Arcane Scepter - WP Replenish (OwO Original)
    arcane_scepter: {
        id: 113,
        name: 'Arcane Scepter',
        internalName: 'arcane_scepter',
        wpCost: { min: 125, max: 200 },
        passives: 1,
        priceRange: { min: 125, max: 200 },
        description: 'Replenish 40-70% of your MAG as WP to an ally with the lowest WP. This weapon can overreplenish up to 50% of targets max WP.',
        type: 'support',
        target: 'lowest_wp_ally',
        damage: null,
        effect: { type: 'wp_replenish', minPercent: 40, maxPercent: 70, overReplenishPercent: 50 }
    },

    // ID 114: Resurrection Staff - Revive Dead Ally (OwO Original)
    resurrection_staff: {
        id: 114,
        name: 'Resurrection Staff',
        internalName: 'resurrection_staff',
        wpCost: { min: 300, max: 400 },
        passives: 1,
        priceRange: { min: 300, max: 400 },
        description: 'Revive a dead ally and heal them for 50-80% of your MAG.',
        type: 'resurrection',
        target: 'dead_ally',
        damage: { stat: 'mag', minPercent: 50, maxPercent: 80 },
        effect: { type: 'revive' }
    },

    // ID 115: Glacial Axe - Freeze debuff (OwO Original)
    glacial_axe: {
        id: 115,
        name: 'Glacial Axe',
        internalName: 'glacial_axe',
        wpCost: { min: 180, max: 280 },
        passives: 1,
        priceRange: { min: 180, max: 280 },
        description: 'Deals 20-40% of your STR to a random opponent and apply Freeze for 2 turns.',
        type: 'physical',
        target: 'random_enemy',
        damage: { stat: 'str', minPercent: 20, maxPercent: 40 },
        effect: { type: 'freeze', duration: 2 }
    },

    // ID 116: Vanguard's Banner - Stacking Attack Buff (OwO Original)
    vanguards_banner: {
        id: 116,
        name: "Vanguard's Banner",
        internalName: 'vanguards_banner',
        wpCost: { min: 250, max: 300 },
        passives: 1,
        priceRange: { min: 250, max: 300 },
        description: "Apply Attack Up to all allies for 2 turns. If the user has enough WP when the buff expires, the buff will be recasted with a stronger version. First/Second/Third buff: 15-25%/25-35%/40-50% more damage.",
        type: 'buff',
        target: 'all_allies',
        damage: null,
        effect: { type: 'attack_up_stack', duration: 2, tier1Min: 15, tier1Max: 25, tier2Min: 25, tier2Max: 35, tier3Min: 40, tier3Max: 50 }
    },

    // ID 117: Culling Scythe - Physical + Mortality (BALANCED)
    culling_scythe: {
        id: 117,
        name: 'Culling Scythe',
        internalName: 'culling_scythe',
        wpCost: { min: 100, max: 200 },
        passives: 1,
        priceRange: { min: 100, max: 200 },
        description: 'Deals 40-60% of your STR to a random enemy and applies Mortality for 2 turns. (Mortality reduces healing effects by 30-50%)',
        type: 'physical',
        target: 'random_enemy',
        damage: { stat: 'str', minPercent: 40, maxPercent: 60 },
        effect: { type: 'mortality', duration: 2, healReductionMin: 30, healReductionMax: 50 }
    },

    // ID 118: Rune of Celebration - HoT + WP Regen (OwO Original)
    crune_of_celebration: {
        id: 118,
        name: 'Rune of Celebration',
        internalName: 'crune_of_celebration',
        wpCost: { min: 100, max: 200 },
        passives: 1,
        priceRange: { min: 100, max: 200 },
        description: 'Apply Celebration to an ally with the lowest health for 3 turns. (Celebration heals 20-50% of your PR as HP and restore 15-40% of your MR as WP.',
        type: 'buff',
        target: 'lowest_hp_ally',
        damage: null,
        effect: {
            type: 'celebration',
            duration: 3,
            hpHealStat: 'pr',
            hpHealMinPercent: 20,
            hpHealMaxPercent: 50,
            wpRestoreStat: 'mr',
            wpRestoreMinPercent: 15,
            wpRestoreMaxPercent: 40
        }
    },

    // ID 119: Staff of Purity - Dispel and conditional damage/heal (BALANCED)
    staff_of_purity: {
        id: 119,
        name: 'Staff of Purity',
        internalName: 'staff_of_purity',
        wpCost: { min: 125, max: 200 },
        passives: 1,
        priceRange: { min: 125, max: 200 },
        description: 'Remove a buff from an enemy. If successful, deal 30-55% of your MAG to them. Remove a debuff from an ally. If successful, heal 30-55% of your STR to them.',
        type: 'dispel',
        target: 'enemy_and_ally',
        damage: { stat: 'mag', minPercent: 30, maxPercent: 55 },
        effect: { type: 'purify', healStat: 'str', healMinPercent: 30, healMaxPercent: 55 }
    },

    // ID 120: Leeching Scythe - Leech debuff with bonus damage (BALANCED)
    leeching_scythe: {
        id: 120,
        name: 'Leeching Scythe',
        internalName: 'leeching_scythe',
        wpCost: { min: 130, max: 230 },
        passives: 1,
        priceRange: { min: 130, max: 230 },
        description: 'Deal 30-50% of your STR to a random enemy and apply Leech for 3 turns. If the Leech debuff is already on the target, deal +25-40% more damage.',
        type: 'physical',
        target: 'random_enemy',
        damage: { stat: 'str', minPercent: 30, maxPercent: 50 },
        effect: { type: 'leech', duration: 3, bonusDamageMinPercent: 25, bonusDamageMaxPercent: 40 }
    },

    // ID 121: Foul Fish - Stinky debuff (BALANCED)
    foul_fish: {
        id: 121,
        name: 'Foul Fish',
        internalName: 'foul_fish',
        wpCost: { min: 180, max: 280 },
        passives: 1,
        priceRange: { min: 180, max: 280 },
        description: 'Deal 30-50% of your STR to a random enemy and apply Stinky for 2 turns. (Stinky prevents any future buffs AND debuffs from applying to affected animals, and deals 12-25% MAG when an effect is blocked).',
        type: 'physical',
        target: 'random_enemy',
        damage: { stat: 'str', minPercent: 30, maxPercent: 50 },
        effect: { type: 'stinky', duration: 2, blockDamageMinPercent: 12, blockDamageMaxPercent: 25 }
    },

    // ID 122: Rune of Luck - Multi-hit Random STR/MAG (BALANCED)
    rune_of_luck: {
        id: 122,
        name: 'Rune of Luck',
        internalName: 'rune_of_luck',
        wpCost: { min: 100, max: 200 },
        passives: 1,
        priceRange: { min: 100, max: 200 },
        description: 'Punches a random enemy 5 times. Each punch randomly deals either a percentage of your STR or MAG. Punches deal: 1-20%, 1-20%, 1-20%, 1-20%, 1-20%.',
        type: 'multi_hit',
        target: 'random_enemy',
        damage: { stat: 'str_or_mag', minPercent: 1, maxPercent: 20 },
        effect: { type: 'multi_punch', hits: 5, statChoice: ['str', 'mag'] }
    }
};

// Helper function to get weapon data by internal name
function getWeaponData(weaponName) {
    return WEAPON_DATA[weaponName] || null;
}

// Helper function to get weapon data by ID
function getWeaponDataById(weaponId) {
    for (const key in WEAPON_DATA) {
        if (WEAPON_DATA[key].id === weaponId) {
            return WEAPON_DATA[key];
        }
    }
    return null;
}

// Helper function to calculate rank-scaled damage range
function getWeaponDamageRange(weaponName, rank, quality = 50) {
    const weapon = WEAPON_DATA[weaponName];
    if (!weapon || !weapon.damage) return { min: 0, max: 0 };

    // Get rank multiplier
    const rankMultiplier = getRankDamageMultiplier(rank);
    // Quality bonus (0-5% based on quality 0-100)
    const qualityBonus = 1 + (quality / 100 * 0.05);

    const finalMultiplier = rankMultiplier * qualityBonus;

    return {
        min: weapon.damage.minPercent * finalMultiplier,
        max: weapon.damage.maxPercent * finalMultiplier,
        stat: weapon.damage.stat
    };
}

// Rank damage multipliers for weapon scaling (MORE DEPENDENT ON RANK)
// Higher ranks now provide significantly more damage bonus
function getRankDamageMultiplier(rank) {
    switch (rank) {
        case 'common': return 0.80;      // Common is now baseline lower
        case 'uncommon': return 1.00;    // Uncommon is normal
        case 'rare': return 1.20;        // Rare gets 20% boost
        case 'epic': return 1.45;        // Epic gets 45% boost
        case 'mythical': return 1.75;    // Mythical gets 75% boost
        case 'legendary': return 2.10;   // Legendary gets 110% boost
        case 'fabled':
        case 'febled': return 2.50;      // Fabled gets 150% boost
        default: return 0.80;
    }
}

// Rank heal multipliers for weapon scaling (MORE DEPENDENT ON RANK)
function getRankHealMultiplier(rank) {
    switch (rank) {
        case 'common': return 0.85;      // Common heals less
        case 'uncommon': return 1.00;    // Uncommon is normal
        case 'rare': return 1.15;        // Rare gets 15% boost
        case 'epic': return 1.35;        // Epic gets 35% boost
        case 'mythical': return 1.60;    // Mythical gets 60% boost
        case 'legendary': return 1.90;   // Legendary gets 90% boost
        case 'fabled':
        case 'febled': return 2.25;      // Fabled gets 125% boost
        default: return 0.85;
    }
}

// Get effect values scaled by rank
function getWeaponEffectRange(weaponName, rank, effectKey1, effectKey2, quality = 50) {
    const weapon = WEAPON_DATA[weaponName];
    if (!weapon || !weapon.effect) return { min: 0, max: 0 };

    const rankMultiplier = getRankDamageMultiplier(rank);
    const qualityBonus = 1 + (quality / 100 * 0.05);
    const finalMultiplier = rankMultiplier * qualityBonus;

    const minValue = weapon.effect[effectKey1] || 0;
    const maxValue = weapon.effect[effectKey2] || 0;

    return {
        min: minValue * finalMultiplier,
        max: maxValue * finalMultiplier
    };
}

// ==================== ANIMAL TYPE & RECOMMENDATION DATA ====================
// Animal type definitions based on stat distribution
const ANIMAL_TYPES = {
    TANK: { name: 'Tank', emoji: '🛡️', description: 'High HP and defense, absorbs damage for the team' },
    DPS: { name: 'DPS', emoji: '⚔️', description: 'High physical damage dealer' },
    MAGE: { name: 'Mage', emoji: '🔮', description: 'High magic damage dealer' },
    SUPPORT: { name: 'Support', emoji: '💚', description: 'Healer and buffer for allies' },
    ASSASSIN: { name: 'Assassin', emoji: '🗡️', description: 'High burst damage, low survivability' },
    HYBRID: { name: 'Hybrid', emoji: '⚡', description: 'Balanced mix of physical and magic' },
    BRUISER: { name: 'Bruiser', emoji: '💪', description: 'Mix of damage and tankiness' }
};

// Helper function to determine animal type based on stats
function getAnimalType(hp, str, pr, wp, mag, mr) {
    const totalStats = hp + str + pr + wp + mag + mr;
    const strRatio = str / totalStats;
    const magRatio = mag / totalStats;
    const hpRatio = hp / totalStats;
    const prRatio = pr / totalStats;
    const mrRatio = mr / totalStats;
    const defenseRatio = (pr + mr) / totalStats;

    // High HP + defense = Tank
    if (hpRatio >= 0.25 && defenseRatio >= 0.25) return ANIMAL_TYPES.TANK;
    if (hpRatio >= 0.35) return ANIMAL_TYPES.TANK;

    // High STR = DPS/Assassin
    if (strRatio >= 0.4 && hpRatio <= 0.15) return ANIMAL_TYPES.ASSASSIN;
    if (strRatio >= 0.35) return ANIMAL_TYPES.DPS;

    // High MAG = Mage/Support
    if (magRatio >= 0.4 && hpRatio <= 0.15) return ANIMAL_TYPES.MAGE;
    if (magRatio >= 0.35) return ANIMAL_TYPES.SUPPORT;

    // Balanced STR and MAG = Hybrid
    if (Math.abs(strRatio - magRatio) <= 0.1 && strRatio >= 0.2) return ANIMAL_TYPES.HYBRID;

    // High WP = Support/Mage
    if (wp >= 5 && magRatio >= 0.2) return ANIMAL_TYPES.SUPPORT;

    // High defense but low HP = Bruiser
    if (defenseRatio >= 0.3) return ANIMAL_TYPES.BRUISER;

    // Default based on highest offensive stat
    if (str > mag) return strRatio >= 0.25 ? ANIMAL_TYPES.DPS : ANIMAL_TYPES.BRUISER;
    if (mag > str) return magRatio >= 0.25 ? ANIMAL_TYPES.MAGE : ANIMAL_TYPES.SUPPORT;

    return ANIMAL_TYPES.HYBRID;
}

// Recommended weapons based on animal type
const TYPE_WEAPON_RECOMMENDATIONS = {
    Tank: {
        weapons: ['defender_aegis', 'spirit_stuff', 'crune_of_celebration'],
        passives: ['physical_Resistance_effect', 'magic_Resistance_effect', 'health_point_effect', 'regeneration_effect', 'thorns_Effect', 'safeguard_Effect', 'kamikaze_Effect']
    },
    DPS: {
        weapons: ['great_sword', 'bow', 'culling_scythe', 'poison_dagger'],
        passives: ['strength_effect', 'lifesteal_effect', 'thorns_Effect', 'discharge_Effect', 'critical_Effect', 'enrage_Effect', 'snail_Effect']
    },
    Mage: {
        weapons: ['energy_stuff', 'wang_of_absorption', 'rune_of_the_forgotten'],
        passives: ['magic_effect', 'weapon_point_effect', 'lifesteal_effect', 'discharge_Effect', 'mana_tap_Effect', 'absolve_Effect', 'energize_Effect']
    },
    Support: {
        weapons: ['healing_stuff', 'spirit_stuff', 'resurrection_staff', 'crune_of_celebration'],
        passives: ['magic_effect', 'weapon_point_effect', 'regeneration_effect', 'sprout_Effect', 'sacrifice_Effect', 'absolve_Effect', 'energize_Effect']
    },
    Assassin: {
        weapons: ['bow', 'poison_dagger', 'culling_scythe'],
        passives: ['strength_effect', 'lifesteal_effect', 'discharge_Effect', 'sprout_Effect', 'critical_Effect', 'enrage_Effect', 'kamikaze_Effect']
    },
    Hybrid: {
        weapons: ['rune_of_the_forgotten', 'orb_of_potency', 'poison_dagger'],
        passives: ['strength_effect', 'magic_effect', 'lifesteal_effect', 'regeneration_effect', 'critical_Effect', 'mana_tap_Effect']
    },
    Bruiser: {
        weapons: ['great_sword', 'defender_aegis', 'spirit_stuff'],
        passives: ['physical_Resistance_effect', 'strength_effect', 'health_point_effect', 'lifesteal_effect', 'thorns_Effect', 'enrage_Effect', 'safeguard_Effect']
    }
};

// ==================== COUNTER SYSTEM ====================
// Pet Type Counter System - Rock-Paper-Scissors style advantages
// Each type counters certain types and is countered by others
// Counter bonus: +25% damage dealt, Countered penalty: -25% damage dealt
const PET_TYPE_COUNTERS = {
    Tank: {
        counters: ['Mage', 'Support'],      // Tanks resist magic-based enemies
        counteredBy: ['DPS', 'Assassin']    // Physical damage pierces tank defenses
    },
    DPS: {
        counters: ['Tank', 'Bruiser'],      // DPS breaks through defenses
        counteredBy: ['Mage', 'Support']    // Magic-based enemies outrange DPS
    },
    Mage: {
        counters: ['DPS', 'Assassin'],      // Mages burst down physical attackers
        counteredBy: ['Tank', 'Hybrid']     // Tanks resist magic, Hybrids adapt
    },
    Support: {
        counters: ['DPS', 'Assassin'],      // Support heals through physical burst
        counteredBy: ['Tank', 'Bruiser']    // Tanks/Bruisers outlast support
    },
    Assassin: {
        counters: ['Mage', 'Support'],      // Assassins burst down squishy targets
        counteredBy: ['Tank', 'Bruiser']    // Tanky targets survive burst
    },
    Hybrid: {
        counters: ['Mage', 'Tank'],         // Hybrids adapt to enemy type
        counteredBy: ['Assassin', 'DPS']    // Pure damage specialists defeat Hybrids
    },
    Bruiser: {
        counters: ['Assassin', 'Support'],  // Bruisers survive burst and out-sustain
        counteredBy: ['DPS', 'Mage']        // Pure damage dealers beat Bruisers
    }
};

// Weapon Type Counter System
// Physical weapons counter magic-focused enemies, magic weapons counter physical-focused enemies
const WEAPON_TYPE_COUNTERS = {
    // Physical weapons (STR-based)
    great_sword: { counters: ['magic'], counteredBy: ['physical'] },
    bow: { counters: ['magic'], counteredBy: ['physical'] },
    poison_dagger: { counters: ['magic', 'tank'], counteredBy: ['support'] },
    culling_scythe: { counters: ['support', 'magic'], counteredBy: ['physical'] },
    glacial_axe: { counters: ['magic'], counteredBy: ['physical'] },
    leeching_scythe: { counters: ['support'], counteredBy: ['magic'] },
    foul_fish: { counters: ['support'], counteredBy: ['magic'] },

    // Magic weapons (MAG-based)
    energy_stuff: { counters: ['physical'], counteredBy: ['magic'] },
    wang_of_absorption: { counters: ['physical'], counteredBy: ['magic'] },
    flame_stuff: { counters: ['physical', 'tank'], counteredBy: ['magic'] },
    vampiric_staff: { counters: ['physical'], counteredBy: ['magic'] },

    // Support/Utility weapons
    healing_stuff: { counters: ['physical'], counteredBy: ['assassin'] },
    spirit_stuff: { counters: ['physical'], counteredBy: ['assassin'] },
    resurrection_staff: { counters: ['physical'], counteredBy: ['assassin'] },
    arcane_scepter: { counters: [], counteredBy: ['assassin'] },

    // Hybrid/Utility weapons (no strict counters)
    rune_of_the_forgotten: { counters: [], counteredBy: [] },
    orb_of_potency: { counters: [], counteredBy: [] },
    crune_of_celebration: { counters: [], counteredBy: ['assassin'] },
    rune_of_luck: { counters: [], counteredBy: [] },
    defender_aegis: { counters: ['physical'], counteredBy: ['magic'] },
    vanguards_banner: { counters: [], counteredBy: [] },
    staff_of_purity: { counters: ['debuffs'], counteredBy: [] }
};

// Counter damage multiplier constant
const COUNTER_BONUS = 0.25;  // 25% bonus damage when countering
const COUNTER_PENALTY = 0.25; // 25% less damage when countered

/**
 * Get Pet Type Counter Multiplier
 * @param {string} attackerType - Type of the attacker (Tank, DPS, Mage, etc.)
 * @param {string} defenderType - Type of the defender
 * @returns {object} - { multiplier: number, status: 'counter'|'countered'|'neutral', emoji: string }
 */
function getPetTypeCounterMultiplier(attackerType, defenderType) {
    const attackerCounters = PET_TYPE_COUNTERS[attackerType];
    if (!attackerCounters) {
        return { multiplier: 1.0, status: 'neutral', emoji: '' };
    }

    // Check if attacker counters defender
    if (attackerCounters.counters.includes(defenderType)) {
        return {
            multiplier: 1.0 + COUNTER_BONUS,
            status: 'counter',
            emoji: '💥',
            message: `${attackerType} → ${defenderType}`
        };
    }

    // Check if attacker is countered by defender type
    if (attackerCounters.counteredBy.includes(defenderType)) {
        return {
            multiplier: 1.0 - COUNTER_PENALTY,
            status: 'countered',
            emoji: '🛡️',
            message: `${defenderType} resists ${attackerType}`
        };
    }

    return { multiplier: 1.0, status: 'neutral', emoji: '' };
}

/**
 * Get Weapon Counter Multiplier against enemy type
 * @param {string} weaponName - Internal name of the weapon
 * @param {string} enemyType - Type of the enemy (Tank, DPS, Mage, etc.)
 * @returns {object} - { multiplier: number, status: 'counter'|'countered'|'neutral' }
 */
function getWeaponCounterMultiplier(weaponName, enemyType) {
    const weaponCounters = WEAPON_TYPE_COUNTERS[weaponName];
    if (!weaponCounters) {
        return { multiplier: 1.0, status: 'neutral' };
    }

    // Determine enemy's category based on their type
    let enemyCategory = 'neutral';
    if (['DPS', 'Assassin', 'Bruiser'].includes(enemyType)) {
        enemyCategory = 'physical';
    } else if (['Mage', 'Support'].includes(enemyType)) {
        enemyCategory = 'magic';
    } else if (enemyType === 'Tank') {
        enemyCategory = 'tank';
    }

    // Check if weapon counters enemy category
    if (weaponCounters.counters.includes(enemyCategory)) {
        return {
            multiplier: 1.0 + COUNTER_BONUS,
            status: 'counter',
            emoji: '⚡'
        };
    }

    // Check if weapon is countered by enemy category
    if (weaponCounters.counteredBy.includes(enemyCategory)) {
        return {
            multiplier: 1.0 - COUNTER_PENALTY,
            status: 'countered',
            emoji: '🔻'
        };
    }

    return { multiplier: 1.0, status: 'neutral', emoji: '' };
}

/**
 * Calculate combined counter multiplier for an attack
 * Combines both pet type and weapon type advantages
 * @param {object} attacker - { type: string, weaponName: string }
 * @param {object} defender - { type: string }
 * @returns {object} - { multiplier: number, status: string, details: string }
 */
function getCombinedCounterMultiplier(attacker, defender) {
    const petCounter = getPetTypeCounterMultiplier(attacker.type, defender.type);
    const weaponCounter = attacker.weaponName ?
        getWeaponCounterMultiplier(attacker.weaponName, defender.type) :
        { multiplier: 1.0, status: 'neutral' };

    // Combine multipliers (additive bonuses, not multiplicative)
    let totalBonus = 0;
    let status = 'neutral';
    let details = '';

    if (petCounter.status === 'counter') {
        totalBonus += COUNTER_BONUS;
        details += `Pet advantage vs ${defender.type}! `;
    } else if (petCounter.status === 'countered') {
        totalBonus -= COUNTER_PENALTY;
        details += `Pet disadvantage vs ${defender.type}! `;
    }

    if (weaponCounter.status === 'counter') {
        totalBonus += COUNTER_BONUS;
        details += `Weapon effective! `;
    } else if (weaponCounter.status === 'countered') {
        totalBonus -= COUNTER_PENALTY;
        details += `Weapon resisted! `;
    }

    // Cap at +50% / -50%
    totalBonus = Math.max(-0.5, Math.min(0.5, totalBonus));

    if (totalBonus > 0) status = 'advantage';
    else if (totalBonus < 0) status = 'disadvantage';

    return {
        multiplier: 1.0 + totalBonus,
        status: status,
        details: details.trim(),
        petCounter: petCounter,
        weaponCounter: weaponCounter
    };
}

/**
 * Get animal type for an entity based on its stats
 * Helper for battle calculations
 */
function getEntityType(entity) {
    if (!entity || !entity.bool) return null;

    const stats = {
        hp: parseInt(entity.main_hp) || 0,
        str: parseInt(entity.str) || 0,
        pr: parseInt(entity.pr) || 0,
        wp: parseInt(entity.main_wp) || 0,
        mag: parseInt(entity.mag) || 0,
        mr: parseInt(entity.mr) || 0
    };

    return getAnimalType(stats.hp, stats.str, stats.pr, stats.wp, stats.mag, stats.mr);
}

// Get animal type and recommendations
function getAnimalTypeAndRecommendations(animalId) {
    // Get stats from gif object
    const hp = parseInt(gif[`rank_${animalId}_hp`]) || 0;
    const str = parseInt(gif[`rank_${animalId}_str`]) || 0;
    const pr = parseInt(gif[`rank_${animalId}_pr`]) || 0;
    const wp = parseInt(gif[`rank_${animalId}_wp`]) || 0;
    const mag = parseInt(gif[`rank_${animalId}_mag`]) || 0;
    const mr = parseInt(gif[`rank_${animalId}_mr`]) || 0;

    const animalType = getAnimalType(hp, str, pr, wp, mag, mr);
    const recommendations = TYPE_WEAPON_RECOMMENDATIONS[animalType.name] || TYPE_WEAPON_RECOMMENDATIONS.Hybrid;

    return {
        type: animalType,
        recommendedWeapons: recommendations.weapons,
        recommendedPassives: recommendations.passives,
        stats: { hp, str, pr, wp, mag, mr }
    };
}

// Get weapon display name for recommendations
function getWeaponDisplayName(weaponInternalName) {
    const weaponData = WEAPON_DATA[weaponInternalName];
    if (weaponData) return weaponData.name;

    // Fallback mapping
    const names = {
        'great_sword': 'Great Sword',
        'bow': 'Bow',
        'poison_dagger': 'Poison Dagger',
        'healing_stuff': 'Healing Staff',
        'spirit_stuff': 'Spirit Staff',
        'energy_stuff': 'Energy Staff',
        'wang_of_absorption': 'Wand of Absorption',
        'resurrection_staff': 'Resurrection Staff',
        'culling_scythe': 'Culling Scythe',
        'rune_of_the_forgotten': 'Rune of the Forgotten',
        'crune_of_celebration': 'Rune of Celebration',
        'defender_aegis': "Defender's Aegis",
        'orb_of_potency': 'Orb of Potency',
        'rune_of_luck': 'Rune of Luck',
        'vampiric_staff': 'Vampiric Staff',
        'flame_stuff': 'Flame Staff',
        'arcane_scepter': 'Arcane Scepter',
        'glacial_axe': 'Glacial Axe',
        'vanguards_banner': "Vanguard's Banner",
        'staff_of_purity': 'Staff of Purity',
        'leeching_scythe': 'Leeching Scythe',
        'foul_fish': 'Foul Fish'
    };
    return names[weaponInternalName] || weaponInternalName;
}

// Get passive display name
function getPassiveDisplayName(passiveInternalName) {
    const passiveNames = {
        'physical_Resistance_effect': 'Physical Resistance',
        'magic_Resistance_effect': 'Magic Resistance',
        'strength_effect': 'Strength',
        'magic_effect': 'Magic',
        'health_point_effect': 'Health Points',
        'weapon_point_effect': 'Weapon Points',
        'lifesteal_effect': 'Lifesteal',
        'regeneration_effect': 'Regeneration',
        'sacrifice_Effect': 'Sacrifice',
        'thorns_Effect': 'Thorns',
        'discharge_Effect': 'Discharge',
        'sprout_Effect': 'Sprout',
        'enrage_Effect': 'Enrage',
        'kamikaze_Effect': 'Kamikaze',
        'safeguard_Effect': 'Safeguard',
        'energize_Effect': 'Energize',
        'critical_Effect': 'Critical',
        'absolve_Effect': 'Absolve',
        'snail_Effect': 'Snail',
        'mana_tap_Effect': 'Mana Tap',
        'knowledge_Effect': 'Knowledge'
    };
    return passiveNames[passiveInternalName] || passiveInternalName;
}

const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
    ]
});

function xpToLevel(xp) {
    let lvl = 1;
    let rateXp = 1001;
    while (xp >= rateXp) {
        lvl += 1;
        rateXp *= 1.5;
    }
    return lvl;
}
function xpToRateXp(xp) {
    let lvl = 1;
    let rateXp = 1001;
    while (xp >= rateXp) {
        lvl += 1;
        rateXp *= 1.5;
    }
    const RateXP = parseInt(rateXp);
    return RateXP.toLocaleString();
}

function checkRankAnimalById(animal_id) {
    const match = animal_id.match(/^(\d+)_/);
    const id = parseInt(match[1]);
    for (let i = 1; i <= 99; i++) {
        if (i == id) {
            return gif[`animal_rank_${i}`];
        }
    }
    return '';
}
function checkPointAnimalById(animal_id) {
    const match = animal_id.match(/^(\d+)_/);
    const id = parseInt(match[1]);
    if (id == 1) {
        return '1';
    } else if (id == 2) {
        return '5';
    } else if (id == 3) {
        return '20';
    } else if (id == 4) {
        return '250';
    } else if (id == 5) {
        return '3,000';
    } else if (id == 6) {
        return '10,000';
    } else if (id == 7) {
        return '20,000';
    } else if (id == 8) {
        return '100,000';
    } else if (id == 9) {
        return '500';
    } else if (id == 10) {
        return '25,000';
    } else if (id == 11) {
        return '500';
    } else if (id == 12) {
        return '30,000';
    } else if (id == 13) {
        return '200,000';
    } else if (id == 14) {
        return '500,000';
    } else if (id == 15) {
        return '500,000';
    } else if (id == 16) {
        return '500,000';
    } else if (id == 17) {
        return '500,000';
    } else if (id == 18) {
        return '500,000';
    } else if (id == 19) {
        return '500,000';
    } else if (id == 20) {
        return '500,000';
    } else if (id == 21) {
        return '500,000';
    } else if (id == 22) {
        return '500,000';
    } else if (id == 23) {
        return '500,000';
    } else if (id == 25) {
        return '500,000';
    } else if (id == 26) {
        return '10,000';
    }

    return '';
}
function checkSellAnimalById(animal_id) {
    const match = animal_id.match(/^(\d+)_/);
    const id = parseInt(match[1]);
    if (id == 1) {
        return '1';
    } else if (id == 2) {
        return '3';
    } else if (id == 3) {
        return '10';
    } else if (id == 4) {
        return '250';
    } else if (id == 5) {
        return '5,000';
    } else if (id == 6) {
        return '15,000';
    } else if (id == 7) {
        return '30,000';
    } else if (id == 8) {
        return '250,000';
    } else if (id == 9) {
        return '6,000';
    } else if (id == 10) {
        return '50,000';
    } else if (id == 11) {
        return '1,000';
    } else if (id == 12) {
        return '50,000';
    } else if (id == 13) {
        return '300,000';
    } else if (id == 14) {
        return '1,000,000';
    } else if (id == 15) {
        return '500,000';
    } else if (id == 16) {
        return '500,000';
    } else if (id == 17) {
        return '500,000';
    } else if (id == 18) {
        return '500,000';
    } else if (id == 19) {
        return '500,000';
    } else if (id == 20) {
        return '500,000';
    } else if (id == 21) {
        return '500,000';
    } else if (id == 22) {
        return '500,000';
    } else if (id == 23) {
        return '500,000';
    } else if (id == 25) {
        return '500,000';
    } else if (id == 26) {
        return '50,000';
    }

    return '';
}
function getAnimalNameByName(name_animal) {
    for (let i = 1; i <= 99; i++) {
        for (let y = 1; y <= 99; y++) {
            if (gif[`rank_${i}_${y}_name`] == name_animal) {
                return name_animal;
            }
        }
    }
    return '';
}
function getAnimalIdByName(name_animal) {
    for (let i = 1; i <= 99; i++) {
        for (let y = 1; y <= 99; y++) {
            if (gif[`rank_${i}_${y}_name`] == name_animal) {
                return `${i}_${y}`;
            }
        }
    }
    return '';
}
async function checkOwnAnimal(name_animal, id) {
    const userData = await getUser(id);
    for (let i = 1; i <= 99; i++) {
        for (let y = 1; y <= 99; y++) {
            if (`${gif[`rank_${i}_${y}_name`]}` == `${name_animal}`) {
                if (userData.sat[`sat_${i}_${y}_h`] > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function toSuperscript(number, maxNumber) {
    const superscriptDigits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    if (maxNumber >= 10 && maxNumber <= 99) {
        if (number >= 10) {
            const paddedNumber = `${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else {
            const paddedNumber = `0${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        }
    } else if (maxNumber >= 100 && maxNumber <= 999) {
        if (number >= 100) {
            const paddedNumber = `${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 10) {
            const paddedNumber = `0${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else {
            const paddedNumber = `00${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        }
    } else if (maxNumber >= 1000 && maxNumber <= 9999) {
        if (number >= 1000) {
            const paddedNumber = `${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 100) {
            const paddedNumber = `0${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 10) {
            const paddedNumber = `00${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else {
            const paddedNumber = `000${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        }
    } else if (maxNumber >= 10000 && maxNumber <= 99999) {
        if (number >= 10000) {
            const paddedNumber = `${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 1000) {
            const paddedNumber = `0${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 100) {
            const paddedNumber = `00${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 10) {
            const paddedNumber = `000${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else {
            const paddedNumber = `0000${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        }
    } else if (maxNumber >= 100000 && maxNumber <= 999999) {
        if (number >= 100000) {
            const paddedNumber = `${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 10000) {
            const paddedNumber = `0${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 1000) {
            const paddedNumber = `00${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 100) {
            const paddedNumber = `000${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else if (number >= 10) {
            const paddedNumber = `0000${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        } else {
            const paddedNumber = `00000${number}`;
            return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
        }
    } else {
        const paddedNumber = `${number}`;
        return paddedNumber.split('').map(digit => superscriptDigits[digit]).join('');
    }
}

function mileToHour(time) {
    let hours = 0;
    let mins = 0;
    let secs = 0;

    while (time != 0) {
        if (time >= 1000) {
            secs += 1;
            time -= 1000;
        }
        if (secs >= 60) {
            mins += 1;
            secs -= 60;
        }
        if (mins >= 60) {
            hours += 1;
            mins -= 60;
        }
    }
    return hours;
}
function mileToMin(time) {
    let hours = 0;
    let mins = 0;
    let secs = 0;

    while (time != 0) {
        if (time >= 1000) {
            secs += 1;
            time -= 1000;
        }
        if (secs >= 60) {
            mins += 1;
            secs -= 60;
        }
        if (mins >= 60) {
            hours += 1;
            mins -= 60;
        }
    }
    return mins;
}
function mileToSec(time) {
    let hours = 0;
    let mins = 0;
    let secs = 0;

    while (time != 0) {
        if (time >= 1000) {
            secs += 1;
            time -= 1000;
        }
        if (secs >= 60) {
            mins += 1;
            secs -= 60;
        }
        if (mins >= 60) {
            hours += 1;
            mins -= 60;
        }
    }
    return secs;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getFiles(commandFiles, dir) {
    bot.commands = new Collection();
    for (const file of commandFiles) {
        const command = require(`${dir}/${file}`);
        bot.commands.set(command.name, command);
    }
    const result = bot.commands;
    return result;
}

async function getUser(id) {
    let userData = await User.findOne({ userId: id });
    return userData;
}

function SimpleEmbed(text) {
    return new EmbedBuilder()
        .setColor('Blue')
        .setDescription(text)
}
function customEmbed() {
    return new EmbedBuilder()
}
function advanceEmbed(desc, image, footer, user, color) {
    return new EmbedBuilder()
        .setAuthor({ name: `${user.displayName}`, iconURL: user.displayAvatarURL() })
        .setColor(`${color}`)
        .setDescription(`${desc}`)
        .setImage(`${image}`)
        .setFooter({ text: `${footer}` })
}
function basicEmbed(title, desc, image, footers, color) {
    return new EmbedBuilder()
        .setTitle(`${title}`)
        .setColor(`${color}`)
        .setDescription(`${desc}`)
        .setImage(`${image}`)
        .setFooter({ text: `${footers}` })
        .setTimestamp()
}

function emojiButton(id, emoji, style) {
    return new ButtonBuilder()
        .setCustomId(`${id}`)
        .setEmoji(`${emoji}`)
        .setStyle(style)
}
function labelButton(id, label, style) {
    return new ButtonBuilder()
        .setCustomId(`${id}`)
        .setLabel(`${label}`)
        .setStyle(style)
}

function oneButton(allButton) {
    return new ActionRowBuilder().addComponents(allButton);
}
function twoButton(one, two) {
    return new ActionRowBuilder().addComponents(one, two);
}
function threeButton(one, two, three) {
    return new ActionRowBuilder().addComponents(one, two, three);
}
function fourButton(one, two, three, four) {
    return new ActionRowBuilder().addComponents(one, two, three, four);
}
function fiveButton(one, two, three, four, five) {
    return new ActionRowBuilder().addComponents(one, two, three, four, five);
}

function blackjackEmbed(amount, text, body, text2, body2, result, user, color, client) {
    if (typeof color == Number) {
        color = 'Yellow';
    }
    return new EmbedBuilder()
        .setAuthor({ name: `${user.displayName} you bet ${amount}$ to play bear jenh`, iconURL: user.displayAvatarURL() })
        .setColor(`${color.toString()}`)
        .addFields(
            { name: `${client.user.displayName} [${text}]`, value: `${body}`, inline: true },
            { name: `${user.displayName} [${text2}]`, value: `${body2}`, inline: true },
        )
        .setFooter({ text: `${result}` })
}

function getCollectionButton(mgs, timeout) {
    return mgs.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: timeout,
    });
}

function cooldown(id, timeout, cdId, cooldowntime, message, cooldowns, prem) {
    if (id == process.env.devId) {
        return false;
    }

    if (timeout.includes(id)) {
        if (cdId.includes(id)) {
            return true;
        }

        cdId.push(id);

        if (prem.includes(id)) {
            const CD = parseInt(cooldowntime / 2);

            const currentTime = new Date();
            const cooldownEnd = new Date(currentTime.getTime() + CD);
            if (currentTime < cooldownEnd) {
                const timeLeft = Math.ceil((cooldownEnd - currentTime) / 1000) - 1;
                message.channel.send({ embeds: [SimpleEmbed(`<@${id}> cooldown **<t:${Math.floor(cooldownEnd.getTime() / 1000)}:R>**`)] })
                    .then(cooldownMessage => {
                        setTimeout(() => {
                            cooldownMessage.delete().catch(console.error);
                            cdId.shift();
                        }, timeLeft * 1000);
                    })
                    .catch(console.error);
                return true;
            }
            return true;
        }

        const cooldownEnd = cooldowns.get(message.guild.id);
        const currentTime = new Date();
        if (currentTime < cooldownEnd) {
            const timeLeft = Math.ceil((cooldownEnd - currentTime) / 1000) - 1;
            message.channel.send({ embeds: [SimpleEmbed(`<@${id}> cooldown **<t:${Math.floor(cooldownEnd.getTime() / 1000)}:R>**`)] })
                .then(cooldownMessage => {
                    setTimeout(() => {
                        cooldownMessage.delete().catch(console.error);
                        cdId.shift();
                    }, timeLeft * 1000);
                })
                .catch(console.error);
            return true;
        }
        return true;

    } else {
        if (prem.includes(id)) {
            const CD = parseInt(cooldowntime / 2);

            const currentTime = new Date();
            const cooldownEnd = new Date(currentTime.getTime() + CD);
            cooldowns.set(message.guild.id, cooldownEnd);
            timeout.push(id);
            setTimeout(() => {
                timeout.shift();
                cdId.shift();
            }, CD - 1000);
            return false;

        } else {
            const currentTime = new Date();
            const cooldownEnd = new Date(currentTime.getTime() + cooldowntime);
            cooldowns.set(message.guild.id, cooldownEnd);
            timeout.push(id);
            setTimeout(() => {
                timeout.shift();
                cdId.shift();
            }, cooldowntime - 1000);
            return false;
        }
    }
}

async function getimageAnimal(animal_iamge, animal_level, animal_M_HP, animal_health, animal_M_SM, animal_SM, player1_name, enemy_image, enemy_level, enemy_M_HP, enemy_health, enemy_M_SM, enemy_SM, player2_name, theme) {

    if (animal_health > animal_M_HP) {
        animal_health = animal_M_HP
    }
    if (enemy_health > enemy_M_HP) {
        enemy_health = enemy_M_HP
    }

    const animal_main_HP = animal_M_HP;
    const animal_main_SM = animal_M_SM;

    const progress_animal_HP = parseInt((animal_health / animal_main_HP) * 100);
    const progress_animal_SM = parseInt((animal_SM / animal_main_SM) * 100);

    const enemy_main_HP = enemy_M_HP;
    const enemy_main_SM = enemy_M_SM;

    const progress_enemy_HP = parseInt((enemy_health / enemy_main_HP) * 100);
    const progress_enemy_SM = parseInt((enemy_SM / enemy_main_SM) * 100);


    const width = 500;
    const height = 200;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    try {
        const background = await loadImage(theme);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    } catch (error) {
        console.log('dragon background image error');
    }

    //check win or lose
    if (enemy_health == 0) {
        ctx.fillStyle = 'Yellow';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(`WIN`, 180, 65);
    } else if (animal_health == 0) {
        ctx.fillStyle = 'Yellow';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(`WIN`, 292, 65);
    }

    //image animal
    const animal_width = 90;
    const animal_height = 90;

    const animal_x = 90;
    const animal_y = 70;

    try {
        const animalImage = await loadImage(animal_iamge);
        ctx.drawImage(animalImage, animal_x, animal_y, animal_width, animal_height);
    } catch (error) {
        console.log('dragon animal image error');
    }

    //option progress bar animal SM
    const animal_SM_progress_width = 200;
    const animal_SM_progress_height = 20;

    const animal_SM_prosition_x = 10;
    const animal_SM_prosition_y = 30;

    // Draw frame [] animal SM
    ctx.strokeStyle = 'White';
    ctx.strokeRect(animal_SM_prosition_x, animal_SM_prosition_y, animal_SM_progress_width, animal_SM_progress_height);

    // Draw progress bar animal SM
    const animal_SM_progressBarWidth = (animal_SM_progress_width - 198.04) * progress_animal_SM;
    ctx.fillStyle = '#0151AB';
    ctx.fillRect(animal_SM_prosition_x + 2, animal_SM_prosition_y + 2, animal_SM_progressBarWidth, animal_SM_progress_height - 4);
    ctx.fillStyle = 'White';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${animal_SM}/${animal_M_SM}`, animal_SM_prosition_x + 10, animal_SM_prosition_y + 15);



    //option progress bar animal HP
    const animal_progress_width = 200;
    const animal_progress_height = 20;

    const animal_prosition_x = 10;
    const animal_prosition_y = 10;

    // Draw frame [] animal HP
    ctx.strokeStyle = 'White';
    ctx.strokeRect(animal_prosition_x, animal_prosition_y, animal_progress_width, animal_progress_height);

    // Draw progress bar animal HP
    const animal_progressBarWidth = (animal_progress_width - 198.04) * progress_animal_HP;
    ctx.fillStyle = '#BD0202';
    ctx.fillRect(animal_prosition_x + 2, animal_prosition_y + 2, animal_progressBarWidth, animal_progress_height - 4);
    ctx.fillStyle = 'White';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${animal_health}/${animal_M_HP}`, animal_prosition_x + 10, animal_prosition_y + 15);

    // Animal name
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`${player1_name}`, 80, 190);

    // Frame [] state animal
    const animal_frame_progress_width = 80;
    const animal_frame_progress_height = 20;

    const animal_frame_box_pos_x = 10;
    const animal_frame_box_pos_y = 50;

    ctx.strokeStyle = 'White';
    ctx.strokeRect(animal_frame_box_pos_x, animal_frame_box_pos_y, animal_frame_progress_width, animal_frame_progress_height);

    //Text level animal
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';

    ctx.fillText(`LEVEL: ${animal_level}`, animal_frame_box_pos_x + 10, animal_frame_box_pos_y + 15);
    //ctx.fillText(`PW: ${animal_PW}`, animal_frame_box_pos_x+150, animal_frame_box_pos_y+15);
    //ctx.fillText(`ITEM `, 115, 115);
    //ctx.fillText(`SKILL ${animal_skill}`, 115, 135);

    //image enemy
    const enemy_width = 95;
    const enemy_height = 90;

    const enemy_x = 310;
    const enemy_y = 70;

    try {
        const enemyImage = await loadImage(enemy_image);
        ctx.drawImage(enemyImage, enemy_x, enemy_y, enemy_width, enemy_height);
    } catch (error) {
        console.log('dragon enemy image error');
    }

    //option progress bar enemy SM
    const enemy_SM_progress_width = 200;
    const enemy_SM_progress_height = 20;

    const enemy_SM_prosition_x = 290;
    const enemy_SM_prosition_y = 30;

    // Draw frame [] enemy SM
    ctx.strokeStyle = 'White';
    ctx.strokeRect(enemy_SM_prosition_x, enemy_SM_prosition_y, enemy_SM_progress_width, enemy_SM_progress_height);

    // Draw progress bar enemy SM
    const enemy_SM_progressBarWidth = (enemy_SM_progress_width - 198.04) * progress_enemy_SM;
    ctx.fillStyle = '#0151AB';
    ctx.fillRect(enemy_SM_prosition_x + 2, enemy_SM_prosition_y + 2, enemy_SM_progressBarWidth, enemy_SM_progress_height - 4);
    ctx.fillStyle = 'White';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${enemy_SM}/${enemy_M_SM}`, enemy_SM_prosition_x + 10, enemy_SM_prosition_y + 15);



    //option progress bar enemy
    const enemy_progress_width = 200;
    const enemy_progress_height = 20;

    const enemy_prosition_x = 290;
    const enemy_prosition_y = 10;

    // Draw frame [] enemy HP
    ctx.strokeStyle = 'White';
    ctx.strokeRect(enemy_prosition_x, enemy_prosition_y, enemy_progress_width, enemy_progress_height);

    // Draw progress bar enemy HP
    const enemy_progressBarWidth = (enemy_progress_width - 198.04) * progress_enemy_HP;
    ctx.fillStyle = '#BD0202';
    ctx.fillRect(enemy_prosition_x + 2, enemy_prosition_y + 2, enemy_progressBarWidth, enemy_progress_height - 4);
    ctx.fillStyle = 'White';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(`${enemy_health}/${enemy_M_HP}`, enemy_prosition_x + 10, enemy_prosition_y + 15);

    // Enemy name
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`${player2_name}`, 320, 190);

    // Frame [] state enemy
    const enemy_frame_progress_width = 80;
    const enemy_frame_progress_height = 20;

    const enemy_frame_box_pos_x = 410;
    const enemy_frame_box_pos_y = 50;

    ctx.strokeStyle = 'White';
    ctx.strokeRect(enemy_frame_box_pos_x, enemy_frame_box_pos_y, enemy_frame_progress_width, enemy_frame_progress_height);

    //Text level animal
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';

    ctx.fillText(`LEVEL: ${enemy_level}`, enemy_frame_box_pos_x + 10, enemy_frame_box_pos_y + 15);
    //ctx.fillText(`PW: ${enemy_PW}`, 395, 95);
    //ctx.fillText(`ITEM `, 395, 115);
    //ctx.fillText(`SKILL ${enemy_skill}`, 395, 135);

    return canvas.toBuffer();
}

async function getSatImage(sat1, sat2, sat3, ene1, ene2, ene3, streak, ene_streak, userid, oppoid) {
    if (sat1.hp < 0) {
        sat1.hp = 0;
    }
    if (sat1.left_hp > sat1.main_hp) {
        sat1.left_hp = sat1.main_hp;
    }
    if (sat1.wp < 0) {
        sat1.wp = 0;
    }
    if (sat1.left_wp > sat1.main_wp) {
        sat1.left_wp = sat1.main_wp;
    }

    if (sat2.hp < 0) {
        sat2.hp = 0;
    }
    if (sat2.left_hp > sat2.main_hp) {
        sat2.left_hp = sat2.main_hp;
    }
    if (sat2.wp < 0) {
        sat2.wp = 0;
    }
    if (sat2.left_wp > sat2.main_wp) {
        sat2.left_wp = sat2.main_wp;
    }

    if (sat3.hp < 0) {
        sat3.hp = 0;
    }
    if (sat3.left_hp > sat3.main_hp) {
        sat3.left_hp = sat3.main_hp;
    }
    if (sat3.wp < 0) {
        sat3.wp = 0;
    }
    if (sat3.left_wp > sat3.main_wp) {
        sat3.left_wp = sat3.main_wp;
    }

    if (ene1.hp < 0) {
        ene1.hp = 0;
    }
    if (ene1.left_hp > ene1.main_hp) {
        ene1.left_hp = ene1.main_hp;
    }
    if (ene1.wp < 0) {
        ene1.wp = 0;
    }
    if (ene1.left_wp > ene1.main_wp) {
        ene1.left_wp = ene1.main_wp;
    }

    if (ene2.hp < 0) {
        ene2.hp = 0;
    }
    if (ene2.left_hp > ene2.main_hp) {
        ene2.left_hp = ene2.main_hp;
    }
    if (ene2.wp < 0) {
        ene2.wp = 0;
    }
    if (ene2.left_wp > ene2.main_wp) {
        ene2.left_wp = ene2.main_wp;
    }

    if (ene3.hp < 0) {
        ene3.hp = 0;
    }
    if (ene3.left_hp > ene3.main_hp) {
        ene3.left_hp = ene3.main_hp;
    }
    if (ene3.wp < 0) {
        ene3.wp = 0;
    }
    if (ene3.left_wp > ene3.main_wp) {
        ene3.left_wp = ene3.main_wp;
    }

    let sat1_hp_increase = 0;
    let sat1_hp = sat1.hp;
    let sat1_hp_left = sat1.left_hp;
    if (sat1.hp > sat1.main_hp) {
        sat1_hp_increase = sat1.hp - sat1.main_hp;
        sat1_hp = sat1.main_hp;
        sat1_hp_left = sat1.main_hp;
        if (sat1_hp_increase > sat1.main_hp) {
            sat1_hp_increase = sat1.main_hp;
        }
    }
    if (sat1.wp > sat1.main_wp) {
        sat1.main_wp = sat1.wp;
    }

    let sat2_hp_increase = 0;
    let sat2_hp = sat2.hp;
    let sat2_hp_left = sat2.left_hp;
    if (sat2.hp > sat2.main_hp) {
        sat2_hp_increase = sat2.hp - sat2.main_hp;
        sat2_hp = sat2.main_hp;
        sat2_hp_left = sat2.main_hp;
        if (sat2_hp_increase > sat2.main_hp) {
            sat2_hp_increase = sat2.main_hp;
        }
    }
    if (sat2.wp > sat2.main_wp) {
        sat2.main_wp = sat2.wp;
    }

    let sat3_hp_increase = 0;
    let sat3_hp = sat3.hp;
    let sat3_hp_left = sat3.left_hp;
    if (sat3.hp > sat3.main_hp) {
        sat3_hp_increase = sat3.hp - sat3.main_hp;
        sat3_hp = sat3.main_hp;
        sat3_hp_left = sat3.main_hp;
        if (sat3_hp_increase > sat3.main_hp) {
            sat3_hp_increase = sat3.main_hp;
        }
    }
    if (sat3.wp > sat3.main_wp) {
        sat3.main_wp = sat3.wp;
    }

    let ene1_hp_increase = 0;
    let ene1_hp = ene1.hp;
    let ene1_hp_left = ene1.left_hp;
    if (ene1.hp > ene1.main_hp) {
        ene1_hp_increase = ene1.hp - ene1.main_hp;
        ene1_hp = ene1.main_hp;
        ene1_hp_left = ene1.main_hp;
        if (ene1_hp_increase > ene1.main_hp) {
            ene1_hp_increase = ene1.main_hp;
        }
    }
    if (ene1.wp > ene1.main_wp) {
        ene1.main_wp = ene1.wp;
    }

    let ene2_hp_increase = 0;
    let ene2_hp = ene2.hp;
    let ene2_hp_left = ene2.left_hp;
    if (ene2.hp > ene2.main_hp) {
        ene2_hp_increase = ene2.hp - ene2.main_hp;
        ene2_hp = ene2.main_hp;
        ene2_hp_left = ene2.main_hp;
        if (ene2_hp_increase > ene2.main_hp) {
            ene2_hp_increase = ene2.main_hp;
        }
    }
    if (ene2.wp > ene2.main_wp) {
        ene2.main_wp = ene2.wp;
    }

    let ene3_hp_increase = 0;
    let ene3_hp = ene3.hp;
    let ene3_hp_left = ene3.left_hp;
    if (ene3.hp > ene3.main_hp) {
        ene3_hp_increase = ene3.hp - ene3.main_hp;
        ene3_hp = ene3.main_hp;
        ene3_hp_left = ene3.main_hp;
        if (ene3_hp_increase > ene3.main_hp) {
            ene3_hp_increase = ene3.main_hp;
        }
    }
    if (ene3.wp > ene3.main_wp) {
        ene3.main_wp = ene3.wp;
    }

    const width = 456;
    const height = 231;
    const PG_width = 133;
    const PG_height = 14;
    const PG_color_hp = '#ae443f';
    const PG_color_hp_increase = '#5cbb62';
    const PG_color_hp_increase_left = '#7a8a53';
    const PG_color_sm = '#5b75a4';
    const PG_bar_left = '#696b6e';
    const ImageWH = 64;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    let allSatColor = '#ffffff';
    let allEneColor = '#ffffff';

    ////FONT
    ctx.font = "10px Arial";
    ctx.fillStyle = '#ffffff';

    //// BACKGROUND
    let background_image = gif.frame_battle;

    const match_sat1 = sat1.rank.match(/^(\d+)_/);
    const sat1_rank_id = parseInt(match_sat1[1]);
    const match_sat2 = sat2.rank.match(/^(\d+)_/);
    const sat2_rank_id = parseInt(match_sat2[1]);
    const match_sat3 = sat3.rank.match(/^(\d+)_/);
    const sat3_rank_id = parseInt(match_sat3[1]);

    const match_ene1 = ene1.rank.match(/^(\d+)_/);
    const ene1_rank_id = parseInt(match_ene1[1]);
    const match_ene2 = ene2.rank.match(/^(\d+)_/);
    const ene2_rank_id = parseInt(match_ene2[1]);
    const match_ene3 = ene3.rank.match(/^(\d+)_/);
    const ene3_rank_id = parseInt(match_ene3[1]);


    if (sat1_rank_id == 27 || ene1_rank_id == 27) {
        background_image = gif.frame_sololeveling;
    } else if (sat2_rank_id == 27 || ene2_rank_id == 27) {
        background_image = gif.frame_sololeveling;
    } else if (sat3_rank_id == 27 || ene3_rank_id == 27) {
        background_image = gif.frame_sololeveling;
    }

    else if (sat1_rank_id == 16 || ene1_rank_id == 16) {
        background_image = gif.frame_battle_op;
    } else if (sat2_rank_id == 16 || ene2_rank_id == 16) {
        background_image = gif.frame_battle_op;
    } else if (sat3_rank_id == 16 || ene3_rank_id == 16) {
        background_image = gif.frame_battle_op;
    }

    else if (sat1_rank_id == 21 || ene1_rank_id == 21) {
        background_image = gif.frame_battle_naruto;
    } else if (sat2_rank_id == 21 || ene2_rank_id == 21) {
        background_image = gif.frame_battle_naruto;
    } else if (sat3_rank_id == 21 || ene3_rank_id == 21) {
        background_image = gif.frame_battle_naruto;
    }

    else if (sat1_rank_id == 15 || ene1_rank_id == 15) {
        background_image = gif.frame_battle_jjk;
    } else if (sat2_rank_id == 15 || ene2_rank_id == 15) {
        background_image = gif.frame_battle_jjk;
    } else if (sat3_rank_id == 15 || ene3_rank_id == 15) {
        background_image = gif.frame_battle_jjk;
    }

    else if (sat1_rank_id == 24 || ene1_rank_id == 24) {
        background_image = gif.frame_battle_kof;
    } else if (sat2_rank_id == 24 || ene2_rank_id == 24) {
        background_image = gif.frame_battle_kof;
    } else if (sat3_rank_id == 24 || ene3_rank_id == 24) {
        background_image = gif.frame_battle_kof;
    }


    if (streak >= 20000 || ene_streak >= 20000) {
        background_image = gif.frame_battle20;
    } else if (streak >= 10000 || ene_streak >= 10000) {
        background_image = gif.frame_battle10;
    } else if (streak >= 9000 || ene_streak >= 9000) {
        if (streak >= 9500 || ene_streak >= 9500) {
            background_image = gif.frame_battle9_2;
        } else {
            background_image = gif.frame_battle9;
        }
    } else if (streak >= 8000 || ene_streak >= 8000) {
        if (streak >= 8500 || ene_streak >= 8500) {
            background_image = gif.frame_battle8_2;
        } else {
            background_image = gif.frame_battle8;
        }
    } else if (streak >= 7000 || ene_streak >= 7000) {
        if (streak >= 7500 || ene_streak >= 7500) {
            background_image = gif.frame_battle7_2;
        } else {
            background_image = gif.frame_battle7;
        }
    } else if (streak >= 6000 || ene_streak >= 6000) {
        if (streak >= 6500 || ene_streak >= 6500) {
            background_image = gif.frame_battle6_2;
        } else {
            background_image = gif.frame_battle6;
        }
    } else if (streak >= 5000 || ene_streak >= 5000) {
        if (streak >= 5500 || ene_streak >= 5500) {
            background_image = gif.frame_battle5_2;
        } else {
            background_image = gif.frame_battle5;
        }
    } else if (streak >= 4000 || ene_streak >= 4000) {
        if (streak >= 4500 || ene_streak >= 4500) {
            background_image = gif.frame_battle4_2;
        } else {
            background_image = gif.frame_battle4;
        }
    } else if (streak >= 3000 || ene_streak >= 3000) {
        if (streak >= 3500 || ene_streak >= 3500) {
            background_image = gif.frame_battle3_2;
        } else {
            background_image = gif.frame_battle3;
        }
    } else if (streak >= 2000 || ene_streak >= 2000) {
        if (streak >= 2500 || ene_streak >= 2500) {
            background_image = gif.frame_battle2_2;
        } else {
            background_image = gif.frame_battle2;
        }
    } else if (streak >= 1000 || ene_streak >= 1000) {
        background_image = gif.frame_battle1;
    }

    if (userid == '1208244808888487939' || oppoid == '1208244808888487939' || userid == '1136945370459553872' || oppoid == '1136945370459553872') {
        background_image = gif.frame_linn;
    }

    const background = await loadImage(background_image);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    //// SAT
    //SAT ONE
    let a1_slash = '';
    let a1_TJ = '';
    if (sat1.bool) { a1_slash = '/'; a1_TJ = '%'; };
    if (sat1.hp == 0) { ctx.globalAlpha = 0.5; }

    try {
        const animalImage1 = await loadImage(sat1.png);
        ctx.drawImage(animalImage1, 7, 7, ImageWH, ImageWH);
    } catch (error) {
        console.log(`error image sat1 ${sat1.png}`);
    }

    //SAT ONE NAME
    ctx.fillStyle = allSatColor;
    ctx.textAlign = 'right';
    ctx.fillText(`${sat1.name}`, 205, 40);
    ctx.textAlign = 'left';
    //SAT ONE LEVEL
    ctx.fillText(`${sat1.lvl}`, 75, 40);

    //Progress bar sat one hp left
    const sat1_hp_pg_left = parseInt((sat1_hp_left / sat1.main_hp) * 100);
    const sat1_PG_HP_left = (PG_width - 131.67) * sat1_hp_pg_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(72, 7, sat1_PG_HP_left, PG_height - 4);
    //Progress bar sat one hp
    const sat1_hp_pg = parseInt((sat1_hp / sat1.main_hp) * 100);
    const sat1_PG_HP = (PG_width - 131.67) * sat1_hp_pg;
    ctx.fillStyle = PG_color_hp;
    ctx.fillRect(72, 7, sat1_PG_HP, PG_height - 4);
    //Progress bar sat one hp increase
    const sat1_hp_pg_increase = parseInt((sat1_hp_increase / sat1.main_hp) * 100);
    const sat1_PG_HP_increase = (PG_width - 131.67) * sat1_hp_pg_increase;
    ctx.fillStyle = PG_color_hp_increase;
    ctx.fillRect(72, 7, sat1_PG_HP_increase, PG_height - 4);
    //Progress bat sat one text hp
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat1.hp}${a1_slash}${sat1.main_hp}`, 73, 15.5);

    //Progress bar sat one sm left
    const sat1_sm_pg_left = parseInt((sat1.wp / sat1.left_wp) * 100);
    const sat1_PG_sm_left = (PG_width - 131.67) * sat1_sm_pg_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(72, 18, sat1_PG_sm_left, PG_height - 4);
    //Progress bar sat one sm
    const sat1_sm_pg = parseInt((sat1.wp / sat1.main_wp) * 100);
    const sat1_PG_SM = (PG_width - 131.67) * sat1_sm_pg;
    ctx.fillStyle = PG_color_sm;
    ctx.fillRect(72, 18, sat1_PG_SM, PG_height - 4);
    //Progress bat sat one text sm
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat1.wp}${a1_slash}${sat1.main_wp}`, 73, 26.5);
    //STATE
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat1.str}`, 115, 48); //STR
    ctx.fillText(`${sat1.mag}`, 115, 56); //MAG
    ctx.fillText(`${sat1.pr}${a1_TJ}`, 115, 64); //PR
    ctx.fillText(`${sat1.mr}${a1_TJ}`, 115, 72); //MR
    //WEAPON
    try {
        const sat1_weapon = await loadImage(sat1.weapon);
        ctx.drawImage(sat1_weapon, 75, 42, 32, 32);
    } catch (error) {
        console.log(`error image sat1 ${sat1.weapon}`);
    }
    //RANK
    try {
        if (sat1.rank) {
            const match_sat1 = sat1.rank.match(/^(\d+)_/);
            const sat1_rank_id = parseInt(match_sat1[1]);
            if (sat1_rank_id > 14 && sat1_rank_id != 26) {
                const emoji = gif[`animal_rank_${sat1_rank_id}`].match(/^<:(\w+):(\d+)>$/);
                const emojiID = emoji[2];

                const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
                const sat1_rank = await loadImage(emojiURL);
                ctx.drawImage(sat1_rank, 180, 49, 25, 25);
            }
        }
    } catch (error) { console.log(`error rank sat1: ${error}`); }
    //POISON
    try {
        if (sat1.poison_bool && sat1.poison_round > 0) {
            const emoji = gif.poison_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const sat1_poison = await loadImage(emojiURL);
            ctx.drawImage(sat1_poison, 135, 40, 16, 16);
        }
    } catch (error) { console.log(`error poison sat1: ${error}`); }
    //DEFEND UP
    try {
        if (sat1.defend_up_bool && sat1.defend_up_round > 0) {
            const emoji = gif.defend_up_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const sat1_poison = await loadImage(emojiURL);
            ctx.drawImage(sat1_poison, 151, 40, 16, 16);
        }
    } catch (error) { console.log(`error defend up sat1: ${error}`); }
    if (sat1.hp == 0) { ctx.globalAlpha = 1; }

    //SAT TWO
    let a2_slash = '';
    let a2_TJ = '';
    if (sat2.bool) { a2_slash = '/'; a2_TJ = '%'; };
    if (sat2.hp == 0) { ctx.globalAlpha = 0.5; }
    try {
        const animalImage2 = await loadImage(sat2.png);
        ctx.drawImage(animalImage2, 7, 84, ImageWH, ImageWH);
    } catch (error) {
        console.log(`error image sat2 ${sat2.png}`);
    }

    //SAT TWO NAME
    ctx.fillStyle = allSatColor;
    ctx.textAlign = 'right';
    ctx.fillText(`${sat2.name}`, 205, 117);
    ctx.textAlign = 'left';
    //SAT TWO LEVEL
    ctx.fillText(`${sat2.lvl}`, 75, 117);
    //Progress bar sat two hp left
    const sat2_hp_pg_left = parseInt((sat2_hp_left / sat2.main_hp) * 100);
    const sat2_PG_HP_left = (PG_width - 131.67) * sat2_hp_pg_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(72, 84, sat2_PG_HP_left, PG_height - 4);
    //Progress bar sat two hp
    const sat2_hp_pg = parseInt((sat2_hp / sat2.main_hp) * 100);
    const sat2_PG_HP = (PG_width - 131.67) * sat2_hp_pg;
    ctx.fillStyle = PG_color_hp;
    ctx.fillRect(72, 84, sat2_PG_HP, PG_height - 4);
    //Progress bar sat two hp increase
    const sat2_hp_pg_increase = parseInt((sat2_hp_increase / sat2.main_hp) * 100);
    const sat2_PG_HP_increase = (PG_width - 131.67) * sat2_hp_pg_increase;
    ctx.fillStyle = PG_color_hp_increase;
    ctx.fillRect(72, 84, sat2_PG_HP_increase, PG_height - 4);
    //Progress bat sat one text hp
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat2.hp}${a2_slash}${sat2.main_hp}`, 73, 92.5);

    //Progress bar sat one sm left
    const sat2_sm_pg_left = parseInt((sat2.wp / sat2.left_wp) * 100);
    const sat2_PG_sm_left = (PG_width - 131.67) * sat2_sm_pg_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(72, 95, sat2_PG_sm_left, PG_height - 4);
    //Progress bar sat two sm
    const sat2_wp_pg = parseInt((sat2.wp / sat2.main_wp) * 100);
    const sat2_PG_SM = (PG_width - 131.67) * sat2_wp_pg;
    ctx.fillStyle = PG_color_sm;
    ctx.fillRect(72, 95, sat2_PG_SM, PG_height - 4);
    //Progress bat sat one text sm
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat2.wp}${a2_slash}${sat2.main_wp}`, 73, 103.5);
    //STATE
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat2.str}`, 115, 125); //STR
    ctx.fillText(`${sat2.mag}`, 115, 133); //MAG
    ctx.fillText(`${sat2.pr}${a2_TJ}`, 115, 141); //PR
    ctx.fillText(`${sat2.mr}${a2_TJ}`, 115, 149); //MR
    //WEAPON
    try {
        const sat2_weapon = await loadImage(sat2.weapon);
        ctx.drawImage(sat2_weapon, 75, 119, 32, 32);
    } catch (error) {
        console.log(`error image sat2 ${sat2.weapon}`);
    }
    //RANK
    try {
        if (sat2.rank) {
            const match_sat2 = sat2.rank.match(/^(\d+)_/);
            const sat2_rank_id = parseInt(match_sat2[1]);
            if (sat2_rank_id > 14 && sat2_rank_id != 26) {
                const emoji = gif[`animal_rank_${sat2_rank_id}`].match(/^<:(\w+):(\d+)>$/);
                const emojiID = emoji[2];

                const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
                const sat2_rank = await loadImage(emojiURL);
                ctx.drawImage(sat2_rank, 180, 126, 25, 25);
            }
        }
    } catch (error) { console.log(`error rank sat2: ${error}`); }
    //POISON
    try {
        if (sat2.poison_bool && sat2.poison_round > 0) {
            const emoji = gif.poison_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const sat2_poison = await loadImage(emojiURL);
            ctx.drawImage(sat2_poison, 135, 117, 16, 16);
        }
    } catch (error) { console.log(`error poison sat2: ${error}`); }
    //DEFEND UP
    try {
        if (sat2.defend_up_bool && sat2.defend_up_round > 0) {
            const emoji = gif.defend_up_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const sat2_poison = await loadImage(emojiURL);
            ctx.drawImage(sat2_poison, 151, 117, 16, 16);
        }
    } catch (error) { console.log(`error defend up sat2: ${error}`); }
    if (sat2.hp == 0) { ctx.globalAlpha = 1; }

    //SAT THREE
    let a3_slash = '';
    let a3_TJ = '';
    if (sat3.bool) { a3_slash = '/'; a3_TJ = '%'; };
    if (sat3.hp == 0) { ctx.globalAlpha = 0.5; }
    try {
        const animalImage3 = await loadImage(sat3.png);
        ctx.drawImage(animalImage3, 7, 161, ImageWH, ImageWH);
    } catch (error) {
        console.log(`error image sat3 ${sat3.png}`);
    }

    //SAT THREE NAME
    ctx.fillStyle = allSatColor;
    ctx.textAlign = 'right';
    ctx.fillText(`${sat3.name}`, 205, 194);
    ctx.textAlign = 'left';
    //SAT THREE LEVEL
    ctx.fillText(`${sat3.lvl}`, 75, 194);
    //Progress bar sat two hp left
    const sat3_hp_pg_left = parseInt((sat3_hp_left / sat3.main_hp) * 100);
    const sat3_PG_HP_left = (PG_width - 131.67) * sat3_hp_pg_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(72, 161, sat3_PG_HP_left, PG_height - 4);
    //Progress bar sat three hp
    const sat3_hp_pg = parseInt((sat3_hp / sat3.main_hp) * 100);
    const sat3_PG_HP = (PG_width - 131.67) * sat3_hp_pg;
    ctx.fillStyle = PG_color_hp;
    ctx.fillRect(72, 161, sat3_PG_HP, PG_height - 4);
    //Progress bar sat three hp increase
    const sat3_hp_pg_increase = parseInt((sat3_hp_increase / sat3.main_hp) * 100);
    const sat3_PG_HP_increase = (PG_width - 131.67) * sat3_hp_pg_increase;
    ctx.fillStyle = PG_color_hp_increase;
    ctx.fillRect(72, 161, sat3_PG_HP_increase, PG_height - 4);
    //Progress bat sat one text hp
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat3.hp}${a3_slash}${sat3.main_hp}`, 73, 169.5);

    //Progress bar sat one sm left
    const sat3_sm_pg_left = parseInt((sat3.wp / sat3.left_wp) * 100);
    const sat3_PG_sm_left = (PG_width - 131.67) * sat3_sm_pg_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(72, 172, sat3_PG_sm_left, PG_height - 4);
    //Progress bar sat three sm
    const sat3_wp_pg = parseInt((sat3.wp / sat3.main_wp) * 100);
    const sat3_PG_SM = (PG_width - 131.67) * sat3_wp_pg;
    ctx.fillStyle = PG_color_sm;
    ctx.fillRect(72, 172, sat3_PG_SM, PG_height - 4);
    //Progress bat sat one text sm
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat3.wp}${a3_slash}${sat3.main_wp}`, 73, 180.5);
    //STATE
    ctx.fillStyle = allSatColor;
    ctx.fillText(`${sat3.str}`, 115, 202); //STR
    ctx.fillText(`${sat3.mag}`, 115, 210); //MAG
    ctx.fillText(`${sat3.pr}${a3_TJ}`, 115, 218); //PR
    ctx.fillText(`${sat3.mr}${a3_TJ}`, 115, 226); //MR
    //WEAPON
    try {
        const sat3_weapon = await loadImage(sat3.weapon);
        ctx.drawImage(sat3_weapon, 75, 196, 32, 32);
    } catch (error) {
        console.log(`error image sat3 ${sat3.weapon}`);
    }
    //RANK
    try {
        if (sat3.rank) {
            const match_sat3 = sat3.rank.match(/^(\d+)_/);
            const sat3_rank_id = parseInt(match_sat3[1]);
            if (sat3_rank_id > 14 && sat3_rank_id != 26) {
                const emoji = gif[`animal_rank_${sat3_rank_id}`].match(/^<:(\w+):(\d+)>$/);
                const emojiID = emoji[2];

                const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
                const sat3_rank = await loadImage(emojiURL);
                ctx.drawImage(sat3_rank, 180, 203, 25, 25);
            }
        }
    } catch (error) { console.log(`error rank sat2: ${error}`); }
    //POISON
    try {
        if (sat3.poison_bool && sat3.poison_round > 0) {
            const emoji = gif.poison_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const sat3_poison = await loadImage(emojiURL);
            ctx.drawImage(sat3_poison, 135, 194, 16, 16);
        }
    } catch (error) { console.log(`error poison sat3: ${error}`); }
    //DEFEND UP
    try {
        if (sat3.defend_up_bool && sat3.defend_up_round > 0) {
            const emoji = gif.defend_up_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const sat3_poison = await loadImage(emojiURL);
            ctx.drawImage(sat3_poison, 151, 194, 16, 16);
        }
    } catch (error) { console.log(`error defend up sat3: ${error}`); }
    if (sat3.hp == 0) { ctx.globalAlpha = 1; }

    //// ENEMY
    //ENEMY ONE
    let e1_slash = '';
    let e1_TJ = '';
    if (ene1.bool) { e1_slash = '/'; e1_TJ = '%'; };
    if (ene1.hp == 0) { ctx.globalAlpha = 0.5; }
    ctx.fillStyle = allEneColor;
    try {
        const eenmyImage1 = await loadImage(ene1.png);
        ctx.drawImage(eenmyImage1, 385, 7, ImageWH, ImageWH);
    } catch (error) {
        console.log(`error image ene1 ${ene1.png}`);
    }

    //ENEMY ONE NAME
    ctx.fillText(`${ene1.name}`, 251, 40);
    //ENEMY ONE LEVEL
    ctx.textAlign = 'right';
    ctx.fillText(`${ene1.lvl}`, 382, 40);
    ctx.textAlign = 'left';
    //Progress bar ene one hp left
    const ene1_hp_pg_left = parseInt((ene1_hp_left / ene1.main_hp) * 100);
    const ene1_PG_HP_left = (PG_width - 131.67) * ene1_hp_pg_left;
    const e1_fillStartHP_left = 251 + PG_width - ene1_PG_HP_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(e1_fillStartHP_left, 7, ene1_PG_HP_left, PG_height - 4);
    //Progress bar ene one hp
    const ene1_hp_pg = parseInt((ene1_hp / ene1.main_hp) * 100);
    const ene1_PG_HP = (PG_width - 131.67) * ene1_hp_pg;
    const e1_fillStartHP = 251 + PG_width - ene1_PG_HP;
    ctx.fillStyle = PG_color_hp;
    ctx.fillRect(e1_fillStartHP, 7, ene1_PG_HP, PG_height - 4);

    //Progress bar ene one hp increase
    const ene1_hp_pg_increase = parseInt((ene1_hp_increase / ene1.main_hp) * 100);
    const ene1_PG_HP_increase = (PG_width - 131.67) * ene1_hp_pg_increase;
    const e1_fillStartHP__increase = 251 + PG_width - ene1_PG_HP_increase;
    ctx.fillStyle = PG_color_hp_increase;
    ctx.fillRect(e1_fillStartHP__increase, 7, ene1_PG_HP_increase, PG_height - 4);

    //Progress bat ene one text hp
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene1.hp}${e1_slash}${ene1.main_hp}`, 384, 15.5);
    ctx.textAlign = 'left';

    //Progress bar ene one sm left
    const ene1_wp_pg_left = parseInt((ene1.wp / ene1.left_wp) * 100);
    const ene1_PG_wp_left = (PG_width - 131.67) * ene1_wp_pg_left;
    const e1_fillStartSM_left = 251 + PG_width - ene1_PG_wp_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(e1_fillStartSM_left, 18, ene1_PG_wp_left, PG_height - 4);

    //Progress bar ene one sm
    const ene1_wp_pg = parseInt((ene1.wp / ene1.main_wp) * 100);
    const ene1_PG_SM = (PG_width - 131.67) * ene1_wp_pg;
    const e1_fillStartSM = 251 + PG_width - ene1_PG_SM;
    ctx.fillStyle = PG_color_sm;
    ctx.fillRect(e1_fillStartSM, 18, ene1_PG_SM, PG_height - 4);
    //Progress bat ene one text sm
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene1.wp}${e1_slash}${ene1.main_wp}`, 384, 26.5);
    ctx.textAlign = 'left';
    //STATE
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene1.str}`, 342, 48); //STR
    ctx.fillText(`${ene1.mag}`, 342, 56); //MAG
    ctx.fillText(`${ene1.pr}${e1_TJ}`, 342, 64); //PR
    ctx.fillText(`${ene1.mr}${e1_TJ}`, 342, 72); //MR
    ctx.textAlign = 'left';
    //WEAPON
    try {
        const ene1_weapon = await loadImage(ene1.weapon);
        ctx.drawImage(ene1_weapon, 352, 42, 32, 32);
    } catch (error) {
        console.log(`error image ene1 ${ene1.weapon}`);
    }
    //RANK
    try {
        if (ene1.rank) {
            const match_ene1 = ene1.rank.match(/^(\d+)_/);
            const ene1_rank_id = parseInt(match_ene1[1]);
            if (ene1_rank_id > 14 && ene1_rank_id != 26) {
                const emoji = gif[`animal_rank_${ene1_rank_id}`].match(/^<:(\w+):(\d+)>$/);
                const emojiID = emoji[2];

                const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
                const ene1_rank = await loadImage(emojiURL);
                ctx.drawImage(ene1_rank, 251, 49, 25, 25);
            }
        }
    } catch (error) { console.log(`error rank ene1: ${error}`); }
    //POISON
    try {
        if (ene1.poison_bool && ene1.poison_round > 0) {
            const emoji = gif.poison_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const ene1_poison = await loadImage(emojiURL);
            ctx.drawImage(ene1_poison, 307, 40, 16, 16);
        }
    } catch (error) { console.log(`error poison ene1: ${error}`); }
    //DEFEND UP
    try {
        if (ene1.defend_up_bool && ene1.defend_up_round > 0) {
            const emoji = gif.defend_up_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const ene1_poison = await loadImage(emojiURL);
            ctx.drawImage(ene1_poison, 290, 40, 16, 16);
        }
    } catch (error) { console.log(`error defend up ene1: ${error}`); }
    if (ene1.hp == 0) { ctx.globalAlpha = 1; }
    //ENEMY TWO
    let e2_slash = '';
    let e2_TJ = '';
    if (ene2.bool) { e2_slash = '/'; e2_TJ = '%'; };
    if (ene2.hp == 0) { ctx.globalAlpha = 0.5; }
    try {
        const eenmyImage2 = await loadImage(ene2.png);
        ctx.drawImage(eenmyImage2, 385, 84, ImageWH, ImageWH);
    } catch (error) {
        console.log(`error image ene2 ${ene2.png}`);
    }

    //ENEMY TWO NAME
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene2.name}`, 251, 117);
    //ENEMY TWO LEVEL
    ctx.textAlign = 'right';
    ctx.fillText(`${ene2.lvl}`, 382, 117);
    ctx.textAlign = 'left';
    //Progress bar ene two hp left
    const ene2_hp_pg_left = parseInt((ene2_hp_left / ene2.main_hp) * 100);
    const ene2_PG_HP_left = (PG_width - 131.67) * ene2_hp_pg_left;
    const e2_fillStartHP_left = 251 + PG_width - ene2_PG_HP_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(e2_fillStartHP_left, 84, ene2_PG_HP_left, PG_height - 4);
    //Progress bar sat two hp
    const ene2_hp_pg = parseInt((ene2_hp / ene2.main_hp) * 100);
    const ene2_PG_HP = (PG_width - 131.67) * ene2_hp_pg;
    const e2_fillStartHP = 251 + PG_width - ene2_PG_HP;
    ctx.fillStyle = PG_color_hp;
    ctx.fillRect(e2_fillStartHP, 84, ene2_PG_HP, PG_height - 4);

    //Progress bar ene two hp increase
    const ene2_hp_pg_increase = parseInt((ene2_hp_increase / ene2.main_hp) * 100);
    const ene2_PG_HP_increase = (PG_width - 131.67) * ene2_hp_pg_increase;
    const e2_fillStartHP__increase = 251 + PG_width - ene2_PG_HP_increase;
    ctx.fillStyle = PG_color_hp_increase;
    ctx.fillRect(e2_fillStartHP__increase, 84, ene2_PG_HP_increase, PG_height - 4);

    //Progress bat ene two text hp
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene2.hp}${e2_slash}${ene2.main_hp}`, 384, 92.5);
    ctx.textAlign = 'left';

    //Progress bar ene two sm left
    const ene2_wp_pg_left = parseInt((ene2.wp / ene2.left_wp) * 100);
    const ene2_PG_wp_left = (PG_width - 131.67) * ene2_wp_pg_left;
    const e2_fillStartSM_left = 251 + PG_width - ene2_PG_wp_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(e2_fillStartSM_left, 95, ene2_PG_wp_left, PG_height - 4);

    //Progress bar sat two sm
    const ene2_wp_pg = parseInt((ene2.wp / ene2.main_wp) * 100);
    const ene2_PG_SM = (PG_width - 131.67) * ene2_wp_pg;
    const e2_fillStartSM = 251 + PG_width - ene2_PG_SM;
    ctx.fillStyle = PG_color_sm;
    ctx.fillRect(e2_fillStartSM, 95, ene2_PG_SM, PG_height - 4);
    //Progress bat ene two text sm
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene2.wp}${e2_slash}${ene2.main_wp}`, 384, 103.5);
    ctx.textAlign = 'left';
    //STATE
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene2.str}`, 342, 125); //STR
    ctx.fillText(`${ene2.mag}`, 342, 133); //MAG
    ctx.fillText(`${ene2.pr}${e2_TJ}`, 342, 141); //PR
    ctx.fillText(`${ene2.mr}${e2_TJ}`, 342, 149); //MR
    ctx.textAlign = 'left';
    //WEAPON
    try {
        const ene2_weapon = await loadImage(ene2.weapon);
        ctx.drawImage(ene2_weapon, 352, 119, 32, 32);
    } catch (error) {
        console.log(`error image ene2 ${ene2.weapon}`);
    }
    //RANK
    try {
        if (ene2.rank) {
            const match_ene2 = ene2.rank.match(/^(\d+)_/);
            const ene2_rank_id = parseInt(match_ene2[1]);
            if (ene2_rank_id > 14 && ene2_rank_id != 26) {
                const emoji = gif[`animal_rank_${ene2_rank_id}`].match(/^<:(\w+):(\d+)>$/);
                const emojiID = emoji[2];

                const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
                const ene2_rank = await loadImage(emojiURL);
                ctx.drawImage(ene2_rank, 251, 126, 25, 25);
            }
        }
    } catch (error) { console.log(`error rank ene2: ${error}`); }
    //POISON
    try {
        if (ene2.poison_bool && ene2.poison_round > 0) {
            const emoji = gif.poison_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const ene2_poison = await loadImage(emojiURL);
            ctx.drawImage(ene2_poison, 307, 117, 16, 16);
        }
    } catch (error) { console.log(`error poison ene2: ${error}`); }
    //DEFEND UP
    try {
        if (ene2.defend_up_bool && ene2.defend_up_round > 0) {
            const emoji = gif.defend_up_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const ene2_poison = await loadImage(emojiURL);
            ctx.drawImage(ene2_poison, 290, 117, 16, 16);
        }
    } catch (error) { console.log(`error defend up ene2: ${error}`); }
    if (ene2.hp == 0) { ctx.globalAlpha = 1; }

    //ENEMY THREE
    let e3_slash = '';
    let e3_TJ = '';
    if (ene3.bool) { e3_slash = '/'; e3_TJ = '%'; };
    if (ene3.hp == 0) { ctx.globalAlpha = 0.5; }
    try {
        const eenmyImage3 = await loadImage(ene3.png);
        ctx.drawImage(eenmyImage3, 385, 161, ImageWH, ImageWH);
    } catch (error) {
        console.log(`error image ene3 ${ene3.png}`);
    }

    //ENEMY THREE NAME
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene3.name}`, 251, 192);
    //ENEMY THREE LEVEL
    ctx.textAlign = 'right';
    ctx.fillText(`${ene3.lvl}`, 382, 192);
    ctx.textAlign = 'left';
    //Progress bar ene three hp left
    const ene3_hp_pg_left = parseInt((ene3_hp_left / ene3.main_hp) * 100);
    const ene3_PG_HP_left = (PG_width - 131.67) * ene3_hp_pg_left;
    const e3_fillStartHP_left = 251 + PG_width - ene3_PG_HP_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(e3_fillStartHP_left, 161, ene3_PG_HP_left, PG_height - 4);
    //Progress bar sat three hp
    const ene3_hp_pg = parseInt((ene3_hp / ene3.main_hp) * 100);
    const ene3_PG_HP = (PG_width - 131.67) * ene3_hp_pg;
    const e3_fillStartHP = 251 + PG_width - ene3_PG_HP;
    ctx.fillStyle = PG_color_hp;
    ctx.fillRect(e3_fillStartHP, 161, ene3_PG_HP, PG_height - 4);

    //Progress bar ene three hp increase
    const ene3_hp_pg_increase = parseInt((ene3_hp_increase / ene3.main_hp) * 100);
    const ene3_PG_HP_increase = (PG_width - 131.67) * ene3_hp_pg_increase;
    const e3_fillStartHP__increase = 251 + PG_width - ene3_PG_HP_increase;
    ctx.fillStyle = PG_color_hp_increase;
    ctx.fillRect(e3_fillStartHP__increase, 161, ene3_PG_HP_increase, PG_height - 4);

    //Progress bat ene three text hp
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene3.hp}${e3_slash}${ene3.main_hp}`, 384, 169.5);
    ctx.textAlign = 'left';

    //Progress bar ene three sm left
    const ene3_wp_pg_left = parseInt((ene3.wp / ene3.left_wp) * 100);
    const ene3_PG_wp_left = (PG_width - 131.67) * ene3_wp_pg_left;
    const e3_fillStartSM_left = 251 + PG_width - ene3_PG_wp_left;
    ctx.fillStyle = PG_bar_left;
    ctx.fillRect(e3_fillStartSM_left, 172, ene3_PG_wp_left, PG_height - 4);

    //Progress bar sat three sm
    const ene3_wp_pg = parseInt((ene3.wp / ene3.main_wp) * 100);
    const ene3_PG_SM = (PG_width - 131.67) * ene3_wp_pg;
    const e3_fillStartSM = 251 + PG_width - ene3_PG_SM;
    ctx.fillStyle = PG_color_sm;
    ctx.fillRect(e3_fillStartSM, 172, ene3_PG_SM, PG_height - 4);
    //Progress bat ene three text sm
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene3.wp}${e3_slash}${ene3.main_wp}`, 384, 180.5);
    ctx.textAlign = 'left';
    //STATE
    ctx.textAlign = 'right';
    ctx.fillStyle = allEneColor;
    ctx.fillText(`${ene3.str}`, 342, 200); //STR
    ctx.fillText(`${ene3.mag}`, 342, 208); //MAG
    ctx.fillText(`${ene3.pr}${e3_TJ}`, 342, 216); //PR
    ctx.fillText(`${ene3.mr}${e3_TJ}`, 342, 224); //MR
    ctx.textAlign = 'left';
    //WEAPON
    try {
        const ene3_weapon = await loadImage(ene3.weapon);
        ctx.drawImage(ene3_weapon, 352, 196, 32, 32);
    } catch (error) {
        console.log(`error image ene3 ${ene3.weapon}`);
    }
    //RANK
    try {
        if (ene3.rank) {
            const match_ene3 = ene3.rank.match(/^(\d+)_/);
            const ene3_rank_id = parseInt(match_ene3[1]);
            if (ene3_rank_id > 14 && ene3_rank_id != 26) {
                const emoji = gif[`animal_rank_${ene3_rank_id}`].match(/^<:(\w+):(\d+)>$/);
                const emojiID = emoji[2];

                const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
                const ene3_rank = await loadImage(emojiURL);
                ctx.drawImage(ene3_rank, 251, 203, 25, 25);
            }
        }
    } catch (error) { console.log(`error rank ene3: ${error}`); }
    //POISON
    try {
        if (ene3.poison_bool && ene3.poison_round > 0) {
            const emoji = gif.poison_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const ene3_poison = await loadImage(emojiURL);
            ctx.drawImage(ene3_poison, 307, 194, 16, 16);
        }
    } catch (error) { console.log(`error poison ene3: ${error}`); }
    //DEFEND UP
    try {
        if (ene3.defend_up_bool && ene3.defend_up_round > 0) {
            const emoji = gif.defend_up_passive_weapon_gif.match(/^<:(\w+):(\d+)>$/);
            const emojiID = emoji[2];

            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            const ene3_poison = await loadImage(emojiURL);
            ctx.drawImage(ene3_poison, 290, 194, 16, 16);
        }
    } catch (error) { console.log(`error defend up ene3: ${error}`); }
    if (ene3.hp == 0) { ctx.globalAlpha = 1; }

    return canvas.toBuffer();
}

// ================ STAT CALCULATIONS (EXACT OwO formulas) ================

// ==================== EXACT OWO BOT STAT FORMULAS ====================
// These are the EXACT formulas from the official OwO Bot wiki

// Calculate Health Points (EXACT OwO)
// Formula: 2 * HP_Stat * Level + 500
// Every animal has a base of 500 HP, increases twice the stat per level
function stateHP(statehp, lvl) {
    const HP = 2 * statehp * lvl + 500;
    return HP;
}

// Calculate Physical Attack (STR) (EXACT OwO)
// Formula: STR_Stat * Level + 100
// Every animal has a base of 100 STR, increases by stat per level
function stateSTR(statestr, lvl) {
    const str = parseInt(statestr * lvl + 100);
    return str;
}

// Calculate Weapon Points (EXACT OwO)
// Formula: 2 * WP_Stat * Level + 500
// Every animal has a base of 500 WP, increases twice the stat per level
function stateWP(statewp, lvl) {
    const wp = parseInt(2 * statewp * lvl + 500);
    return wp;
}

// Calculate Magical Attack (MAG) (EXACT OwO)
// Formula: MAG_Stat * Level + 100
// Every animal has a base of 100 MAG, increases by stat per level
function stateMAG(statemag, lvl) {
    const mag = parseInt(statemag * lvl + 100);
    return mag;
}

// Calculate Physical Resistance (PR) (EXACT OwO)
// Formula: 0.8 * ((25 + 2*PR_Stat*Level) / (125 + 2*PR_Stat*Level))
// The lowest amount of PR you can have is 16%
function statePR(statepr, Level) {
    const numerator = 25 + 2 * statepr * Level;
    const denominator = 125 + 2 * statepr * Level;
    const pr = 0.8 * (numerator / denominator);
    // Convert to percentage (0-100 scale) and ensure minimum 16%
    const prPercent = Math.max(pr * 100, 16);
    return parseInt(prPercent);
}

// Calculate Magic Resistance (MR) (EXACT OwO)
// Formula: 0.8 * ((25 + 2*MR_Stat*Level) / (125 + 2*MR_Stat*Level))
// The lowest amount of MR you can have is 16%
function stateMR(statemr, Level) {
    const numerator = 25 + 2 * statemr * Level;
    const denominator = 125 + 2 * statemr * Level;
    const mr = 0.8 * (numerator / denominator);
    // Convert to percentage (0-100 scale) and ensure minimum 16%
    const mrPercent = Math.max(mr * 100, 16);
    return parseInt(mrPercent);
}

// ==================== OWO-STYLE DAMAGE SYSTEM ====================
// BASIC_ATTACK_MULTIPLIER - Used for passive effects like Thorns
// Set to 0.10 (10%) to match battle damage scaling
const BASIC_ATTACK_MULTIPLIER = 0.10;

// Damage calculation with OwO-style balance
// Includes: basic attack reduction, resistance, and damage variance
function resistance(demage, resistance, high_hp) {
    // Apply basic attack multiplier (25% of raw stat)
    demage = parseInt(demage * BASIC_ATTACK_MULTIPLIER);

    // Add small random variance (±10%) for excitement
    const variance = 0.9 + (Math.random() * 0.2);
    demage = parseInt(demage * variance);

    // Apply resistance reduction (resistance is a percentage like 30%)
    const resistReduction = demage * (resistance / 100);
    demage = parseInt(demage - resistReduction);

    // Minimum damage is 1 (you always deal at least 1 damage)
    if (demage < 1) {
        demage = 1;
    }

    // Cap at target's max HP (can't overkill)
    if (demage > high_hp) {
        demage = high_hp;
    }

    return parseInt(demage);
}

// ==================== OWO-STYLE BATTLE ACTION SYSTEM ====================
// Each animal chooses between: 1. Physical Attack OR 2. Use Weapon
// Physical Attack: STR → reduced by target's PR
// Weapon Attack: MAG (or weapon damage) → reduced by target's MR, costs WP

// Calculate physical attack damage (STR-based, reduced by PR)
function physicalAttackDamage(attacker_str, defender_pr, defender_max_hp) {
    // Physical attacks use STR stat
    let damage = parseInt(attacker_str * BASIC_ATTACK_MULTIPLIER);

    // Add variance ±10%
    const variance = 0.9 + (Math.random() * 0.2);
    damage = parseInt(damage * variance);

    // Reduce by defender's PR (Physical Resistance)
    const reduction = damage * (defender_pr / 100);
    damage = parseInt(damage - reduction);

    // Minimum 1 damage
    return Math.max(1, Math.min(damage, defender_max_hp));
}

// Calculate weapon attack damage (MAG-based or weapon damage, reduced by MR)
function weaponAttackDamage(weapon_damage, defender_mr, defender_max_hp) {
    // Weapon attacks use the pre-calculated weapon damage
    let damage = weapon_damage;

    // Add variance ±10%
    const variance = 0.9 + (Math.random() * 0.2);
    damage = parseInt(damage * variance);

    // Reduce by defender's MR (Magic Resistance)
    const reduction = damage * (defender_mr / 100);
    damage = parseInt(damage - reduction);

    // Minimum 1 damage
    return Math.max(1, Math.min(damage, defender_max_hp));
}

// WP cost for using a weapon (configurable per weapon type)
const WEAPON_WP_COST = 50; // Base WP cost per weapon use

// Perform a single animal's battle action (OwO-style: choose physical OR weapon)
function performBattleAction(attacker, defender, allDefenders) {
    // Skip if attacker is dead
    if (!attacker.bool || attacker.hp <= 0) return 0;

    // Choose random target from alive defenders
    const aliveDefenders = allDefenders.filter(d => d.bool && d.hp > 0);
    if (aliveDefenders.length === 0) return 0;

    const target = aliveDefenders[getRandomInt(0, aliveDefenders.length - 1)];

    // Decide: Use weapon OR physical attack
    // Use weapon if: has weapon, has enough WP, and has weapon damage
    const hasWeapon = attacker.weapon_bool === true;
    const hasWP = attacker.wp >= WEAPON_WP_COST;
    const hasWeaponDamage = (attacker.demage_point > 0) || (attacker.mag_point > 0);

    let damage = 0;

    if (hasWeapon && hasWP && hasWeaponDamage) {
        // USE WEAPON - costs WP, uses MAG-based damage, reduced by MR
        attacker.wp -= WEAPON_WP_COST;

        // Weapon damage is either demage_point (STR weapons) or mag_point (MAG weapons)
        const weaponDmg = attacker.demage_point > 0 ? attacker.demage_point : attacker.mag_point;
        damage = weaponAttackDamage(weaponDmg, target.mr, target.main_hp);
    } else {
        // PHYSICAL ATTACK - no WP cost, uses STR, reduced by PR
        damage = physicalAttackDamage(attacker.str, target.pr, target.main_hp);
    }

    // Apply damage to target
    target.hp -= damage;
    if (target.hp < 0) target.hp = 0;

    return damage;
}

function generateRandomId(letter) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < letter; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function getWeaponRank(weapon, rank) {
    return gif[`${weapon}_${rank}_gif`];
}
function getPassive(passive) {
    return gif[`${passive}_gif`];
}

async function getWeaponEquipById(weapon_id, userId) {
    const userData = await getUser(userId);
    for (const allwp of userData.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr] = str.split(' ');

        if (weapon_id == id) {
            if (boolStr == 'false') {
                return false;
            }
        }
    }
    return true;
}

async function getWeaponRankById(weapon_id, userId) {
    const userData = await getUser(userId);
    for (const allwp of userData.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr] = str.split(' ');

        if (weapon_id == id) {
            return gif[`${name}_${rank}_gif`];
        }
    }
}

async function getWeaponNameById(weapon_id, userId) {
    const userData = await getUser(userId);
    for (const allwp of userData.wp) {
        const str = `${allwp}`;
        const [id, name, rank, passive, percen, boolStr] = str.split(' ');

        if (weapon_id == id) {
            // Use getWeaponName for consistency with all weapons
            return getWeaponName(name);
        }
    }
    return '**Unknown Weapon**';
}

function getWeaponName(name) {
    // First check if weapon exists in WEAPON_DATA
    const weaponData = WEAPON_DATA[name];
    if (weaponData) {
        return `**${weaponData.name}**`;
    }

    // Fallback for backwards compatibility
    if (name == 'great_sword') {
        return '**Great Sword**';
    } else if (name == 'defender_aegis') {
        return '**Defender Aegis**';
    } else if (name == 'wang_of_absorption') {
        return '**Wand of Absorption**';
    } else if (name == 'bow') {
        return '**Bow**';
    } else if (name == 'energy_stuff') {
        return '**Energy Staff**';
    } else if (name == 'healing_stuff') {
        return '**Healing Staff**';
    } else if (name == 'orb_of_potency') {
        return '**Orb of Potency**';
    } else if (name == 'rune_of_the_forgotten') {
        return '**Rune of the Forgotten**';
    } else if (name == 'crune_of_celebration') {
        return '**Rune of Celebration**';
    } else if (name == 'spirit_stuff') {
        return '**Spirit Staff**';
    } else if (name == 'resurrection_staff') {
        return '**Resurrection Staff**';
    } else if (name == 'culling_scythe') {
        return '**Culling Scythe**';
    } else if (name == 'poison_dagger') {
        return '**Poison Dagger**';
    } else if (name == 'rune_of_luck') {
        return '**Rune of Luck**';
    } else if (name == 'vampiric_staff') {
        return '**Vampiric Staff**';
    } else if (name == 'flame_stuff') {
        return '**Flame Staff**';
    } else if (name == 'arcane_scepter') {
        return '**Arcane Scepter**';
    } else if (name == 'glacial_axe') {
        return '**Glacial Axe**';
    } else if (name == 'vanguards_banner') {
        return "**Vanguard's Banner**";
    } else if (name == 'staff_of_purity') {
        return '**Staff of Purity**';
    } else if (name == 'leeching_scythe') {
        return '**Leeching Scythe**';
    } else if (name == 'foul_fish') {
        return '**Foul Fish**';
    }
    return '**Unknown Weapon**';
}

function getRank(rank) {
    if (rank == 'common') {
        return gif.animal_rank_1;
    } else if (rank == 'uncommon') {
        return gif.animal_rank_2;
    } else if (rank == 'rare') {
        return gif.animal_rank_3;
    } else if (rank == 'epic') {
        return gif.animal_rank_4;
    } else if (rank == 'mythical') {
        return gif.animal_rank_5;
    } else if (rank == 'legendary') {
        return gif.animal_rank_6;
    } else if (rank == 'febled') {
        return gif.animal_rank_8;
    } else {
        return '';
    }
}

// Rank multiplier for passive effects (EXACT OwO values)
function getRankMultiplier(rank) {
    switch (rank) {
        case 'common': return 0.05;
        case 'uncommon': return 0.08;
        case 'rare': return 0.12;
        case 'epic': return 0.15;
        case 'mythical': return 0.18;
        case 'legendary': return 0.22;
        case 'febled': return 0.25;
        default: return 0;
    }
}

function getRank(rank) {
    if (rank == 'common') {
        return gif.animal_rank_1;
    } else if (rank == 'uncommon') {
        return gif.animal_rank_2;
    } else if (rank == 'rare') {
        return gif.animal_rank_3;
    } else if (rank == 'epic') {
        return gif.animal_rank_4;
    } else if (rank == 'mythical') {
        return gif.animal_rank_5;
    } else if (rank == 'legendary') {
        return gif.animal_rank_6;
    } else if (rank == 'febled') {
        return gif.animal_rank_8;
    } else {
        return '';
    }
}

// activeWeapon - Uses WEAPON_DATA for OwO-style weapon damage calculation
function activeWeapon(sat, weapon_name, weapon_passive, percen, rank) {

    // Get weapon data from WEAPON_DATA
    const weaponData = WEAPON_DATA[weapon_name];
    if (!weaponData) {
        return sat; // Unknown weapon, return unchanged
    }

    // Get rank multipliers
    const rankDamageMultiplier = getRankDamageMultiplier(rank);
    const rankHealMultiplier = getRankHealMultiplier(rank);

    // Calculate damage/heal based on weapon type using WEAPON_DATA percentages
    switch (weapon_name) {

        // ID 100: No Weapon - 100% STR to random opponent
        case 'no_weapon':
            sat.demage_point = parseInt(sat.str * 1.0 * rankDamageMultiplier);
            break;

        // ID 101: Great Sword - 8-15% STR to ALL opponents (AoE) - NERFED
        case 'great_sword':
            const gsPercent = getRandomInt(8, 16) / 100;
            sat.demage_point = parseInt(sat.str * gsPercent * rankDamageMultiplier);
            sat.aoe_damage = true; // Flag for AoE
            break;

        // ID 102: Healing Staff - 50-80% MAG heal (REDUCED), 50% overheal cap
        case 'healing_stuff':
            const hsPercent = getRandomInt(50, 81) / 100;
            sat.increase_hp_point = hsPercent * rankHealMultiplier;
            sat.overheal_percent = 0.50;
            break;

        // ID 103: Bow - 50-80% STR to random opponent (REDUCED from 110-160%)
        case 'bow':
            const bowPercent = getRandomInt(50, 81) / 100;
            sat.demage_point = parseInt(sat.str * bowPercent * rankDamageMultiplier);
            break;

        // ID 104: Rune of the Forgotten - 1-3% ALL stats, 13% STR + 13% MAG TRUE damage - NERFED 150%
        case 'rune_of_the_forgotten':
            const statBoost = getRandomInt(1, 4) / 100 * rankDamageMultiplier;
            sat.hp += parseInt(sat.hp * statBoost);
            sat.str += parseInt(sat.str * statBoost);
            sat.pr += parseInt(sat.pr * statBoost);
            sat.wp += parseInt(sat.wp * statBoost);
            sat.mag += parseInt(sat.mag * statBoost);
            sat.mr += parseInt(sat.mr * statBoost);
            // True damage = 13% STR + 13% MAG (ignores resistance) - NERFED 150%
            sat.demage_point = parseInt((sat.str * 0.13 + sat.mag * 0.13) * rankDamageMultiplier);
            sat.true_damage = true;
            break;

        // ID 105: Defender's Aegis - Taunt + 30-50% damage reduction
        case 'defender_aegis':
            const drPercent = getRandomInt(30, 51);
            sat.defend_up_defend_pr = drPercent;
            sat.defend_up_defend_mr = drPercent;
            sat.taunt_bool = true;
            break;

        // ID 106: Orb of Potency - No active, 2 passives (handled elsewhere)
        case 'orb_of_potency':
            // No active ability
            break;

        // ID 107: Vampiric Staff - 15-25% MAG to ALL enemies, heal allies (REDUCED)
        case 'vampiric_staff':
            const vsPercent = getRandomInt(15, 26) / 100;
            sat.mag_point = parseInt(sat.mag * vsPercent * rankDamageMultiplier);
            sat.aoe_damage = true;
            sat.vampiric_heal = true;
            break;

        // ID 108: Poison Dagger - 40-60% STR + 20-35% MAG poison DoT (REDUCED)
        case 'poison_dagger':
            const pdPercent = getRandomInt(40, 61) / 100;
            const poisonPercent = getRandomInt(20, 36) / 100;
            sat.demage_point = parseInt(sat.str * pdPercent * rankDamageMultiplier);
            sat.poison_demage = parseInt(sat.mag * poisonPercent * rankDamageMultiplier);
            sat.poison_bool = true;
            sat.poison_duration = 3;
            break;

        // ID 109: Wand of Absorption - 45-60% MAG + 15-25% WP drain (REDUCED)
        case 'wang_of_absorption':
            const waPercent = getRandomInt(45, 61) / 100;
            const drainPercent = getRandomInt(15, 26) / 100;
            sat.mag_point = parseInt(sat.mag * waPercent * rankDamageMultiplier);
            sat.wp_drain_percent = drainPercent;
            break;

        // ID 110: Flame Staff - 40-55% MAG + 12-20% DoT + 35-50% explosion (REDUCED)
        case 'flame_stuff':
            const fsPercent = getRandomInt(40, 56) / 100;
            const flameDoT = getRandomInt(12, 21) / 100;
            const explosionPercent = getRandomInt(35, 51) / 100;
            sat.mag_point = parseInt(sat.mag * fsPercent * rankDamageMultiplier);
            sat.flame_dot = parseInt(sat.mag * flameDoT * rankDamageMultiplier);
            sat.flame_explosion = parseInt(sat.mag * explosionPercent * rankDamageMultiplier);
            sat.flame_bool = true;
            sat.flame_duration = 3;
            break;

        // ID 111: Energy Staff - 7-14% MAG to ALL opponents (AoE) - NERFED 150%
        case 'energy_stuff':
            const esPercent = getRandomInt(7, 15) / 100;
            sat.mag_point = parseInt(sat.mag * esPercent * rankDamageMultiplier);
            sat.aoe_damage = true;
            break;

        // ID 112: Spirit Staff - 30-50% MAG heal to ALL + 20-30% defense up
        case 'spirit_stuff':
            const ssPercent = getRandomInt(30, 51) / 100;
            const defUpPercent = getRandomInt(20, 31);
            sat.increase_hp_point = ssPercent * rankHealMultiplier;
            sat.aoe_heal = true;
            sat.defend_up_bool = true;
            sat.defend_up_defend_pr = defUpPercent;
            sat.defend_up_defend_mr = defUpPercent;
            sat.defend_up_duration = 2;
            break;

        // ID 113: Arcane Scepter - 40-70% MAG as WP replenish, 50% over-replenish
        case 'arcane_scepter':
            const asPercent = getRandomInt(40, 71) / 100;
            sat.wp_replenish = parseInt(sat.mag * asPercent * rankHealMultiplier);
            sat.wp_over_replenish = 0.50;
            break;

        // ID 114: Resurrection Staff - Revive + 50-80% MAG heal
        case 'resurrection_staff':
            const rsPercent = getRandomInt(50, 81) / 100;
            sat.resurrection_revive_heal = parseInt(sat.mag * rsPercent * rankHealMultiplier);
            sat.resurrection_bool = true;
            break;

        // ID 115: Glacial Axe - 20-40% STR + 2 turn Freeze
        case 'glacial_axe':
            const gaPercent = getRandomInt(20, 41) / 100;
            sat.demage_point = parseInt(sat.str * gaPercent * rankDamageMultiplier);
            sat.freeze_bool = true;
            sat.freeze_duration = 2;
            break;

        // ID 116: Vanguard's Banner - Attack Up buff tiers: 15-25%/25-35%/40-50%
        case 'vanguards_banner':
            const tier1 = getRandomInt(15, 26) / 100;
            const tier2 = getRandomInt(25, 36) / 100;
            const tier3 = getRandomInt(40, 51) / 100;
            sat.increase_demage_point = tier1 * rankDamageMultiplier;
            sat.attack_up_tier = 1;
            sat.attack_up_tier2 = tier2;
            sat.attack_up_tier3 = tier3;
            sat.attack_up_duration = 2;
            break;

        // ID 117: Culling Scythe - 40-60% STR + 30-50% heal reduction (Mortality) (REDUCED)
        case 'culling_scythe':
            const csPercent = getRandomInt(40, 61) / 100;
            const mortalityPercent = getRandomInt(30, 51) / 100;
            sat.demage_point = parseInt(sat.str * csPercent * rankDamageMultiplier);
            sat.culling_bool = true;
            sat.culling_point = mortalityPercent;
            sat.culling_duration = 2;
            break;

        // ID 118: Rune of Celebration - 20-50% PR as HP, 15-40% MR as WP
        case 'crune_of_celebration':
            const hpHealPercent = getRandomInt(20, 51) / 100;
            const wpRestorePercent = getRandomInt(15, 41) / 100;
            sat.celebration_hp_heal = parseInt(sat.pr * hpHealPercent * rankHealMultiplier);
            sat.celebration_wp_restore = parseInt(sat.mr * wpRestorePercent * rankHealMultiplier);
            sat.celebration_bool = true;
            sat.celebration_duration = 3;
            break;

        // ID 119: Staff of Purity - Dispel + 30-55% MAG damage / 30-55% STR heal (REDUCED)
        case 'staff_of_purity':
            const purifyDmgPercent = getRandomInt(30, 56) / 100;
            const purifyHealPercent = getRandomInt(30, 56) / 100;
            sat.mag_point = parseInt(sat.mag * purifyDmgPercent * rankDamageMultiplier);
            sat.purify_heal = parseInt(sat.str * purifyHealPercent * rankHealMultiplier);
            sat.purify_bool = true;
            break;

        // ID 120: Leeching Scythe - 30-50% STR + 25-40% bonus if leeched (REDUCED)
        case 'leeching_scythe':
            const lsPercent = getRandomInt(30, 51) / 100;
            const leechBonusPercent = getRandomInt(25, 41) / 100;
            sat.demage_point = parseInt(sat.str * lsPercent * rankDamageMultiplier);
            sat.leech_bonus = leechBonusPercent;
            sat.leech_bool = true;
            sat.leech_duration = 3;
            break;

        // ID 121: Foul Fish - 30-50% STR + 12-25% MAG stinky damage (REDUCED)
        case 'foul_fish':
            const ffPercent = getRandomInt(30, 51) / 100;
            const stinkyPercent = getRandomInt(12, 26) / 100;
            sat.demage_point = parseInt(sat.str * ffPercent * rankDamageMultiplier);
            sat.stinky_damage = parseInt(sat.mag * stinkyPercent * rankDamageMultiplier);
            sat.stinky_bool = true;
            sat.stinky_duration = 2;
            break;

        // ID 122: Rune of Luck - 5 punches, each 1-20% STR or MAG (REDUCED)
        case 'rune_of_luck':
            let totalPunchDamage = 0;
            for (let i = 0; i < 5; i++) {
                const punchPercent = getRandomInt(1, 21) / 100;
                const useMag = Math.random() > 0.5;
                if (useMag) {
                    totalPunchDamage += parseInt(sat.mag * punchPercent);
                } else {
                    totalPunchDamage += parseInt(sat.str * punchPercent);
                }
            }
            sat.demage_point = parseInt(totalPunchDamage * rankDamageMultiplier);
            break;
    }

    return sat;
}

function battleAllEntity(entities, sat1, sat2, sat3, ene1, ene2, ene3) {
    entities.forEach(entity => {
        if (entity.weapon_bool == true) {
            try {
                // THORNS EFFECT: Reflects a percentage of damage back (5-10%)
                // Nerfed significantly - only deals small reflected damage, no extra damage
                if (entity.weapon_passive == 'thorns_Effect') {
                    const thorns_percent = getRandomInt(5, 11) / 100; // 5-10% reflection

                    if ([sat1, sat2, sat3].includes(entity)) {
                        // Player pets with thorns reflect damage to enemies
                        if ((sat1.weapon_passive == 'thorns_Effect') && (sat1.wp > 0) && sat1.bool) {
                            // Reflect small damage to enemies (no HP -= in condition!)
                            if (ene1.bool) {
                                const reflectDmg = parseInt(ene1.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene1.hp -= reflectDmg;
                            }
                            if (ene2.bool) {
                                const reflectDmg = parseInt(ene2.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene2.hp -= reflectDmg;
                            }
                            if (ene3.bool) {
                                const reflectDmg = parseInt(ene3.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene3.hp -= reflectDmg;
                            }
                        }
                        if ((sat2.weapon_passive == 'thorns_Effect') && (sat2.wp > 0) && sat2.bool) {
                            if (ene1.bool) {
                                const reflectDmg = parseInt(ene1.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene1.hp -= reflectDmg;
                            }
                            if (ene2.bool) {
                                const reflectDmg = parseInt(ene2.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene2.hp -= reflectDmg;
                            }
                            if (ene3.bool) {
                                const reflectDmg = parseInt(ene3.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene3.hp -= reflectDmg;
                            }
                        }
                        if ((sat3.weapon_passive == 'thorns_Effect') && (sat3.wp > 0) && sat3.bool) {
                            if (ene1.bool) {
                                const reflectDmg = parseInt(ene1.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene1.hp -= reflectDmg;
                            }
                            if (ene2.bool) {
                                const reflectDmg = parseInt(ene2.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene2.hp -= reflectDmg;
                            }
                            if (ene3.bool) {
                                const reflectDmg = parseInt(ene3.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                ene3.hp -= reflectDmg;
                            }
                        }
                    }
                    if ([ene1, ene2, ene3].includes(entity)) {
                        // Enemy pets with thorns reflect damage to player
                        if ((ene1.weapon_passive == 'thorns_Effect') && (ene1.wp > 0) && ene1.bool) {
                            if (sat1.bool) {
                                const reflectDmg = parseInt(sat1.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat1.hp -= reflectDmg;
                            }
                            if (sat2.bool) {
                                const reflectDmg = parseInt(sat2.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat2.hp -= reflectDmg;
                            }
                            if (sat3.bool) {
                                const reflectDmg = parseInt(sat3.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat3.hp -= reflectDmg;
                            }
                        }
                        if ((ene2.weapon_passive == 'thorns_Effect') && (ene2.wp > 0) && ene2.bool) {
                            if (sat1.bool) {
                                const reflectDmg = parseInt(sat1.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat1.hp -= reflectDmg;
                            }
                            if (sat2.bool) {
                                const reflectDmg = parseInt(sat2.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat2.hp -= reflectDmg;
                            }
                            if (sat3.bool) {
                                const reflectDmg = parseInt(sat3.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat3.hp -= reflectDmg;
                            }
                        }
                        if ((ene3.weapon_passive == 'thorns_Effect') && (ene3.wp > 0) && ene3.bool) {
                            if (sat1.bool) {
                                const reflectDmg = parseInt(sat1.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat1.hp -= reflectDmg;
                            }
                            if (sat2.bool) {
                                const reflectDmg = parseInt(sat2.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat2.hp -= reflectDmg;
                            }
                            if (sat3.bool) {
                                const reflectDmg = parseInt(sat3.str * thorns_percent * BASIC_ATTACK_MULTIPLIER);
                                sat3.hp -= reflectDmg;
                            }
                        }
                    }
                }
            } catch (error) { console.log(`thorns_Effect: ${error}`); }

            try {
                if (entity.weapon_passive == 'sacrifice_Effect' || entity.weapon_passive_two == 'sacrifice_Effect') {
                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_passive == 'sacrifice_Effect' || sat1.weapon_passive_two == 'sacrifice_Effect') {
                            if (sat1.hp <= 0 && !sat1.bool) {
                                const heal_hp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_wp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_hp = parseInt(heal_hp_percen * sat1.main_hp);
                                const heal_wp = parseInt(heal_wp_percen * sat1.main_wp);

                                if (sat2.bool) {
                                    sat2.hp += heal_hp;
                                    sat2.wp += heal_wp;
                                }

                                if (sat3.bool) {
                                    sat3.hp += heal_hp;
                                    sat3.wp += heal_wp;
                                }
                            }
                        }
                        if (sat2.weapon_passive == 'sacrifice_Effect' || sat2.weapon_passive_two == 'sacrifice_Effect') {
                            if (sat2.hp <= 0 && !sat2.bool) {
                                const heal_hp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_wp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_hp = parseInt(heal_hp_percen * sat2.main_hp);
                                const heal_wp = parseInt(heal_wp_percen * sat2.main_wp);

                                if (sat1.bool) {
                                    sat1.hp += heal_hp;
                                    sat1.wp += heal_wp;
                                }

                                if (sat3.bool) {
                                    sat3.hp += heal_hp;
                                    sat3.wp += heal_wp;
                                }
                            }
                        }
                        if (sat3.weapon_passive == 'sacrifice_Effect' || sat3.weapon_passive_two == 'sacrifice_Effect') {
                            if (sat3.hp <= 0 && !sat3.bool) {
                                const heal_hp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_wp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_hp = parseInt(heal_hp_percen * sat3.main_hp);
                                const heal_wp = parseInt(heal_wp_percen * sat3.main_wp);

                                if (sat1.bool) {
                                    sat1.hp += heal_hp;
                                    sat1.wp += heal_wp;
                                }

                                if (sat2.bool) {
                                    sat2.hp += heal_hp;
                                    sat2.wp += heal_wp;
                                }
                            }
                        }
                    }
                    if ([ene1, ene2, ene3].includes(entity) && (ene1.wp > 0 || ene2.wp > 0 || ene3.wp > 0)) {
                        if (ene1.weapon_passive == 'sacrifice_Effect' || ene1.weapon_passive_two == 'sacrifice_Effect') {
                            if (ene1.hp <= 0 && !ene1.bool) {
                                const heal_hp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_wp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_hp = parseInt(heal_hp_percen * ene1.main_hp);
                                const heal_wp = parseInt(heal_wp_percen * ene1.main_wp);

                                if (ene2.bool) {
                                    ene2.hp += heal_hp;
                                    ene2.wp += heal_wp;
                                }

                                if (ene3.bool) {
                                    ene3.hp += heal_hp;
                                    ene3.wp += heal_wp;
                                }
                            }
                        }
                        if (ene2.weapon_passive == 'sacrifice_Effect' || ene2.weapon_passive_two == 'sacrifice_Effect') {
                            if (ene2.hp <= 0 && !ene2.bool) {
                                const heal_hp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_wp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_hp = parseInt(heal_hp_percen * ene2.main_hp);
                                const heal_wp = parseInt(heal_wp_percen * ene2.main_wp);

                                if (ene1.bool) {
                                    ene1.hp += heal_hp;
                                    ene1.wp += heal_wp;
                                }

                                if (ene3.bool) {
                                    ene3.hp += heal_hp;
                                    ene3.wp += heal_wp;
                                }
                            }
                        }
                        if (ene3.weapon_passive == 'sacrifice_Effect' || ene3.weapon_passive_two == 'sacrifice_Effect') {
                            if (ene3.hp <= 0 && !ene3.bool) {
                                const heal_hp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_wp_percen = parseInt(getRandomInt(50, 76) / 100);
                                const heal_hp = parseInt(heal_hp_percen * ene3.main_hp);
                                const heal_wp = parseInt(heal_wp_percen * ene3.main_wp);

                                if (ene1.bool) {
                                    ene1.hp += heal_hp;
                                    ene1.wp += heal_wp;
                                }

                                if (ene2.bool) {
                                    ene2.hp += heal_hp;
                                    ene2.wp += heal_wp;
                                }
                            }
                        }
                    }
                }
            } catch (error) { console.log(`sacrifice_Effect: ${error}`); }

            try {
                if (entity.weapon_passive == 'discharge_Effect') {
                    if ([sat1, sat2, sat3].includes(entity) && (sat1.wp > 0 || sat2.wp > 0 || sat3.wp > 0)) {
                        if (sat1.weapon_passive == 'discharge_Effect') {
                            if (sat1.wp <= 0) {
                                const demage_replenished_percen = parseInt(getRandomInt(40, 70) / 100);
                                let demage_replenished = parseInt(sat1.main_wp * demage_replenished_percen);
                                const ene_ran = getRandomInt(1, 4);
                                if (ene_ran == 1 && ene1.bool) {
                                    ene1.hp -= resistance(demage_replenished, ene1.mr, ene1.main_hp);
                                } else if (ene_ran == 2 && ene2.bool) {
                                    ene2.hp -= resistance(demage_replenished, ene2.mr, ene2.main_hp);
                                } else if (ene_ran == 3 && ene3.bool) {
                                    ene3.hp -= resistance(demage_replenished, ene3.mr, ene3.main_hp);
                                }
                            }
                        }
                        if (sat2.weapon_passive == 'discharge_Effect') {
                            if (sat2.wp <= 0) {
                                const demage_replenished_percen = parseInt(getRandomInt(40, 70) / 100);
                                let demage_replenished = parseInt(sat2.main_wp * demage_replenished_percen);
                                const ene_ran = getRandomInt(1, 4);
                                if (ene_ran == 1 && ene1.bool) {
                                    ene1.hp -= resistance(demage_replenished, ene1.mr, ene1.main_hp);
                                } else if (ene_ran == 2 && ene2.bool) {
                                    ene2.hp -= resistance(demage_replenished, ene2.mr, ene2.main_hp);
                                } else if (ene_ran == 3 && ene3.bool) {
                                    ene3.hp -= resistance(demage_replenished, ene3.mr, ene3.main_hp);
                                }
                            }
                        }
                        if (sat3.weapon_passive == 'discharge_Effect') {
                            if (sat3.wp <= 0) {
                                const demage_replenished_percen = parseInt(getRandomInt(40, 70) / 100);
                                let demage_replenished = parseInt(sat3.main_wp * demage_replenished_percen);
                                const ene_ran = getRandomInt(1, 4);
                                if (ene_ran == 1 && ene1.bool) {
                                    ene1.hp -= resistance(demage_replenished, ene1.mr, ene1.main_hp);
                                } else if (ene_ran == 2 && ene2.bool) {
                                    ene2.hp -= resistance(demage_replenished, ene2.mr, ene2.main_hp);
                                } else if (ene_ran == 3 && ene3.bool) {
                                    ene3.hp -= resistance(demage_replenished, ene3.mr, ene3.main_hp);
                                }
                            }
                        }
                    }
                    if ([ene1, ene2, ene3].includes(entity) && (ene1.wp > 0 || ene2.wp > 0 || ene3.wp > 0)) {
                        if (ene1.weapon_passive == 'discharge_Effect') {
                            if (ene1.wp <= 0) {
                                const demage_replenished_percen = parseInt(getRandomInt(40, 70) / 100);
                                let demage_replenished = parseInt(ene1.main_wp * demage_replenished_percen);
                                const sat_ran = getRandomInt(1, 4);
                                if (sat_ran == 1 && sat1.bool) {
                                    sat1.hp -= resistance(demage_replenished, sat1.mr, sat1.main_hp);
                                } else if (sat_ran == 2 && sat2.bool) {
                                    sat2.hp -= resistance(demage_replenished, sat2.mr, sat2.main_hp);
                                } else if (sat_ran == 3 && sat3.bool) {
                                    sat3.hp -= resistance(demage_replenished, sat3.mr, sat3.main_hp);
                                }
                            }
                        }
                        if (ene2.weapon_passive == 'discharge_Effect') {
                            if (ene2.wp <= 0) {
                                const demage_replenished_percen = parseInt(getRandomInt(40, 70) / 100);
                                let demage_replenished = parseInt(ene2.main_wp * demage_replenished_percen);
                                const sat_ran = getRandomInt(1, 4);
                                if (sat_ran == 1 && sat1.bool) {
                                    sat1.hp -= resistance(demage_replenished, sat1.mr, sat1.main_hp);
                                } else if (sat_ran == 2 && sat2.bool) {
                                    sat2.hp -= resistance(demage_replenished, sat2.mr, sat2.main_hp);
                                } else if (sat_ran == 3 && sat3.bool) {
                                    sat3.hp -= resistance(demage_replenished, sat3.mr, sat3.main_hp);
                                }
                            }
                        }
                        if (ene3.weapon_passive == 'discharge_Effect') {
                            if (ene3.wp <= 0) {
                                const demage_replenished_percen = parseInt(getRandomInt(40, 70) / 100);
                                let demage_replenished = parseInt(ene3.main_wp * demage_replenished_percen);
                                const sat_ran = getRandomInt(1, 4);
                                if (sat_ran == 1 && sat1.bool) {
                                    sat1.hp -= resistance(demage_replenished, sat1.mr, sat1.main_hp);
                                } else if (sat_ran == 2 && sat2.bool) {
                                    sat2.hp -= resistance(demage_replenished, sat2.mr, sat2.main_hp);
                                } else if (sat_ran == 3 && sat3.bool) {
                                    sat3.hp -= resistance(demage_replenished, sat3.mr, sat3.main_hp);
                                }
                            }
                        }
                    }
                }
            } catch (error) { console.log(`discharge_Effect: ${error}`); }

            // POISON DAGGER - Initial: str × (0-30%), DoT: mag × (35-60%) for 3 rounds
            try {
                if (entity.weapon_name == 'poison_dagger') {
                    // Handle poison DoT ticks
                    [sat1, sat2, sat3, ene1, ene2, ene3].forEach(ent => {
                        if (ent.poison_bool && ent.poison_round > 0) {
                            ent.hp -= ent.poison_demage; // TRUE damage (no resistance)
                            ent.poison_round -= 1;
                            if (ent.poison_round <= 0) {
                                ent.poison_bool = false;
                                ent.poison_round = 0;
                            }
                        }
                    });

                    const take_wp = getRandomInt(100, 201);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'poison_dagger' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damage_percent = getRandomInt(70, 101) / 100; // 70-100% = 0-30% damage
                            const initial_damage = parseInt(sat1.str * (1 - damage_percent));
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(initial_damage, ene1.pr, ene1.main_hp);
                                ene1.poison_bool = true;
                                ene1.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene1.poison_demage = parseInt(sat1.mag * dot_percent);
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(initial_damage, ene2.pr, ene2.main_hp);
                                ene2.poison_bool = true;
                                ene2.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene2.poison_demage = parseInt(sat1.mag * dot_percent);
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(initial_damage, ene3.pr, ene3.main_hp);
                                ene3.poison_bool = true;
                                ene3.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene3.poison_demage = parseInt(sat1.mag * dot_percent);
                            }
                        }
                        if (sat2.weapon_name == 'poison_dagger' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damage_percent = getRandomInt(70, 101) / 100;
                            const initial_damage = parseInt(sat2.str * (1 - damage_percent));
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(initial_damage, ene1.pr, ene1.main_hp);
                                ene1.poison_bool = true;
                                ene1.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene1.poison_demage = parseInt(sat2.mag * dot_percent);
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(initial_damage, ene2.pr, ene2.main_hp);
                                ene2.poison_bool = true;
                                ene2.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene2.poison_demage = parseInt(sat2.mag * dot_percent);
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(initial_damage, ene3.pr, ene3.main_hp);
                                ene3.poison_bool = true;
                                ene3.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene3.poison_demage = parseInt(sat2.mag * dot_percent);
                            }
                        }
                        if (sat3.weapon_name == 'poison_dagger' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damage_percent = getRandomInt(70, 101) / 100;
                            const initial_damage = parseInt(sat3.str * (1 - damage_percent));
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(initial_damage, ene1.pr, ene1.main_hp);
                                ene1.poison_bool = true;
                                ene1.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene1.poison_demage = parseInt(sat3.mag * dot_percent);
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(initial_damage, ene2.pr, ene2.main_hp);
                                ene2.poison_bool = true;
                                ene2.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene2.poison_demage = parseInt(sat3.mag * dot_percent);
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(initial_damage, ene3.pr, ene3.main_hp);
                                ene3.poison_bool = true;
                                ene3.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                ene3.poison_demage = parseInt(sat3.mag * dot_percent);
                            }
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'poison_dagger' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damage_percent = getRandomInt(70, 101) / 100;
                            const initial_damage = parseInt(ene1.str * (1 - damage_percent));
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(initial_damage, sat1.pr, sat1.main_hp);
                                sat1.poison_bool = true;
                                sat1.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat1.poison_demage = parseInt(ene1.mag * dot_percent);
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(initial_damage, sat2.pr, sat2.main_hp);
                                sat2.poison_bool = true;
                                sat2.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat2.poison_demage = parseInt(ene1.mag * dot_percent);
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(initial_damage, sat3.pr, sat3.main_hp);
                                sat3.poison_bool = true;
                                sat3.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat3.poison_demage = parseInt(ene1.mag * dot_percent);
                            }
                        }
                        if (ene2.weapon_name == 'poison_dagger' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damage_percent = getRandomInt(70, 101) / 100;
                            const initial_damage = parseInt(ene2.str * (1 - damage_percent));
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(initial_damage, sat1.pr, sat1.main_hp);
                                sat1.poison_bool = true;
                                sat1.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat1.poison_demage = parseInt(ene2.mag * dot_percent);
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(initial_damage, sat2.pr, sat2.main_hp);
                                sat2.poison_bool = true;
                                sat2.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat2.poison_demage = parseInt(ene2.mag * dot_percent);
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(initial_damage, sat3.pr, sat3.main_hp);
                                sat3.poison_bool = true;
                                sat3.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat3.poison_demage = parseInt(ene2.mag * dot_percent);
                            }
                        }
                        if (ene3.weapon_name == 'poison_dagger' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damage_percent = getRandomInt(70, 101) / 100;
                            const initial_damage = parseInt(ene3.str * (1 - damage_percent));
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(initial_damage, sat1.pr, sat1.main_hp);
                                sat1.poison_bool = true;
                                sat1.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat1.poison_demage = parseInt(ene3.mag * dot_percent);
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(initial_damage, sat2.pr, sat2.main_hp);
                                sat2.poison_bool = true;
                                sat2.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat2.poison_demage = parseInt(ene3.mag * dot_percent);
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(initial_damage, sat3.pr, sat3.main_hp);
                                sat3.poison_bool = true;
                                sat3.poison_round = 3;
                                const dot_percent = getRandomInt(40, 66) / 100;
                                sat3.poison_demage = parseInt(ene3.mag * dot_percent);
                            }
                        }
                    }
                }
            } catch (error) { console.log(`poison_dagger: ${error}`); }

            // SPIRIT STAFF - Healing: (30-50%) × mag, Defense: +20-40% PR/MR for 2 rounds
            try {
                if (entity.weapon_name == 'spirit_stuff') {
                    // Handle defense buff countdown
                    [sat1, sat2, sat3, ene1, ene2, ene3].forEach(ent => {
                        if (ent.defend_up_bool && ent.defend_up_round > 0) {
                            ent.defend_up_round -= 1;
                            if (ent.defend_up_round <= 0) {
                                ent.pr -= ent.defend_up_defend_pr;
                                ent.mr -= ent.defend_up_defend_mr;
                                ent.defend_up_round = 0;
                                ent.defend_up_bool = false;
                            }
                        }
                    });

                    const take_wp = getRandomInt(125, 226);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'spirit_stuff' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const heal_percent = getRandomInt(30, 51) / 100;
                            const healing = parseInt(sat1.mag * heal_percent);

                            [sat1, sat2, sat3].forEach(ally => {
                                if (ally.bool) {
                                    ally.hp += healing;
                                    ally.defend_up_round = 2;
                                    const def_percent = getRandomInt(20, 41) / 100;
                                    ally.defend_up_defend_pr = parseInt(ally.pr * def_percent);
                                    ally.defend_up_defend_mr = parseInt(ally.mr * def_percent);
                                    if (!ally.defend_up_bool) {
                                        ally.pr += ally.defend_up_defend_pr;
                                        ally.mr += ally.defend_up_defend_mr;
                                    }
                                    ally.defend_up_bool = true;
                                }
                            });
                        }
                        if (sat2.weapon_name == 'spirit_stuff' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const heal_percent = getRandomInt(30, 51) / 100;
                            const healing = parseInt(sat2.mag * heal_percent);

                            [sat1, sat2, sat3].forEach(ally => {
                                if (ally.bool) {
                                    ally.hp += healing;
                                    ally.defend_up_round = 2;
                                    const def_percent = getRandomInt(20, 41) / 100;
                                    ally.defend_up_defend_pr = parseInt(ally.pr * def_percent);
                                    ally.defend_up_defend_mr = parseInt(ally.mr * def_percent);
                                    if (!ally.defend_up_bool) {
                                        ally.pr += ally.defend_up_defend_pr;
                                        ally.mr += ally.defend_up_defend_mr;
                                    }
                                    ally.defend_up_bool = true;
                                }
                            });
                        }
                        if (sat3.weapon_name == 'spirit_stuff' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const heal_percent = getRandomInt(30, 51) / 100;
                            const healing = parseInt(sat3.mag * heal_percent);

                            [sat1, sat2, sat3].forEach(ally => {
                                if (ally.bool) {
                                    ally.hp += healing;
                                    ally.defend_up_round = 2;
                                    const def_percent = getRandomInt(20, 41) / 100;
                                    ally.defend_up_defend_pr = parseInt(ally.pr * def_percent);
                                    ally.defend_up_defend_mr = parseInt(ally.mr * def_percent);
                                    if (!ally.defend_up_bool) {
                                        ally.pr += ally.defend_up_defend_pr;
                                        ally.mr += ally.defend_up_defend_mr;
                                    }
                                    ally.defend_up_bool = true;
                                }
                            });
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'spirit_stuff' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const heal_percent = getRandomInt(30, 51) / 100;
                            const healing = parseInt(ene1.mag * heal_percent);

                            [ene1, ene2, ene3].forEach(ally => {
                                if (ally.bool) {
                                    ally.hp += healing;
                                    ally.defend_up_round = 2;
                                    const def_percent = getRandomInt(20, 41) / 100;
                                    ally.defend_up_defend_pr = parseInt(ally.pr * def_percent);
                                    ally.defend_up_defend_mr = parseInt(ally.mr * def_percent);
                                    if (!ally.defend_up_bool) {
                                        ally.pr += ally.defend_up_defend_pr;
                                        ally.mr += ally.defend_up_defend_mr;
                                    }
                                    ally.defend_up_bool = true;
                                }
                            });
                        }
                        if (ene2.weapon_name == 'spirit_stuff' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const heal_percent = getRandomInt(30, 51) / 100;
                            const healing = parseInt(ene2.mag * heal_percent);

                            [ene1, ene2, ene3].forEach(ally => {
                                if (ally.bool) {
                                    ally.hp += healing;
                                    ally.defend_up_round = 2;
                                    const def_percent = getRandomInt(20, 41) / 100;
                                    ally.defend_up_defend_pr = parseInt(ally.pr * def_percent);
                                    ally.defend_up_defend_mr = parseInt(ally.mr * def_percent);
                                    if (!ally.defend_up_bool) {
                                        ally.pr += ally.defend_up_defend_pr;
                                        ally.mr += ally.defend_up_defend_mr;
                                    }
                                    ally.defend_up_bool = true;
                                }
                            });
                        }
                        if (ene3.weapon_name == 'spirit_stuff' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const heal_percent = getRandomInt(30, 51) / 100;
                            const healing = parseInt(ene3.mag * heal_percent);

                            [ene1, ene2, ene3].forEach(ally => {
                                if (ally.bool) {
                                    ally.hp += healing;
                                    ally.defend_up_round = 2;
                                    const def_percent = getRandomInt(20, 41) / 100;
                                    ally.defend_up_defend_pr = parseInt(ally.pr * def_percent);
                                    ally.defend_up_defend_mr = parseInt(ally.mr * def_percent);
                                    if (!ally.defend_up_bool) {
                                        ally.pr += ally.defend_up_defend_pr;
                                        ally.mr += ally.defend_up_defend_mr;
                                    }
                                    ally.defend_up_bool = true;
                                }
                            });
                        }
                    }
                }
            } catch (error) { console.log(`spirit_stuff: ${error}`); }

            // RESURRECTION STAFF - Revive: resurrection_revive_heal × mag
            try {
                if (entity.weapon_name == 'resurrection_staff') {
                    const take_wp = getRandomInt(300, 401);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'resurrection_staff' && sat1.wp > 0) {
                            if (!sat2.bool && sat2.hp <= 0) {
                                sat1.wp -= take_wp;
                                sat2.hp += parseInt(sat1.resurrection_revive_heal * sat1.mag);
                            } else if (!sat3.bool && sat3.hp <= 0) {
                                sat1.wp -= take_wp;
                                sat3.hp += parseInt(sat1.resurrection_revive_heal * sat1.mag);
                            }
                        }
                        if (sat2.weapon_name == 'resurrection_staff' && sat2.wp > 0) {
                            if (!sat1.bool && sat1.hp <= 0) {
                                sat2.wp -= take_wp;
                                sat1.hp += parseInt(sat2.resurrection_revive_heal * sat2.mag);
                            } else if (!sat3.bool && sat3.hp <= 0) {
                                sat2.wp -= take_wp;
                                sat3.hp += parseInt(sat2.resurrection_revive_heal * sat2.mag);
                            }
                        }
                        if (sat3.weapon_name == 'resurrection_staff' && sat3.wp > 0) {
                            if (!sat1.bool && sat1.hp <= 0) {
                                sat3.wp -= take_wp;
                                sat1.hp += parseInt(sat3.resurrection_revive_heal * sat3.mag);
                            } else if (!sat2.bool && sat2.hp <= 0) {
                                sat3.wp -= take_wp;
                                sat2.hp += parseInt(sat3.resurrection_revive_heal * sat3.mag);
                            }
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'resurrection_staff' && ene1.wp > 0) {
                            if (!ene2.bool && ene2.hp <= 0) {
                                ene1.wp -= take_wp;
                                ene2.hp += parseInt(ene1.resurrection_revive_heal * ene1.mag);
                            } else if (!ene3.bool && ene3.hp <= 0) {
                                ene1.wp -= take_wp;
                                ene3.hp += parseInt(ene1.resurrection_revive_heal * ene1.mag);
                            }
                        }
                        if (ene2.weapon_name == 'resurrection_staff' && ene2.wp > 0) {
                            if (!ene1.bool && ene1.hp <= 0) {
                                ene2.wp -= take_wp;
                                ene1.hp += parseInt(ene2.resurrection_revive_heal * ene2.mag);
                            } else if (!ene3.bool && ene3.hp <= 0) {
                                ene2.wp -= take_wp;
                                ene3.hp += parseInt(ene2.resurrection_revive_heal * ene2.mag);
                            }
                        }
                        if (ene3.weapon_name == 'resurrection_staff' && ene3.wp > 0) {
                            if (!ene1.bool && ene1.hp <= 0) {
                                ene3.wp -= take_wp;
                                ene1.hp += parseInt(ene3.resurrection_revive_heal * ene3.mag);
                            } else if (!ene2.bool && ene2.hp <= 0) {
                                ene3.wp -= take_wp;
                                ene2.hp += parseInt(ene3.resurrection_revive_heal * ene3.mag);
                            }
                        }
                    }
                }
            } catch (error) { console.log(`resurrection_staff: ${error}`); }

            // HEALING STAFF - Heal lowest HP: increase_hp_point × mag
            try {
                if (entity.weapon_name == 'healing_stuff') {
                    const take_wp = getRandomInt(150, 226);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'healing_stuff' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const healing = parseInt(sat1.mag * sat1.increase_hp_point);

                            let lowestHpAlly = null;
                            let lowestHp = Infinity;
                            [sat2, sat3].forEach(ally => {
                                if (ally.bool && ally.hp < lowestHp) {
                                    lowestHp = ally.hp;
                                    lowestHpAlly = ally;
                                }
                            });
                            if (lowestHpAlly) lowestHpAlly.hp += healing;
                        }
                        if (sat2.weapon_name == 'healing_stuff' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const healing = parseInt(sat2.mag * sat2.increase_hp_point);

                            let lowestHpAlly = null;
                            let lowestHp = Infinity;
                            [sat1, sat3].forEach(ally => {
                                if (ally.bool && ally.hp < lowestHp) {
                                    lowestHp = ally.hp;
                                    lowestHpAlly = ally;
                                }
                            });
                            if (lowestHpAlly) lowestHpAlly.hp += healing;
                        }
                        if (sat3.weapon_name == 'healing_stuff' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const healing = parseInt(sat3.mag * sat3.increase_hp_point);

                            let lowestHpAlly = null;
                            let lowestHp = Infinity;
                            [sat1, sat2].forEach(ally => {
                                if (ally.bool && ally.hp < lowestHp) {
                                    lowestHp = ally.hp;
                                    lowestHpAlly = ally;
                                }
                            });
                            if (lowestHpAlly) lowestHpAlly.hp += healing;
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'healing_stuff' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const healing = parseInt(ene1.mag * ene1.increase_hp_point);

                            let lowestHpAlly = null;
                            let lowestHp = Infinity;
                            [ene2, ene3].forEach(ally => {
                                if (ally.bool && ally.hp < lowestHp) {
                                    lowestHp = ally.hp;
                                    lowestHpAlly = ally;
                                }
                            });
                            if (lowestHpAlly) lowestHpAlly.hp += healing;
                        }
                        if (ene2.weapon_name == 'healing_stuff' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const healing = parseInt(ene2.mag * ene2.increase_hp_point);

                            let lowestHpAlly = null;
                            let lowestHp = Infinity;
                            [ene1, ene3].forEach(ally => {
                                if (ally.bool && ally.hp < lowestHp) {
                                    lowestHp = ally.hp;
                                    lowestHpAlly = ally;
                                }
                            });
                            if (lowestHpAlly) lowestHpAlly.hp += healing;
                        }
                        if (ene3.weapon_name == 'healing_stuff' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const healing = parseInt(ene3.mag * ene3.increase_hp_point);

                            let lowestHpAlly = null;
                            let lowestHp = Infinity;
                            [ene1, ene2].forEach(ally => {
                                if (ally.bool && ally.hp < lowestHp) {
                                    lowestHp = ally.hp;
                                    lowestHpAlly = ally;
                                }
                            });
                            if (lowestHpAlly) lowestHpAlly.hp += healing;
                        }
                    }
                }
            } catch (error) { console.log(`healing_stuff: ${error}`); }

            // RUNE OF THE FORGOTTEN - AoE: increase_demage_point × (str + mag), NO RESISTANCE
            try {
                if (entity.weapon_name == 'rune_of_the_forgotten') {
                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'rune_of_the_forgotten' && sat1.wp > 0) {
                            const damage = parseInt(sat1.increase_demage_point * (sat1.str + sat1.mag));
                            if (ene1.bool) ene1.hp -= damage;
                            if (ene2.bool) ene2.hp -= damage;
                            if (ene3.bool) ene3.hp -= damage;
                        }
                        if (sat2.weapon_name == 'rune_of_the_forgotten' && sat2.wp > 0) {
                            const damage = parseInt(sat2.increase_demage_point * (sat2.str + sat2.mag));
                            if (ene1.bool) ene1.hp -= damage;
                            if (ene2.bool) ene2.hp -= damage;
                            if (ene3.bool) ene3.hp -= damage;
                        }
                        if (sat3.weapon_name == 'rune_of_the_forgotten' && sat3.wp > 0) {
                            const damage = parseInt(sat3.increase_demage_point * (sat3.str + sat3.mag));
                            if (ene1.bool) ene1.hp -= damage;
                            if (ene2.bool) ene2.hp -= damage;
                            if (ene3.bool) ene3.hp -= damage;
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'rune_of_the_forgotten' && ene1.wp > 0) {
                            const damage = parseInt(ene1.increase_demage_point * (ene1.str + ene1.mag));
                            if (sat1.bool) sat1.hp -= damage;
                            if (sat2.bool) sat2.hp -= damage;
                            if (sat3.bool) sat3.hp -= damage;
                        }
                        if (ene2.weapon_name == 'rune_of_the_forgotten' && ene2.wp > 0) {
                            const damage = parseInt(ene2.increase_demage_point * (ene2.str + ene2.mag));
                            if (sat1.bool) sat1.hp -= damage;
                            if (sat2.bool) sat2.hp -= damage;
                            if (sat3.bool) sat3.hp -= damage;
                        }
                        if (ene3.weapon_name == 'rune_of_the_forgotten' && ene3.wp > 0) {
                            const damage = parseInt(ene3.increase_demage_point * (ene3.str + ene3.mag));
                            if (sat1.bool) sat1.hp -= damage;
                            if (sat2.bool) sat2.hp -= damage;
                            if (sat3.bool) sat3.hp -= damage;
                        }
                    }
                }
            } catch (error) { console.log(`rune_of_the_forgotten: ${error}`); }

            // CRUNE OF CELEBRATION - AoE Heal: increase_hp_point × current_hp
            try {
                if (entity.weapon_name == 'crune_of_celebration') {
                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'crune_of_celebration' && sat1.wp > 0) {
                            const healing = parseInt(sat1.increase_hp_point * sat1.hp);
                            sat1.hp += healing;
                            if (sat2.bool) sat2.hp += healing;
                            if (sat3.bool) sat3.hp += healing;
                        }
                        if (sat2.weapon_name == 'crune_of_celebration' && sat2.wp > 0) {
                            const healing = parseInt(sat2.increase_hp_point * sat2.hp);
                            sat2.hp += healing;
                            if (sat1.bool) sat1.hp += healing;
                            if (sat3.bool) sat3.hp += healing;
                        }
                        if (sat3.weapon_name == 'crune_of_celebration' && sat3.wp > 0) {
                            const healing = parseInt(sat3.increase_hp_point * sat3.hp);
                            sat3.hp += healing;
                            if (sat1.bool) sat1.hp += healing;
                            if (sat2.bool) sat2.hp += healing;
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'crune_of_celebration' && ene1.wp > 0) {
                            const healing = parseInt(ene1.increase_hp_point * ene1.hp);
                            ene1.hp += healing;
                            if (ene2.bool) ene2.hp += healing;
                            if (ene3.bool) ene3.hp += healing;
                        }
                        if (ene2.weapon_name == 'crune_of_celebration' && ene2.wp > 0) {
                            const healing = parseInt(ene2.increase_hp_point * ene2.hp);
                            ene2.hp += healing;
                            if (ene1.bool) ene1.hp += healing;
                            if (ene3.bool) ene3.hp += healing;
                        }
                        if (ene3.weapon_name == 'crune_of_celebration' && ene3.wp > 0) {
                            const healing = parseInt(ene3.increase_hp_point * ene3.hp);
                            ene3.hp += healing;
                            if (ene1.bool) ene1.hp += healing;
                            if (ene2.bool) ene2.hp += healing;
                        }
                    }
                }
            } catch (error) { console.log(`crune_of_celebration: ${error}`); }

            // CULLING SCYTHE - Damage: str × (1 - culling_point), Debuff: Reduces increase_hp_point for 2 rounds
            try {
                if (entity.weapon_name == 'culling_scythe') {
                    // Handle culling debuff countdown
                    [sat1, sat2, sat3, ene1, ene2, ene3].forEach(ent => {
                        if (ent.culling_bool && ent.culling_round > 0) {
                            ent.culling_round -= 1;
                            if (ent.culling_round <= 0) {
                                ent.increase_hp_point += ent.culling_point;
                                ent.culling_bool = false;
                                ent.culling_round = 0;
                            }
                        }
                    });

                    const take_wp = getRandomInt(100, 201);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'culling_scythe' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damage = parseInt(sat1.str * (1 - sat1.culling_point));

                            [ene1, ene2, ene3].forEach(enemy => {
                                if (enemy.bool && enemy.increase_hp_point > 0) {
                                    enemy.hp -= resistance(damage, enemy.pr, enemy.main_hp);
                                    enemy.culling_point = parseInt(enemy.increase_hp_point * sat1.culling_point);
                                    enemy.increase_hp_point -= enemy.culling_point;
                                    if (enemy.increase_hp_point < 0) enemy.increase_hp_point = 0;
                                    enemy.culling_bool = true;
                                    enemy.culling_round = 2;
                                }
                            });
                        }
                        if (sat2.weapon_name == 'culling_scythe' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damage = parseInt(sat2.str * (1 - sat2.culling_point));

                            [ene1, ene2, ene3].forEach(enemy => {
                                if (enemy.bool && enemy.increase_hp_point > 0) {
                                    enemy.hp -= resistance(damage, enemy.pr, enemy.main_hp);
                                    enemy.culling_point = parseInt(enemy.increase_hp_point * sat2.culling_point);
                                    enemy.increase_hp_point -= enemy.culling_point;
                                    if (enemy.increase_hp_point < 0) enemy.increase_hp_point = 0;
                                    enemy.culling_bool = true;
                                    enemy.culling_round = 2;
                                }
                            });
                        }
                        if (sat3.weapon_name == 'culling_scythe' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damage = parseInt(sat3.str * (1 - sat3.culling_point));

                            [ene1, ene2, ene3].forEach(enemy => {
                                if (enemy.bool && enemy.increase_hp_point > 0) {
                                    enemy.hp -= resistance(damage, enemy.pr, enemy.main_hp);
                                    enemy.culling_point = parseInt(enemy.increase_hp_point * sat3.culling_point);
                                    enemy.increase_hp_point -= enemy.culling_point;
                                    if (enemy.increase_hp_point < 0) enemy.increase_hp_point = 0;
                                    enemy.culling_bool = true;
                                    enemy.culling_round = 2;
                                }
                            });
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'culling_scythe' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damage = parseInt(ene1.str * (1 - ene1.culling_point));

                            [sat1, sat2, sat3].forEach(ally => {
                                if (ally.bool && ally.increase_hp_point > 0) {
                                    ally.hp -= resistance(damage, ally.pr, ally.main_hp);
                                    ally.culling_point = parseInt(ally.increase_hp_point * ene1.culling_point);
                                    ally.increase_hp_point -= ally.culling_point;
                                    if (ally.increase_hp_point < 0) ally.increase_hp_point = 0;
                                    ally.culling_bool = true;
                                    ally.culling_round = 2;
                                }
                            });
                        }
                        if (ene2.weapon_name == 'culling_scythe' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damage = parseInt(ene2.str * (1 - ene2.culling_point));

                            [sat1, sat2, sat3].forEach(ally => {
                                if (ally.bool && ally.increase_hp_point > 0) {
                                    ally.hp -= resistance(damage, ally.pr, ally.main_hp);
                                    ally.culling_point = parseInt(ally.increase_hp_point * ene2.culling_point);
                                    ally.increase_hp_point -= ally.culling_point;
                                    if (ally.increase_hp_point < 0) ally.increase_hp_point = 0;
                                    ally.culling_bool = true;
                                    ally.culling_round = 2;
                                }
                            });
                        }
                        if (ene3.weapon_name == 'culling_scythe' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damage = parseInt(ene3.str * (1 - ene3.culling_point));

                            [sat1, sat2, sat3].forEach(ally => {
                                if (ally.bool && ally.increase_hp_point > 0) {
                                    ally.hp -= resistance(damage, ally.pr, ally.main_hp);
                                    ally.culling_point = parseInt(ally.increase_hp_point * ene3.culling_point);
                                    ally.increase_hp_point -= ally.culling_point;
                                    if (ally.increase_hp_point < 0) ally.increase_hp_point = 0;
                                    ally.culling_bool = true;
                                    ally.culling_round = 2;
                                }
                            });
                        }
                    }
                }
            } catch (error) { console.log(`culling_scythe: ${error}`); }

            // WANG OF ABSORPTION - Damage: mag × mag_point, WP Steal: mag amount
            try {
                if (entity.weapon_name == 'wang_of_absorption') {
                    const take_wp = getRandomInt(150, 251);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'wang_of_absorption' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damage = parseInt(sat1.mag * sat1.mag_point);
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                                if (ene1.wp > 0) {
                                    const drain = Math.min(parseInt(sat1.mag), ene1.wp);
                                    ene1.wp -= drain;
                                    const allies = [sat2, sat3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                                if (ene2.wp > 0) {
                                    const drain = Math.min(parseInt(sat1.mag), ene2.wp);
                                    ene2.wp -= drain;
                                    const allies = [sat2, sat3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                                if (ene3.wp > 0) {
                                    const drain = Math.min(parseInt(sat1.mag), ene3.wp);
                                    ene3.wp -= drain;
                                    const allies = [sat2, sat3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            }
                        }
                        if (sat2.weapon_name == 'wang_of_absorption' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damage = parseInt(sat2.mag * sat2.mag_point);
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                                if (ene1.wp > 0) {
                                    const drain = Math.min(parseInt(sat2.mag), ene1.wp);
                                    ene1.wp -= drain;
                                    const allies = [sat1, sat3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                                if (ene2.wp > 0) {
                                    const drain = Math.min(parseInt(sat2.mag), ene2.wp);
                                    ene2.wp -= drain;
                                    const allies = [sat1, sat3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                                if (ene3.wp > 0) {
                                    const drain = Math.min(parseInt(sat2.mag), ene3.wp);
                                    ene3.wp -= drain;
                                    const allies = [sat1, sat3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            }
                        }
                        if (sat3.weapon_name == 'wang_of_absorption' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damage = parseInt(sat3.mag * sat3.mag_point);
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                                if (ene1.wp > 0) {
                                    const drain = Math.min(parseInt(sat3.mag), ene1.wp);
                                    ene1.wp -= drain;
                                    const allies = [sat1, sat2].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                                if (ene2.wp > 0) {
                                    const drain = Math.min(parseInt(sat3.mag), ene2.wp);
                                    ene2.wp -= drain;
                                    const allies = [sat1, sat2].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                                if (ene3.wp > 0) {
                                    const drain = Math.min(parseInt(sat3.mag), ene3.wp);
                                    ene3.wp -= drain;
                                    const allies = [sat1, sat2].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            }
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'wang_of_absorption' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damage = parseInt(ene1.mag * ene1.mag_point);
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                                if (sat1.wp > 0) {
                                    const drain = Math.min(parseInt(ene1.mag), sat1.wp);
                                    sat1.wp -= drain;
                                    const allies = [ene2, ene3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                                if (sat2.wp > 0) {
                                    const drain = Math.min(parseInt(ene1.mag), sat2.wp);
                                    sat2.wp -= drain;
                                    const allies = [ene2, ene3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                                if (sat3.wp > 0) {
                                    const drain = Math.min(parseInt(ene1.mag), sat3.wp);
                                    sat3.wp -= drain;
                                    const allies = [ene2, ene3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            }
                        }
                        if (ene2.weapon_name == 'wang_of_absorption' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damage = parseInt(ene2.mag * ene2.mag_point);
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                                if (sat1.wp > 0) {
                                    const drain = Math.min(parseInt(ene2.mag), sat1.wp);
                                    sat1.wp -= drain;
                                    const allies = [ene1, ene3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                                if (sat2.wp > 0) {
                                    const drain = Math.min(parseInt(ene2.mag), sat2.wp);
                                    sat2.wp -= drain;
                                    const allies = [ene1, ene3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                                if (sat3.wp > 0) {
                                    const drain = Math.min(parseInt(ene2.mag), sat3.wp);
                                    sat3.wp -= drain;
                                    const allies = [ene1, ene3].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            }
                        }
                        if (ene3.weapon_name == 'wang_of_absorption' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damage = parseInt(ene3.mag * ene3.mag_point);
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                                if (sat1.wp > 0) {
                                    const drain = Math.min(parseInt(ene3.mag), sat1.wp);
                                    sat1.wp -= drain;
                                    const allies = [ene1, ene2].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                                if (sat2.wp > 0) {
                                    const drain = Math.min(parseInt(ene3.mag), sat2.wp);
                                    sat2.wp -= drain;
                                    const allies = [ene1, ene2].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                                if (sat3.wp > 0) {
                                    const drain = Math.min(parseInt(ene3.mag), sat3.wp);
                                    sat3.wp -= drain;
                                    const allies = [ene1, ene2].filter(a => a.bool);
                                    if (allies.length > 0) allies[getRandomInt(0, allies.length)].wp += drain;
                                }
                            }
                        }
                    }
                }
            } catch (error) { console.log(`wang_of_absorption: ${error}`); }

            // DEFENDER AEGIS - Passive Defense (just consume WP)
            try {
                if (entity.weapon_name == 'defender_aegis') {
                    const take_wp = getRandomInt(150, 251);
                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'defender_aegis' && sat1.wp > 0) sat1.wp -= take_wp;
                        if (sat2.weapon_name == 'defender_aegis' && sat2.wp > 0) sat2.wp -= take_wp;
                        if (sat3.weapon_name == 'defender_aegis' && sat3.wp > 0) sat3.wp -= take_wp;
                    }
                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'defender_aegis' && ene1.wp > 0) ene1.wp -= take_wp;
                        if (ene2.weapon_name == 'defender_aegis' && ene2.wp > 0) ene2.wp -= take_wp;
                        if (ene3.weapon_name == 'defender_aegis' && ene3.wp > 0) ene3.wp -= take_wp;
                    }
                }
            } catch (error) { console.log(`defender_aegis: ${error}`); }

            // ENERGY STAFF - AoE Magic: (mag × mag_point) + mag
            try {
                if (entity.weapon_name == 'energy_stuff') {
                    const take_wp = 100;

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'energy_stuff' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damage = parseInt((sat1.mag * sat1.mag_point) + sat1.mag);
                            if (ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            if (ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            if (ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                        }
                        if (sat2.weapon_name == 'energy_stuff' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damage = parseInt((sat2.mag * sat2.mag_point) + sat2.mag);
                            if (ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            if (ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            if (ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                        }
                        if (sat3.weapon_name == 'energy_stuff' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damage = parseInt((sat3.mag * sat3.mag_point) + sat3.mag);
                            if (ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            if (ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            if (ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'energy_stuff' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damage = parseInt((ene1.mag * ene1.mag_point) + ene1.mag);
                            if (sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            if (sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            if (sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                        }
                        if (ene2.weapon_name == 'energy_stuff' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damage = parseInt((ene2.mag * ene2.mag_point) + ene2.mag);
                            if (sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            if (sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            if (sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                        }
                        if (ene3.weapon_name == 'energy_stuff' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damage = parseInt((ene3.mag * ene3.mag_point) + ene3.mag);
                            if (sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            if (sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            if (sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                        }
                    }
                }
            } catch (error) { console.log(`energy_stuff: ${error}`); }

            // ORB OF POTENCY - Passive Buff (just consume WP)
            try {
                if (entity.weapon_name == 'orb_of_potency') {
                    const take_wp = getRandomInt(50, 101);
                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'orb_of_potency' && sat1.wp > 0) sat1.wp -= take_wp;
                        if (sat2.weapon_name == 'orb_of_potency' && sat2.wp > 0) sat2.wp -= take_wp;
                        if (sat3.weapon_name == 'orb_of_potency' && sat3.wp > 0) sat3.wp -= take_wp;
                    }
                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'orb_of_potency' && ene1.wp > 0) ene1.wp -= take_wp;
                        if (ene2.weapon_name == 'orb_of_potency' && ene2.wp > 0) ene2.wp -= take_wp;
                        if (ene3.weapon_name == 'orb_of_potency' && ene3.wp > 0) ene3.wp -= take_wp;
                    }
                }
            } catch (error) { console.log(`orb_of_potency: ${error}`); }

            // GREAT SWORD - AoE Physical: (str × demage_point) + str
            try {
                if (entity.weapon_name == 'great_sword') {
                    const take_wp = getRandomInt(100, 201);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'great_sword' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damage = parseInt((sat1.str * sat1.demage_point) + sat1.str);
                            if (ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            if (ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            if (ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                        if (sat2.weapon_name == 'great_sword' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damage = parseInt((sat2.str * sat2.demage_point) + sat2.str);
                            if (ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            if (ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            if (ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                        if (sat3.weapon_name == 'great_sword' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damage = parseInt((sat3.str * sat3.demage_point) + sat3.str);
                            if (ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            if (ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            if (ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'great_sword' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damage = parseInt((ene1.str * ene1.demage_point) + ene1.str);
                            if (sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            if (sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            if (sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                        if (ene2.weapon_name == 'great_sword' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damage = parseInt((ene2.str * ene2.demage_point) + ene2.str);
                            if (sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            if (sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            if (sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                        if (ene3.weapon_name == 'great_sword' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damage = parseInt((ene3.str * ene3.demage_point) + ene3.str);
                            if (sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            if (sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            if (sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                    }
                }
            } catch (error) { console.log(`great_sword: ${error}`); }

            // BOW - Single Target Burst: (str × demage_point) + (str × 3)
            try {
                if (entity.weapon_name == 'bow') {
                    const take_wp = getRandomInt(120, 200);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'bow' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damage = parseInt((sat1.str * sat1.demage_point) + (sat1.str * 3));
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                            }
                        }
                        if (sat2.weapon_name == 'bow' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damage = parseInt((sat2.str * sat2.demage_point) + (sat2.str * 3));
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                            }
                        }
                        if (sat3.weapon_name == 'bow' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damage = parseInt((sat3.str * sat3.demage_point) + (sat3.str * 3));
                            const ene_ran = getRandomInt(1, 4);

                            if (ene_ran == 1 && ene1.bool) {
                                ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            } else if (ene_ran == 2 && ene2.bool) {
                                ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            } else if (ene_ran == 3 && ene3.bool) {
                                ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                            }
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'bow' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damage = parseInt((ene1.str * ene1.demage_point) + (ene1.str * 3));
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                            }
                        }
                        if (ene2.weapon_name == 'bow' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damage = parseInt((ene2.str * ene2.demage_point) + (ene2.str * 3));
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                            }
                        }
                        if (ene3.weapon_name == 'bow' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damage = parseInt((ene3.str * ene3.demage_point) + (ene3.str * 3));
                            const sat_ran = getRandomInt(1, 4);

                            if (sat_ran == 1 && sat1.bool) {
                                sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            } else if (sat_ran == 2 && sat2.bool) {
                                sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            } else if (sat_ran == 3 && sat3.bool) {
                                sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                            }
                        }
                    }
                }
            } catch (error) { console.log(`bow: ${error}`); }

            // RUNE OF LUCK - Multi-hit: 5 punches, each randomly uses STR or MAG at 1-40%
            try {
                if (entity.weapon_name == 'rune_of_luck') {
                    const take_wp = getRandomInt(100, 201);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'rune_of_luck' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            // 5 punches, each randomly uses STR or MAG
                            for (let punch = 0; punch < 5; punch++) {
                                const useStr = getRandomInt(1, 3) === 1; // 50% chance STR or MAG
                                const punchPercent = getRandomInt(1, 41) / 100; // 1-40%
                                const stat = useStr ? sat1.str : sat1.mag;
                                const resistStat = useStr ? 'pr' : 'mr';
                                const damage = parseInt(stat * punchPercent * sat1.demage_point);
                                const ene_ran = getRandomInt(1, 4);
                                if (ene_ran == 1 && ene1.bool) {
                                    ene1.hp -= resistance(damage, ene1[resistStat], ene1.main_hp);
                                } else if (ene_ran == 2 && ene2.bool) {
                                    ene2.hp -= resistance(damage, ene2[resistStat], ene2.main_hp);
                                } else if (ene_ran == 3 && ene3.bool) {
                                    ene3.hp -= resistance(damage, ene3[resistStat], ene3.main_hp);
                                }
                            }
                        }
                        if (sat2.weapon_name == 'rune_of_luck' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            for (let punch = 0; punch < 5; punch++) {
                                const useStr = getRandomInt(1, 3) === 1;
                                const punchPercent = getRandomInt(1, 41) / 100;
                                const stat = useStr ? sat2.str : sat2.mag;
                                const resistStat = useStr ? 'pr' : 'mr';
                                const damage = parseInt(stat * punchPercent * sat2.demage_point);
                                const ene_ran = getRandomInt(1, 4);
                                if (ene_ran == 1 && ene1.bool) {
                                    ene1.hp -= resistance(damage, ene1[resistStat], ene1.main_hp);
                                } else if (ene_ran == 2 && ene2.bool) {
                                    ene2.hp -= resistance(damage, ene2[resistStat], ene2.main_hp);
                                } else if (ene_ran == 3 && ene3.bool) {
                                    ene3.hp -= resistance(damage, ene3[resistStat], ene3.main_hp);
                                }
                            }
                        }
                        if (sat3.weapon_name == 'rune_of_luck' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            for (let punch = 0; punch < 5; punch++) {
                                const useStr = getRandomInt(1, 3) === 1;
                                const punchPercent = getRandomInt(1, 41) / 100;
                                const stat = useStr ? sat3.str : sat3.mag;
                                const resistStat = useStr ? 'pr' : 'mr';
                                const damage = parseInt(stat * punchPercent * sat3.demage_point);
                                const ene_ran = getRandomInt(1, 4);
                                if (ene_ran == 1 && ene1.bool) {
                                    ene1.hp -= resistance(damage, ene1[resistStat], ene1.main_hp);
                                } else if (ene_ran == 2 && ene2.bool) {
                                    ene2.hp -= resistance(damage, ene2[resistStat], ene2.main_hp);
                                } else if (ene_ran == 3 && ene3.bool) {
                                    ene3.hp -= resistance(damage, ene3[resistStat], ene3.main_hp);
                                }
                            }
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'rune_of_luck' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            for (let punch = 0; punch < 5; punch++) {
                                const useStr = getRandomInt(1, 3) === 1;
                                const punchPercent = getRandomInt(1, 41) / 100;
                                const stat = useStr ? ene1.str : ene1.mag;
                                const resistStat = useStr ? 'pr' : 'mr';
                                const damage = parseInt(stat * punchPercent * ene1.demage_point);
                                const sat_ran = getRandomInt(1, 4);
                                if (sat_ran == 1 && sat1.bool) {
                                    sat1.hp -= resistance(damage, sat1[resistStat], sat1.main_hp);
                                } else if (sat_ran == 2 && sat2.bool) {
                                    sat2.hp -= resistance(damage, sat2[resistStat], sat2.main_hp);
                                } else if (sat_ran == 3 && sat3.bool) {
                                    sat3.hp -= resistance(damage, sat3[resistStat], sat3.main_hp);
                                }
                            }
                        }
                        if (ene2.weapon_name == 'rune_of_luck' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            for (let punch = 0; punch < 5; punch++) {
                                const useStr = getRandomInt(1, 3) === 1;
                                const punchPercent = getRandomInt(1, 41) / 100;
                                const stat = useStr ? ene2.str : ene2.mag;
                                const resistStat = useStr ? 'pr' : 'mr';
                                const damage = parseInt(stat * punchPercent * ene2.demage_point);
                                const sat_ran = getRandomInt(1, 4);
                                if (sat_ran == 1 && sat1.bool) {
                                    sat1.hp -= resistance(damage, sat1[resistStat], sat1.main_hp);
                                } else if (sat_ran == 2 && sat2.bool) {
                                    sat2.hp -= resistance(damage, sat2[resistStat], sat2.main_hp);
                                } else if (sat_ran == 3 && sat3.bool) {
                                    sat3.hp -= resistance(damage, sat3[resistStat], sat3.main_hp);
                                }
                            }
                        }
                        if (ene3.weapon_name == 'rune_of_luck' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            for (let punch = 0; punch < 5; punch++) {
                                const useStr = getRandomInt(1, 3) === 1;
                                const punchPercent = getRandomInt(1, 41) / 100;
                                const stat = useStr ? ene3.str : ene3.mag;
                                const resistStat = useStr ? 'pr' : 'mr';
                                const damage = parseInt(stat * punchPercent * ene3.demage_point);
                                const sat_ran = getRandomInt(1, 4);
                                if (sat_ran == 1 && sat1.bool) {
                                    sat1.hp -= resistance(damage, sat1[resistStat], sat1.main_hp);
                                } else if (sat_ran == 2 && sat2.bool) {
                                    sat2.hp -= resistance(damage, sat2[resistStat], sat2.main_hp);
                                } else if (sat_ran == 3 && sat3.bool) {
                                    sat3.hp -= resistance(damage, sat3[resistStat], sat3.main_hp);
                                }
                            }
                        }
                    }
                }
            } catch (error) { console.log(`rune_of_luck: ${error}`); }

            // VAMPIRIC STAFF - AoE Damage + Heal All Allies
            try {
                if (entity.weapon_name == 'vampiric_staff') {
                    const take_wp = getRandomInt(100, 201);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'vampiric_staff' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damagePercent = getRandomInt(25, 46) / 100;
                            const damage = parseInt(sat1.mag * damagePercent * sat1.demage_point);
                            let totalDamage = 0;
                            if (ene1.bool) {
                                const dealt = resistance(damage, ene1.mr, ene1.main_hp);
                                ene1.hp -= dealt;
                                totalDamage += dealt;
                            }
                            if (ene2.bool) {
                                const dealt = resistance(damage, ene2.mr, ene2.main_hp);
                                ene2.hp -= dealt;
                                totalDamage += dealt;
                            }
                            if (ene3.bool) {
                                const dealt = resistance(damage, ene3.mr, ene3.main_hp);
                                ene3.hp -= dealt;
                                totalDamage += dealt;
                            }
                            // Heal all allies
                            if (sat1.bool) sat1.hp += totalDamage;
                            if (sat2.bool) sat2.hp += totalDamage;
                            if (sat3.bool) sat3.hp += totalDamage;
                        }
                        if (sat2.weapon_name == 'vampiric_staff' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damagePercent = getRandomInt(25, 46) / 100;
                            const damage = parseInt(sat2.mag * damagePercent * sat2.demage_point);
                            let totalDamage = 0;
                            if (ene1.bool) { const dealt = resistance(damage, ene1.mr, ene1.main_hp); ene1.hp -= dealt; totalDamage += dealt; }
                            if (ene2.bool) { const dealt = resistance(damage, ene2.mr, ene2.main_hp); ene2.hp -= dealt; totalDamage += dealt; }
                            if (ene3.bool) { const dealt = resistance(damage, ene3.mr, ene3.main_hp); ene3.hp -= dealt; totalDamage += dealt; }
                            if (sat1.bool) sat1.hp += totalDamage;
                            if (sat2.bool) sat2.hp += totalDamage;
                            if (sat3.bool) sat3.hp += totalDamage;
                        }
                        if (sat3.weapon_name == 'vampiric_staff' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damagePercent = getRandomInt(25, 46) / 100;
                            const damage = parseInt(sat3.mag * damagePercent * sat3.demage_point);
                            let totalDamage = 0;
                            if (ene1.bool) { const dealt = resistance(damage, ene1.mr, ene1.main_hp); ene1.hp -= dealt; totalDamage += dealt; }
                            if (ene2.bool) { const dealt = resistance(damage, ene2.mr, ene2.main_hp); ene2.hp -= dealt; totalDamage += dealt; }
                            if (ene3.bool) { const dealt = resistance(damage, ene3.mr, ene3.main_hp); ene3.hp -= dealt; totalDamage += dealt; }
                            if (sat1.bool) sat1.hp += totalDamage;
                            if (sat2.bool) sat2.hp += totalDamage;
                            if (sat3.bool) sat3.hp += totalDamage;
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'vampiric_staff' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damagePercent = getRandomInt(25, 46) / 100;
                            const damage = parseInt(ene1.mag * damagePercent * ene1.demage_point);
                            let totalDamage = 0;
                            if (sat1.bool) { const dealt = resistance(damage, sat1.mr, sat1.main_hp); sat1.hp -= dealt; totalDamage += dealt; }
                            if (sat2.bool) { const dealt = resistance(damage, sat2.mr, sat2.main_hp); sat2.hp -= dealt; totalDamage += dealt; }
                            if (sat3.bool) { const dealt = resistance(damage, sat3.mr, sat3.main_hp); sat3.hp -= dealt; totalDamage += dealt; }
                            if (ene1.bool) ene1.hp += totalDamage;
                            if (ene2.bool) ene2.hp += totalDamage;
                            if (ene3.bool) ene3.hp += totalDamage;
                        }
                        if (ene2.weapon_name == 'vampiric_staff' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damagePercent = getRandomInt(25, 46) / 100;
                            const damage = parseInt(ene2.mag * damagePercent * ene2.demage_point);
                            let totalDamage = 0;
                            if (sat1.bool) { const dealt = resistance(damage, sat1.mr, sat1.main_hp); sat1.hp -= dealt; totalDamage += dealt; }
                            if (sat2.bool) { const dealt = resistance(damage, sat2.mr, sat2.main_hp); sat2.hp -= dealt; totalDamage += dealt; }
                            if (sat3.bool) { const dealt = resistance(damage, sat3.mr, sat3.main_hp); sat3.hp -= dealt; totalDamage += dealt; }
                            if (ene1.bool) ene1.hp += totalDamage;
                            if (ene2.bool) ene2.hp += totalDamage;
                            if (ene3.bool) ene3.hp += totalDamage;
                        }
                        if (ene3.weapon_name == 'vampiric_staff' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damagePercent = getRandomInt(25, 46) / 100;
                            const damage = parseInt(ene3.mag * damagePercent * ene3.demage_point);
                            let totalDamage = 0;
                            if (sat1.bool) { const dealt = resistance(damage, sat1.mr, sat1.main_hp); sat1.hp -= dealt; totalDamage += dealt; }
                            if (sat2.bool) { const dealt = resistance(damage, sat2.mr, sat2.main_hp); sat2.hp -= dealt; totalDamage += dealt; }
                            if (sat3.bool) { const dealt = resistance(damage, sat3.mr, sat3.main_hp); sat3.hp -= dealt; totalDamage += dealt; }
                            if (ene1.bool) ene1.hp += totalDamage;
                            if (ene2.bool) ene2.hp += totalDamage;
                            if (ene3.bool) ene3.hp += totalDamage;
                        }
                    }
                }
            } catch (error) { console.log(`vampiric_staff: ${error}`); }

            // FLAME STAFF - Magic Damage to Random Enemy with Flame DoT
            try {
                if (entity.weapon_name == 'flame_stuff') {
                    const take_wp = getRandomInt(100, 201);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'flame_stuff' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damagePercent = getRandomInt(75, 96) / 100;
                            const damage = parseInt(sat1.mag * damagePercent * sat1.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                        }
                        if (sat2.weapon_name == 'flame_stuff' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damagePercent = getRandomInt(75, 96) / 100;
                            const damage = parseInt(sat2.mag * damagePercent * sat2.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                        }
                        if (sat3.weapon_name == 'flame_stuff' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damagePercent = getRandomInt(75, 96) / 100;
                            const damage = parseInt(sat3.mag * damagePercent * sat3.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'flame_stuff' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damagePercent = getRandomInt(75, 96) / 100;
                            const damage = parseInt(ene1.mag * damagePercent * ene1.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                        }
                        if (ene2.weapon_name == 'flame_stuff' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damagePercent = getRandomInt(75, 96) / 100;
                            const damage = parseInt(ene2.mag * damagePercent * ene2.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                        }
                        if (ene3.weapon_name == 'flame_stuff' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damagePercent = getRandomInt(75, 96) / 100;
                            const damage = parseInt(ene3.mag * damagePercent * ene3.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                        }
                    }
                }
            } catch (error) { console.log(`flame_stuff: ${error}`); }

            // ARCANE SCEPTER - WP Replenish to Lowest WP Ally
            try {
                if (entity.weapon_name == 'arcane_scepter') {
                    const take_wp = getRandomInt(125, 201);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'arcane_scepter' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const replenishPercent = getRandomInt(40, 71) / 100;
                            const replenish = parseInt(sat1.mag * replenishPercent);
                            // Find lowest WP ally
                            let lowestWpAlly = sat1.bool ? sat1 : (sat2.bool ? sat2 : sat3);
                            if (sat2.bool && sat2.wp < lowestWpAlly.wp) lowestWpAlly = sat2;
                            if (sat3.bool && sat3.wp < lowestWpAlly.wp) lowestWpAlly = sat3;
                            lowestWpAlly.wp += replenish;
                        }
                        if (sat2.weapon_name == 'arcane_scepter' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const replenishPercent = getRandomInt(40, 71) / 100;
                            const replenish = parseInt(sat2.mag * replenishPercent);
                            let lowestWpAlly = sat1.bool ? sat1 : (sat2.bool ? sat2 : sat3);
                            if (sat2.bool && sat2.wp < lowestWpAlly.wp) lowestWpAlly = sat2;
                            if (sat3.bool && sat3.wp < lowestWpAlly.wp) lowestWpAlly = sat3;
                            lowestWpAlly.wp += replenish;
                        }
                        if (sat3.weapon_name == 'arcane_scepter' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const replenishPercent = getRandomInt(40, 71) / 100;
                            const replenish = parseInt(sat3.mag * replenishPercent);
                            let lowestWpAlly = sat1.bool ? sat1 : (sat2.bool ? sat2 : sat3);
                            if (sat2.bool && sat2.wp < lowestWpAlly.wp) lowestWpAlly = sat2;
                            if (sat3.bool && sat3.wp < lowestWpAlly.wp) lowestWpAlly = sat3;
                            lowestWpAlly.wp += replenish;
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'arcane_scepter' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const replenishPercent = getRandomInt(40, 71) / 100;
                            const replenish = parseInt(ene1.mag * replenishPercent);
                            let lowestWpAlly = ene1.bool ? ene1 : (ene2.bool ? ene2 : ene3);
                            if (ene2.bool && ene2.wp < lowestWpAlly.wp) lowestWpAlly = ene2;
                            if (ene3.bool && ene3.wp < lowestWpAlly.wp) lowestWpAlly = ene3;
                            lowestWpAlly.wp += replenish;
                        }
                        if (ene2.weapon_name == 'arcane_scepter' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const replenishPercent = getRandomInt(40, 71) / 100;
                            const replenish = parseInt(ene2.mag * replenishPercent);
                            let lowestWpAlly = ene1.bool ? ene1 : (ene2.bool ? ene2 : ene3);
                            if (ene2.bool && ene2.wp < lowestWpAlly.wp) lowestWpAlly = ene2;
                            if (ene3.bool && ene3.wp < lowestWpAlly.wp) lowestWpAlly = ene3;
                            lowestWpAlly.wp += replenish;
                        }
                        if (ene3.weapon_name == 'arcane_scepter' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const replenishPercent = getRandomInt(40, 71) / 100;
                            const replenish = parseInt(ene3.mag * replenishPercent);
                            let lowestWpAlly = ene1.bool ? ene1 : (ene2.bool ? ene2 : ene3);
                            if (ene2.bool && ene2.wp < lowestWpAlly.wp) lowestWpAlly = ene2;
                            if (ene3.bool && ene3.wp < lowestWpAlly.wp) lowestWpAlly = ene3;
                            lowestWpAlly.wp += replenish;
                        }
                    }
                }
            } catch (error) { console.log(`arcane_scepter: ${error}`); }

            // GLACIAL AXE - Physical Damage to Random Enemy
            try {
                if (entity.weapon_name == 'glacial_axe') {
                    const take_wp = getRandomInt(180, 281);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'glacial_axe' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damagePercent = getRandomInt(20, 41) / 100;
                            const damage = parseInt(sat1.str * damagePercent * sat1.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                        if (sat2.weapon_name == 'glacial_axe' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damagePercent = getRandomInt(20, 41) / 100;
                            const damage = parseInt(sat2.str * damagePercent * sat2.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                        if (sat3.weapon_name == 'glacial_axe' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damagePercent = getRandomInt(20, 41) / 100;
                            const damage = parseInt(sat3.str * damagePercent * sat3.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'glacial_axe' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damagePercent = getRandomInt(20, 41) / 100;
                            const damage = parseInt(ene1.str * damagePercent * ene1.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                        if (ene2.weapon_name == 'glacial_axe' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damagePercent = getRandomInt(20, 41) / 100;
                            const damage = parseInt(ene2.str * damagePercent * ene2.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                        if (ene3.weapon_name == 'glacial_axe' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damagePercent = getRandomInt(20, 41) / 100;
                            const damage = parseInt(ene3.str * damagePercent * ene3.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                    }
                }
            } catch (error) { console.log(`glacial_axe: ${error}`); }

            // VANGUARD'S BANNER - Buff all allies with Attack Up (simplified: boost STR)
            try {
                if (entity.weapon_name == 'vanguards_banner') {
                    const take_wp = getRandomInt(250, 301);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'vanguards_banner' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const buffPercent = getRandomInt(15, 26) / 100;
                            if (sat1.bool) sat1.str += parseInt(sat1.str * buffPercent);
                            if (sat2.bool) sat2.str += parseInt(sat2.str * buffPercent);
                            if (sat3.bool) sat3.str += parseInt(sat3.str * buffPercent);
                        }
                        if (sat2.weapon_name == 'vanguards_banner' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const buffPercent = getRandomInt(15, 26) / 100;
                            if (sat1.bool) sat1.str += parseInt(sat1.str * buffPercent);
                            if (sat2.bool) sat2.str += parseInt(sat2.str * buffPercent);
                            if (sat3.bool) sat3.str += parseInt(sat3.str * buffPercent);
                        }
                        if (sat3.weapon_name == 'vanguards_banner' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const buffPercent = getRandomInt(15, 26) / 100;
                            if (sat1.bool) sat1.str += parseInt(sat1.str * buffPercent);
                            if (sat2.bool) sat2.str += parseInt(sat2.str * buffPercent);
                            if (sat3.bool) sat3.str += parseInt(sat3.str * buffPercent);
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'vanguards_banner' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const buffPercent = getRandomInt(15, 26) / 100;
                            if (ene1.bool) ene1.str += parseInt(ene1.str * buffPercent);
                            if (ene2.bool) ene2.str += parseInt(ene2.str * buffPercent);
                            if (ene3.bool) ene3.str += parseInt(ene3.str * buffPercent);
                        }
                        if (ene2.weapon_name == 'vanguards_banner' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const buffPercent = getRandomInt(15, 26) / 100;
                            if (ene1.bool) ene1.str += parseInt(ene1.str * buffPercent);
                            if (ene2.bool) ene2.str += parseInt(ene2.str * buffPercent);
                            if (ene3.bool) ene3.str += parseInt(ene3.str * buffPercent);
                        }
                        if (ene3.weapon_name == 'vanguards_banner' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const buffPercent = getRandomInt(15, 26) / 100;
                            if (ene1.bool) ene1.str += parseInt(ene1.str * buffPercent);
                            if (ene2.bool) ene2.str += parseInt(ene2.str * buffPercent);
                            if (ene3.bool) ene3.str += parseInt(ene3.str * buffPercent);
                        }
                    }
                }
            } catch (error) { console.log(`vanguards_banner: ${error}`); }

            // STAFF OF PURITY - Damage enemy + Heal ally
            try {
                if (entity.weapon_name == 'staff_of_purity') {
                    const take_wp = getRandomInt(125, 201);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'staff_of_purity' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            // Damage random enemy
                            const damagePercent = getRandomInt(50, 101) / 100;
                            const damage = parseInt(sat1.mag * damagePercent * sat1.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                            // Heal random ally
                            const healPercent = getRandomInt(50, 101) / 100;
                            const heal = parseInt(sat1.str * healPercent);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp += heal;
                            else if (sat_ran == 2 && sat2.bool) sat2.hp += heal;
                            else if (sat_ran == 3 && sat3.bool) sat3.hp += heal;
                        }
                        if (sat2.weapon_name == 'staff_of_purity' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 101) / 100;
                            const damage = parseInt(sat2.mag * damagePercent * sat2.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                            const healPercent = getRandomInt(50, 101) / 100;
                            const heal = parseInt(sat2.str * healPercent);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp += heal;
                            else if (sat_ran == 2 && sat2.bool) sat2.hp += heal;
                            else if (sat_ran == 3 && sat3.bool) sat3.hp += heal;
                        }
                        if (sat3.weapon_name == 'staff_of_purity' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 101) / 100;
                            const damage = parseInt(sat3.mag * damagePercent * sat3.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.mr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.mr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.mr, ene3.main_hp);
                            const healPercent = getRandomInt(50, 101) / 100;
                            const heal = parseInt(sat3.str * healPercent);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp += heal;
                            else if (sat_ran == 2 && sat2.bool) sat2.hp += heal;
                            else if (sat_ran == 3 && sat3.bool) sat3.hp += heal;
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'staff_of_purity' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 101) / 100;
                            const damage = parseInt(ene1.mag * damagePercent * ene1.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                            const healPercent = getRandomInt(50, 101) / 100;
                            const heal = parseInt(ene1.str * healPercent);
                            const ene_heal_ran = getRandomInt(1, 4);
                            if (ene_heal_ran == 1 && ene1.bool) ene1.hp += heal;
                            else if (ene_heal_ran == 2 && ene2.bool) ene2.hp += heal;
                            else if (ene_heal_ran == 3 && ene3.bool) ene3.hp += heal;
                        }
                        if (ene2.weapon_name == 'staff_of_purity' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 101) / 100;
                            const damage = parseInt(ene2.mag * damagePercent * ene2.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                            const healPercent = getRandomInt(50, 101) / 100;
                            const heal = parseInt(ene2.str * healPercent);
                            const ene_heal_ran = getRandomInt(1, 4);
                            if (ene_heal_ran == 1 && ene1.bool) ene1.hp += heal;
                            else if (ene_heal_ran == 2 && ene2.bool) ene2.hp += heal;
                            else if (ene_heal_ran == 3 && ene3.bool) ene3.hp += heal;
                        }
                        if (ene3.weapon_name == 'staff_of_purity' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 101) / 100;
                            const damage = parseInt(ene3.mag * damagePercent * ene3.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.mr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.mr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.mr, sat3.main_hp);
                            const healPercent = getRandomInt(50, 101) / 100;
                            const heal = parseInt(ene3.str * healPercent);
                            const ene_heal_ran = getRandomInt(1, 4);
                            if (ene_heal_ran == 1 && ene1.bool) ene1.hp += heal;
                            else if (ene_heal_ran == 2 && ene2.bool) ene2.hp += heal;
                            else if (ene_heal_ran == 3 && ene3.bool) ene3.hp += heal;
                        }
                    }
                }
            } catch (error) { console.log(`staff_of_purity: ${error}`); }

            // LEECHING SCYTHE - Physical Damage to Random Enemy
            try {
                if (entity.weapon_name == 'leeching_scythe') {
                    const take_wp = getRandomInt(130, 231);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'leeching_scythe' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(sat1.str * damagePercent * sat1.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                        if (sat2.weapon_name == 'leeching_scythe' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(sat2.str * damagePercent * sat2.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                        if (sat3.weapon_name == 'leeching_scythe' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(sat3.str * damagePercent * sat3.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'leeching_scythe' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(ene1.str * damagePercent * ene1.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                        if (ene2.weapon_name == 'leeching_scythe' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(ene2.str * damagePercent * ene2.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                        if (ene3.weapon_name == 'leeching_scythe' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(ene3.str * damagePercent * ene3.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                    }
                }
            } catch (error) { console.log(`leeching_scythe: ${error}`); }

            // FOUL FISH - Physical Damage to Random Enemy
            try {
                if (entity.weapon_name == 'foul_fish') {
                    const take_wp = getRandomInt(180, 281);

                    if ([sat1, sat2, sat3].includes(entity)) {
                        if (sat1.weapon_name == 'foul_fish' && sat1.wp > 0) {
                            sat1.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(sat1.str * damagePercent * sat1.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                        if (sat2.weapon_name == 'foul_fish' && sat2.wp > 0) {
                            sat2.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(sat2.str * damagePercent * sat2.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                        if (sat3.weapon_name == 'foul_fish' && sat3.wp > 0) {
                            sat3.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(sat3.str * damagePercent * sat3.demage_point);
                            const ene_ran = getRandomInt(1, 4);
                            if (ene_ran == 1 && ene1.bool) ene1.hp -= resistance(damage, ene1.pr, ene1.main_hp);
                            else if (ene_ran == 2 && ene2.bool) ene2.hp -= resistance(damage, ene2.pr, ene2.main_hp);
                            else if (ene_ran == 3 && ene3.bool) ene3.hp -= resistance(damage, ene3.pr, ene3.main_hp);
                        }
                    }

                    if ([ene1, ene2, ene3].includes(entity)) {
                        if (ene1.weapon_name == 'foul_fish' && ene1.wp > 0) {
                            ene1.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(ene1.str * damagePercent * ene1.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                        if (ene2.weapon_name == 'foul_fish' && ene2.wp > 0) {
                            ene2.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(ene2.str * damagePercent * ene2.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                        if (ene3.weapon_name == 'foul_fish' && ene3.wp > 0) {
                            ene3.wp -= take_wp;
                            const damagePercent = getRandomInt(50, 81) / 100;
                            const damage = parseInt(ene3.str * damagePercent * ene3.demage_point);
                            const sat_ran = getRandomInt(1, 4);
                            if (sat_ran == 1 && sat1.bool) sat1.hp -= resistance(damage, sat1.pr, sat1.main_hp);
                            else if (sat_ran == 2 && sat2.bool) sat2.hp -= resistance(damage, sat2.pr, sat2.main_hp);
                            else if (sat_ran == 3 && sat3.bool) sat3.hp -= resistance(damage, sat3.pr, sat3.main_hp);
                        }
                    }
                }
            } catch (error) { console.log(`foul_fish: ${error}`); }

        } // closes if (entity.weapon_bool == true)
    }); // closes entities.forEach(entity => {
} // closes function battleAllEntity


function battleWithWeapon(sat, weapon_name, passive_name, passive_two_name, rank) {

    const rankBonus = getRankMultiplier(rank); // rank scaling

    // Rune weapons WP cost
    if (weapon_name == 'rune_of_the_forgotten' && sat.wp > 0) {
        const take_wp = getRandomInt(10, 50);
        sat.wp -= take_wp;

    } else if (weapon_name == 'crune_of_celebration' && sat.wp > 0) {
        const take_wp = getRandomInt(10, 50);
        sat.wp -= take_wp;
    } else if (weapon_name == 'rune_of_luck' && sat.wp > 0) {
        const take_wp = getRandomInt(100, 200);
        sat.wp -= take_wp;
    } else if (weapon_name == 'vampiric_staff' && sat.wp > 0) {
        const take_wp = getRandomInt(100, 200);
        sat.wp -= take_wp;
    } else if (weapon_name == 'flame_stuff' && sat.wp > 0) {
        const take_wp = getRandomInt(100, 200);
        sat.wp -= take_wp;
    } else if (weapon_name == 'arcane_scepter' && sat.wp > 0) {
        const take_wp = getRandomInt(125, 200);
        sat.wp -= take_wp;
    } else if (weapon_name == 'glacial_axe' && sat.wp > 0) {
        const take_wp = getRandomInt(180, 280);
        sat.wp -= take_wp;
    } else if (weapon_name == 'vanguards_banner' && sat.wp > 0) {
        const take_wp = getRandomInt(250, 300);
        sat.wp -= take_wp;
    } else if (weapon_name == 'staff_of_purity' && sat.wp > 0) {
        const take_wp = getRandomInt(125, 200);
        sat.wp -= take_wp;
    } else if (weapon_name == 'leeching_scythe' && sat.wp > 0) {
        const take_wp = getRandomInt(130, 230);
        sat.wp -= take_wp;
    } else if (weapon_name == 'foul_fish' && sat.wp > 0) {
        const take_wp = getRandomInt(180, 280);
        sat.wp -= take_wp;
    }

    // -------- LIFESTEAL (Rank-Scaled) --------
    if ((passive_name == 'lifesteal_effect' || passive_two_name == 'lifesteal_effect') && sat.wp > 0) {

        const lifesteal_percent = getRandomInt(15, 36) / 100; // 15–35%

        // rankBonus increases the heal amount
        const final_percent = lifesteal_percent + rankBonus;

        const lifesteal_heal = parseInt((sat.str + sat.mag) * final_percent);
        sat.hp += lifesteal_heal;
    }

    // -------- REGENERATION (Rank-Scaled) --------
    else if ((passive_name == 'regeneration_effect' || passive_two_name == 'regeneration_effect') && sat.wp > 0) {

        const regen_percent = getRandomInt(5, 11) / 100; // 5–10%

        const final_percent = regen_percent + rankBonus;

        const regen_heal = parseInt(sat.main_hp * final_percent);
        sat.hp += regen_heal;
    }

    return sat;
}


function getRankGif(rank) {
    if (rank == 'common') {
        rank_gif = gif.animal_rank_1;
    } else if (rank == 'uncommon') {
        rank_gif = gif.animal_rank_2;
    } else if (rank == 'rare') {
        rank_gif = gif.animal_rank_3;
    } else if (rank == 'epic') {
        rank_gif = gif.animal_rank_4;
    } else if (rank == 'mythical') {
        rank_gif = gif.animal_rank_5;
    } else if (rank == 'legendary') {
        rank_gif = gif.animal_rank_6;
    } else if (rank == 'febled') {
        rank_gif = gif.animal_rank_8;
    }
    return rank_gif;
}

function splitMessage(message) {
    const maxChunkLength = 2000;
    const chunks = [];
    let currentChunk = '';
    const lines = message.split('\n');
    for (const line of lines) {
        if (currentChunk.length + line.length > maxChunkLength) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
        if (line.length > maxChunkLength) {
            const lineChunks = splitLine(line, maxChunkLength);
            for (const chunk of lineChunks) {
                chunks.push(chunk);
            }
        } else {
            currentChunk += line + '\n';
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}
function splitLine(line, maxLength) {
    const chunks = [];
    let currentChunk = '';

    for (const char of line) {
        if (currentChunk.length + char.length > maxLength) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
        currentChunk += char;
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}

async function longMessage(longMessage, message) {
    const chunks = splitMessage(longMessage);

    for (const chunk of chunks) {
        await message.channel.send(chunk);
    }
}

async function survival(userData, option) {

    const width = 720;
    const height = 400;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const currentTime = new Date();

    if (userData.sa.event.revive_date < currentTime && userData.sa.event.revive_date) {
        userData.sa.event.revive_date = '';
        userData.sa.GUI.Heart = 5;
        option.dead = false;
    }

    try {
        if (option.camfire_theme == true) {//////////////////////////////////////////////// CANFIRE

            if (userData.sa.GUI.Heart > 0) {
                const sa_camfire = await loadImage(gif.sa_camfire);
                ctx.drawImage(sa_camfire, 0, 0, width, height);

                ctx.font = 'bold 30px Arial';///////////////////// USERNAME
                ctx.fillStyle = 'Black';
                ctx.textBaseline = 'middle';
                const text = `${userData.username}`;
                const textWidth = ctx.measureText(text).width;
                const x = 629 - (textWidth / 2);
                ctx.fillText(text, x, 360);

                const sa_mail = await loadImage(gif.mail);/// mail
                ctx.drawImage(sa_mail, 0, 0, width, height);

                const ban_talk_chance = getRandomInt(1, 6);/// ban_talk
                if (ban_talk_chance == 1) {
                    const sa_mail = await loadImage(gif.ban_talk_long);
                    ctx.drawImage(sa_mail, 0, 0, width, height);
                }

                try {//////////////////////////////////////////////// health
                    const sa_pf = await loadImage(gif.pf);
                    ctx.drawImage(sa_pf, 10, 10, 70, 70);

                    let sa_heart;

                    if (userData.sa.GUI.Heart == 5) {
                        sa_heart = await loadImage(gif.bar_5);

                    } else if (userData.sa.GUI.Heart == 4) {
                        sa_heart = await loadImage(gif.bar_4);

                    } else if (userData.sa.GUI.Heart == 3) {
                        sa_heart = await loadImage(gif.bar_3);

                    } else if (userData.sa.GUI.Heart == 2) {
                        sa_heart = await loadImage(gif.bar_2);

                    } else if (userData.sa.GUI.Heart == 1) {
                        sa_heart = await loadImage(gif.bar_1);

                    } else if (userData.sa.GUI.Heart <= 0) {
                        sa_heart = await loadImage(gif.bar_0);
                    }

                    ctx.drawImage(sa_heart, 75, -35, 294, 163);
                } catch (error) { console.log(`error heart`); }

            } else {

                if (!userData.sa.event.revive_date) {
                    const cooldownEnd = new Date(currentTime.getTime() + 300_000);
                    userData.sa.event.revive_date = cooldownEnd;

                    const sa_dead = await loadImage(gif.sa_dead);
                    ctx.drawImage(sa_dead, 0, 0, width, height);

                    try { await userData.save(); } catch (error) { }

                } else {
                    const timeUntilReset = userData.sa.event.revive_date - currentTime;
                    const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeUntilReset % (1000 * 60)) / 1000);

                    const sa_dead = await loadImage(gif.sa_dead);
                    ctx.drawImage(sa_dead, 0, 0, width, height);

                    ctx.font = 'bold 60px Arial';
                    ctx.fillStyle = 'White';
                    ctx.fillText(`${minutes}m ${seconds}s`, 250, 340);
                }
            }

        } else if (option.Storage_theme == true) {////////////////////////////////////////// STORAGE
            const sa_camfire = await loadImage(gif.sa_storage);
            ctx.drawImage(sa_camfire, 0, 0, width, height);

            ////// chocolate_bar
            if (userData.sa.item.food.chocolate_bar > 0) {
                const chocolate_bar = await loadImage(gif.chocolate_bar);
                ctx.drawImage(chocolate_bar, 167, 47, 47, 47);

                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(`${userData.sa.item.food.chocolate_bar}`, 187, 67);
            }

            ////// rag
            if (userData.sa.item.resource.rag > 0) {
                const rag = await loadImage(gif.rag);
                ctx.drawImage(rag, 217, 47, 47, 47);

                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(`${userData.sa.item.resource.rag}`, 237, 67);
            }

            ////// stack
            if (userData.sa.item.resource.stack > 0) {
                const stack = await loadImage(gif.stack);
                ctx.drawImage(stack, 267, 47, 47, 47);

                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(`${userData.sa.item.resource.stack}`, 287, 67);
            }

            ////// flower
            if (userData.sa.item.resource.flower > 0) {
                const flower = await loadImage(gif.flower);
                ctx.drawImage(flower, 317, 47, 47, 47);

                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(`${userData.sa.item.resource.flower}`, 337, 67);
            }

            ////// log
            if (userData.sa.item.resource.log > 0) {
                const log = await loadImage(gif.log);
                ctx.drawImage(log, 367, 47, 47, 47);

                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(`${userData.sa.item.resource.log}`, 387, 67);
            }

            ////// flower soup
            if (userData.sa.item.food.flower_soup > 0) {
                const flower_soup = await loadImage(gif.flower_soup);
                ctx.drawImage(flower_soup, 417, 47, 47, 47);

                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(`${userData.sa.item.food.flower_soup}`, 437, 67);
            }

            ////// stone
            if (userData.sa.item.resource.stone > 0) {
                const stone = await loadImage(gif.stone);
                ctx.drawImage(stone, 467, 47, 47, 47);

                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(`${userData.sa.item.resource.stone}`, 487, 67);
            }

            ////// medical
            if (userData.sa.item.medical.bandage > 0) {
                const bandage = await loadImage(gif.bandage);
                ctx.drawImage(bandage, 517, 47, 47, 47);

                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = 'Black';
                ctx.fillText(`${userData.sa.item.medical.bandage}`, 537, 67);
            }

            //////////////////////// weapom

            ////// knife
            if (userData.sa.item.melee.knife.knife_bool) {
                const knife_item = await loadImage(gif.knife_item);
                ctx.drawImage(knife_item, 25, 120, 100, 100);
            }

            ////// spear
            if (userData.sa.item.melee.spear.spear_bool) {
                const spear_item = await loadImage(gif.spear_item);
                ctx.drawImage(spear_item, 42, 50, 200, 200);
            }

            ////// axe
            if (userData.sa.item.melee.axe.axe_bool) {
                const axe_item = await loadImage(gif.axe_item);
                ctx.drawImage(axe_item, 20, 190, 100, 100);
            }

        } else if (option.map_theme == true) {////////////////////////////////////////////// MAP
            const sa_map = await loadImage(gif.sa_map);
            ctx.drawImage(sa_map, 0, 0, width, height);

        } else if (option.exploring == true) {////////////////////////////////////////////// EXPLORING

            //////////////////////////////////////////////////////////////////////////////////// LANDING UNLOCK
            let exploring;
            if (option.landing == 'a') {
                exploring = await loadImage(gif.sa_forest_1);

            } else if (option.landing == 'b') {
                exploring = await loadImage(gif.sa_forest_2);

            } else if (option.landing == 'c') {
                exploring = await loadImage(gif.sa_forest_3);

            } else if (option.landing == 'd') {
                exploring = await loadImage(gif.sa_forest_4);

            } else if (option.landing == 'e') {
                exploring = await loadImage(gif.sa_forest_5);

            } else if (option.landing == 'f') {
                exploring = await loadImage(gif.sa_forest_5);
            }

            try {//////// EXPLORING
                ctx.drawImage(exploring, 0, 0, width, height);
            } catch (error) { console.log(`error exploring`); }
            //////////////////////////////////////////////////////////////////////////////////// LANDING UNLOCK




            ///////////////////////////////////////////////////////////////////////////////////// melee & weapom
            if (option.zombie_amount > 0) {
                if (userData.sa.item.melee.knife.knife_bool) {///////////////////////////////////// knife
                    userData.sa.item.melee.knife.knife_percen -= option.zombie_amount * 5;

                    if (option.zombie_amount > 3) {
                        userData.sa.GUI.Heart -= 1;
                        try {//////// DEMAGE HEART
                            const sa_demage_heart = await loadImage(gif.demage_heart);
                            ctx.drawImage(sa_demage_heart, 0, 0, width, height);
                        } catch (error) { console.log(`error demage heart`); }

                    } else {
                        const luck_knife_ran = getRandomInt(1, 3);
                        if (luck_knife_ran == 1) {
                            userData.sa.GUI.Heart -= 1;
                            try {//////// DEMAGE HEART
                                const sa_demage_heart = await loadImage(gif.demage_heart);
                                ctx.drawImage(sa_demage_heart, 0, 0, width, height);
                            } catch (error) { console.log(`error demage heart`); }
                        }
                    }

                    const resource_ran = getRandomInt(1, 3);
                    if (resource_ran == 1) {
                        try {//////// RAG
                            const sa_rag = await loadImage(gif.rag);
                            ctx.drawImage(sa_rag, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ ${option.zombie_amount}`, 90, 130);

                            userData.sa.item.resource.rag += option.zombie_amount;

                        } catch (error) { console.log(`error RAG`); }

                    } else if (resource_ran == 2) {
                        try {//////// STACK
                            const sa_stack = await loadImage(gif.stack);
                            ctx.drawImage(sa_stack, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ ${option.zombie_amount}`, 90, 130);

                            userData.sa.item.resource.stack += option.zombie_amount;

                        } catch (error) { console.log(`error STACK`); }
                    }

                    if (userData.sa.item.melee.knife.knife_percen <= 0) {
                        userData.sa.item.melee.knife.knife_bool = false;
                        userData.sa.item.melee.knife.knife_percen = 0;
                    }

                    if (userData.sa.GUI.Heart <= 0) {
                        option.dead = true;
                    }

                    option.zombie_amount = 0;

                } else if (userData.sa.item.melee.spear.spear_bool) {/////////////////////////////// spear
                    userData.sa.item.melee.spear.spear_percen -= option.zombie_amount * 5;

                    if (option.zombie_amount > 1) {
                        userData.sa.GUI.Heart -= 1;
                        try {//////// DEMAGE HEART
                            const sa_demage_heart = await loadImage(gif.demage_heart);
                            ctx.drawImage(sa_demage_heart, 0, 0, width, height);
                        } catch (error) { console.log(`error demage heart`); }

                    } else {
                        const luck_knife_ran = getRandomInt(1, 3);
                        if (luck_knife_ran == 1) {
                            userData.sa.GUI.Heart -= 1;
                            try {//////// DEMAGE HEART
                                const sa_demage_heart = await loadImage(gif.demage_heart);
                                ctx.drawImage(sa_demage_heart, 0, 0, width, height);
                            } catch (error) { console.log(`error demage heart`); }
                        }
                    }

                    const resource_ran = getRandomInt(1, 3);
                    if (resource_ran == 1) {
                        try {//////// RAG
                            const sa_rag = await loadImage(gif.rag);
                            ctx.drawImage(sa_rag, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ ${option.zombie_amount}`, 90, 130);

                            userData.sa.item.resource.rag += option.zombie_amount;

                        } catch (error) { console.log(`error RAG`); }

                    } else if (resource_ran == 2) {
                        try {//////// STACK
                            const sa_stack = await loadImage(gif.stack);
                            ctx.drawImage(sa_stack, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ ${option.zombie_amount}`, 90, 130);

                            userData.sa.item.resource.stack += option.zombie_amount;

                        } catch (error) { console.log(`error STACK`); }
                    }

                    if (userData.sa.item.melee.spear.spear_percen <= 0) {
                        userData.sa.item.melee.spear.spear_bool = false;
                        userData.sa.item.melee.spear.spear_percen = 0;
                    }

                    if (userData.sa.GUI.Heart <= 0) {
                        option.dead = true;
                    }

                    option.zombie_amount = 0;

                } else if (userData.sa.item.melee.axe.axe_bool) {//////////////////////////////////////axe
                    userData.sa.item.melee.axe.axe_percen -= option.zombie_amount * 5;

                    if (option.zombie_amount > 1) {
                        userData.sa.GUI.Heart -= 1;
                        try {//////// DEMAGE HEART
                            const sa_demage_heart = await loadImage(gif.demage_heart);
                            ctx.drawImage(sa_demage_heart, 0, 0, width, height);
                        } catch (error) { console.log(`error demage heart`); }

                    } else {
                        const luck_knife_ran = getRandomInt(1, 3);
                        if (luck_knife_ran == 1) {
                            userData.sa.GUI.Heart -= 1;
                            try {//////// DEMAGE HEART
                                const sa_demage_heart = await loadImage(gif.demage_heart);
                                ctx.drawImage(sa_demage_heart, 0, 0, width, height);
                            } catch (error) { console.log(`error demage heart`); }
                        }
                    }

                    const resource_ran = getRandomInt(1, 3);
                    if (resource_ran == 1) {
                        try {//////// RAG
                            const sa_rag = await loadImage(gif.rag);
                            ctx.drawImage(sa_rag, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ ${option.zombie_amount}`, 90, 130);

                            userData.sa.item.resource.rag += option.zombie_amount;

                        } catch (error) { console.log(`error RAG`); }

                    } else if (resource_ran == 2) {
                        try {//////// STACK
                            const sa_stack = await loadImage(gif.stack);
                            ctx.drawImage(sa_stack, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ ${option.zombie_amount}`, 90, 130);

                            userData.sa.item.resource.stack += option.zombie_amount;

                        } catch (error) { console.log(`error STACK`); }
                    }

                    if (userData.sa.item.melee.axe.axe_percen <= 0) {
                        userData.sa.item.melee.axe.axe_bool = false;
                        userData.sa.item.melee.axe.axe_percen = 0;
                    }

                    if (userData.sa.GUI.Heart <= 0) {
                        option.dead = true;
                    }

                    option.zombie_amount = 0;

                } else {
                    userData.sa.GUI.Heart -= option.zombie_amount;

                    if (userData.sa.GUI.Heart <= 0) {
                        option.dead = true;
                    }

                    option.zombie_amount = 0;
                }
            }
            ///////////////////////////////////////////////////////////////////////////////////// melee & weapom





            ///////////////////////////////////////////////////////////////////////////////////// spawning
            const zombie = getRandomInt(1, option.zombie_chanceSpawn + 1);
            if (zombie == 1 && option.spanw_resource <= 0) {///////// ZOMBIE
                const zombie_amount = getRandomInt(option.zombie_startWith, option.zombie_endWith + 1);
                option.zombie_amount = zombie_amount;

                let zombie_pos = 420;
                for (let i = 1; i <= zombie_amount; i++) {
                    try {
                        let sa_zombie;
                        const zombie_ran = getRandomInt(1, 6);

                        if (zombie_ran == 1) {
                            sa_zombie = await loadImage(gif.zombie);
                        } else if (zombie_ran == 2) {
                            sa_zombie = await loadImage(gif.zombie2);
                        } else if (zombie_ran == 3) {
                            sa_zombie = await loadImage(gif.zombie3);
                        } else if (zombie_ran == 4) {
                            sa_zombie = await loadImage(gif.zombie4);
                        } else if (zombie_ran == 5) {
                            sa_zombie = await loadImage(gif.zombie5);
                        }

                        ctx.drawImage(sa_zombie, zombie_pos, 190, 211, 211);
                    } catch (error) { console.log(`error zombie`); }
                    zombie_pos += 50;
                }
            } else {
                if (option.interact == true) {
                    if (option.spanw_resource == 2) {
                        try {//////// LOG
                            const sa_log = await loadImage(gif.log);
                            ctx.drawImage(sa_log, 50, 100, 40, 40);

                            let amount_log = 1;

                            if (userData.sa.item.melee.axe.axe_bool) {
                                amount_log = 3;
                            }

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ ${amount_log}`, 90, 130);

                            userData.sa.item.resource.log += amount_log;

                        } catch (error) { console.log(`error log`); }

                    } else if (option.spanw_resource == 1) {
                        try {//////// FLOWER
                            const sa_flower = await loadImage(gif.flower);
                            ctx.drawImage(sa_flower, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ 1`, 90, 130);

                            userData.sa.item.resource.flower += 1;

                        } catch (error) { console.log(`error flower`); }

                    } else if (option.spanw_resource == 3) {
                        try {//////// STONE
                            const sa_stone = await loadImage(gif.stone);
                            ctx.drawImage(sa_stone, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ 1`, 90, 130);

                            userData.sa.item.resource.stone += 1;

                        } catch (error) { console.log(`error stone`); }

                    } else if (option.spanw_resource == 4) {
                        try {//////// HEALING
                            const sa_heart = await loadImage(gif.heart);
                            ctx.drawImage(sa_heart, 50, 100, 40, 40);

                            ctx.font = 'bold 24px Arial';
                            ctx.fillStyle = 'White';
                            ctx.fillText(`+ 1`, 90, 130);

                            if (userData.sa.GUI.Heart < 5) {
                                userData.sa.GUI.Heart += 1;
                            }

                        } catch (error) { console.log(`error healing`); }

                    } else if (option.spanw_resource == 10) {
                        if (option.landing == 'a') {
                            try {//////// AXE
                                const sa_axe_item = await loadImage(gif.axe_item);
                                ctx.drawImage(sa_axe_item, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 1`, 90, 130);

                                userData.sa.item.melee.axe.axe_bool = true;
                                userData.sa.item.melee.axe.axe_percen = 100;

                            } catch (error) { console.log(`error axe`); }

                        } else if (option.landing == 'b') {
                            try {//////// KNIFE
                                const sa_knife_item = await loadImage(gif.knife_item);
                                ctx.drawImage(sa_knife_item, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 1`, 90, 130);

                                userData.sa.item.melee.knife.knife_bool = true;
                                userData.sa.item.melee.knife.knife_percen = 100;

                            } catch (error) { console.log(`error knife`); }

                        } else if (option.landing == 'c') {
                            try {//////// AXE
                                const sa_axe_item = await loadImage(gif.axe_item);
                                ctx.drawImage(sa_axe_item, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 1`, 90, 130);

                                userData.sa.item.melee.axe.axe_bool = true;
                                userData.sa.item.melee.axe.axe_percen = 100;

                            } catch (error) { console.log(`error axe`); }

                        } else if (option.landing == 'd') {
                            try {//////// KNIFE
                                const sa_knife_item = await loadImage(gif.knife_item);
                                ctx.drawImage(sa_knife_item, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 1`, 90, 130);

                                userData.sa.item.melee.knife.knife_bool = true;
                                userData.sa.item.melee.knife.knife_percen = 100;

                            } catch (error) { console.log(`error knife`); }

                        } else if (option.landing == 'e') {
                            try {//////// AXE
                                const sa_axe_item = await loadImage(gif.axe_item);
                                ctx.drawImage(sa_axe_item, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 1`, 90, 130);

                                userData.sa.item.melee.axe.axe_bool = true;
                                userData.sa.item.melee.axe.axe_percen = 100;

                            } catch (error) { console.log(`error axe`); }

                        } else if (option.landing == 'f') {
                            try {//////// KNIFE
                                const sa_knife_item = await loadImage(gif.knife_item);
                                ctx.drawImage(sa_knife_item, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 1`, 90, 130);

                                userData.sa.item.melee.knife.knife_bool = true;
                                userData.sa.item.melee.knife.knife_percen = 100;

                            } catch (error) { console.log(`error knife`); }
                        }
                    } else if (option.spanw_resource == 11) {
                        const healing_item_ran = getRandomInt(1, 4);

                        if (healing_item_ran == 1) {
                            try {//////// CHCOLATE_BAR
                                const sa_chocolate_bar = await loadImage(gif.chocolate_bar);
                                ctx.drawImage(sa_chocolate_bar, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 5`, 90, 130);

                                userData.sa.item.food.chocolate_bar += 5;

                            } catch (error) { console.log(`error knife`); }

                        } else if (healing_item_ran == 2) {
                            try {//////// FLOWER_SOUP
                                const sa_flower_soup = await loadImage(gif.flower_soup);
                                ctx.drawImage(sa_flower_soup, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 5`, 90, 130);

                                userData.sa.item.food.flower_soup += 5;

                            } catch (error) { console.log(`error knife`); }

                        } else if (healing_item_ran == 3) {
                            try {//////// BANDAGE
                                const sa_bandage = await loadImage(gif.bandage);
                                ctx.drawImage(sa_bandage, 50, 100, 40, 40);

                                ctx.font = 'bold 24px Arial';
                                ctx.fillStyle = 'White';
                                ctx.fillText(`+ 10`, 90, 130);

                                userData.sa.item.medical.bandage += 10;

                            } catch (error) { console.log(`error knife`); }
                        }
                    }

                    option.interact = false;
                    option.spanw_resource = 0;

                } else if (option.zombie_amount <= 0 && option.spanw_resource != 0) {

                    if (option.spanw_resource == 1) {
                        try {///////// TREE FLOWER
                            const sa_tree_flower = await loadImage(gif.tree_flower);
                            ctx.drawImage(sa_tree_flower, 600, 310, 90, 90);
                        } catch (error) { console.log(`error tree flower`); }

                    } else if (option.spanw_resource == 2) {
                        try {///////// TREE LOG
                            let sa_tree_log;
                            const tree_log_ran = getRandomInt(1, 4);
                            if (tree_log_ran == 1) {
                                sa_tree_log = await loadImage(gif.tree12);
                            } else if (tree_log_ran == 2) {
                                sa_tree_log = await loadImage(gif.tree13);
                            } else if (tree_log_ran == 3) {
                                sa_tree_log = await loadImage(gif.tree14);
                            }
                            ctx.drawImage(sa_tree_log, 450, 65, 335, 335);
                        } catch (error) { console.log(`error tree log`); }

                    } else if (option.spanw_resource == 3) {
                        try {///////// TREE STONE
                            const sa_tree_stone = await loadImage(gif.tree_stone);
                            ctx.drawImage(sa_tree_stone, 600, 310, 90, 90);
                        } catch (error) { console.log(`error tree stone`); }

                    } else if (option.spanw_resource == 4) {
                        try {///////// HEALING
                            const sa_healing = await loadImage(gif.healing);
                            ctx.drawImage(sa_healing, 580, 250, 150, 150);
                        } catch (error) { console.log(`error healing`); }

                    } else if (option.spanw_resource == 10) {
                        try {///////// REWARD CHEST
                            const sa_reward_chest = await loadImage(gif.reward_chest);
                            ctx.drawImage(sa_reward_chest, 0, 0, width, height);
                        } catch (error) { console.log(`error reward chest`); }
                    } else if (option.spanw_resource == 10) {
                        try {///////// REWARD CHEST
                            const sa_reward_chest_normal = await loadImage(gif.reward_chest_normal);
                            ctx.drawImage(sa_reward_chest_normal, 0, 0, width, height);
                        } catch (error) { console.log(`error reward chest normal`); }
                    }

                } else if (option.spanw_resource == 0) {
                    const spanw_resource_luck_ran = getRandomInt(1, 3);
                    if (spanw_resource_luck_ran == 1) {
                        const spanw_resource_ran = getRandomInt(1, 4);
                        if (spanw_resource_ran == 1) {
                            option.spanw_resource = 1;

                        } else if (spanw_resource_ran == 2) {
                            option.spanw_resource = 2;

                        } else if (spanw_resource_ran == 3) {
                            option.spanw_resource = 3;
                        }
                    } else {
                        const healing_luck_ran = getRandomInt(1, 3);
                        if (healing_luck_ran == 1) {
                            option.spanw_resource = 4;
                        }
                    }
                }
            }
            if (option.landing == 'a') {
                if (userData.sa.land.land_b == false && option.level_exploring == 99) {
                    option.spanw_resource = 10;

                } else if (option.level_exploring == 99) {
                    option.spanw_resource = 11;
                }
            } else if (option.landing == 'b') {
                if (userData.sa.land.land_c == false && option.level_exploring == 99) {
                    option.spanw_resource = 10;

                } else if (option.level_exploring == 99) {
                    option.spanw_resource = 11;
                }
            } else if (option.landing == 'c') {
                if (userData.sa.land.land_d == false && option.level_exploring == 99) {
                    option.spanw_resource = 10;

                } else if (option.level_exploring == 99) {
                    option.spanw_resource = 11;
                }
            } else if (option.landing == 'd') {
                if (userData.sa.land.land_e == false && option.level_exploring == 99) {
                    option.spanw_resource = 10;

                } else if (option.level_exploring == 99) {
                    option.spanw_resource = 11;
                }
            } else if (option.landing == 'e') {
                if (userData.sa.land.land_f == false && option.level_exploring == 99) {
                    option.spanw_resource = 10;

                } else if (option.level_exploring == 99) {
                    option.spanw_resource = 11;
                }
            } else if (option.landing == 'f') {
                if (option.level_exploring == 99) {
                    option.spanw_resource = 10;
                }
            }
            ///////////////////////////////////////////////////////////////////////////////////// spawning





            ///////////////////////////////////////////////////////////////////////////////////// gui
            if (userData.sa.GUI.Heart > 0) {///////// health
                try {
                    const sa_pf = await loadImage(gif.pf);
                    ctx.drawImage(sa_pf, 10, 10, 70, 70);

                    let sa_heart;

                    if (userData.sa.GUI.Heart == 5) {
                        sa_heart = await loadImage(gif.bar_5);

                    } else if (userData.sa.GUI.Heart == 4) {
                        sa_heart = await loadImage(gif.bar_4);

                    } else if (userData.sa.GUI.Heart == 3) {
                        sa_heart = await loadImage(gif.bar_3);

                    } else if (userData.sa.GUI.Heart == 2) {
                        sa_heart = await loadImage(gif.bar_2);

                    } else if (userData.sa.GUI.Heart == 1) {
                        sa_heart = await loadImage(gif.bar_1);

                    } else if (userData.sa.GUI.Heart <= 0) {
                        sa_heart = await loadImage(gif.bar_0);
                    }

                    ctx.drawImage(sa_heart, 75, -35, 294, 163);
                } catch (error) { console.log(`error heart`); }
            }

            try {//////////////////////////////////// ARROW
                const sa_arrow = await loadImage(gif.arrow);
                ctx.drawImage(sa_arrow, 660, 10, 50, 50);

                ctx.font = 'bold 30px Arial';///////////////////// USERNAME
                ctx.fillStyle = 'White';
                ctx.textBaseline = 'middle';
                const text = `${option.level_exploring}`;
                const textWidth = ctx.measureText(text).width;
                const x = 680 - (textWidth / 2);
                ctx.fillText(text, x, 30);

            } catch (error) { console.log(`error arrow`); }

            try {//////////////////////////////////// LANDING
                let sa_land;

                if (option.landing == 'a') {
                    sa_land = await loadImage(gif.land_a);
                } else if (option.landing == 'b') {
                    sa_land = await loadImage(gif.land_b);
                } else if (option.landing == 'c') {
                    sa_land = await loadImage(gif.land_c);
                } else if (option.landing == 'd') {
                    sa_land = await loadImage(gif.land_d);
                } else if (option.landing == 'e') {
                    sa_land = await loadImage(gif.land_e);
                } else if (option.landing == 'f') {
                    sa_land = await loadImage(gif.land_f);
                }

                if (option.level_exploring == 100) {//////////////////////////////////// new land unlock
                    if (option.landing == 'a') {
                        if (userData.sa.land.land_b == false) {
                            const sa_new_land_unlock = await loadImage(gif.new_land_unlock);
                            ctx.drawImage(sa_new_land_unlock, 0, 0, width, height);
                            userData.sa.land.land_b = true;
                        }
                    } else if (option.landing == 'b') {
                        if (userData.sa.land.land_c == false) {
                            const sa_new_land_unlock = await loadImage(gif.new_land_unlock);
                            ctx.drawImage(sa_new_land_unlock, 0, 0, width, height);
                            userData.sa.land.land_c = true;
                        }
                    } else if (option.landing == 'c') {
                        if (userData.sa.land.land_d == false) {
                            const sa_new_land_unlock = await loadImage(gif.new_land_unlock);
                            ctx.drawImage(sa_new_land_unlock, 0, 0, width, height);
                            userData.sa.land.land_d = true;
                        }
                    } else if (option.landing == 'd') {
                        if (userData.sa.land.land_e == false) {
                            const sa_new_land_unlock = await loadImage(gif.new_land_unlock);
                            ctx.drawImage(sa_new_land_unlock, 0, 0, width, height);
                            userData.sa.land.land_e = true;
                        }
                    } else if (option.landing == 'e') {
                        if (userData.sa.land.land_f == false) {
                            const sa_new_land_unlock = await loadImage(gif.new_land_unlock);
                            ctx.drawImage(sa_new_land_unlock, 0, 0, width, height);
                            userData.sa.land.land_f = true;
                        }
                    }
                }

                ctx.drawImage(sa_land, 0, 0, width, height);
            } catch (error) { console.log(`error landing`); }

            const ban_talk_chance = getRandomInt(1, 4);////////////////////// ban talk
            if (ban_talk_chance == 1) {
                const ban_talking_ran = getRandomInt(1, 7);
                if (ban_talking_ran == 1) {
                    try {
                        const ban_talk = await loadImage(gif.ban_talk_0);
                        ctx.drawImage(ban_talk, 0, 0, width, height);
                        ctx.font = 'bold 35px Arial';
                        ctx.fillStyle = 'Black';
                        ctx.fillText(`${option.zombie_amount}`, 180, 170);
                    } catch (error) { console.log(`error ban talk`); }

                } else if (ban_talking_ran == 2) {
                    try {
                        const ban_talk = await loadImage(gif.ban_talk_1);
                        ctx.drawImage(ban_talk, 0, 0, width, height);
                    } catch (error) { console.log(`error ban talk`); }

                } else if (ban_talking_ran == 3) {
                    try {
                        const ban_talk = await loadImage(gif.ban_talk_2);
                        ctx.drawImage(ban_talk, 0, 0, width, height);
                    } catch (error) { console.log(`error ban talk`); }

                } else if (ban_talking_ran == 4) {
                    try {
                        const ban_talk = await loadImage(gif.ban_talk_3);
                        ctx.drawImage(ban_talk, 0, 0, width, height);
                    } catch (error) { console.log(`error ban talk`); }
                } else if (ban_talking_ran == 5) {
                    try {
                        const ban_talk = await loadImage(gif.ban_talk_4);
                        ctx.drawImage(ban_talk, 0, 0, width, height);
                    } catch (error) { console.log(`error ban talk`); }
                } else if (ban_talking_ran == 6) {
                    try {
                        const ban_talk = await loadImage(gif.ban_talk_5);
                        ctx.drawImage(ban_talk, 0, 0, width, height);
                    } catch (error) { console.log(`error ban talk`); }
                }
            }

            const zombie_talk_chance = getRandomInt(1, 4);///////////////////////////// zombie talk
            if (zombie_talk_chance == 1 && option.zombie_amount > 0) {
                const zombie_talk = getRandomInt(1, 4);
                if (zombie_talk == 1) {
                    try {
                        const zombie_talk = await loadImage(gif.zombie_talk_0);
                        ctx.drawImage(zombie_talk, 0, 0, width, height);
                        ctx.font = 'bold 35px Arial';
                        ctx.fillStyle = 'Black';
                        ctx.fillText(`${option.zombie_amount}`, 433, 220);
                    } catch (error) { console.log(`error zombie talk`); }

                } else if (zombie_talk == 2) {
                    try {
                        const zombie_talk = await loadImage(gif.zombie_talk_1);
                        ctx.drawImage(zombie_talk, 0, 0, width, height);
                    } catch (error) { console.log(`error zombie talk`); }

                } else if (zombie_talk == 3) {
                    try {
                        const zombie_talk = await loadImage(gif.zombie_talk_2);
                        ctx.drawImage(zombie_talk, 0, 0, width, height);
                    } catch (error) { console.log(`error zombie talk`); }
                }
            }
            ///////////////////////////////////////////////////////////////////////////////////// gui





            try {///////// BAN
                const sa_ban = await loadImage(gif.ban);
                ctx.drawImage(sa_ban, 10, 190, 211, 211);
            } catch (error) { console.log(`error ban`); }

            if (userData.sa.item.melee.knife.knife_bool) {///////// KNIFE
                try {
                    const sa_knife = await loadImage(gif.knife);
                    ctx.drawImage(sa_knife, 10, 190, 211, 211);

                    ctx.font = 'bold 25px Arial';
                    ctx.fillStyle = 'White';
                    ctx.fillText(`${userData.sa.item.melee.knife.knife_percen}%`, 100, 95);
                } catch (error) { console.log(`error knife`); }

            } else if (userData.sa.item.melee.spear.spear_bool) {////////// SPEAR
                try {
                    const sa_spear = await loadImage(gif.spear);
                    ctx.drawImage(sa_spear, 10, 190, 211, 211);

                    ctx.font = 'bold 25px Arial';
                    ctx.fillStyle = 'White';
                    ctx.fillText(`${userData.sa.item.melee.spear.spear_percen}%`, 100, 95);
                } catch (error) { console.log(`error spear`); }

            } else if (userData.sa.item.melee.axe.axe_bool) {///////////// AXE
                try {
                    const sa_axe = await loadImage(gif.axe);
                    ctx.drawImage(sa_axe, 10, 190, 211, 211);

                    ctx.font = 'bold 25px Arial';
                    ctx.fillStyle = 'White';
                    ctx.fillText(`${userData.sa.item.melee.axe.axe_percen}%`, 100, 95);
                } catch (error) { console.log(`error axe`); }
            }

        } else if (option.crafting_theme == true) {///////////////////////////////////////// CRAFTING
            const sa_crafting = await loadImage(gif.sa_crafting);
            ctx.drawImage(sa_crafting, 0, 0, width, height);

            if (option.crafted_spear) {///////// crafting spear
                option.crafted_spear = false;

                try {
                    const sa_spear = await loadImage(gif.spear);
                    ctx.drawImage(sa_spear, 240, -75, 135, 135);

                    ctx.font = 'bold 25px Arial';
                    ctx.fillStyle = 'White';
                    ctx.fillText(`+ 1`, 380, 25);
                } catch (error) { console.log(`error crafting spear`); }

            } else if (option.crafted_flower_soup) {///////// flower soup
                option.crafted_flower_soup = false;

                try {
                    const sa_flower_soup = await loadImage(gif.flower_soup);
                    ctx.drawImage(sa_flower_soup, 335, -5, 40, 40);

                    ctx.font = 'bold 25px Arial';
                    ctx.fillStyle = 'White';
                    ctx.fillText(`+ 1`, 380, 25);
                } catch (error) { console.log(`error crafting spear`); }

            } else if (option.crafted_bandage) {///////// medical
                option.crafted_bandage = false;

                try {
                    const sa_bandage = await loadImage(gif.bandage);
                    ctx.drawImage(sa_bandage, 335, -5, 40, 40);

                    ctx.font = 'bold 25px Arial';
                    ctx.fillStyle = 'White';
                    ctx.fillText(`+ 1`, 380, 25);
                } catch (error) { console.log(`error medical`); }
            }

            ////// knife
            if (userData.sa.item.melee.knife.knife_bool) {
                const knife_item = await loadImage(gif.knife_item);
                ctx.drawImage(knife_item, 25, 120, 100, 100);
            }

            ////// spear
            if (userData.sa.item.melee.spear.spear_bool) {
                const spear_item = await loadImage(gif.spear_item);
                ctx.drawImage(spear_item, 42, 50, 200, 200);
            }
        } else if (option.base_theme == true) {///////////////////////////////////////// BASE
            if (userData.sa.base.base_bool) {
                const sa_upgrade_base = await loadImage(gif.upgrade_base);
                ctx.drawImage(sa_upgrade_base, 0, 0, width, height);

            } else {
                const sa_upgrade_base = await loadImage(gif.upgrade_base);
                ctx.drawImage(sa_upgrade_base, 0, 0, width, height);

                ////// log
                if (true) {
                    const log = await loadImage(gif.log);
                    ctx.drawImage(log, 397, 110, 50, 50);

                    ctx.font = 'bold 24px Arial';
                    ctx.fillStyle = 'Black';
                    ctx.fillText(`${userData.sa.item.resource.log} / 75`, 460, 145);
                }

                ////// stack
                if (true) {
                    const stack = await loadImage(gif.stack);
                    ctx.drawImage(stack, 397, 180, 50, 50);

                    ctx.font = 'bold 24px Arial';
                    ctx.fillStyle = 'Black';
                    ctx.fillText(`${userData.sa.item.resource.stack} / 100`, 460, 215);
                }

                ////// rag
                if (true) {
                    const rag = await loadImage(gif.rag);
                    ctx.drawImage(rag, 397, 250, 50, 50);

                    ctx.font = 'bold 24px Arial';
                    ctx.fillStyle = 'Black';
                    ctx.fillText(`${userData.sa.item.resource.rag} / 80`, 460, 285);
                }
            }
        }

    } catch (error) { console.log(`error survival in function ${error.stack()}`); }

    return canvas.toBuffer();
}

module.exports = { getUserClanTag, getUserClanTagShort, VERIFY_ICON, Clan, ANIMAL_TYPES, getAnimalType, getAnimalTypeAndRecommendations, getWeaponDisplayName, getPassiveDisplayName, WEAPON_DATA, getWeaponData, getWeaponDataById, getWeaponDamageRange, getRankDamageMultiplier, getRankHealMultiplier, getWeaponEffectRange, PET_TYPE_COUNTERS, WEAPON_TYPE_COUNTERS, getPetTypeCounterMultiplier, getWeaponCounterMultiplier, getCombinedCounterMultiplier, getEntityType, survival, battleAllEntity, longMessage, splitMessage, getRankGif, battleWithWeapon, activeWeapon, getRank, getWeaponName, getWeaponNameById, getWeaponRankById, getWeaponEquipById, getPassive, getWeaponRank, generateRandomId, resistance, stateMR, stateHP, stateSTR, stateWP, stateMAG, statePR, stateMAG, getSatImage, loadImage, createCanvas, checkOwnAnimal, xpToRateXp, xpToLevel, toSuperscript, User, fs, getAnimalNameByName, getimageAnimal, getAnimalIdByName, checkRankAnimalById, checkPointAnimalById, checkSellAnimalById, customEmbed, cooldown, mileToHour, mileToMin, mileToSec, basicEmbed, EmbedBuilder, getCollectionButton, oneButton, twoButton, threeButton, fourButton, fiveButton, sleep, getRandomInt, one_second, prefix, getFiles, getUser, SimpleEmbed, blackjackEmbed, gif, advanceEmbed, labelButton, emojiButton, sym, syms, sym3, ButtonStyle, AttachmentBuilder, ComponentType, createCanvas, loadImage, InteractionCollector, physicalAttackDamage, weaponAttackDamage, performBattleAction, WEAPON_WP_COST, BASIC_ATTACK_MULTIPLIER };  