import { Teams, Players, RunService, Workspace } from "@rbxts/services"

import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS"
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"
import InstanceXL = require("ReplicatedStorage/Standard/InstanceXL");
import { PlayerServer } from "./PlayerServer";

type Character = Model

export namespace CharacterServer {
    //
    //  Is player playing with companions out of their league?
    //
    //  Had to keep this out of HeroServer because it needs to be used by CharacterXL ; couldn't include PlayerServer for same reason
    export function IsDangerZoneForHero(pcs: Map<Player, CharacterRecordI>, player: Player): boolean {
        DebugXL.Assert(player.Team === Teams.FindFirstChild('Heroes'))

        if (player.Team !== Teams.FindFirstChild('Heroes')) return false
        let character = player.Character
        DebugXL.Assert(character !== undefined)
        if (!character)
            return false

        let playerPc = pcs.get(player)
        DebugXL.Assert(playerPc !== undefined)
        if (!playerPc) return false
        let myLevel = playerPc.getLocalLevel()
        DebugXL.Assert(myLevel !== undefined)
        let dangerZone = false
        if (myLevel) {
            pcs.forEach((pcData) => {
                // did it this way instead of pcData instanceof Hero to avoid a circular dependency with CharacterXL -> CharacterServer -> Hero -> ... -> CharacterXL
                if (pcData.getTeam() === Teams.FindFirstChild('Heroes')) {
                    if ((pcData.getActualLevel() + BalanceData.effective0LevelStrength) / (myLevel! + BalanceData.effective0LevelStrength) >= 11 / 7) {
                        dangerZone = true  // an early out would be nice but hard with the forEach
                    }
                }
            })
        }
        return dangerZone
    }

    export function giveAuraOfCourage(character: Character, damageReduction: number) {
        DebugXL.logI('Gameplay', `Giving ${character.Name} aura of courage`)
        let duration = math.huge
        let effectUntil = time() + duration
        InstanceXL.CreateSingleton('Vector3Value',
            { Name: 'AuraOfCourage', Value: new Vector3(damageReduction, effectUntil, 0), Parent: character })
    }

    export function setLastAttackingPlayer(target: Character, attackingPlayer: Player | undefined) {
        DebugXL.Assert(target.IsA("Model"))
        const targetHumanoid = target.FindFirstChild<Humanoid>("Humanoid")
        if (targetHumanoid) {
            InstanceXL.CreateSingleton("ObjectValue", { Name: "creator", Parent: targetHumanoid, Value: attackingPlayer })
        }
    }

    export function setLastAttacker(target: Character, attacker: Character) {
        DebugXL.Assert(target.IsA("Model"))
        DebugXL.Assert(attacker.IsA("Model"))
        const targetHumanoid = target.FindFirstChild<Humanoid>("Humanoid")
        if (targetHumanoid) {
            InstanceXL.CreateSingleton("ObjectValue", { Name: "LastAttacker", Parent: targetHumanoid, Value: attacker })
            const attackingPlayer = Players.GetPlayerFromCharacter(attacker)
            CharacterServer.setLastAttackingPlayer(target, attackingPlayer)
        }
    }

    export function checkAuraOfCourage(character: Character) {
        character.GetChildren().forEach((child) => {
            if (child.Name === 'AuraOfCourage') {
                let vectorValue = child as Vector3Value
                let player = Players.GetPlayerFromCharacter(character)
                DebugXL.Assert(player !== undefined)
                if (player) {
                    if (time() > vectorValue.Value.Y || !CharacterServer.IsDangerZoneForHero(PlayerServer.getPlayerCharacterRecords(), player)) {
                        print('Dismissing aura of courage')
                        child.Parent = undefined
                    }
                }
            }
        })
    }

    RunService.Heartbeat.Connect(() => {
        Players.GetPlayers().forEach((player) => {
            if (player.Character)
                if (player.Character.Parent === Workspace)
                    checkAuraOfCourage(player.Character)
        })
    })
}