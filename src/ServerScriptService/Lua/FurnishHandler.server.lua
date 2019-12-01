local CharacterI          = require( game.ServerStorage.CharacterI )
local FurnishServerModule = require( game.ServerStorage.FurnishServerModule )
local GameManagement      = require( game.ServerStorage.GameManagementModule )
local Inventory           = require( game.ServerStorage.InventoryModule )
local Monsters            = require( game.ServerStorage.MonstersModule )

local MathXL              = require( game.ReplicatedStorage.Standard.MathXL )

local CharacterClientI    = require( game.ReplicatedStorage.CharacterClientI )
local FurnishUtility      = require( game.ReplicatedStorage.FurnishUtility )
local PossessionData      = require( game.ReplicatedStorage.PossessionData )


-- services
local players           = game:GetService("Players")
local serverStorage     = game:GetService("ServerStorage")
local replicatedStorage = game:GetService("ReplicatedStorage")


-- shared instances
local sharedInstances = replicatedStorage["Shared Instances"]
local placementStorage = sharedInstances["Placement Storage"]
local sharedModules = sharedInstances.Modules
local remotes = sharedInstances.Remotes

-- modules

-- objects

-- data
local dataInitiated = false

-- definitions
local random = math.random

--remotes["Place Instance"].OnServerEvent:Connect(function(player, name, position, rotation)
remotes.PlaceInstanceRF.OnServerInvoke = function(player, name, position, rotation)
	if GameManagement:LevelReady() then
		local furnishingDatum = PossessionData.dataT[ name ]
		if furnishingDatum.buildCostN <= player.BuildPoints.Value then
			local instance = FurnishServerModule:Furnish( player, name, position, rotation )
			if instance then  -- many reasons it can fail
				Monsters:AdjustBuildPoints( player, -furnishingDatum.buildCostN )
		
				if furnishingDatum.buildCostN < 0 then
					-- how many of those have you already built? The first time you build, you get 1 ruby. Second time, 50% chance. Third time, 33% chance. Etc
					local _, personalN = FurnishUtility:CountFurnishings( name, player )
					local odds = math.sqrt( 1 / personalN )
					if MathXL:RandomNumber() <= odds then	
						Inventory:AdjustCount( player, "Stars", 1, "Build", name )
						Inventory:EarnRubies( player, 1, "Build", name )
					end
				end		
					
				-- if it's a spawn point trigger respawn
				if furnishingDatum.furnishingType == PossessionData.FurnishingEnum.Spawn or
						furnishingDatum.furnishingType == PossessionData.FurnishingEnum.BossSpawn then
					
					-- kludge to prevent superboss player from ruining last level
					local classInfo = PossessionData.dataT[ CharacterClientI:GetCharacterClass( player ) ]
					if not classInfo or not classInfo.tagsT["Superboss"] then   -- letting heroes build for debug purposes
						player.Team = game.Teams.Monsters -- necessery in Underhaven
						CharacterI:SetCharacterClass( player, instance.MonsterSpawn.CharacterClass.Value )
						GameManagement:MarkPlayersCharacterForRespawn( player, instance.MonsterSpawn )
					end
				end
				return instance
			end
		end
	end
	return nil
end

