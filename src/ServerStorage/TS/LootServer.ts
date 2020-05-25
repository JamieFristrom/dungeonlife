function Loot:MonsterDrop( monsterLevel, monsterClassS, lastAttackingPlayer, worldPosV3 )
	local odds = CharacterClasses.monsterStats[ monsterClassS ].dropItemPctN * itemDropRateModifierN / #game.Teams.Heroes:GetPlayers()
--	--print( "Loot:MonsterDrop level "..monsterLevel.."; odds: "..odds )
	for _, player in pairs( game.Teams.Heroes:GetPlayers() ) do
		local boostInPlay = false
		if Inventory:BoostActive( player ) then
			odds = odds * 2
			boostInPlay = true
	--			--print( "Loot drop odds doubled to "..odds )
		end
		if not playerLootRandomishers[ player ] then
			playerLootRandomishers[ player ] = Randomisher.new( 7 )
		end
		local dieRoll = playerLootRandomishers[ player ]:next0to1()	
		if dieRoll <= odds then
			local playerCharacterKey = PlayerServer.getCharacterKeyFromPlayer( player )
			if playerCharacterKey then
				local averageLevel = ( monsterLevel + PlayerServer.getActualLevel( playerCharacterKey ) ) / 2
	--			--print( "Loot:MonsterDrop HIT: "..player.Name..": odds: "..odds.."; dieRoll: "..dieRoll )
				Loot:Drop( averageLevel, player, false, worldPosV3, boostInPlay and ( dieRoll >= odds / 2 ) )		
			end
	--			return   -- 			
		else
--			--print( "Loot:MonsterDrop miss: "..player.Name..": odds: "..odds.."; dieRoll: "..dieRoll )
		end
	end

	-- if lastAttackingPlayer then
	-- 	-- you still might get a potion even if you get loot;  otherwise boost will diminish your chance of finding potions
	-- 	-- boost does not effect potion chance
	-- 	-- chance to drop affected by how many potions they already have (use 'em or lose 'em.  use 'em or don't get any more of 'em anyway)
	-- 	if Loot:CheckForPotionDrop( lastAttackingPlayer, monsterLevel, healthPotionDropChance, "Healing", worldPosV3 ) then return end
	-- 	Loot:CheckForPotionDrop( lastAttackingPlayer, monsterLevel, magicPotionDropChance, "Mana", worldPosV3 )
	-- end
end