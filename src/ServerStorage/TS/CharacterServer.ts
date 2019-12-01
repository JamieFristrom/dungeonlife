import { Teams, Players, RunService, Workspace } from "@rbxts/services"

import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS"
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { PC } from "ReplicatedStorage/TS/PCTS"
import InstanceXL = require("ReplicatedStorage/Standard/InstanceXL");
import { PlayerServer } from "./PlayerServer";


export namespace CharacterServer
{
    
    // had to keep this out of HeroServer because it needs to be used by CharacterXL ; couldn't include PlayerServer for same reason
    export function IsDangerZoneForHero( pcs: Map< Player, PC >, player: Player ) : boolean
    {
        DebugXL.Assert( player.Team === Teams.FindFirstChild('Heroes'))
        if( player.Team !== Teams.FindFirstChild('Heroes') ) return false

        let playerPc = pcs.get( player )
        DebugXL.Assert( playerPc !== undefined )
        if( !playerPc ) return false
        let myLevel = playerPc.getLocalLevel()
        DebugXL.Assert( myLevel !== undefined )
        let dangerZone = false
        if( myLevel )
        {
            pcs.forEach( (pcData)=>
            {
                // did it this way instead of pcData instanceof Hero to avoid a circular dependency with CharacterXL -> CharacterServer -> Hero -> ... -> CharacterXL
                if( pcData.getTeam() === Teams.FindFirstChild('Heroes') ) {
                    if( ( pcData.getActualLevel() + BalanceData.effective0LevelStrength ) / ( myLevel! + BalanceData.effective0LevelStrength ) >= 11/7 )
                    {
                        dangerZone = true  // an early out would be nice but hard with the forEach
                    }
                }
            })
        }
        return dangerZone
    }

    export function giveAuraOfCourage( character: Model, damageReduction: number )
    {
        print(`Giving ${character.Name} aura of courage`)
        let duration = math.huge
        let effectUntil = time() + duration
        InstanceXL.CreateSingleton( 'Vector3Value', 
            { Name: 'AuraOfCourage', Value: new Vector3( damageReduction, effectUntil, 0 ), Parent: character } )
    }
/*    
function CharacterXL:GiveAuraOfCourage( character, damageReduction, duration )
print("Giving "..character.Name.." aura of courage")
duration = duration or math.huge
local effectUntil = time() + duration
InstanceXL:CreateSingleton( "Vector3Value", { Name = "AuraOfCourage", Value = Vector3.new( damageReduction, effectUntil, 0 ), Parent = character } )	
end
*/

    export function checkAuraOfCourage( character: Model )
    {
        character.GetChildren().forEach( (child)=>
        {
            if( child.Name === 'AuraOfCourage' )
            {
                let vectorValue = child as Vector3Value
                let player = Players.GetPlayerFromCharacter( character )
                DebugXL.Assert( player !== undefined )
                if( player ) 
                {
                    if( time() > vectorValue.Value.Y || !CharacterServer.IsDangerZoneForHero( PlayerServer.pcs, player ) )
                    {
                        print('Dismissing aura of courage')
                        child.Parent = undefined
                    }
                }
            }
        } )
    }
/*
elseif instance.Name == "AuraOfCourage" then  -- we can abstract this later
-- specifically making this stateful; you either start the level with it or you don't, and as soon as the level
-- becomes safe it goes away. This way as the level naturally ramps up in difficulty you don't get a boost
if time() > instance.Value.Y or not CharacterServer.IsDangerZoneForHero( PlayerServer.pcs, player ) then
    print("Dismissing Aura of Courage")
    instance:Destroy()
end
end
*/

    RunService.Heartbeat.Connect( () =>
    {
        Players.GetPlayers().forEach( (player)=>
        {
            if( player.Character )
                if( player.Character.Parent === Workspace )
                    checkAuraOfCourage( player.Character )
        })
    })
/*
game["Run Service"].Heartbeat:Connect( function( deltaT )
	-- monitor freezing
	for _, player in pairs( game.Players:GetPlayers() ) do
		if player.Character then
			if player.Character.Parent == workspace then
				ProcessPC( player.Character, deltaT )
			end
		end
	end
end)
*/
}