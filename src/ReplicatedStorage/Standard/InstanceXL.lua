--
-- InstanceXL
--
-- Instance eXtended Library. It excels. It's extra large.
--
-- Additional functions to augment Roblox's instance API
--
local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )

local InstanceXL = {}

-- if a singleton, it will overwrite the previous singleton with new data
-- after this is already quite entrenched in the code base I'm realizing it's misleading - you'd expect
-- new to return an InstanceXL but it returns a Roblox instance
function InstanceXL.new( className, parameters, singletonB )
	return InstanceXL:CreateInstance( className, parameters, singletonB )
end

-- this is more clear
function InstanceXL:CreateInstance( className, parameters, singletonB )
	local newInstance
	local parent = parameters.Parent
	
	parameters.Name = parameters.Name or className
	
	if parent then 
		local existingInstance = parent:FindFirstChild( parameters.Name )
		if existingInstance then
			if singletonB then
--				--print( existingInstance:GetFullName() .. " already exists. Not creating singleton." )
				newInstance = existingInstance
			else
				warn( "Existing instance "..existingInstance:GetFullName().." when non-singleton new called" )
--				print( debug.traceback() )
			end
		end
	end
	
	if not newInstance then		
		newInstance = Instance.new( className )
	end
	
	for k, v in pairs( parameters ) do
		if k ~= "Parent" then
			newInstance[ k ] = v
		end
	end

	-- I suspect this is a premature optimization but they say you should set parent last so it
	-- doesn't spam calls to changed values
	newInstance.Parent = parent
	return newInstance		
end


function InstanceXL:CreateSingleton( className, parameters )
	return InstanceXL:CreateInstance( className, parameters, true )
end


function InstanceXL:ClearChildrenThat( parentInstance, predicateFunc )
	DebugXL:Assert( self==InstanceXL )
	for _, child in pairs( parentInstance:GetChildren() ) do
		if predicateFunc( child ) then
			child.Parent = nil
			--child:Destroy()
		end
	end
end

function InstanceXL:UnparentAllChildren( parentInstance )
	for _, child in pairs(parentInstance:GetChildren()) do
		child.Parent = nil
	end	
end

function InstanceXL:ClearAllChildrenBut( parentInstance, safeChildName )
	DebugXL:Assert( self==InstanceXL )
	InstanceXL:ClearChildrenThat( parentInstance, function( child ) return child.Name ~= safeChildName end )
end


function InstanceXL:FindFirstAncestorThat( instance, predicateFunc )
	DebugXL:Assert( self==InstanceXL )
	if not instance.Parent then return nil end
	if predicateFunc( instance.Parent ) then
		return instance.Parent
	else
		return InstanceXL:FindFirstAncestorThat( instance.Parent, predicateFunc )
	end	
end


-- doesn't care if you're a model or a part
function InstanceXL:GetCFrame( instance )
	DebugXL:Assert( self==InstanceXL )
	if instance:IsA("BasePart") then
		return instance.CFrame
	elseif instance:IsA("Model") then
		return instance:GetPrimaryPartCFrame()
	else
		DebugXL:Assert( "Object has no cframe" )
	end
end


return InstanceXL