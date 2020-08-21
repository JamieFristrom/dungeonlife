
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local Costumes          = require( game.ServerStorage.Standard.CostumesServer )

local PlayerTracker = require( game.ServerStorage.TS.PlayerServer ).PlayerTracker
local ToolCaches = require( game.ServerStorage.TS.ToolCaches ).ToolCaches

local PossessionData    = require( game.ReplicatedStorage.PossessionData )

local PlayerUtility = require( game.ReplicatedStorage.TS.PlayerUtility ).PlayerUtility
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData
local CharacterRecord = require( game.ReplicatedStorage.TS.CharacterRecord ).CharacterRecord
local ActiveSkins = require( game.ReplicatedStorage.TS.SkinTypes ).ActiveSkins

local TableXL = require( game.ReplicatedStorage.Standard.TableXL )

local FlexEquip = {}


function FlexEquip:ApplyEntireCostumeWait( playerTracker, player, pcData, activeSkinsT )
	DebugXL:Assert( self==FlexEquip )
	DebugXL:Assert( TableXL:InstanceOf( playerTracker, PlayerTracker ))
	DebugXL:Assert( player:IsA("Player") )
	DebugXL:Assert( TableXL:InstanceOf( pcData, CharacterRecord ))
	DebugXL:Assert( type(activeSkinsT)=="table" )

	if( not PlayerUtility.IsPlayersCharacterAlive( player )) then return end

	local equippedItemModelsA = {}
	local noAttachmentsSet = {}
	pcData.gearPool:forEach( function( item, _ )
		if item.equippedB then
			local equipDatum = ToolData.dataT[ item.baseDataS ]
			if not item.hideItemB then
				local baseEquipS = activeSkinsT[ equipDatum.skinType ] and PossessionData.dataT[ activeSkinsT[ equipDatum.skinType ] ].baseEquipS or equipDatum.baseEquipS
				local baseEquipObj = game.ServerStorage.Equip[ baseEquipS ]
				table.insert( equippedItemModelsA, baseEquipObj )
			end
			if item.hideAccessoriesB then
				local equipSlot = equipDatum.equipSlot
				for _, attachName in pairs( Costumes.attachmentsForEquipSlotT[ equipSlot ] ) do
					noAttachmentsSet[ attachName ] = true
				end
			end
		end
	end )
	
	DebugXL:logD( LogArea.Characters, 'FlexEquipModule - Costumes:LoadCharacter for '..player.Name )
	Costumes:LoadCharacter( player, equippedItemModelsA, noAttachmentsSet, true, player.Character )
	DebugXL:logV( LogArea.Characters, 'FlexEquipModule - character loaded for '..player.Name )
	
	-- loading a character erases the backpack, so:
	local characterKey = playerTracker:getCharacterKeyFromPlayer( player )
	ToolCaches.updateToolCache( playerTracker, characterKey, pcData, activeSkinsT )
end

function FlexEquip:ApplyEntireCostumeIfNecessaryWait( playerTracker, inventoryManager, player )
	if player.Team == game.Teams.Heroes then
		local character = player.Character
		if character then
			if character.Parent then
				local skinOwnerS = "monster"
				if player.Team == game.Teams.Heroes then
					skinOwnerS = "hero"
				end
				local allActiveSkinsT = inventoryManager:GetActiveSkinsWait( player )
				local _activeSkinsT = allActiveSkinsT[ skinOwnerS ]
	
				local pcData = playerTracker:getCharacterRecordFromPlayerWait( player )
				FlexEquip:ApplyEntireCostumeWait( playerTracker, player, pcData, _activeSkinsT )
			end
		end
	end
end

return FlexEquip
