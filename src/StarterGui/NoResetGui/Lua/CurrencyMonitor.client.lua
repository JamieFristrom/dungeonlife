local GuiTraveller = require( script.Parent.Parent:WaitForChild("GuiTravellerModule") )

local RankForStars = require( game.ReplicatedStorage.RankForStars )

local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize

local currentBoostN = game.Players.LocalPlayer:WaitForChild("Boost").Value
local currentStarsN
local currentRubiesN

local currenciesFrame = script.Parent.Parent:WaitForChild("Currencies")

local function UpdateStars()

	local rankS = RankForStars:GetRankForStars( game.Players.LocalPlayer:WaitForChild("Stars").Value )
	currentStarsN = game.Players.LocalPlayer:WaitForChild("Stars").Value
	currenciesFrame.Stars.Count.Text = tostring( currentStarsN ).." ("..Localize.formatByKey( rankS )..")"
end


local function UpdateRubies()	
	-- rubies
	currentRubiesN = game.Players.LocalPlayer:WaitForChild("Rubies").Value
	currenciesFrame.Rubies.Count.Text = tostring( currentRubiesN )
end


local function UpdateBoost()
	local newBoostN = game.Players.LocalPlayer:WaitForChild("Boost").Value
	local adjustmentN = newBoostN - currentBoostN
	if adjustmentN > 0 then
		GuiTraveller:SendTravellerWait( UDim2.new( 0.5, 0, 0.5, 0 ), 
			UDim2.new( 0, currenciesFrame.Boost.Count.AbsolutePosition.X,
				0, currenciesFrame.Boost.Count.AbsolutePosition.Y ),
			currenciesFrame.Boost.AddButton.Image,
			"",
			adjustmentN == math.huge and "infinite" or string.format( "%d:%02d:%02d", math.floor( adjustmentN/3600 ), math.floor( adjustmentN%3600/60 ), adjustmentN%60 ),
			Color3.fromRGB( 255, 255, 255 ) )
	end
	currenciesFrame.Boost.Count.Text = newBoostN == math.huge and "infinite" or string.format( "%d:%02d:%02d", math.floor( newBoostN/3600 ), math.floor( newBoostN%3600/60 ), newBoostN%60 )
	currentBoostN = newBoostN	
end


UpdateStars()
UpdateRubies()


game.Players.LocalPlayer:WaitForChild("Stars").Changed:Connect( function( valueN )
	local adjustmentN = valueN - currentStarsN
	if adjustmentN > 0 then
		GuiTraveller:SendTravellerWait( UDim2.new( 0.5, 0, 0.5, 0 ), 
			UDim2.new( 0, currenciesFrame.Stars.Count.AbsolutePosition.X,
				0, currenciesFrame.Stars.Count.AbsolutePosition.Y ),
			currenciesFrame.Stars.ImageLabel.Image,
			"",
			adjustmentN,
			Color3.fromRGB( 255, 240, 48 ) )
	end
	UpdateStars()
end)

	
game.Players.LocalPlayer:WaitForChild("Rubies").Changed:Connect( function( valueN )
	wait(0.4)
	local adjustmentN = valueN - currentRubiesN
	if adjustmentN > 0 then
		GuiTraveller:SendTravellerWait( UDim2.new( 0.5, 0, 0.45, 0 ), 
			UDim2.new( 0, currenciesFrame.Rubies.Count.AbsolutePosition.X,
				0, currenciesFrame.Rubies.Count.AbsolutePosition.Y ),
			currenciesFrame.Rubies.ImageLabel.Image,
			"",
			adjustmentN,
			Color3.fromRGB( 255, 0, 0 ) )
	end
	
	UpdateRubies()
end )


while wait(0.1) do
	UpdateBoost()
end