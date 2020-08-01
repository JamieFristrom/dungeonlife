
-- Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

local DebugXL = require( game.ReplicatedStorage.TS.DebugXLTS ).DebugXL
local LogArea = require( game.ReplicatedStorage.TS.DebugXLTS ).LogArea
DebugXL:logI(LogArea.Executed, script:GetFullName())

local MathXL = require( game.ReplicatedStorage.Standard.MathXL )

local PCClient = require( game.ReplicatedStorage.TS.PCClient ).PCClient

local goalOpacity = 0.5

local savedColors = {}

local function SaveColors( character )
	savedColors[ character ] = {}
	savedColors[ character ].limbs = {}
	for _, object in pairs( character:GetChildren() ) do 
		if object:IsA("MeshPart") then
			local limb = object
			savedColors[ character ].limbs[ limb ] = {}
			savedColors[ character ].limbs[ limb ].Color = limb.Color
			savedColors[ character ].limbs[ limb ].Material = limb.Material
			savedColors[ character ].limbs[ limb ].TextureID = limb.TextureID
		end
	end
	local shirt = character:FindFirstChild("Shirt")
	local pants = character:FindFirstChild("Pants")

	if shirt then savedColors[ character ].shirt = shirt.ShirtTemplate end
	if pants then savedColors[ character ].pants = pants.PantsTemplate end
	
	if character:FindFirstChild("Head") then
		savedColors[ character ].HeadColor = character.Head.Color 
	end	
end


local function RestoreColors( character )
	for limb, vars in pairs( savedColors[ character ].limbs ) do 
		for variableName, variable in pairs( vars ) do
			limb[ variableName ] = variable
		end
	end

	if character.Parent then
		if savedColors[ character ].shirt then character.Shirt.ShirtTemplate = savedColors[ character ].shirt end
		if savedColors[ character ].pants then character.Pants.PantsTemplate = savedColors[ character ].pants end
		if savedColors[ character ].HeadColor then character.Head.Color = savedColors[ character ].HeadColor end
	end
end



local function Colorify( character )
	local frameColor =  Color3.new( 0.6 + math.sin( time()*2 )*0.35, 0, 0 )
	for _, object in pairs( character:GetChildren() ) do 
		if object:IsA("MeshPart") then
			local limb = object
			limb.Color = frameColor
			limb.Material     = Enum.Material.Neon
			limb.TextureID    = ""
		end
	end
	local shirt = character:FindFirstChild("Shirt")
	local pants = character:FindFirstChild("Pants")

	if shirt then shirt.ShirtTemplate = "" end
	if pants then pants.PantsTemplate = "" end
	
	if character:FindFirstChild("Head") then
		character.Head.Color = frameColor
	end
--	character.Head.BrickColor = BrickColor.new("Red")
end

local function InsertRaycastTargetV3s( raycastTargetV3s, targetCharacter )
	-- let's do head, torso, and a circle around torso. a bit like the invisicam circle behavior, not the much heavier smart circle
	table.insert( raycastTargetV3s, targetCharacter.Head.Position )
	table.insert( raycastTargetV3s, targetCharacter.HumanoidRootPart.Position )
	
	local cameraOrientedCF = workspace.CurrentCamera.CFrame - workspace.CurrentCamera.CFrame.p + targetCharacter.HumanoidRootPart.Position
	
	for i = 1, 6 do
		local xOffset = math.cos( i / 6 * math.pi * 2 ) * 3
		local yOffset = math.sin( i / 6 * math.pi * 2 ) * 3
		-- find that point relative to the camera, translated to the torso
		local targetV3 = cameraOrientedCF:pointToWorldSpace( Vector3.new( xOffset, yOffset, 0 ) )
		table.insert( raycastTargetV3s, targetV3 )
	end
end

local savedTransparentPartsT = {}

local basePartsA = {}
local basePartsT = {}

-- this used to have a cool turn-walls-transparent effect that was too slow on many systems and also
-- made it harder to play

local lastMonsterClass = ""
while wait( 0.05 ) do
    if PCClient.pc then
        local monsterIdValue = PCClient.pc.idS
        if monsterIdValue == "Zombie" then		
            for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
                local character = player.Character
                if character then
                    if not savedColors[ character ] then
                        print( "Enabling zombie power colors on "..character.Name )
                        SaveColors( character )
                        if character:FindFirstChild("Humanoid") then
                            character.Humanoid.Died:Connect( function() savedColors[ character ] = nil end )
                        end
                        
                    end
                    if character:FindFirstChild("Head") then
                        local targetBillboardGui = character.Head:FindFirstChild("TargetBillboard")		
                        if not targetBillboardGui then
                            print( "Placing zombie power billboard on "..character.Name )
                            targetBillboardGui = script.Parent.Parent:WaitForChild("TargetBillboard"):Clone()
                            targetBillboardGui.Enabled = true
                            targetBillboardGui.Parent = character.Head
                            -- should auto destroy itself when hero dies
                        end
                    end
                    
                    Colorify( character )
                end
            end
        else
            if lastMonsterClass == "Zombie" then
                print( "No longer zombie" )
                for character, _ in pairs( savedColors ) do
                    if character.Parent then
                        print( "Restoring nonzombie colors on "..character.Name )				
                        RestoreColors( character )
                        if character.Head:FindFirstChild("TargetBillboard") then
                            print( "Removing zombie billboard from "..character.Name )
                            character.Head.TargetBillboard:Destroy()
                        end
                    end
                end		
            end
        end
        lastMonsterClass = monsterIdValue	
    end
end