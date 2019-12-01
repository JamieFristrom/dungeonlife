import { Hero } from ".//HeroTS"


export class HeroStable 
{
	static readonly latestVersionN = 3
	private saveVersionN = HeroStable.latestVersionN
	public heroesA = new Array<Hero>()

	static objectify( rawHeroStableData: object )
	{
		let heroStable = setmetatable( rawHeroStableData as HeroStable, HeroStable as LuaMetatable<HeroStable> ) as HeroStable
		
		heroStable.heroesA.forEach(element => {
			Hero.objectify( element )
		});
		
		return heroStable
	}

	checkVersion( player: Player )
	{
		this.heroesA.forEach(hero => {
			hero.updateStoredData( this.saveVersionN, HeroStable.latestVersionN, player )
		});
		this.saveVersionN = HeroStable.latestVersionN
	}

	getHighestHeroLevel()
	{
		return this.heroesA.size() >= 1 ? math.max( ...this.heroesA.map( hero => hero.getActualLevel() ) ) : 0
	}
}
