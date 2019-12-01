print( script:GetFullName().." executed" )

local Costumes          = require( game.ServerStorage.Standard.CostumesServer )
local PlayerXL          = require( game.ServerStorage.Standard.PlayerXL )

local CharacterI        = require( game.ServerStorage.CharacterI )
local FlexibleTools     = require( game.ServerStorage.FlexibleToolsModule )
local FlexEquip         = require( game.ServerStorage.FlexEquipModule )
local Inventory         = require( game.ServerStorage.InventoryModule )
local Monsters          = require( game.ServerStorage.MonstersModule )

local DebugXL           = require( game.ReplicatedStorage.Standard.DebugXL )

local CharacterClientI  = require( game.ReplicatedStorage.CharacterClientI )
local FloorData         = require( game.ReplicatedStorage.FloorData )
local PossessionData    = require( game.ReplicatedStorage.PossessionData )
local MonsterUtility    = require( game.ReplicatedStorage.MonsterUtility )
local WerewolfUtility   = require( game.ReplicatedStorage.WerewolfUtility )

local PlayerUtility = require( game.ReplicatedStorage.TS.PlayerUtility ).PlayerUtility
local ToolData = require( game.ReplicatedStorage.TS.ToolDataTS ).ToolData

local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

local Werewolf = {}

-- werewolf module assumes we've used costumesserver to save the original player's costume


function Werewolf:TakeHumanFormWait( player )
	DebugXL:Assert( self == Werewolf )
	DebugXL:Assert( player:IsA("Player") )
	
	if( not PlayerUtility.IsPlayersCharacterAlive( player )) then return end

	local character = player.Character
	local taggerFlavorS = MonsterUtility:GetClassWait( character ) 
	if taggerFlavorS == "Werewolf" then  -- safety check for hackers
		local heldTool = character:FindFirstChildWhichIsA("Tool")
		if heldTool then heldTool:Destroy() end
--		warn( "Clearing "..player.Name.."'s backpack" )
		
		Costumes:LoadCharacter( player, {}, {}, false, character )

		local pcData = CharacterI:GetPCDataWait( player )
		pcData:equipAvailableArmor()		

		-- we don't need to unequip held weapon, the costume application did that for us
		-- clear claws from hotbar		
		for i = 1,4 do
			CharacterClientI:AssignPossessionToSlot( pcData, nil, i )
		end
		FlexEquip:ApplyEntireCostumeWait( player, pcData, Inventory:GetActiveSkinsWait( player ).hero )

		-- put non-claws in hotbar; not bothering to equip 
		local slot = 1
		for k, toolInst in pairs( pcData.itemsT ) do
			local baseDataS = toolInst.baseDataS
			if baseDataS ~= "ClawsWerewolf" then
				if ToolData.dataT[ baseDataS ].useTypeS ~= "worn" then
					CharacterClientI:AssignPossessionToSlot( pcData, k, slot )
					slot = slot + 1
				end
			end
		end
		PlayerServer.updateBackpack( player, pcData )
				
		workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )		
		
		local humanoid = player.Character:FindFirstChild("Humanoid")
		if humanoid then
			-- they can tell you're a werewolf if they hit you and your health bar goes down
			humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None
		end
	end
end


function Werewolf:WolfOutWait( player )
	DebugXL:Assert( self == Werewolf )
	DebugXL:Assert( player:IsA("Player") )
	
	if( not PlayerUtility.IsPlayersCharacterAlive( player )) then return end

	local character = player.Character
	local taggerFlavorS = MonsterUtility:GetClassWait( character )
	if taggerFlavorS == "Werewolf" then		
		local heldTool = player:FindFirstChildWhichIsA("Tool")
		if heldTool then heldTool:Destroy() end
		
		local inventory = Inventory:GetWait( player )
		local noAttachSet = Costumes.allAttachmentsSet
		if inventory then
			if not inventory.settingsT.monstersT[ "Werewolf" ].hideAccessoriesB then
				noAttachSet = {}
			end
		end	
		local destCharacter = Costumes:LoadCharacter( player, { game.ServerStorage.Monsters.Werewolf }, noAttachSet, true, character )
		
		local humanoid = destCharacter:FindFirstChild("Humanoid")
		
		-- set health display back to normal
		humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.Viewer
--      managed by CharacterXL now:
--		humanoid.WalkSpeed = PossessionData.dataT[ taggerFlavorS ].walkSpeedN

		-- we don't need to unequip held weapon, the costume application did that for us
		-- remove cosmetic armor
		local pcData = CharacterI:GetPCDataWait( player )
		for _, item in pairs( pcData.itemsT ) do
			item.equippedB = nil
		end
		-- clear human weapons from hotbar		
		for i = 1,4 do
			CharacterClientI:AssignPossessionToSlot( pcData, nil, i )
		end

		-- put claws in hotbar and equip
		for k, toolInst in pairs( pcData.itemsT ) do
			if toolInst.baseDataS == "ClawsWerewolf" then
				CharacterClientI:AssignPossessionToSlot( pcData, k, 1 )
				-- FlexibleTools:CreateTool( { 
				-- 	toolInstanceDatumT = toolInst,
				-- 	destinationPlayer = player,
				-- 	activeSkinsT = Inventory:GetActiveSkinsWait( player ).monster,
				-- 	possessionsKey = k } )				
			elseif toolInst.baseDataS == "TransformWerewolf" then
				CharacterClientI:AssignPossessionToSlot( pcData, k, 2 )
				-- FlexibleTools:CreateTool( { 
				-- 	toolInstanceDatumT = toolInst,
				-- 	destinationPlayer = player,
				-- 	activeSkinsT = Inventory:GetActiveSkinsWait( player ).monster,
				-- 	possessionsKey = k } )				
			end
		end
		PlayerServer.updateBackpack( player, pcData )

		workspace.Signals.HotbarRE:FireClient( player, "Refresh", pcData )
	end
end


function Werewolf:ToggleForm( player )
	if not Costumes:ApplyingCostume( player.Character ) then
		if player.Character:FindFirstChild("Werewolf Head") then
			Werewolf:TakeHumanFormWait( player )
		else
			Werewolf:WolfOutWait( player )
		end
	end
end


workspace.Signals.WerewolfRE.OnServerEvent:Connect( function( player, funcName, ... )
	if Werewolf[ funcName ] then
		local classS = MonsterUtility:GetClassWait( player.Character )
		if classS == "Werewolf" then		
			Werewolf[ funcName ]( Werewolf, player, ... )
		end
	else
		-- probably a hacker 
		DebugXL:Error( "Attempt to call nonexistent function Werewolf:"..tostring( funcName ) )
	end
		
end )


return Werewolf

