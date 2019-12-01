repeat wait() until game.Players.LocalPlayer
local Player = game.Players.LocalPlayer
local currentItems = {}

local module = {}
	function module.MouseEnterLeaveEvent(UIObj)
		if currentItems[UIObj] then
			return currentItems[UIObj].EnteredEvent.Event,currentItems[UIObj].LeaveEvent.Event
		end		
		
		local newObj = {}
		newObj.UIObj = UIObj
		local EnterEvent = Instance.new("BindableEvent")
		local LeaveEvent = Instance.new("BindableEvent")
		newObj.EnteredEvent = EnterEvent
		newObj.MouseIn = false
		newObj.LeaveEvent = LeaveEvent
		currentItems[UIObj] = newObj
		UIObj.AncestryChanged:connect(function()
		    if UIObj.Parent == nil then
		        -- item was removed
				EnterEvent:Destroy()	
				LeaveEvent:Destroy()	
				currentItems[UIObj] = nil
		    end
		end)
		
		-- spawn(function() --Super hacky, but if you click a button then dont move your mouse, mouse over wont fire even if your mouse is over!
		-- 	wait()
		-- 	local Mouse = Player:GetMouse()
		-- 	local X = Mouse.X
		-- 	local Y = Mouse.Y
		-- 	if X>newObj.UIObj.AbsolutePosition.X and Y>newObj.UIObj.AbsolutePosition.Y then
		-- 		if X<newObj.UIObj.AbsolutePosition.X+newObj.UIObj.AbsoluteSize.X and Y<newObj.UIObj.AbsolutePosition.Y+newObj.UIObj.AbsoluteSize.Y then
		-- 			if newObj.MouseIn ~= true then
		-- 				newObj.MouseIn = true
		-- 				if newObj.EnteredEvent then
		-- 					newObj.EnteredEvent:Fire()
		-- 				end
		-- 			end
		-- 		end	
		-- 	end
		-- end)	
		
	   return EnterEvent.Event,LeaveEvent.Event
	end
	
	local Mouse = Player:GetMouse()
	
	local function IsInFrame(v)
		local X = Mouse.X
		local Y = Mouse.Y
		if X>v.AbsolutePosition.X and Y>v.AbsolutePosition.Y and X<v.AbsolutePosition.X+v.AbsoluteSize.X and Y<v.AbsolutePosition.Y+v.AbsoluteSize.Y then
			return true
		else 
			return false
		end
	end
	
	Mouse.Move:Connect(function()
		for i,v in pairs(currentItems) do
			if not IsInFrame(v.UIObj) then
				if v.MouseIn then
					v.MouseIn = false
					v.LeaveEvent:Fire()
				end
			end
		end
		for i,v in pairs(currentItems) do
			if IsInFrame(v.UIObj) then
				if not v.MouseIn then
					v.MouseIn = true
					v.EnteredEvent:Fire()
				end
			end
		end
	end)
	
return module