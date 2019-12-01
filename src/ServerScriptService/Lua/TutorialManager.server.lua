local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL       = require( game.ReplicatedStorage.Standard.InstanceXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )

local Inventory        = require( game.ServerStorage.InventoryModule )

local InventoryUtility = require( game.ReplicatedStorage.InventoryUtility )

local Crates           = require( game.ReplicatedStorage.Standard.Crates ) 

local function PlayerAdded( player )
	print( "TutorialManager PlayerAdded "..player.Name)
	local inventory = Inventory:GetWait( player )
--	warn( "TutorialManager GetWait returned "..player.Name)
	if not inventory then
--		warn( "TutorialManager no inventory "..player.Name)
		-- probably because player dropped out immediately
		DebugXL:Assert( player.Parent == nil )  
		return 
	end   	
	if not InventoryUtility:IsInTutorial( inventory ) then 
--		warn( "Tutorial done "..player.Name)
		return 
	end
	if Inventory:GetCount( player, "Tutorial" ) == 0 then
		local myThing
--		warn( "Tutorial monitoring "..player.Name.." building")
		while not myThing do
			myThing = TableXL:FindWhere( workspace.Building:GetChildren(), function( child )
				--print( "Tutorial: Found thing" )
				-- actually happy as long as they build anything. We could *force* them to buy a chest by disabling
				-- the other buttons, but that's annoying to write and play, and we could 
				return child:WaitForChild("creator").Value == player
			end)
			wait(0.1)
		end
		-- in case you accidentally do them in the wrong order, keep your best
		Inventory:SetCount( player, "Tutorial", math.max( 1, Inventory:GetCount( player, "Tutorial" ) ) )
	end

	-- handle it if they do the last two in the wrong order
--	warn( "Tutorial monitoring "..player.Name.." rubies / dungeonlord")
	while InventoryUtility:IsInTutorial( Inventory:GetWait( player ) ) do
		wait(0.1)
		if not player.Parent then return end		
		if Inventory:GetCount( player, "Rubies" ) < Crates[2].Cost then 
			-- in case you accidentally do them in the wrong order, keep your best
			Inventory:SetCount( player, "Tutorial", math.max( 2, Inventory:GetCount( player, "Tutorial" ) ) )
		end
		if CharacterClientI:GetCharacterClass( player )~="DungeonLord" then
			-- in case you accidentally do them in the wrong order, keep your best
			Inventory:SetCount( player, "Tutorial", math.max( 3, Inventory:GetCount( player, "Tutorial" ) ) )
		end
	end
end

for _, player in pairs( game.Players:GetPlayers() ) do 
	spawn( function() PlayerAdded( player ) end ) 
end
game.Players.PlayerAdded:Connect( PlayerAdded )
	