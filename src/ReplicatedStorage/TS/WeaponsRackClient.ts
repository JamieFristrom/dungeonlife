
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.Name)

import { CollectionService, RunService, Teams } from "@rbxts/services";

export class WeaponsRackClient 
{
    constructor( inst: Instance )
    {
        let chestInstance = inst as Model
        let origin = chestInstance.WaitForChild<BasePart>("Origin")  // .PrimaryPart  // dunno why PrimaryPart doesn't work
        let clientUsedObj = chestInstance.WaitForChild<BoolValue>("ClientUsed")
        let clickDetector = chestInstance.WaitForChild("ClickBox").WaitForChild<ClickDetector>("ClickDetector")
        let clickRE = chestInstance.WaitForChild<RemoteEvent>("ClickRE")
        
        function OnClick( player: Player )
        {
            if( player.Team === Teams.FindFirstChild('Monsters') ) {
                clientUsedObj.Value = true
                clickRE.FireServer("use")
            }
        }
        
        clickDetector.MouseClick.Connect( OnClick )    
        clickRE.FireServer("ack")
    }

}

// wishlist: a clickable component that includes racks, chests, and whatever new clickable things we make
// (drinkable healing fountains?)
export namespace WeaponsRackClientManager 
{
    export function run() {
        CollectionService.GetTagged( "WeaponsRack").forEach( function( instance )
        {
            new WeaponsRackClient( instance )
        } )

        CollectionService.GetInstanceAddedSignal( "WeaponsRack" ).Connect( function( instance )
        {
            new WeaponsRackClient( instance )
        } )
    }
}