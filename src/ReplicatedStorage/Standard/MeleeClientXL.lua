local DebugXL          = require( game.ReplicatedStorage.Standard.DebugXL )
local MathXL           = require( game.ReplicatedStorage.Standard.MathXL )
local TableXL          = require( game.ReplicatedStorage.Standard.TableXL )
local WeaponUtility    = require( game.ReplicatedStorage.Standard.WeaponUtility )

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )


local MeleeClientXL = {}

-- a full 360 degree attack 
MeleeClientXL.swordSweepDot = -2

function MeleeClientXL.new( tool )
	
	local windUpAnimTrack
	local attackAnimTracks = {}
	local attackUpperBodyAnimTracks = {}
	
	local attackIndex = 1
	
	local handle = tool:WaitForChild("Handle")
	local unsheathSound = handle:WaitForChild("Unsheath")
	local slashSound = handle:WaitForChild("Slash")
	local hitSound = handle:WaitForChild("Hit")
	local hitVol = hitSound.Volume
	local hitSoundSpeed = hitSound.PlaybackSpeed
	
	local function OnButton1Down(mouse)
		
		local character = tool.Parent	
		local player = game.Players:GetPlayerFromCharacter( character )

		if WeaponUtility:IsCoolingDown( player ) then return end 
		
		slashSound:Play()

		-- if in 120 degree-ish forward cone we slash and auto hit
		local bestTarget, bestFitN = WeaponUtility:FindClosestTargetInCone( character, MeleeClientXL.swordSweepDot )
--		local enemyCharacters = TableXL:FindAllInAWhere( game.CollectionService:GetTagged("Character"),
--			function( v ) return CharacterClientI:ValidTarget( character, v ) end )
--		local targetsInCone = TableXL:FindAllInAWhere( enemyCharacters, function( targetCharacter ) 
--				if not targetCharacter.PrimaryPart then return false end 
--				local facingTargetV3 = ( targetCharacter:GetPrimaryPartCFrame().p - character:GetPrimaryPartCFrame().p ).Unit  
--				return facingTargetV3:Dot( character:GetPrimaryPartCFrame().lookVector ) > MeleeClientXL.swordSweepDot  
--			end )
--		local bestTarget, bestFitN = TableXL:FindBestFitMin( targetsInCone, function( targetCharacter ) 
--			return ( targetCharacter:GetPrimaryPartCFrame().p - character:GetPrimaryPartCFrame().p ).Magnitude end )
--		
		local foundTargetB = false
		if bestTarget then
			if bestFitN <= tool.Range.Value then
--				--print( "Found target" )
				foundTargetB = true
				local targetV3 = bestTarget:GetPrimaryPartCFrame().p
				targetV3 = Vector3.new( targetV3.X, character:GetPrimaryPartCFrame().p.Y, targetV3.Z )
				local facingTargetCF = CFrame.new( character:GetPrimaryPartCFrame().p, targetV3 )
				character:SetPrimaryPartCFrame( facingTargetCF )
			end
		end
					
		local humanoid = character:FindFirstChildOfClass("Humanoid")
		if humanoid then
			
			for _, child in pairs( handle:GetChildren() ) do
				if child:IsA("Trail") then
					child.Enabled = true
				end
			end
			local adjCooldown = WeaponUtility:GetAdjustedCooldown( player, tool.Cooldown.Value )
			if attackAnimTracks[ attackIndex ] then 			
				if character.PrimaryPart.Velocity.Magnitude > 0.5 then
					attackUpperBodyAnimTracks[ attackIndex ]:Play( nil, nil, 0.6/adjCooldown ) 
				else
					attackAnimTracks[ attackIndex ]:Play( nil, nil, 0.6/adjCooldown )
				end
				attackIndex = attackIndex % #attackAnimTracks + 1
			else
--				--print( "Playing slash animation" )
				local Animation = Instance.new("StringValue")
				Animation.Name = "toolanim"
				Animation.Value = "Slash"
				Animation.Parent = tool
				game.Debris:AddItem(Animation, 2)		
			end
			
			if foundTargetB then
				delay( adjCooldown / 2, function() 
					hitSound.PlaybackSpeed = hitSoundSpeed * MathXL:RandomNumber( 0.8, 1.2 )
					hitSound.Volume = hitVol * MathXL:RandomNumber( 0.7, 1.3 )
					tool.Handle.Hit:Play() 
				end )
			end
			WeaponUtility:CooldownWait( player, adjCooldown, nil )  
	
			for _, child in pairs( handle:GetChildren() ) do
				if child:IsA("Trail") then
					child.Enabled = false
				end
			end
		end		
	end
	
	
	local function OnEquippedLocal(mouse)
	
		if mouse == nil then
			print("Mouse not found")
			return 
		end
		
		mouse.Button1Down:connect(function() OnButton1Down(mouse) end)
		
		local character = tool.Parent
		local humanoid = character:FindFirstChild("Humanoid")
		if humanoid then
			local windUpAnim = tool:FindFirstChild("WindUpAnim")
			if windUpAnim then
				windUpAnimTrack = humanoid:LoadAnimation( windUpAnim )
				windUpAnimTrack.Looped = false
				windUpAnimTrack:Play()
				wait( windUpAnimTrack.Length * 0.9 )
				windUpAnimTrack:AdjustSpeed( 0 )
			end
			for i = 1, 5 do
				local attackAnim = tool:FindFirstChild("AttackAnim"..i)
				if attackAnim then
					attackAnimTracks[i] = humanoid:LoadAnimation( attackAnim )
					attackAnimTracks[i].Looped = false
					-- just assuming you provide the upper body version. do it
					local attackUpperBodyAnim = tool:FindFirstChild("AttackAnimUpperBody"..i)
					attackUpperBodyAnimTracks[i] = humanoid:LoadAnimation( attackUpperBodyAnim )
					attackUpperBodyAnimTracks[i].Looped = false 
				else
					break
				end
			end
		end
	end
	
	local function OnUnequippedLocal()
		if windUpAnimTrack then
			windUpAnimTrack:Stop()
		end
	end
	
	tool.Equipped:Connect( OnEquippedLocal )
	tool.Unequipped:Connect( OnUnequippedLocal )

end

return MeleeClientXL
