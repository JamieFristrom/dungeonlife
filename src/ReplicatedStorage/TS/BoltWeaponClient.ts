import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI( 'Executed', script.GetFullName())

import { FlexToolClient } from "ReplicatedStorage/TS/FlexToolClient"
import { MessageGui } from "ReplicatedStorage/TS/MessageGui"
import { BaseWeaponClient } from "ReplicatedStorage/TS/BaseWeaponClient"
import { BoltWeaponUtility } from "ReplicatedStorage/TS/BoltWeaponUtility"
import * as BoltWeaponUtilityXL from 'ReplicatedStorage/Standard/BoltWeaponUtilityXL'
import * as RangedWeaponUtility from 'ReplicatedStorage/Standard/RangedWeaponUtility'
import * as MathXL from 'ReplicatedStorage/Standard/MathXL'

import { Workspace, RunService } from "@rbxts/services"

type Character = Model


export class BoltWeaponClient extends BaseWeaponClient
{
    static readonly lagHidingB = true
    boltTemplate: BasePart

    constructor( tool: Tool, messageFunc: (msg: string, b: boolean)=>void, animName: string )
    {
        let flexTool = FlexToolClient.getFlexTool( tool )
        super( tool, new BoltWeaponUtility( tool, flexTool ) )       // fixme: move flexTool into BaseWeaponUtility
        const templateTemplate = this.tool.WaitForChild<BasePart>('Bolt')
        this.boltTemplate = templateTemplate.Clone()
        templateTemplate.Parent = undefined        
    }

    _onActivated(character: Character, mouse: Mouse)
    {
        // can't use mouse hit because it collides with transparent objects
        const [ clickPart, clickHitV3 ] = RangedWeaponUtility.MouseHitNontransparentPack( mouse, [character] )

        const serverBoltCodeName = 'Bolt'+tostring(MathXL.RandomInteger(1,100000))
        DebugXL.logV('Combat', 'BoltWeaponRE.FireServer')

        const boltWeaponRemoteEvent = this.tool.FindFirstChild<RemoteEvent>('BoltWeaponRE')
        DebugXL.Assert( boltWeaponRemoteEvent !== undefined )
        if( !boltWeaponRemoteEvent ) { return }
        boltWeaponRemoteEvent.FireServer( 'OnActivated', clickHitV3, serverBoltCodeName )
        
        if( BoltWeaponClient.lagHidingB )
        {
            // making the bolt go slower on the client is a poor man's way of doing lag compensation
            // 0.5 was too slow, though, people noticed - 10/29					
            const bolt = BoltWeaponUtilityXL.Fire( this.tool, this.boltTemplate, clickHitV3, 0.75 )  // fires our fake client bolt
            bolt.Name = 'ClientBolt'
            bolt.Parent = this.tool
            // why do we need this line? maybe we don't anymore now that this is local script only
            // if game["Run Service"]:IsClient() and not game["Run Service"]:IsServer() then
            DebugXL.logD('Combat', 'Spawning boltwatch function for '+serverBoltCodeName )
            spawn(()=>{
                DebugXL.logV('Combat', 'Waiting for '+serverBoltCodeName+'...' )   
                const serverBolt = Workspace.FindFirstChild<Folder>('ActiveServerProjectiles')!.WaitForChild( serverBoltCodeName )
                serverBolt.Parent = undefined  // hides the real server bolt
                DebugXL.logD('Combat', 'Destroyed '+serverBoltCodeName)
            })
        }
    }
}
