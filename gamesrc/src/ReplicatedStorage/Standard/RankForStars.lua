local RankForStars = {}

local rankForStarA = 
{
	{ rankS = "Novice",     starCapN = 200,   badge = nil }, --(+100)  * 2, etc
	{ rankS = "Apprentice", starCapN = 600,   badge = 2124442000 }, -- (+200)
	{ rankS = "Journeyer",  starCapN = 1200,  badge = 2124442001 }, -- (+300)
	{ rankS = "Savant",     starCapN = 2200,  badge = 2124442002 }, -- (+500)
	{ rankS = "Expert",     starCapN = 3800,  badge = 2124442003 }, -- (+800)
	{ rankS = "Master",     starCapN = 6400,  badge = 2124442004 }, --   (+1300)
	{ rankS = "Archon",     starCapN = 10000, badge = 2124442005 }, --  +2100 * 2 = 4200 
	{ rankS = "Demigod",    starCapN = 15000, badge = 2124442006 },
	{ rankS = "Deity",      starCapN = 40000, badge = 2124442007 },
	{ rankS = "Titan",      starCapN = math.huge, badge = 2124450657 }
}


function RankForStars:GetRankForStars( starsN )
	local rankS
	for i = 1, #rankForStarA do
		if starsN < rankForStarA[i].starCapN then
			rankS = rankForStarA[i].rankS
			break
		end
	end
	return rankS
end


-- redundant but so
function RankForStars:AwardBadgesForStars( starsN, player )
	local rankS
	for i = 1, #rankForStarA do
		if rankForStarA[i].badge then
			game.BadgeService:AwardBadge( player.UserId, rankForStarA[i].badge )
		end
		if starsN < rankForStarA[i].starCapN then
			break
		end
	end
	return rankS
end


return RankForStars

