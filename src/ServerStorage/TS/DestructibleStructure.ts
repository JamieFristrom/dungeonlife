
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { TweenService, CollectionService, Teams } from '@rbxts/services'

import * as MathXL from 'ReplicatedStorage/Standard/MathXL'

import { HeroServer } from './HeroServer'
import { DungeonDeck } from './DungeonDeck'
import { DestructibleServer } from './DestructibleServer'
import { LootServer } from './LootServer'

const flyApartSeconds = 1.0

const heroesTeam = Teams.WaitForChild<Team>("Heroes")

export class DestructibleStructure
{
	constructor( public destructibleInstance: Model ) {
		DebugXL.logD("Gameplay", "Destructible.new called for "+destructibleInstance.GetFullName())
		CollectionService.AddTag( destructibleInstance, "CharacterTag" )
		CollectionService.AddTag( destructibleInstance, "Destructible" )
		const humanoid = destructibleInstance.FindFirstChild<Humanoid>("Humanoid")
		DebugXL.Assert(humanoid!==undefined)
		if( humanoid ) {
			// this should get recalibrated once level starts properly but just in case...
			const averageHeroLocalLevel = HeroServer.getAverageHeroLocalLevel()
			const numHeroes = heroesTeam.GetPlayers().size()
			const dungeonDepth = DungeonDeck.getCurrentDepth()
			DestructibleServer.calibrateHealth( destructibleInstance, averageHeroLocalLevel, numHeroes, dungeonDepth )
			humanoid.Died.Connect( ()=>{
				LootServer.destructibleDrop(destructibleInstance)
				DebugXL.logI("Gameplay", destructibleInstance.GetFullName()+' died')
				destructibleInstance.PrimaryPart!.FindFirstChild<Sound>("Destroyed")!.Play()
				this.flyApart()
				wait(flyApartSeconds)
				destructibleInstance.Parent = undefined
			})
			DebugXL.logD("Gameplay", humanoid.GetFullName()+" died connected")
			const hitSoundEmitter = destructibleInstance.PrimaryPart!.FindFirstChild<Sound>("Hit")
			let lastHealth = humanoid.Health
			humanoid.HealthChanged.Connect( (newHealth: number)=>{
				if( newHealth<lastHealth ) {
					hitSoundEmitter!.Play()
				}
				lastHealth = newHealth
			})
		}
	}

	flyApart() {
		for( let descendent of this.destructibleInstance.GetDescendants() ) {
			if( descendent.IsA("BasePart") ) {
				if( MathXL.RandomNumber() > 0.5 ) {
					descendent.Anchored = false
					descendent.Velocity = new Vector3( MathXL.RandomNumber(-20, 20), 
						MathXL.RandomNumber(20, 40),
						MathXL.RandomNumber(-20, 20))
					TweenService.Create( descendent, new TweenInfo( 1 ), { Transparency: 1 }).Play()
				}
				else {
					// I've been destroying objects this way for a while now so that structures don't get dismantled on destruction
					// and parent-child references are still intact requiring fewer if checks in other parts of the code. So far it's been fine.
					descendent.Parent = undefined
				}
			}
		}
	}
}
