-- Module for resizing accessories after scaling the character
local RunService = game:GetService("RunService")

function findFirstMatchingAttachment(model, name)
	for _, child in pairs(model:GetChildren()) do
		if child:IsA("Attachment") and child.Name == name then
			return child
		elseif not child:IsA("Accoutrement") and not child:IsA("Tool") then -- don't look in hats or tools in the character
			local foundAttachment = findFirstMatchingAttachment(child, name)
			if foundAttachment then
				return foundAttachment
			end
		end
	end
end

local function getOriginalProperty(obj, property)
	local origPropertyValue = obj:FindFirstChild("OriginalProperty" ..property)
	if not origPropertyValue then
		origPropertyValue = Instance.new("Vector3Value")
		origPropertyValue.Name = "OriginalProperty" ..property
		origPropertyValue.Value = property and obj[property]
		origPropertyValue.Parent = obj
	end
	return origPropertyValue.Value
end

local function findHandleMesh(handle)
	for _, obj in pairs(handle:GetChildren()) do
		if obj:IsA("DataModelMesh") then
			return obj, getOriginalProperty(obj, "Scale")
		end
	end
end

local function buildWeld(weldName, parent, part0, part1, c0, c1)
	local weld = Instance.new("Weld")
	weld.Name = weldName
	weld.Part0 = part0
	weld.Part1 = part1
	weld.C0 = c0
	weld.C1 = c1
	weld.Parent = parent
end

local function getAccoutrementWeld(attachmentPart, handle)
	local accessoryWeld = handle:FindFirstChild("AccessoryWeld")
	if accessoryWeld then
		return accessoryWeld
	end
	
	-- Legacy case
	for _, obj in pairs(attachmentPart:GetChildren()) do
		if obj:IsA("Weld") then
			if obj.Part0 == handle or obj.Part1 == handle then
				return obj
			end
		end
	end

	return nil
end

-- Get what part an accoutrement is attached to
local function getAttachedPart(accessory, character)
	local handle = accessory:FindFirstChild("Handle")
	
	if handle then
		local accoutrementAttachment = handle:FindFirstChildOfClass("Attachment")
		local characterAttachment = accoutrementAttachment and findFirstMatchingAttachment(character, accoutrementAttachment.Name) or nil
		local attachmentPart = characterAttachment and characterAttachment.Parent or character:FindFirstChild("Head")
		
		return attachmentPart
	end
	return nil
end

local function rescaleAccessory(accessory, character, bodyScaleVector, headScale)
	local handle = accessory:FindFirstChild("Handle")
	if not handle then
		return
	end
	
	local originalSize = getOriginalProperty(handle, "Size")
	local currentScaleVector = handle.Size/originalSize
	local desiredScaleVector = bodyScaleVector
	
	local accoutrementAttachment = handle:FindFirstChildOfClass("Attachment")
	local characterAttachment = accoutrementAttachment and findFirstMatchingAttachment(character, accoutrementAttachment.Name) or nil
	local attachmentPart = characterAttachment and characterAttachment.Parent or character:FindFirstChild("Head")
	if not attachmentPart then return end
	
	local accoutrementWeld = getAccoutrementWeld(attachmentPart, handle)
	if not accoutrementWeld then return end
	
	if attachmentPart.Name == "Head" then
		desiredScaleVector = Vector3.new(headScale, headScale, headScale)
	end
	local modifyVector = desiredScaleVector/currentScaleVector
	
	-- Modify the size of the attachment and handleMesh
	handle.Size = handle.Size * modifyVector
	local handleMesh, origMeshScale = findHandleMesh(handle)
	if handleMesh then
		handleMesh.Scale = origMeshScale * desiredScaleVector
	end
	
	-- This resizes the Attachment and the legacy AttachmentPoint property
	if accoutrementAttachment then
		-- Accessory case is easier
		accoutrementAttachment.Position = getOriginalProperty(accoutrementAttachment, "Position") * desiredScaleVector
	end	
	-- Legacy hat logic case
	local x, y, z, R00, R01, R02, R10, R11, R12, R20, R21, R22 = accessory.AttachmentPoint:components()
	x, y, z = x * modifyVector.x, y * modifyVector.y, z * modifyVector.z
	accessory.AttachmentPoint = CFrame.new(
		x,     y,   z,
		R00, R01, R02,
		R10, R11, R12, 
		R20, R21, R22
	)

	local attachmentCFrame = characterAttachment and characterAttachment.CFrame or CFrame.new(0, 0.5 * headScale, 0)
	local hatCFrame = accoutrementAttachment and accoutrementAttachment.CFrame or accessory.AttachmentPoint
		
	if accessory:IsA("Hat") and not accoutrementWeld.Parent == handle then
		-- This is using the legacy hat attachment sytem
		buildWeld("HeadWeld", attachmentPart, attachmentPart, handle, attachmentCFrame, hatCFrame)
	else
		-- Reparent the accessory to properly weld it to the character
		accessory.Parent = nil
		accessory.Parent = character
	end
end

local function rescaleAccessories(character, bodyScaleVector, headScale)
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	for _, obj in pairs(character:GetChildren()) do
		if obj:IsA("Accoutrement") then			
			if RunService:IsServer() then
				rescaleAccessory(obj, character, bodyScaleVector, headScale)
			else
				-- We need to wait for character size to change
				local attachedPart = getAttachedPart(obj, character)
				local currentSize = attachedPart.Size
				local anyChanged, xChanged, yChanged, zChanged = false, false, false, false		
				
				if attachedPart then
					coroutine.wrap(function()
						local sizeChangedConnection;
						sizeChangedConnection = attachedPart.Changed:connect(function(property) 
							if property == "Size" then
								anyChanged = true
								if currentSize.X ~= attachedPart.Size.X then
									xChanged = true
								end
								if currentSize.Y ~= attachedPart.Size.Y then
									yChanged = true
								end
								if currentSize.Z ~= attachedPart.Size.Z then
									zChanged = true
								end
							end
							
							if xChanged and yChanged and zChanged then
								sizeChangedConnection:disconnect()
								sizeChangedConnection = nil
								rescaleAccessory(obj, character, bodyScaleVector, headScale)
							end
						end)
						
						-- Clean up the connection if it isn't already disconnected
						wait(0.5)
						if sizeChangedConnection then
							sizeChangedConnection:disconnect()
						end
					end)()
				end
			end
		end
	end
end

return rescaleAccessories