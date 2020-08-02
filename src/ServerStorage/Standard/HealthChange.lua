local CharacterClientI   = require( game.ReplicatedStorage.CharacterClientI )
local WerewolfUtility    = require( game.ReplicatedStorage.WerewolfUtility )

local MathXL = require( game.ReplicatedStorage.Standard.MathXL )

local PlayerServer = require( game.ServerStorage.TS.PlayerServer ).PlayerServer

local HealthChange = {}

local critSoundIds = 
{
	'rbxassetid://4064946996',
	'rbxassetid://4064947437',
	'rbxassetid://4064947806'
}

function HealthChange:Activate( character, amount, critB )
	spawn( function() 
		local player = game.Players:GetPlayerFromCharacter( character )
		if player then
			if PlayerServer.getCharacterClass( player ) == "Werewolf" and WerewolfUtility:IsUndercover( character ) then
				return
			end
		end 
		local displayAmount = math.floor( math.abs( amount ) ) 
		if displayAmount > 0 then
			local newDamageFX = game.ServerStorage.CharacterFX.DamageFX:Clone()
			newDamageFX.Parent = character.PrimaryPart
			newDamageFX.DamageBubble.Frame.Critical.Visible = critB
			newDamageFX.CritRings.Enabled = critB
			if amount > 0 then
				newDamageFX.DamageBubble.Frame.Damage.Text = "+"..displayAmount
				newDamageFX.DamageBubble.Frame.Damage.TextColor3 = Color3.new( 0, 1, 0 )  -- color blindness issue
				newDamageFX.Particles.Enabled = false
			else
				if( critB )then
					newDamageFX.CritSound.SoundId = critSoundIds[ MathXL:RandomInteger(1, #critSoundIds)]
					newDamageFX.CritSound.PlaybackSpeed = MathXL:RandomNumber( 0.75, 0.85 )
					newDamageFX.CritSound:Play()
				end
				newDamageFX.DamageBubble.Frame.Damage.Text = displayAmount
				newDamageFX.DamageBubble.Frame.Damage.TextColor3 = Color3.new( 1, 0, 0 )
			end
			newDamageFX.FXScript.Disabled = false
		end
	end )
end

return HealthChange
