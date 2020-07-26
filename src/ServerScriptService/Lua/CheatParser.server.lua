
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local CheatUtilityXL  = require( game.ReplicatedStorage.TS.CheatUtility )

local InstanceXL      = require( game.ReplicatedStorage.Standard.InstanceXL )

local CharacterXL     = require( game.ServerStorage.Standard.CharacterXL )

local GameManagement  = require( game.ServerStorage.GameManagementModule )
local Monsters        = require( game.ServerStorage.MonstersModule )
local LootServer = require( game.ServerStorage.TS.LootServer ).LootServer

local AdminCommands = require( game.ServerStorage.TS.AdminCommands ).AdminCommands
local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

local CheatParser = {}

function CheatParser:DropLoot( player )
	local characterKey = PlayerServer.getCharacterKeyFromPlayer( player )
	if characterKey then
		LootServer.monsterDrop( PlayerServer.getActualLevel( characterKey ) * 2, "Orc", true, player )
	end
end

function CheatParser:FurnishPower( player )
	InstanceXL.new( "BoolValue", { Name = "FurnishPower", Value = true, Parent = player } ) 
end

function CheatParser:TestSlow( player )
	CharacterXL:SpeedMulFor( player.Character, 0.8, 0.6, 5 )	
end

function CheatParser:TestFreeze( player )
	CharacterXL:FreezeFor( player.Character, 5 )
end

function CheatParser:TestFrost( player )
	require( game.ServerStorage.CharacterFX.Frost ):Activate( player.Character, 5 )
end

function CheatParser:TestBurn( player )
	require( game.ServerStorage.CharacterFX.Burn ):Activate( player.Character, 5 )
end

function CheatParser:TestDamageOverTime( player )
	CharacterXL:DamageOverTimeFor( player.Character, 2.5, 5, player )  -- let's see if self-attacking works; attacking from nil gets ignored
end

function CheatParser:DownALevel( player )
	GameManagement:ReachedExit( player )
end

function CheatParser:BuildPoints( player )
	Monsters:AdjustBuildPoints( player, 600 )
end

function CheatParser:TestServerError( player )
	local nilThing = nil
	nilThing[1] = 1
end

function CheatParser:TestHero()
	workspace.GameManagement.TestHero.Value = true
end

AdminCommands:setLuaCommandHandler( function( player, args )
	if CheatUtilityXL:PlayerWhitelisted( player ) then 
		if CheatParser[ args[1] ] then
			CheatParser[ args[1] ]( CheatParser, player, args )
		end
	end
end )


workspace.Standard.CheatParser.CheatRE.OnServerEvent:Connect( function( player, cheatName )
	if CheatUtilityXL:PlayerWhitelisted( player ) then 
		CheatParser[ cheatName ]( CheatParser, player )
	end
end)

