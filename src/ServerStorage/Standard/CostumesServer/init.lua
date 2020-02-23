local DebugXL  = require( game.ReplicatedStorage.Standard.DebugXL )
local InstanceXL = require( game.ReplicatedStorage.Standard.InstanceXL )
--local RemoteXL = require( game.ReplicatedStorage.Standard.RemoteXL )
local FloorData = require( game.ReplicatedStorage.Standard.FloorData )
local CostumesClient = require( game.ReplicatedStorage.Standard.CostumesClient )

local rescaleAccessories = require(script:WaitForChild("RescaleAccessories"))
-------------------------------------------------------------------------------------------------------------------------------
-- CostumesModule
-- @Jamie_Fristrom, 2018
--
-- Functions for applying different costumes to avatars
--
-- Only supports R15
--
-------------------------------------------------------------------------------------------------------------------------------
local Costumes = {}


	
local giver = script.Parent
local validatorSrc = script:WaitForChild("Validator")

local insert = game:GetService("InsertService")
local assets = game:GetService("AssetService")
local debris = game:GetService("Debris")

local cookie = 1  -- for debugging; seems like some messages are not getting through and don't know why
-------------------------------------------------------------------------------------------------------------------------------
-- Logic for applying 

-- note:  this can fail if we try to set the costumes of two characters at the same time. my ears are ringing
--        so we have a per-humanoid array
--        surely not the most elegant way to do this
local disableDeathRemoteFuncAcknowledgedB = {}
--local verifyJointsRemoteFuncAcknowledgedB = {}
local applyingCostumeB = {}

local function CostumeKey( player )
	return "Costume"..player.UserId
end


-- local function setDeathEnabledWait( humanoid, value )
-- --	print( humanoid.Parent.Name.." server setDeathEnabled "..tostring(value) )
-- 	humanoid:SetStateEnabled("Dead",value)
-- --		print( "Found setDeathEnabled" )
-- 	local char = humanoid.Parent
-- 	local player = game.Players:GetPlayerFromCharacter(char)
-- 	if player then

-- -- in theory doen't need anymore - invoke won't return until function attached
-- -- in practice it seems we do
-- 		if disableDeathRemoteFuncAcknowledgedB[ humanoid ] then 
-- 			print( player.Name.." disable death remote immediately acked" ) 
--  		end
--  		while not disableDeathRemoteFuncAcknowledgedB[ humanoid ] do wait() end

-- 		if humanoid:FindFirstChild("SetDeathEnabled") then
-- 			-- possible that we died in the last line, so
-- --			print( player.Name.. " invoking client "..cookie )
-- 			RemoteXL:RemoteFuncCarefulInvokeClientWait( humanoid.SetDeathEnabled, player, 10, value, cookie )
-- 			--humanoid.SetDeathEnabled:InvokeClient(player,value,cookie)
-- 			cookie = cookie + 1
-- 		end
-- 	end
-- --	print( humanoid.Parent.Name.." death enabled "..tostring( value ) )
-- end

-- local function prepareClient(humanoid)
-- -- 	local verifyJoints = humanoid:FindFirstChild("VerifyJoints")
-- -- 	if not verifyJoints then
-- -- 		disableDeathRemoteFuncAcknowledgedB[ humanoid ] = nil
-- -- 		verifyJointsRemoteFuncAcknowledgedB[ humanoid ] = nil
-- 	if not humanoid:FindFirstChild("SetDeathEnabled") then
-- 		disableDeathRemoteFuncAcknowledgedB[ humanoid ] = nil		
-- -- 		DebugXL:Assert( not humanoid:FindFirstChild("SetDeathEnabled") )
-- 		local disableDeath = Instance.new("RemoteFunction")

-- 		-- it is possible for the humanoid to have been destroyed in that window 
-- 		if not humanoid.Parent then return end

--  		disableDeath.Name = "SetDeathEnabled"
--  		disableDeath.Parent = humanoid
--  		disableDeath.OnServerInvoke = function() 
-- 		 	--print( humanoid.Parent.Name.." disableDeathRemoteFuncAcknowledged "..cookie )
--  		 	disableDeathRemoteFuncAcknowledgedB[ humanoid ] = true
--  		end
		
--  		local validator = validatorSrc:Clone()
--  		validator.Parent = humanoid	
		
-- -- 		verifyJoints = Instance.new("RemoteFunction")
-- -- 		verifyJoints.Name = "VerifyJoints"/
-- -- 		verifyJoints.Parent = humanoid
-- -- 		verifyJoints.OnServerInvoke = function() 
-- -- --			print("verifyJointsRemoteFuncAcknowledgedB "..cookie )
-- -- 			verifyJointsRemoteFuncAcknowledgedB[ humanoid ] = true
-- -- 		end
		
--  		validator.Disabled = false
		
--  		humanoid.AncestryChanged:Connect( function( child, parent )
--  			if parent==nil then
--  				disableDeathRemoteFuncAcknowledgedB[ humanoid ] = nil
-- -- 				verifyJointsRemoteFuncAcknowledgedB[ humanoid ] = nil
--  			end
--  		end)
-- -- 	else
-- -- --		print( "Joint verifier already established" )
--  	end
-- -- 	return verifyJoints
-- end


function Costumes:ApplyNewFace( destCharacter, srcFaceImage )
	DebugXL:Assert( self == Costumes )
	if destCharacter:FindFirstChild("Head") then
		destCharacter.Head.face.Texture = srcFaceImage
	end
end


-- -- doesn't do face
-- function Costumes:ApplyNewHead( destCharacter, srcHead )
-- 	DebugXL:Assert( self == Costumes )
-- 	local head = destCharacter:FindFirstChild("Head")   -- once in a while there isn't one... could be a character reset happening at wrong moment
-- 	if head then
-- 		head.Mesh:Destroy()
-- 		local newHeadMesh = srcHead.Mesh:Clone()
-- 		newHeadMesh.Parent = head
-- 		head.Size = srcHead.Size
-- 		head.Color = srcHead.Color
-- 		head.Material = srcHead.Material
-- 		head.Reflectance = srcHead.Reflectance
-- 		head.Transparency = srcHead.Transparency		
-- 	end	
-- end


local function CopyScale( srcCharacter, destHumanoid, scaleParamS )
	local srcHumanoid = srcCharacter:FindFirstChild("Humanoid")
	if srcHumanoid then
		local paramObj = srcHumanoid:FindFirstChild( scaleParamS )
		if paramObj then
			InstanceXL.new( "NumberValue", { Name = scaleParamS, Value = paramObj.Value, Parent = destHumanoid }, true )
		end
	else
--		warn( "Costume "..srcCharacter.Name.." missing humanoid" )
	end
end


local function CopyInstance( srcCharacter, destCharacter, instanceName )
	if srcCharacter:FindFirstChild( instanceName ) then
		if destCharacter:FindFirstChild( instanceName ) then
			destCharacter[ instanceName ]:Destroy() 
		end
		srcCharacter[ instanceName ]:Clone().Parent = destCharacter
	end 
end
--
--
-- local function RecalculateHipHeight( character )
-- 	-- quick and dirty method which will fail if you say are in the long part of your walk stride
-- --	local bottomOfHumanoidRootPart = character.HumanoidRootPart.Position.Y - (1/2 * character.HumanoidRootPart.Size.Y)
-- --	local bottomOfLFoot = character.LeftFoot.Position.Y - (1/2 * character.LeftFoot.Size.Y) 
-- --	local bottomOfRFoot = character.RightFoot.Position.Y - (1/2 * character.RightFoot.Size.Y) 
-- --	local bottomOfFoot = ( bottomOfLFoot + bottomOfRFoot ) / 2
-- --	local newHipHeight = bottomOfHumanoidRootPart - bottomOfFoot
-- --	return newHipHeight
-- 	character:WaitForChild("LeftFoot")
-- 	character:WaitForChild("LeftLowerLeg")
-- 	character:WaitForChild("LeftUpperLeg")
-- 	character:WaitForChild("LowerTorso")
-- 	character:WaitForChild("HumanoidRootPart")
-- 	local soleToAnkle  = character.LeftFoot.LeftAnkleRigAttachment.Position.Y + character.LeftFoot.Size.Y / 2
-- 	local ankleToKnee  = character.LeftLowerLeg.LeftKneeRigAttachment.Position.Y - character.LeftLowerLeg.LeftAnkleRigAttachment.Position.Y
-- 	local kneeToHip    = character.LeftUpperLeg.LeftHipRigAttachment.Position.Y - character.LeftUpperLeg.LeftKneeRigAttachment.Position.Y
-- 	local hipToRoot    = character.LowerTorso.RootRigAttachment.Position.Y - character.LowerTorso.LeftHipRigAttachment.Position.Y
-- 	local rootToHRPFloor = -character.HumanoidRootPart.Size.Y / 2 - character.HumanoidRootPart.RootRigAttachment.Position.Y
	
-- 	-- according to the docs, hipHeight "Sets how many studs off the ground the Humanoid�s RootPart should be when standing on a floor."
-- 	-- and therefore isn't tied to the hipRigAttachments directly
-- 	local hipHeight = soleToAnkle + ankleToKnee + kneeToHip + hipToRoot + rootToHRPFloor
-- 	return hipHeight
-- end

Costumes.attachmentsForEquipSlotT = {
	Torso  = { "LeftGripAttachment", "LeftShoulderAttachment", "WaistBackAttachment", "WaistCenterAttachment", "WaistFrontAttachment", "RightGripAttachment", "RightShoulderAttachment",
		"BodyBackAttachment", "BodyFrontAttachment", "LeftCollarAttachment", "NeckAttachment", "RightCollarAttachment" },
	Legs   = { "LeftFootAttachment", "RightFootAttachment" },
	Head   = { "FaceCenterAttachment", "FaceFrontAttachment", "HairAttachment", "HatAttachment" },	
}

Costumes.allAttachmentsSet = {}

for _, slot in pairs( Costumes.attachmentsForEquipSlotT ) do
	for _, attachName in pairs( slot ) do
		Costumes.allAttachmentsSet[ attachName ] = true
	end
end

-- doesn't set cframe
-- srcCharactersA are an array of 0 to n characters to apply to the new character; could be a few pieces of armor or just one thing.
-- doing as ipairs for consistency
function Costumes:LoadCharacter( player, srcCharactersA, noAttachmentsSet, alsoClothesB, characterToReplace, cframe ) -- characterToReplace is optional
	DebugXL:Assert( player:IsA("Player") )
	if characterToReplace and not cframe then
		cframe = characterToReplace:GetPrimaryPartCFrame()
	end

	if player then
		local destCharacter = Costumes:GetSavedCostume( player ):Clone()

		-- remove avatar's roblox accessories for transition
		local accessories = {}
		for _,child in pairs(destCharacter:GetChildren()) do
			if child:IsA("Accoutrement") then
				local handle = child:FindFirstChild("Handle")
				DebugXL:Assert( handle )
				local addToAccessoryList = true
				if handle then
					local attach = handle:FindFirstChildWhichIsA("Attachment")
					DebugXL:Assert( attach )
					if attach then
						if noAttachmentsSet[ attach.Name ] then
							addToAccessoryList = false
						end
					else -- it's a hat
						if noAttachmentsSet[ "HatAttachment" ] then
							addToAccessoryList = false
						end
					end
				end
				child.Parent = nil
				if addToAccessoryList then
					table.insert(accessories,child)
				end
			end
		end
		--print( "Accessories removed and recorded" )	

		for _, modelInfo in ipairs( srcCharactersA ) do
			Costumes:ApplyCharacterCostumeWait( destCharacter, modelInfo, alsoClothesB )
		end

		-- put back accessories
		for _, accessory in pairs( accessories ) do
			destCharacter.Humanoid:AddAccessory( accessory )
		end

--		destCharacter.Humanoid:BuildRigFromAttachments()
		destCharacter.PrimaryPart = destCharacter:FindFirstChild("HumanoidRootPart")

		if characterToReplace then
			characterToReplace.Parent = nil
--			destCharacter:MoveTo( characterToReplace:GetPrimaryPartCFrame().p )			
			destCharacter:SetPrimaryPartCFrame( cframe )
			destCharacter.Humanoid.MaxHealth = characterToReplace.Humanoid.MaxHealth
			destCharacter.Humanoid.Health = characterToReplace.Humanoid.Health			

			-- transfer other status and fx
			for _, child in pairs( characterToReplace:GetChildren() ) do
				if child:IsA("NumberValue") 
				or child:IsA("BoolValue") 
				or child:IsA("Vector3Value") 
				or child:IsA("ParticleEmitter") 
				then
					if child.Name~="ChangingCostume" then
						child.Parent = destCharacter
					end
				end
			end

			-- fire and frost fx have not been fixed. I'd want to update the fx system to be more pull than push
			-- to fix those. 
		elseif cframe then
--			destCharacter:MoveTo( cframe.p )			
			destCharacter:SetPrimaryPartCFrame( cframe )
		end

		if not destCharacter:FindFirstChild("CharacterLight") then
			if FloorData:CurrentFloor().characterLightN > 0 then
				local characterLight = game.ServerStorage.CharacterLight:Clone()
				characterLight.Handle.PointLight.Range = FloorData:CurrentFloor().characterLightN
				characterLight.Parent = destCharacter
			end
		end				

--		destCharacter.Parent = game.Workspace

		-- the mystery hack. while trying to figure out why players sunk into ground, I messed with their hip height and they
		-- snapped back. so I'm doing the same thing in code as a fix. doesn't seem to work if just on the client
		-- super hacky. watch the character, if it seems to be falling for a long time, reset its hipheight, no race condition this way
		-- if I just make a guess when to do the reset. shouldn't interfere with 'real falling' either, right, just adjusting hip height
		-- on the way down
		spawn( function()
			wait(0.05)
			local humanoid = destCharacter:FindFirstChild("Humanoid")
			if not humanoid then return end
			humanoid.HipHeight = humanoid.HipHeight + 0.0001
			-- and, in case we missed some race condition, stay vigilant:
			local lastState = nil
			local startedFalling = math.huge
			while destCharacter.Parent do
				wait()
				local humanoid = destCharacter:FindFirstChild("Humanoid")
				if not humanoid then break end
				local state = humanoid:GetState()
				if state == Enum.HumanoidStateType.Freefall then
					if lastState ~= state then
						startedFalling = time()
					else
						if time() - startedFalling > 0.4 then
							humanoid.HipHeight = humanoid.HipHeight + 0.0001
--							warn("Falling adjustment")
							startedFalling = time()
						end
					end
				else
					startedFalling = math.huge
				end
				lastState = state
			end
		end	)			
	
--		destCharacter:MoveTo( cframe.p )
		destCharacter.Name = player.Name
		player.Character = destCharacter
		destCharacter.Parent = workspace
		return destCharacter
	end
end


function Costumes:ApplyCharacterCostumeWait( destCharacter, srcCharacter, alsoClothesB )
	DebugXL:Assert( self == Costumes )
	if not applyingCostumeB[ destCharacter ] then
		applyingCostumeB[ destCharacter ] = true

--		print( "ApplyNewCharacterCostumeWait "..destCharacter.Name..", "..srcCharacter.Name )		
		local humanoid = destCharacter:FindFirstChild("Humanoid")
		if not humanoid then return end
		
		local player = game.Players:GetPlayerFromCharacter(destCharacter)
		if player then
			if not humanoid.Parent then return end
			
			humanoid:UnequipTools()
		end
	
		local srcHumanoid = srcCharacter:FindFirstChild("Humanoid")
		if srcHumanoid then
			-- we can't do the head in this run because it will get replaced in the BuildRig step
			for _, limb in pairs(srcCharacter:GetChildren()) do
				-- let's see if this works yet. I'll leave it in in case they finally enable it some day
				local bodypartR15 = srcCharacter.Humanoid:GetBodyPartR15( limb )
				if bodypartR15 and bodypartR15 ~= Enum.BodyPartR15.Unknown and bodypartR15 ~= Enum.BodyPartR15.RootPart then
					local newLimb = limb:Clone()
					humanoid:ReplaceBodyPartR15( bodypartR15, newLimb )
				end
				-- if limb:IsA("MeshPart") then
				-- 	local newLimb = limb:Clone()
				-- 	local oldLimb = destCharacter:FindFirstChild(newLimb.Name)
				-- 	if oldLimb then
				-- 		--newLimb.BrickColor = oldLimb.BrickColor
				-- 		newLimb.CFrame = oldLimb.CFrame
				-- 		oldLimb:Destroy()
				-- 	end
				-- 	newLimb.Parent = destCharacter
				-- end
			end
--		print( "Limbs replaced" )

		-- if srcCharacter:FindFirstChild("Head") then		
		-- 	-- straight up replace method - doesn't get confused by scaling changes, but more likely for charater to die or mess up in the
		-- 	-- transforming process. It does seem to be better when not part of the above loop
		-- 	-- local newLimb = srcCharacter.Head:Clone()
		-- 	-- local oldLimb = destCharacter:FindFirstChild("Head")
		-- 	-- if oldLimb then
		-- 	-- 	--newLimb.BrickColor = oldLimb.BrickColor
		-- 	-- 	newLimb.CFrame = oldLimb.CFrame
		-- 	-- 	oldLimb:Destroy()
		-- 	-- end
		-- 	-- newLimb.Parent = destCharacter
			
		-- 	-- old method seemed to bring back some issues with sinking into the ground and didn't work with head-tracking antiexploit
		-- 	Costumes:ApplyNewHead( destCharacter, srcCharacter.Head )
		-- 	if srcCharacter.Head:FindFirstChild("face") then
		-- 		Costumes:ApplyNewFace( destCharacter, srcCharacter.Head.face.Texture )
		-- 	else
		-- 		destCharacter.Head.face:Destroy()
		-- 	end
		-- end
--		
			-- copy proportions from costume  
			CopyScale( srcCharacter, humanoid, "BodyDepthScale" )
			CopyScale( srcCharacter, humanoid, "BodyHeightScale" )
			CopyScale( srcCharacter, humanoid, "BodyProportionScale" )
			CopyScale( srcCharacter, humanoid, "BodyTypeScale" )
			CopyScale( srcCharacter, humanoid, "BodyWidthScale" )
			CopyScale( srcCharacter, humanoid, "HeadScale" )
		end

		if not humanoid.Parent then return end
--		humanoid:BuildRigFromAttachments()
		

				
		-- I do not know what's going on with humanoid root part.
		--wait()
		--humanoid.HipHeight = RecalculateHipHeight( destCharacter )  
--			local hipHeight = srcCharacter.Humanoid.HipHeight - destCharacter.HumanoidRootPart.RootRigAttachment.Position.Y
	--		local hipHeight = RecalculateHipHeight( srcCharacter )  -- I don't know why this is necessary. I also don't know why what looks right in studio doesn't look right elsewhere
	--		local humanoid = destCharacter:FindFirstChildOfClass("Humanoid")
--			humanoid.HipHeight = hipHeight
--			print( "Set "..humanoid:GetFullName().." hipHeight to "..hipHeight )
--		end
--		
--		print( "Rig rebuilt" )
		-- have to do head bit-by-bit; destroying the whole head kills the character
	--	destCharacter.Head.Mesh:Destroy()
	--	local newHeadMesh = srcCharacter.Head.Mesh:Clone()
	--	newHeadMesh.Parent = destCharacter.Head
	--	
	--	destCharacter.Head.face:Destroy()
	--	local newFace = srcCharacter.Head.face:Clone()
	--	newFace.Parent = destCharacter.Head
	--		
	--	destCharacter.Head.Color = srcCharacter.Head.Color
--		
--		if player then
--			pcall(function ()
--				local attempts = 0
--				while not verifyJointsRemoteFuncAcknowledgedB[ humanoid ] do wait() end			
--				while attempts < 10 do
--					local success = RemoteXL:RemoteFuncCarefulInvokeClientWait( verifyJoints, player, 10 )
--					if success then
--						break
--					else
--						attempts = attempts + 1
--					end
--				end
--				if attempts == 10 then
--					DebugXL:Error("Failed to apply package to "..player.Name)
--				end
--			end)
--		end
		
		-- add accessories from new costume
		for _, accessory in pairs(srcCharacter:GetChildren()) do
			if accessory:IsA("Accoutrement") then
				local newAccessory = accessory:Clone()
				-- -- if there's already an accessory on that slot lose it, even if we have 'keep accessories' set to tru
				-- -- do I attach or am I a hat?
				-- if not leaveExistingAccessoriesB then
				-- 	local attachment = newAccessory.Handle:FindFirstChildWhichIsA("Attachment")
				-- 	if attachment then
				-- 		for _, oldAcc in pairs( destCharacter:GetChildren() ) do
				-- 			if oldAcc:IsA("Accoutrement") then
				-- 				local oldAttachment = oldAcc.Handle:FindFirstChildWhichIsA("Attachment")
				-- 				if oldAttachment then 
				-- 					if attachment.Name == oldAttachment.Name then
				-- 						oldAcc:Destroy()
				-- 					end
				-- 				end
				-- 			end
				-- 		end
				-- 	end
				-- end
				destCharacter.Humanoid:AddAccessory( newAccessory )
				-- newAccessory.Parent = destCharacter
			end
		end
		
		if alsoClothesB then
			CopyInstance( srcCharacter, destCharacter, "Body Colors" )
			CopyInstance( srcCharacter, destCharacter, "Pants" )
			CopyInstance( srcCharacter, destCharacter, "Shirt" )
		end

		--setDeathEnabledWait(humanoid,true)
	end
--		print( "Costume applied "..destCharacter.Name..", "..srcCharacter.Name )
	applyingCostumeB[ destCharacter ] = nil
end


function Costumes:ApplyingCostume( character )
	return applyingCostumeB[ character ]
end


-- assumes character is fully loaded
function Costumes:SaveCostumeWait( player )
	DebugXL:Assert( self == Costumes )
	local character = player.Character
	-- don't know the best way to do this. some avatars don't have shirts or pants. but if they do, we want to wait
	-- before saving. so. hmm.
	character:WaitForChild( "Shirt", 1 )
	character:WaitForChild( "Pants", 1 )
	local costumeCopy = Instance.new( "Model" )
	for _, part in pairs( character:GetChildren() ) do
		if part.Name ~= "HideCharacter" then
			local partCopy = part:Clone()
			partCopy.Parent = costumeCopy
		end
	end
	costumeCopy.Name = CostumeKey( player )
	costumeCopy.Parent = game.ServerStorage.PlayerCostumes
end



function Costumes:GetSavedCostume( player )
	return game.ServerStorage.PlayerCostumes[ CostumeKey( player ) ]
end


-- preserves existing costume proportions
function SetScale( humanoid, scaleParamS, newScaleN )
	local paramObj = humanoid:FindFirstChild( scaleParamS )
	if paramObj then
		newScaleN = paramObj.Value * newScaleN
	end
	InstanceXL.new( "NumberValue", { Name = scaleParamS, Value = newScaleN, Parent = humanoid }, true )
end

function Costumes:Scale( character, scaleN )
	if character then
		local humanoid = character:FindFirstChild("Humanoid")
		if humanoid then
			local recordHipHeight = humanoid.HipHeight  
			-- in client-server test the scale values aren't there, so we add them if necessary:
			SetScale( humanoid, "BodyHeightScale", scaleN )
			SetScale( humanoid, "BodyWidthScale", scaleN )
			SetScale( humanoid, "BodyDepthScale", scaleN )
			SetScale( humanoid, "HeadScale", scaleN )
--			humanoid.HipHeight = RecalculateHipHeight( character )
			-- Roblox tries to fix hip height for us but gets it wrong 
			-- and it takes a moment to do it...  maybe a slapdash effort by one of their interns or something.
			-- But no judgment, there's plenty of slapdash to go around
		end
	end
end


function Costumes:Colorify( character, color3 )
	for _, instance in pairs( character:GetChildren()) do
		if instance:IsA("BasePart") then
			instance.Color = color3
		end
	end
end


function Costumes:Petrify( character, color3 )
	for _, descendant in pairs( character:GetDescendants() ) do
		if descendant:IsA("BasePart") then
			descendant.Color = color3
			descendant.Material = Enum.Material.SmoothPlastic
			if descendant:IsA("MeshPart") then
				descendant.TextureID = ""
			end		
		end
		if descendant:IsA( "SpecialMesh" ) then
			descendant.TextureId = ""
		end	
	end
	if character:FindFirstChild("Shirt") then character.Shirt:Destroy() end
	if character:FindFirstChild("Pants") then character.Pants:Destroy() end
	if character:FindFirstChild("Body Colors") then character["Body Colors"]:Destroy() end
	local head = character:FindFirstChild("Head")
	if head then
		if head:FindFirstChild("face") then head.face:Destroy() end 
	end
end


-- garbage collection
spawn( function()
	while wait(1) do
		for _, child in pairs( game.ServerStorage.PlayerCostumes:GetChildren() ) do
			local foundPlayer = false			
			for _, player in pairs( game.Players:GetPlayers() ) do
				if CostumeKey( player ) == child.Name then
					foundPlayer = true
					break
				end
			end
			if not foundPlayer then
				child:Destroy()
			end
		end
	end
end)


return Costumes