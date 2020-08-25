
export type EnhancementFlavor = "fire" | "radiant" | "cold" | "explosive" | "will" | "str" | "dex" | "con"

export namespace Enhancements {

	interface EnhancementFlavorInfoI {
		allowedTypesT: { [k: string]: boolean }
		typeS: string
		prefixes: Array<string>
		suffixes: Array<string>
		durationFunc: (level: number) => number
		damageMulFunc?: (level: number) => number
		effectFunc?: (level: number) => number
		//		descriptionFunc: ( duration: number, damage: number) => string - part of loc system now
		radiusFunc?: (level: number) => number
		exclusiveTag?: string
		/*
			constructor(
				public allowedTypesT: { [k: string]: boolean },
				public typeS: string,
				public prefixS: string,
				public suffixS: string,
				public durationFunc: ( level: number ) => number,
				public descriptionFunc: ( duration: number, damage: number) => string,
			) {}
			*/
	}

	export interface EnhancementI {
		readonly flavorS: EnhancementFlavor
		levelN: number
	}

	export let enhancementFlavorInfos : {[k: string]: EnhancementFlavorInfoI} =
	{
		fire:
		{
			allowedTypesT: { melee: true, ranged: true, spell: true },
			typeS: "damage",
			prefixes: ["Burning", "Flaming", "Ablaze", "Volcano"],
			suffixes: ["Scorch", "Flame", "Fire", "Inferno"],
			// by using the sqrt of level for each parameter, total damage is linear with level. 
			durationFunc: (level: number) => math.sqrt(level) * 2, // duration  // 2, 3, 3.5, 4
			damageMulFunc: (level: number) => math.sqrt(level) * 0.20,
			//			descriptionFunc: ( duration: number, damage: number ) => "Does " + tostring( math.ceil(damage*100) ) + "\% fire damage for " + string.format( "%.1f", duration ) + " seconds",
			//          3/24, nerfing all effects in half
		},
		cold:
		{
			allowedTypesT: { melee: true, ranged: true, spell: true },
			typeS: "damage",
			prefixes: ["Cold", "Icy", "Freezing", "Arctic"],
			suffixes: ["Cold", "Frost", "Ice", "Winter"],
			durationFunc: (level: number) => math.sqrt(level),  // was 0.75 increasing duration so we can actually feel it work
			effectFunc: (level: number) => 0.85 / math.sqrt(level),
			// 0.85, 0.57, ..., 0.425  
			// 2/28/19: was 0.5, 0.35, .28, 0.25 - think I went high here because I couldn't tell anything was happening but it was actually broken 
			//			descriptionFunc: ( duration, damage ) => `Slows attacks to ${ math.ceil( damage*100 )}% for `+string.format( "%.1f", duration )+" seconds",
		},
		radiant:
		{
			allowedTypesT: { melee: true, ranged: true, spell: true },
			typeS: "damage",
			prefixes: ["Sacred", "Radiant", "Angelic", "Celestial"],
			suffixes: ["Light", "Radiance", "The Sun", "The Angels",],
			durationFunc: () => 0,
			damageMulFunc: (level: number) => level * 0.2,
			//			descriptionFunc: ( duration, damage )=>"Does " + math.ceil(damage*100) + "\% more damage to undead",
			//          3/24 nerfing all effects, from 0.25 to 0.2
			exclusiveTag: "Dark"
		},
		// necro  -- debuffs -- bonus against angels?
		explosive:
		{
			allowedTypesT: { melee: true, ranged: true, spell: true },
			typeS: "special",
			prefixes: ["Shockwave", "Exploding", "Boom", "Airquake"],
			suffixes: ["Concussion", "Shockwave", "Oof", "Quake"],
			radiusFunc: (level: number) => 10 * math.sqrt(level),  // 10, 15, 18, 20
			durationFunc: () => 0,
			damageMulFunc: (level: number) => level * 0.15,
			//			descriptionFunc: ( duration, damage )=> `${ math.ceil(damage*100) }% explosion damage`,
			//          3/24 nerfing all effects
		},
		// lifesteal
		// I thought about making the stat bonuses one point less, but that would mean giving up 1.5 stat points worth of weapon power for 1 stat point worth
		str:
		{
			allowedTypesT: { melee: true, armor: true },
			typeS: "stat",
			prefixes: ["Stout", "Strong", "Ox", "Titan"],
			suffixes: ["Strength", "Sinews", "Ogre Strength", "Giant Strength"],
			durationFunc: () => 0,
			effectFunc: (level: number) => level + 1,
			//			descriptionFunc: ( duration, damage )=> "+" + tostring( damage ) + " Strong",
		},
		dex:
		{
			allowedTypesT: { ranged: true, armor: true },
			typeS: "stat",
			prefixes: ["Precise", "Accurate", "Hawk Eye", "Eagle Eye"],
			suffixes: ["Precision", "Accuracy", "The Hawk", "The Eagle"],
			durationFunc: () => 0,
			effectFunc: (level: number) => level + 1,
			//			descriptionFunc: ( duration, damage )=> "+" + tostring( damage ) + " Sharp",
		},
		con:
		{
			allowedTypesT: { melee: true, ranged: true, armor: true },
			typeS: "stat",
			prefixes: ["Hale", "Tough", "Unyielding", "Bear"],
			suffixes: ["Constitution", "Toughness", "Vitality", "The Bear"],
			durationFunc: () => 0,
			effectFunc: (level: number) => level + 1,
			//			descriptionFunc: ( duration, damage )=> "+" + tostring( damage ) + " Tough",
		},
		will:
		{
			allowedTypesT: { spell: true, armor: true },
			typeS: "stat",
			prefixes: ["Occult", "Arcane", "Mystic", "Philosopher's"],
			suffixes: ["Focus", "The Occult", "The Owl", "The Philosopher"],
			durationFunc: () => 0,
			effectFunc: (level: number) => level + 1,
			//			descriptionFunc: ( duration, damage )=> "+" + tostring( damage ) + " Arcane",
		},
		//--health  : { typeS: "derivedStat", prefixS: "Healthy", suffixS: "Health" },
		//--mana    : { typeS: "derivedStat", prefixS: "Spiritual", suffixS: "Magic" }--]]
	}
}
