
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI('Executed', script.GetFullName())

import { CharacterClasses } from 'ReplicatedStorage/TS/CharacterClasses'
import { Players, Teams } from '@rbxts/services'
import { CharacterRecord } from 'ReplicatedStorage/TS/CharacterRecord'
import * as CharacterI from 'ServerStorage/Standard/CharacterI'
import { RandomGear } from './RandomGear'


export namespace LootServer {

    export function drop( targetLevel: number, earningPlayer: Player, boosted: boolean ) {
        if( earningPlayer.Team !== Teams.FindFirstChild<Team>('Heroes')) {
            DebugXL.logW('Gameplay', earningPlayer.GetFullName()+' turned monster before getting loot')
            return
        }
        const characterRecord = CharacterI.GetPCDataWait( earningPlayer )  // this looks like it could lock up fairly easily
        if( ! characterRecord is Hero )

        const heroLevel = heroRecord.getActualLevel()
        const flexTool = RandomGear.ChooseRandomGearForPlayer( 
            math.floor( heroLevel/3),
            math.floor( targetLevel/3),
            earningPlayer,
            heroRecord,
            Inventory.BoostActive(earningPlayer),
            boosted )
        if( !flexTool ) {
            return ""
        }
        DebugXL.Assert( flexTool.levelN >= 1 )
        const activeSkins = Inventory.GetActiveSkinsWait( earningPlayer )

    }

	DebugXL:Assert( flexTool.levelN >= 1 )
	local activeSkinsT = Inventory:GetActiveSkinsWait( _destinationPlayer ).hero 
	if player then
		workspace.Signals.LootDropRE:FireClient( player, "item", flexTool, activeSkinsT, worldPosV3 )

		Heroes:RecordTool( player, flexTool )
	end

	return "EnhanceLvl"..flexTool:getTotalEnhanceLevels()..":".."RelativeLvl"..(flexTool:getActualLevel()-playerLevel)
end

    export function monsterDrop( monsterLevel: number, monsterClassS: string, wasMob: boolean, lastAttackingPlayer?: Player ) {
        const odds = CharacterClasses.monsterStats[ monsterClassS ].dropItemPctN * itemDropRateModifierN / #game.Teams.Heroes:GetPlayers()
        --	--print( "Loot:MonsterDrop level "..monsterLevel.."; odds: "..odds )
            for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
                const boostInPlay = false
                if Inventory:BoostActive( player ) then
                    odds = odds * 2
                    boostInPlay = true
            --			--print( "Loot drop odds doubled to "..odds )
                end
                if not playerLootRandomishers[ player ] then
                    playerLootRandomishers[ player ] = Randomisher.new( 7 )
                end
                const dieRoll = playerLootRandomishers[ player ]:next0to1()	
                if dieRoll <= odds then
                    const playerCharacterKey = PlayerServer.getCharacterKeyFromPlayer( player )
                    if playerCharacterKey then
                        const averageLevel = ( monsterLevel + PlayerServer.getActualLevel( playerCharacterKey ) ) / 2
            --			--print( "Loot:MonsterDrop HIT: "..player.Name..": odds: "..odds.."; dieRoll: "..dieRoll )
                        Loot:Drop( averageLevel, player, false, worldPosV3, boostInPlay and ( dieRoll >= odds / 2 ) )		
                    end
            --			return   -- 			
                else
        --			--print( "Loot:MonsterDrop miss: "..player.Name..": odds: "..odds.."; dieRoll: "..dieRoll )
                end
            end
        
            -- if lastAttackingPlayer then
            -- 	-- you still might get a potion even if you get loot;  otherwise boost will diminish your chance of finding potions
            -- 	-- boost does not effect potion chance
            -- 	-- chance to drop affected by how many potions they already have (use 'em or lose 'em.  use 'em or don't get any more of 'em anyway)
            -- 	if Loot:CheckForPotionDrop( lastAttackingPlayer, monsterLevel, healthPotionDropChance, "Healing", worldPosV3 ) then return end
            -- 	Loot:CheckForPotionDrop( lastAttackingPlayer, monsterLevel, magicPotionDropChance, "Mana", worldPosV3 )
            -- end    }
}
function Loot:MonsterDrop( monsterLevel, monsterClassS, lastAttackingPlayer, worldPosV3 )

end