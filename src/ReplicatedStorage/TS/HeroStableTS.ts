import { Hero } from ".//HeroTS"
import { RawHeroDataI } from "./HeroClassesTS"

interface RawHeroStableDataI {
	heroesA: RawHeroDataI[]
	saveVersionN: number
}

export class HeroStable {
	static readonly latestVersionN = 4  // changing to GearPool
	private saveVersionN = HeroStable.latestVersionN
	public heroesA: Hero[] = []

	static convertFromRemote(rawHeroStableData: object) {
		let heroStable = setmetatable(rawHeroStableData as HeroStable, HeroStable as LuaMetatable<HeroStable>) as HeroStable

		heroStable.heroesA.forEach(element => {
			Hero.convertFromRemote(element)
		});

		return heroStable
	}

	static convertFromPersistent(rawHeroStableData: RawHeroStableDataI, playerNameDebug: string) {
		rawHeroStableData.heroesA.forEach(hero => {
			Hero.convertFromPersistent(hero, rawHeroStableData.saveVersionN, playerNameDebug)
		});
		let heroStable = setmetatable(rawHeroStableData as unknown as HeroStable, HeroStable as LuaMetatable<HeroStable>) as HeroStable

		return heroStable
	}

	checkVersion(player: Player) {
		this.heroesA.forEach(hero => {
			hero.updateStoredData(this.saveVersionN, HeroStable.latestVersionN, player)  // not all of the updating is done here, some is done in the individual convertFromPersistent calls from the heroes
		});
		this.saveVersionN = HeroStable.latestVersionN
	}

	getHighestHeroLevel() {
		return this.heroesA.size() >= 1 ? math.max(...this.heroesA.map(hero => hero.getActualLevel())) : 0
	}
}
