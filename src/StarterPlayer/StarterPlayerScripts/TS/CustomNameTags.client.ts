import * as CharacterClientI from "ReplicatedStorage/Standard/CharacterClientI"
import * as InstanceXL from "ReplicatedStorage/Standard/InstanceXL"
import * as WerewolfUtility from "ReplicatedStorage/Standard/WerewolfUtility"

import { PCMonitor } from "ReplicatedStorage/TS/PCMonitor"
import { ReplicatedStorage, Players, Teams } from "@rbxts/services";
import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS";
import { Localize } from "ReplicatedStorage/TS/Localize";

// doing this on the client side so we can color appropriately for viewer, and also possibly show different info
// for werewolves

let nameTagTemplate = ReplicatedStorage.WaitForChild("NameTag")
let potionTemplate = nameTagTemplate.WaitForChild("PotionIconTemplate")

let showLocalPlayerBar = false

let heroesTeam = Teams.WaitForChild<Team>('Heroes')
let monstersTeam = Teams.WaitForChild<Team>('Monsters')

while( true ) 
{
	wait(0.1) 
	Players.GetPlayers().forEach( (player)=>
	{
		if( showLocalPlayerBar || player !== Players.LocalPlayer )
		{
			if( player.Character ) 
			{
				let head = player.Character.FindFirstChild("Head")
				if( head ) 
				{
					let tag = head.FindFirstChild<BillboardGui>("NameTag")
					if( !tag ) 
					{
						tag = nameTagTemplate.Clone() as BillboardGui
						tag.Enabled = true
						print( "Custom tagging "+player.Character.Name )
						tag.Parent = head
					}
					
					let className = CharacterClientI.GetCharacterClass( player )

					let undercoverWerewolfB = CharacterClientI.GetCharacterClass( player )==="Werewolf" && WerewolfUtility.IsUndercover( player.Character )

					let theirLevelStr = PCMonitor.getPublishedLevel( player )
					let theirLevel = theirLevelStr.match( '%d+' )[0] as unknown as number
					let name = player.Name
					if( className !== "DungeonLord" ) 
					{
						if( undercoverWerewolfB ) 
						{
							let arbitraryHeroLevel = 5
							let arbitraryHero = heroesTeam.GetPlayers()[1]
							if( arbitraryHero )
							{
								let levelStr = PCMonitor.getPublishedLevel( arbitraryHero )
								arbitraryHeroLevel = levelStr.match( '%d+' )[0] as unknown as number
								arbitraryHeroLevel = arbitraryHeroLevel ? arbitraryHeroLevel : 5
							}
							theirLevel = math.min( theirLevel, arbitraryHeroLevel ) 
						}
						if( theirLevel !== undefined ) 
						{
							name += '('+theirLevel+')'
						}
					}
		
					let frame = tag.FindFirstChild<Frame>('Frame')!
					let frameTextLabel = frame.FindFirstChild<TextLabel>('Text')!
					frameTextLabel.Text = name
					frameTextLabel.TextColor3 = player.Team === heroesTeam ? player.Team.TeamColor.Color : new Color3(1,1,1)
					if( player.Team === monstersTeam ) 
					{
//						print( player.Name.." on other team" )
						if( CharacterClientI.GetCharacterClass( player )==="Werewolf" && WerewolfUtility.IsUndercover( player.Character ) )
						{
							// hiding werewolf, better color their name blue if we're a hero
							if( Players.LocalPlayer!.Team === heroesTeam ) 
							{
								frameTextLabel.TextColor3 = heroesTeam.TeamColor.Color
							}
//							print( player.Name.." is a stealth werewolf" )
						}
						else 
						{
							// what's the level differential
							if( theirLevel ) 
							{
								let theirEffectiveLevel = theirLevel + BalanceData.effective0LevelStrength
								let myLevelStr = PCMonitor.getPublishedLevel( Players.LocalPlayer )
								let myEffectiveLevel = myLevelStr.match( '%d+' )[0] as unknown as number 
								if( myEffectiveLevel ) 
								{
									myEffectiveLevel += BalanceData.effective0LevelStrength
									if( myEffectiveLevel > theirEffectiveLevel ) 
									{	
										// leave white, I don't want to paint targets on their heads after all
//										let ratio = math.max( ( theirEffectiveLevel / myLevel - 0.5 ) * 2, 0 )					
		//								print( player.Name.." is weaker. Ratio "..ratio )
//										frameTextLabel.TextColor3 = Color3.new(0,1,0).lerp( Color3.new(1,1,1), ratio )
									}
									else if( myEffectiveLevel < theirEffectiveLevel ) 
									{
										// I am having amazing difficulty mathing right now
										// 1 is safe
										// 0 is death
										// 0 = 0.5
										// 1 = 1
										// x = ( y - 0.5 ) * 2 ?
										// y of 0 -> -1  y of 0.5 -> 0  y of 1 -> 1  y of 0.25 -> -0.5 y of 0.75 -> .5  
										let ratio = math.max( ( myEffectiveLevel / theirEffectiveLevel - 0.5 ) * 2, 0 )					
		//								print( player.Name.." is stronger. Ratio "..ratio )
										const red = new Color3(1,0,0)
										frameTextLabel.TextColor3 = red.Lerp( new Color3(1,1,1), ratio )
										if( ratio <= 0 ) {
											frameTextLabel.Text = "💀" + name + "💀"
										}
									}
								}
							}
						}
					}		
					
					// I wanted the potion icons to the left of the nametag but it's too hard to position with
					// Roblox's UI. Instead
					let potions = frame.WaitForChild('Potions')
					InstanceXL.ClearAllChildrenBut( potions, "UIListLayout" )
					let numPotions = PCMonitor.getNumHealthPotions( player )
					for( let i = 0; i<numPotions; i++ )
					{
						let newPot = potionTemplate.Clone() as ImageLabel
						newPot.Visible = true
						newPot.Parent = potions
					}
				}
			}
		}
	} )
}
