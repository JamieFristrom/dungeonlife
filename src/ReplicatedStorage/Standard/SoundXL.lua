local SoundXL = {}

function SoundXL:PlaySoundOnPart( soundTemplate, part )
	local soundInstance = soundTemplate:Clone()
	soundInstance.Parent = part
	soundInstance:Play()
	spawn( function()
		soundInstance.Ended:Wait()
		soundInstance:Destroy()
	end )
	return soundInstance
end

return SoundXL
