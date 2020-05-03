import { PitTrap } from 'ServerStorage/TS/PitTrap'

import * as CharacterI from 'ServerStorage/Standard/CharacterI'
import * as PossessionData from 'ReplicatedStorage/Standard/PossessionDataStd'

import { Players, Teams } from '@rbxts/services';
import { PlayerServer } from './PlayerServer';

export class PitTrapSpiked extends PitTrap
{
	constructor( _script: Script )
	{
		super( _script )
		
		let trapDatum = PossessionData.dataT[ this.trap.Name ]
		let ouchZone = this.trap.FindFirstChild<BasePart>('OuchZone')!
        let heroesTeam = Teams.FindFirstChild('Heroes')!

		ouchZone.Transparency = 1

		// you can only be hurt by a trap once
		let whoAmIHurting = new Set<Player>()

		ouchZone.Touched.Connect( ( toucher )=>
		{
			if( toucher.Parent!.FindFirstChild("Humanoid") ) {
				let character = toucher.Parent as Model
				let player = Players.GetPlayerFromCharacter( character )
				
				if( player ) {
					if( player.Team === heroesTeam ) {
						if( ! whoAmIHurting.has( player ) ) {
							let creator = this.trap.FindFirstChild<ObjectValue>('creator')! 
							let damagePerLevel = 1.5 // GameplayTestService.getServerTestGroup('ChestTrapDamage') * 0.5 + 1  // 0-4 => 1-3

							CharacterI.TakeDirectDamage( character, 
								trapDatum.baseDamageN! + damagePerLevel * PlayerServer.getLocalLevel( PlayerServer.getCharacterKeyFromCharacterModel( character ) )!,
								creator.Value as Player, { spell: true } )  // wishlist fix;  if( rogues get detect traps there'd be something to be said for 				
							whoAmIHurting.add( player )
						}
					}
				}
			}	
		})
/*
		local trapDatum = PossessionData.dataT[ script.Parent.Name ] 

		script.Parent.OuchZone.Transparency = 1
		
		local whoAmIHurting = {}
		
		script.Parent.OuchZone.Touched:Connect( function( toucher )
			if( toucher.Parent:FindFirstChild("Humanoid") ) {
				local character = toucher.Parent 
				local player = game.Players:GetPlayerFromCharacter( character )
				if player ) {
					if player.Team == game.Teams.Heroes ) {
						if not whoAmIHurting[ player ] ) {
							CharacterI:TakeDirectDamage( character, 
								trapDatum.baseDamageN + trapDatum.damagePerLevelN * CharacterClientI:GetLevel( player ),
								script.Parent.creator.Value, {} )  -- wishlist fix;  if rogues get detect traps there'd be something to be said for 				
							whoAmIHurting[ player ] = true
						end
					end
				end
			end	
		end)
		*/
	}

}


