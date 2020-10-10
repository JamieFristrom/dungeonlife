local PossessionData = require( game.ReplicatedStorage.PossessionData )

local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize

local awardGui = script.Parent.Parent

workspace.Signals.InventoryRE.OnClientEvent:Connect( function( funcName, awardIdS, occasionS )
	if funcName == "Award" then
		local awardSequence = awardGui:WaitForChild("AwardSequenceTemplate"):Clone()
		awardSequence.Visible = true
		awardSequence.Parent = awardGui		
		local shakingChest = awardSequence:WaitForChild("ShakingChestTemplate"):Clone()
		shakingChest.Title.Text = Localize.formatByKey( occasionS )
		shakingChest.Visible = true
		shakingChest.AnimateScript.Disabled = false
		shakingChest.Parent = awardSequence
		print( "Waiting for chest shake" )
		wait(3)
		print( "Destroying chest" )
		shakingChest:Destroy()
		print( "Displaying award" )
		local award = awardSequence:WaitForChild("AwardTemplate"):Clone()
		award.MainScript.Disabled = false
		local itemT = PossessionData.dataT[ awardIdS ]
		award.Card.ImageLabel.Image = itemT.imageId
		award.Card.RarityBacking.ImageColor3 = PossessionData.raritiesT[ itemT.rarityN ].color3
		if( itemT.rarityN>0 )then
			award.Title.Text = Localize.formatByKey( itemT.idS ).."\n(".. Localize.formatByKey( "Rarity"..itemT.rarityN ) ..")"
		else
			award.Title.Text = Localize.formatByKey( itemT.idS )
		end

		award.Visible = true
		
		award.Parent = awardSequence	
	end
end)