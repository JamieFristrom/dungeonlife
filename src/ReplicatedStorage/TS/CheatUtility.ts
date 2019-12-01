import { PlacesManifest } from "./PlacesManifest"

class CheatUtilityClass
{
	// use : calling from Lua
    PlayerWhitelisted( player: Player )
    {
        let rank = 0
        let [ success, msg ] = pcall( function() { rank = player.GetRankInGroup( PlacesManifest.getCurrentGame().groupId ) } )
	    if( !success )
		    warn( msg )
    	return rank >= 250 || ( player.UserId >= -8 && player.UserId <= -1 )  // 250 is the admin rank on the private group
    }
}

let cheatUtilityClass = new CheatUtilityClass()

export = cheatUtilityClass

