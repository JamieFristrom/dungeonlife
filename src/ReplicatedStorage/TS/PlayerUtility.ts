import { Teams } from "@rbxts/services";
import { PlacesManifest } from "./PlacesManifest";

export namespace PlayerUtility
{
//    return (((Character and Character.Parent and Humanoid and Humanoid.Parent and Humanoid.Health > 0 and Player and Player.Parent) and true) or false)

    export function getRank( player: Player )
    {
        let rank = 0
        let [ success, msg ] = pcall( function() { rank = player.GetRankInGroup( PlacesManifest.getCurrentGame().groupId ) } )
        if( !success )
            warn( msg )
        return rank
    }


    export function IsPlayersCharacterAlive( player: Player )
    {
        if( player.Parent )
            if( player.Team !== Teams.FindFirstChild('Unassigned') )
                if( player.Character )
                    if( player.Character.Parent )
                        if( player.Character.PrimaryPart )
                        {
                            let humanoid = player.Character.FindFirstChild("Humanoid") as Humanoid
                            if( humanoid )
                                if( humanoid.Health > 0 )
                                    return true
                        }
    return false
    }
}