print( script:GetFullName().." executed" )
local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL)
local InstanceXL = require( game.ReplicatedStorage.Standard.InstanceXL )

local CharacterClientI = require( game.ReplicatedStorage.CharacterClientI )
local HeroUtility      = require( game.ReplicatedStorage.Standard.HeroUtility )

local Hero = require( game.ReplicatedStorage.TS.HeroTS ).Hero
local Localize = require( game.ReplicatedStorage.TS.Localize ).Localize
local PCClient = require( game.ReplicatedStorage.TS.PCClient ).PCClient
local Places = require( game.ReplicatedStorage.TS.PlacesManifest ).PlacesManifest


local pcFunc   		= workspace.Signals.HeroesRF
local pcEvent  		= workspace.Signals.HeroesRE

local sheetGui   = script.Parent.Parent:WaitForChild("CharacterSheet")
local sheetFrame = sheetGui:WaitForChild("Inlay")

local baseStats = { "strN", "dexN", "willN", "conN"  }
local derivativeStats = { "melee", "ranged", "spell", nil }

local statPoints = 0

local HeroesRemote = {}

function HeroesRemote:RefreshSheet()
	--print( "HeroesRemote:RefreshSheet()" )
	if not PCClient.pc then return end
	if not PCClient.pc.statsT then return end	

	sheetFrame:WaitForChild("CharacterName").Text = game.Players.LocalPlayer.Name
	--print( "PCClient.pc ok" )
	
	-- wishlist fix - a single GetBaseStats function would be a lot more efficient
	statPoints = HeroUtility:StatPointsEarned( PCClient.pc.statsT.experienceN )
	 	- HeroUtility:GetStatPointsSpent( PCClient.pc ) 
	
	local experienceN = PCClient.pc.statsT.experienceN
	local actualLevelN = Hero:levelForExperience( experienceN )  
	local currentMaxHeroLevel = Hero:getCurrentMaxHeroLevel()
	local localLevelN = PCClient.pc:getLocalLevel() 
	local levelDescS = Localize.formatByKey( "Level", { localLevelN } )
	if( actualLevelN > localLevelN )then
		levelDescS = levelDescS .. ' ('..actualLevelN..')'
	end
	sheetFrame:WaitForChild("Level").Text = levelDescS
	
	local experienceFromLastLevelN 	= Hero:experienceFromLastLevel( experienceN )		
	local nextLevelExperienceN		= Hero:experienceFromLastLevelToNext( experienceN )

	for i, stat in ipairs( baseStats ) do
		local localStatN = PCClient.pc:getAdjBaseStat( stat )
		local actualStatN = PCClient.pc:getActualAdjBaseStat( stat )
--		sheetFrame[stat].Label.Text = HeroUtility.statNamesT[ stat ]
		
		sheetFrame[stat].Label.Text = Localize.formatByKey( stat )
		sheetFrame[stat].Stat.Text = localStatN < actualStatN and localStatN.." ("..actualStatN..")" or localStatN  -- PCClient.pc:getAdjBaseStat( stat ) -- HeroUtility:GetAdjBaseStat( PCClient.pc, stat )
		sheetFrame[stat].ImageButton.UIArrow.Visible = statPoints > 0
		sheetFrame[stat].ImageButton.Active = statPoints > 0
		sheetFrame[stat].ImageButton.ImageColor3 = ( statPoints > 0 ) and Color3.fromRGB( 231, 0, 0 ) or Color3.fromRGB( 48, 48, 48 )
		if derivativeStats[i] then
			local derivativeStat = HeroUtility:GetDamageBonus( PCClient.pc, derivativeStats[i] )
			sheetFrame[stat].DerivativeStat.Text = "+".. derivativeStat * 100.0 .."%"
		end
	end
	
	-- .66's below are hardcoded; add another Frame to do properly
	local expBar = sheetFrame:WaitForChild("ExperienceBar")

	if actualLevelN < Hero.globalHeroLevelCap then
		expBar:WaitForChild("Stat").Text = experienceFromLastLevelN .."/".. nextLevelExperienceN
		expBar:WaitForChild("MercuryLevel").Size = UDim2.new( experienceFromLastLevelN / nextLevelExperienceN, 0, 1, 0 )
		expBar.Visible = true
	else
		expBar.Visible = false
	end
	
	-- armor defense
	sheetFrame:WaitForChild("Defense"):WaitForChild("DefenseClose"):WaitForChild("DefenseStat").Text = PCClient.pc:getTotalDefense( "melee" )
	sheetFrame:WaitForChild("Defense"):WaitForChild("DefenseRanged"):WaitForChild("DefenseStat").Text = PCClient.pc:getTotalDefense( "ranged" )
	sheetFrame:WaitForChild("Defense"):WaitForChild("DefenseSpell"):WaitForChild("DefenseStat").Text = PCClient.pc:getTotalDefense( "spell" )
		
	local humanoid = game.Players.LocalPlayer.Character:FindFirstChild("Humanoid")
	
	local maxHealth, maxManaN, health, manaN
	if humanoid and workspace.GameManagement.PreparationCountdown.Value <= 0 and game.Players.LocalPlayer.HeroExpressPreparationCountdown.Value <= 0 then
		maxHealth = humanoid.MaxHealth
		health = humanoid.Health
		local maxManaValue = game.Players.LocalPlayer.Character:FindFirstChild("MaxManaValue")
		maxManaN = maxManaValue and maxManaValue.Value or PCClient.pc:getMaxMana() 
		local manaValue = game.Players.LocalPlayer.Character:FindFirstChild("ManaValue")
		manaN = manaValue and manaValue.Value or maxManaN		
	else 
		maxHealth = PCClient.pc:getMaxHealth() 
		maxManaN =  PCClient.pc:getMaxMana()
		health = maxHealth
		manaN = maxManaN
	end
	
	local healthBar = sheetFrame:WaitForChild("HealthBar")	
	healthBar:WaitForChild("Stat").Text = math.ceil( health ).. "/" .. maxHealth
	healthBar:WaitForChild("MercuryLevel").Size = UDim2.new( health / maxHealth * .66, 0, 1, 0 )
	
			
	local manaBar = sheetFrame:WaitForChild("ManaBar")	
	manaBar:WaitForChild("Label").Text = HeroUtility.statNamesT.mana
	manaBar:WaitForChild("Stat").Text = math.floor( manaN ).. "/" .. maxManaN
	manaBar:WaitForChild("MercuryLevel").Size = UDim2.new( manaN / maxManaN * .66, 0, 1, 0 )
		
	sheetFrame:WaitForChild("StatPoints").Text = "Stat Points "..statPoints	
end


local function SpendStatPoint( stat )
	if statPoints > 0 then
		pcEvent:FireServer( "SpendStatPoint", stat )
		-- fake update for funky fresh
		sheetFrame.SpendStatPoint:Play()
		statPoints = statPoints - 1

		DebugXL:Assert( PCClient.pc )
		if not PCClient.pc then return end
		if not PCClient.pc.statsT then return end  -- probably shouldn't even be here but whatever

		PCClient.pc.statsT[ stat ] = PCClient.pc.statsT[ stat ] + 1
		HeroesRemote:RefreshSheet( PCClient.pc )
	end
end



local function CloseCharacterSheet()
	sheetGui.Visible = false
end


sheetGui.CloseButton.MouseButton1Click:Connect( CloseCharacterSheet )

game:GetService("UserInputService").InputBegan:Connect( function( inputObject )
	if inputObject.UserInputType == Enum.UserInputType.Gamepad1 then
		if inputObject.KeyCode == Enum.KeyCode.ButtonB then
			CloseCharacterSheet()
		end
	end
end)

workspace.GameManagement.PreparationCountdown.Changed:Connect( function(newvalue)
	if newvalue == 0 then
		CloseCharacterSheet()
	end
end)

--if game.Players.LocalPlayer.Team == game.Teams.Heroes then
for _, stat in ipairs( baseStats ) do
	sheetFrame[stat].ImageButton.MouseButton1Click:Connect( function() SpendStatPoint( stat ) end )
end

HeroesRemote:RefreshSheet()

PCClient.pcUpdatedConnect( function()
	HeroesRemote:RefreshSheet()
end)

print( "DrawCharacterSheet connected" )
	
	

--end