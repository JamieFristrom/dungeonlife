
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { CharacterClass } from 'ReplicatedStorage/TS/CharacterClasses'

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

    
    // show what character class we've published in leaderstats; returns 
    export function getPublishedClass( player: Player ) : CharacterClass {
        const leaderstats = player.FindFirstChild<Folder>("leaderstats")
        if( leaderstats !== undefined ) {
             const classObj = leaderstats.FindFirstChild<StringValue>("Class")
             if( classObj !== undefined ) {
                 return classObj.Value === "" ? "NullClass" : classObj.Value as CharacterClass
             }
        }
        return "NullClass"
    }
}