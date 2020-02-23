import { Hero } from ".//HeroTS"


export class HeroStable 
{
	static readonly latestVersionN = 4  // changing to GearPool
	private saveVersionN = HeroStable.latestVersionN
	public heroesA = new Array<Hero>()

	static convertFromRemote( rawHeroStableData: object )
	{
		let heroStable = setmetatable( rawHeroStableData as HeroStable, HeroStable as LuaMetatable<HeroStable> ) as HeroStable
		
		heroStable.heroesA.forEach(element => {
			Hero.convertFromRemote( element )
		});
		
		return heroStable
	}

	static convertFromPersistent( rawHeroStableData: object )
	{
		let heroStable = setmetatable( rawHeroStableData as HeroStable, HeroStable as LuaMetatable<HeroStable> ) as HeroStable
		
		heroStable.heroesA.forEach(element => {
			Hero.convertFromPersistent( element, heroStable.saveVersionN )
		});
		
		return heroStable
	}

	checkVersion( player: Player )
	{
		this.heroesA.forEach(hero => {
			hero.updateStoredData( this.saveVersionN, HeroStable.latestVersionN, player )  // not all of the updating is done here, some is done in the individual convertFromPersistent calls from the heroes
		});
		this.saveVersionN = HeroStable.latestVersionN
	}

	getHighestHeroLevel()
	{
		return this.heroesA.size() >= 1 ? math.max( ...this.heroesA.map( hero => hero.getActualLevel() ) ) : 0
	}
}
