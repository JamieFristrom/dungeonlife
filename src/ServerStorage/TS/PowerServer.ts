import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI('Executed', script.Name)

import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { ToolData } from "ReplicatedStorage/TS/ToolDataTS"

import { AuraServer } from "ServerStorage/TS/AuraServer"

import { AreaEffect } from "ServerStorage/TS/AreaEffect"
import { Barrier } from "ServerStorage/Standard/BarrierModule"

import * as CharacterXL from "ServerStorage/Standard/CharacterXL"
import * as Mana from "ServerStorage/Standard/ManaModule"
import * as Werewolf from "ServerStorage/Standard/WerewolfModule"

import * as FlexEquipUtility from "ReplicatedStorage/Standard/FlexEquipUtility"

import { ServerStorage, Workspace, TweenService, Teams } from "@rbxts/services"
import * as CharacterI from "ServerStorage/Standard/CharacterI"

interface Activateable
{
    Activate( ...args:unknown[] ): void
}

export namespace PowerServer
{

    let magicHealingModule = ServerStorage.FindFirstChild('CharacterFX')!.FindFirstChild<ModuleScript>('MagicHealing')!
    let healthChangeModule = ServerStorage.FindFirstChild('CharacterFX')!.FindFirstChild<ModuleScript>('HealthChange')!
    let auraGlowModule = ServerStorage.FindFirstChild('CharacterFX')!.FindFirstChild<ModuleScript>('AuraGlow')!
    let magicSprintModule = ServerStorage.FindFirstChild('CharacterFX')!.FindFirstChild<ModuleScript>('MagicSprint')!


    export function activatePower( player: Player, flexToolInst: FlexTool  )
    {
        let toolBaseData = ToolData.dataT[ flexToolInst.baseDataS ]
        let character = player.Character
        if( character )
        {
            if( flexToolInst.powerCooldownPctRemaining( player ) <= 0 )
            {
                if( flexToolInst.canLogicallyActivate( character ) )
                {
                    let levelNerfFactor = 1
                    let pcData = CharacterI.GetPCDataWait( player )
                    if( pcData instanceof Hero ) {
                        let localLevel = pcData.getLocalLevel()
                        let actualLevel = pcData.getActualLevel()
                        levelNerfFactor = localLevel < actualLevel ? localLevel / actualLevel : 1
                    }

                    let adjustedManaCost = math.ceil( flexToolInst.getManaCost() * levelNerfFactor ) // to be fair, since you have less mana available, casting lower effect power spells should be cheaper
                    let success = Mana.SpendMana( character, adjustedManaCost )
                    if( success )
                    {
                        flexToolInst.startPowerCooldown( player )
                        if( toolBaseData.idS === "MagicHealing" )
                        {
                            let effectStrength = flexToolInst.getEffectStrength( levelNerfFactor );
                            let team = player.Team
                            DebugXL.Assert( team !== undefined )
                            if( team ) {
                                let newWisp = createWisp(toolBaseData, flexToolInst, player, character, Color3.fromRGB(236, 0, 15), Color3.fromRGB(150,0,0), team,
                                    (targetCharacter, deltaT) => {
                                        let humanoid = targetCharacter.FindFirstChild<Humanoid>("Humanoid");
                                        if (humanoid)
                                            if (humanoid.Health < humanoid.MaxHealth) 
                                            {
                                                humanoid.Health = math.min(humanoid.Health + effectStrength * deltaT, humanoid.MaxHealth);
                                                // requiring inline to avoid circular dependencies
                                                (require(magicHealingModule) as Activateable).Activate(targetCharacter, new Color3(1, 0, 0));
                                                (require(healthChangeModule) as Activateable).Activate(targetCharacter, effectStrength * deltaT);
                                            }
                                    } )
                                newWisp.Name = "MagicHealing"
                            }
                        }
                        else if( toolBaseData.idS === "HasteWisp" )
                        {
                            let team = player.Team
                            DebugXL.Assert( team !== undefined )
                            if( team ) {
                                let newWisp = createWisp(toolBaseData, flexToolInst, player, character, Color3.fromRGB(15, 79, 5), Color3.fromRGB(16,150,0), team,
                                    (targetCharacter, deltaT) => {
                                        (require(auraGlowModule) as Activateable).Activate(targetCharacter, 1, new Color3(0, 1, 0));
                                    } )
                                newWisp.Name = "HasteWisp"                                
                                let effectStrength = flexToolInst.getEffectStrength( levelNerfFactor );
                                newWisp.FindFirstChild<NumberValue>("EffectStrength")!.Value = effectStrength
                            }
                        }
                        else if( toolBaseData.idS === "CurseWisp" )
                        {
                            let newWisp = createWisp(toolBaseData, flexToolInst, player, character, Color3.fromRGB(34, 15, 53), Color3.fromRGB( 68, 30, 106), Teams.FindFirstChild('Monsters') as Team,
                                (targetCharacter, deltaT) => {
                                    (require(auraGlowModule) as Activateable).Activate(targetCharacter, 1, new Color3(0.75, 0, 1));
                                } )
                            newWisp.Name = "CurseWisp"                                
                            let effectStrength = flexToolInst.getEffectStrength( levelNerfFactor );
                            newWisp.FindFirstChild<NumberValue>("EffectStrength")!.Value = effectStrength
                        }
                        else if( toolBaseData.idS === "MagicSprint" || toolBaseData.idS === "MonsterSprint" )
                        {
                            let duration = toolBaseData.durationFunc!( toolBaseData, flexToolInst.levelN ) 
                            CharacterXL.SpeedMulFor( character, flexToolInst.getEffectStrength( levelNerfFactor ), 1, duration )
                                
                            ;( require(magicSprintModule) as Activateable ).Activate( character, duration )                                
                        }
                        else if( toolBaseData.idS === "TransformWerewolf" )                        
                        {
                            Werewolf.ToggleForm( player )
                        }
                        else if( toolBaseData.idS === "MagicBarrier" || toolBaseData.idS === "NecroBarrier" )
                        {
                            let duration = toolBaseData.durationFunc!( toolBaseData, flexToolInst.levelN ) 
                            // using the Roblox tool is really entrenched in the damage system right now even though it has become
                            // nearly irrelevant, so let's dig up the tool so we can apply damage :P
                            Barrier.Activate( character, duration, flexToolInst )                            
                        }
                        else
                        {
                            DebugXL.Error( toolBaseData.idS + " has no activate code")
                        }
                    }
                }
            }
        }
    }

    function createWisp( toolBaseData: ToolData.ToolDatumI, 
            flexToolInst: FlexTool, 
            player: Player, 
            character: Model, 
            colorMain: Color3, colorRim: Color3,
            affectedTeam: Team,
            effectFunc: ( targetCharacter: Model, deltaT: number )=>void) 
    {
        let newWisp = ServerStorage.FindFirstChild('Summons')!.FindFirstChild('Wisp')!.Clone() as Model
        let wispCore = newWisp.FindFirstChild('Wisp')!
        let fireBigParticles = wispCore.FindFirstChild('RingCore')!.FindFirstChild('Fire') as ParticleEmitter
        let fireSmallParticles = wispCore.FindFirstChild('CloudCore')!.FindFirstChild('Fire') as ParticleEmitter
        let light = wispCore.FindFirstChild('WispLight') as PointLight
        fireBigParticles.Color = new ColorSequence(colorMain, Color3.fromRGB(0, 0, 0))
        fireSmallParticles.Color = new ColorSequence(colorRim, Color3.fromRGB(0, 0, 0))
        light.Color = colorMain
        let duration = toolBaseData.durationFunc!(toolBaseData, flexToolInst.levelN)
        let range = FlexEquipUtility.GetAdjStat(flexToolInst, "rangeN")
        new AreaEffect(newWisp, range, duration, affectedTeam, effectFunc )
        newWisp.SetPrimaryPartCFrame(character.GetPrimaryPartCFrame().add(new Vector3(0, 7, 0)))
        newWisp.FindFirstChild<NumberValue>('Range')!.Value = range
        newWisp.Parent = Workspace.FindFirstChild('Summons')
        delay(duration - 2, () => {
            newWisp.GetDescendants().forEach((descendant) => {
                if (descendant.IsA("ParticleEmitter"))
                    descendant.Enabled = false
                else if (descendant.IsA("BasePart"))
                    TweenService.Create(descendant, new TweenInfo(2), { Transparency: 1 }).Play()
            })
            newWisp.PrimaryPart!.FindFirstChild<Sound>("DisperseSound")!.Play()
            wait(2)
            newWisp.Destroy()
        })
        return newWisp
    }

    AuraServer.run()
}
