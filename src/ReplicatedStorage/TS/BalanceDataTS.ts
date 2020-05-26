export const BalanceData = {
	baseCritChance: 0.05,

	// because level 2 is really only marginally better than level 1, what do we evaluate level 0 at? When you used to get
	// 3 stat points per level we considered it 6 because you'd have 15 points in your munchkin stat which is like 5 levels plus a skoch
	// so now let's call it 16
	effective0LevelStrength: 16,

	healthPotionBaseDropChance: 0.5,
	magicPotionBaseDropChance: 0.5,
	// those #s might seem high but a) it's ok that health is no higher than magic because it is tested first
	// b) the number of potions you have cut the odds
	// c) there's a limited # of chests per level
	// d) loitering cuts the odds

	potionDropGammaN: 1,
	// the higher the number the harder to stockpile;  at 1 the chance is cut in half every potion you have;  0.8 was too low, OP characters would stockpile around 6 on the lower levels
	// I think it has to be >= 1 so it will have an asymptote - 10/29
	// that unfortunately makes it kind of obvious, because if you don't have mana but have health you tend to get mana, but we'll see how it goes

	potionLoiteringHalfLifeN: 180, // cut chance of potion in half after this many seconds
	// 1/3 - used to be 90, but now that potions are in chests I thought it made sense to be less stingy so you can have a decent chance of finding a potion
	//       if you run looking for a chest

	chestDropRateModifierN: 0.45,
	destructibleDropRateModifier: 0.2,
	itemDropRateModifierN: 1,
	// 0.75 might be a tad high
	// 11/18: felt like the drop rate of 0.7 was really low - you have to kill 10 monsters to get 1 thing, and that thing is usually trash,
	//        changed to 2 (1.5 felt low while playing by myself, and 3 felt high, but could be sample size probs) which gets divided by # of players, but in multiplayer games everyone gets
	//        could this be why ratings got so low? let's find out
	// 11/19: 2 was too high. One person even complained about too much stuff! And I never changed it? Haven't had too many complaints since.
	// 11/28: finally changing it

	structureHealthMultiplier: 0.6, // formula got reworked 11/2/19; settled on this number 11/16

	monsterHealthPerLevelN: 0.6, // 1.05 was there to balance out crits, but why? Monsters crit too.
	monsterHealthPerLevelHighLevelServerN: 0.5,
	// 0.22 seemed too low, but that may have been due to bad potion dropping?  // 0.35 too low against level 10-level 15 warriors and rogues - (in the 4 / days)
	// 0.48 is weird, that means a level 2 is 50% healthier than a level 1?
	// 3/24: took out base health - level 0 monsters have 0 health, so we want their health to more closely match player health growth:
	//       which is 74 + localLevel * 8 + this.getAdjBaseStat( "conN", heldToolInst ) * 6  so about 17 / level or 17 / 74 or 20%

	// monsterHealthMultiplierN : 1.4,
	// 2 was too high in one-on-one, and 1.75 was too high against rogues and mages, but then I took away monster armor completely
	// low-level rogues and mages were not making it off the first floor very often at 1.5  - 10/29  - nerfed armor and nerfed this
	// 10/30; +50% health and damage fore veryone to reduce efficacy of armor;  I didn't take monster health up a full 50% (from 1.25)
	//   because monsters would be killing heroes a little more quickly now so it's fair that they die quicker too
	// 11/8: heroes need a buff, clearly, after I nerfed enchantments. cutting monsterDamageMultiplier is a mistake, though, because that gives even
	//   more advantage to armored / health players, and it seems like heroes are sucking from level 1 to level 15, and players are saying they want
	//   more time as heroes, want to get off the first level, so went from 1.8 to 1
	// 11/10: at 1, ratings for the period dropped to 0.6, I had the feeling pepole were quitting before they had a chance to be hero, and session length dropped to 733
	//   (as compared to nearly 1100 the previous Friday, though there were 3x times the players because of sponsoring)
	//   so took it to 1.4;  this had no effect. This was the same weekend that high-level characters weren't being downscaled
	// 11/28: it's clear tough characters are OP,
	// 3/24: took out base health - level 0 monsters have 0 health. Heroes have about 16 / level or so and monsters vary from 15 - 45, so lowered from 1.4, tried 0.5 which felt too low, settled on 1
	//       and turned it right back
	// wishlist fix: this can be factored out now that monster health is linear per level

	monsterDamageMultiplierN: 0.4, // 0.95 was there to balance out crits, but why? Monsters crit too.
	// was 0.5 before I doubled hitpoints and added armor.  .75 seemed too high at first but then I made sure level 1 characters start with armor
	// then I nerfed armor a little (floor instead of ceiling) and it seemed too high again - playing with a group we had a lot of trouble getting off the
	// first floor
	// also, it wanted to be lower when we went back to no-midlevel-hero-churn so that remaining hero had a better shot of getting to next level
	// low-level rogues and mages were not making it off the first floor very often at .5  - 10/29  - nerfed armor and nerfed this
	// 10/30;  +50% health and damage for everyone to reduce efficacy of armor

	// monsters still too weak against 15th level warrior even after nerfing plate on 10/29;
	// increasing monsterHealthPerLevelN from 0.42 to 0.48
	// increasing damageperlevel from 0.015 to 0.025,
	// because I just lowered the starting monster stats but a 15th level hero could have a 30th level weapon
	// or 30th level armor
	// 3/24: it's probably me forgetting how weapon damage works, but monsters are killing heroes too quickly after the balance adjustment, and I'm just fudging it
	//      .25 too low so .4

	// 10/30;  instead of making monsters do more damage automatically, having them hold bigger weapons to more closely match what heroes do
	// their numbers approximate putting more than 2 points into their main stat;  since their health is also going up faster than heroes
	// they'll eventually become unstoppable

	monsterWeaponLevelMultiplierN: 0.5, // now that we've changed how monsters work we need their weapon to not go up so fast - used to be 1.5 - 3/24
	// 11/16: now that we changed the progression of what level a hero's weapon needs we need to nerf for monsters so it throws off our math less
	// we used 1.5 before as if the monster's primary stat was going up at that speed
	monsterStartingLevelFactor: 0.75,

	monsterDefaultDamagePerLevelBonusN: 0.015, // heroes get 0.005 per point or 0.015 / level if they munchkin a stat, but they get weapons way more powerful than the monsters
	monsterDefaultDamagePerLevelBonusHighLevelServerN: 0.0,
	// 0.015 felt too weak against
	// some monsters have their own damageperlevel, such as the gremlin

	monsterLevelTimeXPFactor: 0.15,
	// 3/28 - it was 0.25 and 0.2, felt they started too weak and got too strong too fast in general

	dungeonFloorDifficultyK: 0.1666, // 0.05     // 5% stronger every level?   - 0.025 seemed too weak;  used both to increase monster level and structure hit points
	//levelTimeDifficultyK : 0.10 / 90,  // 60 seemed too low.  120 seemed too high
	// 0.1666 was tested for monsters but not for destructible structures

	sidekickDamageReductionMin: 0.3, // 0.2 <-> 0.4 seemed too low
	sidekickDamageReductionMax: 0.6,

	// note, because you can't go lower than level 1, and a 3 on 1 is a thing that happens, the minfactor can't go lower than .66.  Make monsters easier by lowering their monster multipliers instead if you hit bottom here
	outnumberedMinFactorN: 0.67, // 0.6 too high, 'swarms' annoying, 0.3 too low, a level 4 against 3 monsters is unstoppable
	outnumberedSpreadN: 0.63, // so turned this up from 0.7 as well so 1 on 1 would still be against 1.3

	// 10/30 took from weaponDamagePer 0.2 and armorDefensePer 0.15 to 0.15 and 0.11;  a 15th level character could do 8 times the damage of a 1st level
	// and that made the disparity too great. It can still be a lot higher because doing that much damage means you put nothing into health,
	// so I didn't cut it completely in half.  Side note: it used to be this before I added armor.
	// also on 10/30 came the days of monsters using higher level weapons; at that point it was fine for armordefenseperlevel to stay high (0.15)
	// because the monsters were effectively getting 0.225 damage bonus per level
	weaponDamagePerLevelN: 0.15,
	armorDefensePerLevelN: 0.15, // 0.1 seemed too low for a 10th level warrior with good armor; don't want to go crazy though and weaken the mage/rogue too much
	// so did 0.14.  In theory as long as it's below weapon damage per level we're ok
	// 0.17 was too high; warriors and full plate were untouchable. Nerfed full plate and took this to 0.16  - 10/29
	// looking at chat it looked like .16 still too high.

	// if mana restore is linear mages won't get out of control
	// if it's a percentage mages won't lose their power
	manaRestorePctN: 0.0075, // half a percent. one percent was too high
	// feeling like half a percent is too low, 10/30

	heroXPMultiplierN: 1.5, // at 2, powerplaying was complaining about it taking 80 kills to go up from 6th level - we probably need to fact check that.
	// the game used to be more popular with a slower leveling rate, I discovered, and looking at the old numbers it was closer to 2.5
	// after the difficulty adjustments leveling may be coming too quickly, I'm getting multiple levels in one session, so lowered to 1.5 both to compensate for
	// not adjusting by monsterHealthMultiplier and to take it down a notch

	// 11/30: setting default walkspeed back to Roblox standard
	walkspeedMultiplierN: 1.33,
};
