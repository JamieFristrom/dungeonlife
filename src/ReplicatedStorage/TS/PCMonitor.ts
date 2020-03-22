import { DebugXL } from "./DebugXLTS";

// CharacterRecord monitor is for functions that monitor any PC
// PCClient is just for the local player's pc
export namespace PCMonitor
{
    export function getNumHealthPotions( player: Player )
    {
        let numPotionsObject = player.FindFirstChild<NumberValue>("NumHealthPotions")
        return numPotionsObject ? numPotionsObject.Value : 0
    }

    // note it's a string that can be something like '5 (7)'
    export function getPublishedLevel( player: Player )
    {
        let levelValueObj = player.FindFirstChild('leaderstats')!.FindFirstChild<StringValue>('Level')
        if( levelValueObj )  // we start reading this before the value gets published
        {
            return levelValueObj.Value
        }
        return ''
    }
}