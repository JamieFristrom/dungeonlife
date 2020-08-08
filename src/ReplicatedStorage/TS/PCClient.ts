
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { CharacterRecord, CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"

import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { HotbarSlot } from "ReplicatedStorage/TS/FlexToolTS"

import { Workspace, Players } from "@rbxts/services";

let hotbarRE = Workspace.WaitForChild('Signals').WaitForChild('HotbarRE') as RemoteEvent

let localPlayer = Players.LocalPlayer!
let playerGui = localPlayer.WaitForChild('PlayerGui')

export namespace PCClient 
{
    // well, this is ugly
    function virtuallyObjectify( pcData: {[k:string]:unknown} )
    {
        if( pcData.statsT )
        {
            print( "Local player pcdata is hero")
            let pc = Hero.convertFromRemote( pcData as unknown as Hero )
            pc.getActualLevel();  // just for test
            //print( pc )
            //print( PCClient )
            return pc
        }
        else
        {
            //print( "Local player pcdata is monster")
            return CharacterRecord.convertFromRemote( pcData as unknown as CharacterRecord )
        }
    }

    //let pcDataRaw = hotbarRF.InvokeServer( "GetPCData") as { [k:string]:unknown }
    export let pc: CharacterRecord | undefined
    //print( "CharacterRecord client aquired initial pc data" )

    let defaultConnection = hotbarRE.OnClientEvent.Connect( function( ...args: unknown[] )
    {
        //print( "hotbarre called")
        let funcName = args[0] as string
        let pcData = args[1] as CharacterRecordI | Hero
        if( funcName === "Refresh" )
        {            
            PCClient.pc = virtuallyObjectify( pcData as unknown as {[k:string]:number})
            //print( "client pc refreshed")
        }
    })

    export function pcUpdatedConnect( func: ( pc: CharacterRecord )=>void )
    {
	    defaultConnection.Disconnect()
        return hotbarRE.OnClientEvent.Connect( function( ...args: unknown[] )
        {
            let funcName = args[0] as string
            let pcData = args[1] as CharacterRecord
            if( funcName === "Refresh" )
            {
                // if we connect multiple functions it just means that pcData gets overwritten several times
                PCClient.pc = virtuallyObjectify( pcData as unknown as {[k:string]:unknown} )
                //print( "Objectified")
                func( PCClient.pc )
            }
        } )
    }

    export function equip(slotN: HotbarSlot) {
        //print( "Equip "..slotN )
        DebugXL.Assert(PCClient.pc !== undefined)
        if (PCClient.pc) {
            let possessionKey = PCClient.pc.getPossessionKeyFromSlot(slotN)!
            if (possessionKey) {
                let localCharacter = localPlayer.Character
                if (localCharacter) {
                    hotbarRE.FireServer("Equip", slotN)
    
                    // get tool for hotbar slot
                    let flexToolInst = PCClient.pc.getFlexTool(possessionKey)
                    if (flexToolInst)  // possible you've thrown out the tool and the hotbar is late on updating
                    {
                        if (flexToolInst.getUseType() === "power") {
                            let uiClick = playerGui.WaitForChild("Audio").WaitForChild("PowerActivate") as Sound
                            uiClick.Play()
    
                            // play effect now?
                            if (flexToolInst.canLogicallyActivate(localCharacter)) {
                                let manaValueObj = localCharacter.FindFirstChild<NumberValue>("ManaValue")
                                if (manaValueObj) {
                                    let mana = manaValueObj.Value
                                    if (mana >= flexToolInst.getManaCost()) {
                                        if (flexToolInst.powerCooldownPctRemaining(localPlayer) <= 0) {
                                            flexToolInst.startPowerCooldown(localPlayer)
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            let uiClick = playerGui.WaitForChild('Audio').WaitForChild('UIClick') as Sound
                            uiClick.Play()
                            if (!localCharacter.Parent) {
                                // if we're on the character outfitting screen our tools won't have been instantiated
                                return
                            }
    
                            let humanoid = localCharacter.FindFirstChild("Humanoid") as Humanoid
                            if (humanoid) {
                                let heldTool = localCharacter.FindFirstChildWhichIsA("Tool") as Tool
                                if (heldTool && CharacterRecord.getToolPossessionKey(heldTool) === possessionKey) {
                                    // unequip
                                    DebugXL.logD(LogArea.Items, 'Unequipping')
                                    humanoid.UnequipTools()
                                    //SelectSlot(0)
                                }
                                else {
                                    let tool = CharacterRecord.getToolInstanceFromPossessionKey(localCharacter, PCClient.pc, possessionKey) as Tool
                                    if (tool) {
                                        DebugXL.logD(LogArea.Items, 'Equipping')
                                        humanoid.EquipTool(tool)  // error in EquipTool's type signature that has now been fixed
                                    }
                                    else {
                                        // there may be some false positives here, but most of the time this means your backpack is improperly cacheing...                                                        
                                        // I could see false positives coming from equipping a weapon that the inventory replication
                                        // says you have before the instance actually gets replicated - perhaps waiting here is the right choice
                                        const flexTool = PCClient.pc.getFlexTool(possessionKey)
                                        if (flexTool) {
                                            DebugXL.logW(LogArea.Items, "Hotbar failed to find instance for " + localCharacter.GetFullName() + " tool " + flexTool.baseDataS)
                                        }
                                        else {
                                            DebugXL.Error("Hotbar had possession key for " + localCharacter.GetFullName() + " flextool that doesn't exist")
                                        }
                                    }
                                    // put box around equipped tool in GUI
                                    //SelectSlot( slotN )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
}



