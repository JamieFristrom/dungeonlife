
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Teams, RunService } from "@rbxts/services";
import { PlacesManifest } from "./PlacesManifest";
import { InstanceUtility } from "./InstanceUtility";
import { CharacterRecordI } from "./CharacterRecord";
import { Hero } from "./HeroTS"
import { Monster } from "./Monster"


export namespace PlayerUtility {
    //    return (((Character and Character.Parent and Humanoid and Humanoid.Parent and Humanoid.Health > 0 and Player and Player.Parent) and true) or false)
    let heroTeam = (Teams.WaitForChild("Heroes") as Team)
    let monsterTeam = (Teams.WaitForChild("Monsters") as Team)

    export function getHeroTeam() {
        return heroTeam
    }

    export function getMonsterTeam() {
        return monsterTeam
    }

    export function getRank(player: Player) {
        let rank = 0
        let [success, msg] = pcall(function () { rank = player.GetRankInGroup(PlacesManifest.getCurrentGame().groupId) })
        if (!success)
            warn(msg)
        return rank
    }

    export function IsPlayersCharacterAlive(player: Player) {
        if (player.Parent)
            if (player.Team !== Teams.FindFirstChild('Unassigned'))
                if (player.Character)
                    if (player.Character.Parent)
                        if (player.Character.PrimaryPart) {
                            let humanoid = player.Character.FindFirstChild("Humanoid") as Humanoid
                            if (humanoid)
                                if (humanoid.Health > 0)
                                    return true
                        }
        return false
    }

    export function publishClientValues(player: Player, buildPoints: number, heroRespawnCountdown: number, rank: string, vip: boolean) {
        setBuildPoints(player, buildPoints)

        let heroRespawnObject = InstanceUtility.findOrCreateChild<NumberValue>(player, "HeroRespawnCountdown", "NumberValue")
        heroRespawnObject.Value = heroRespawnCountdown

        let leaderstats = InstanceUtility.findOrCreateChild(player, "leaderstats", "Model")
        let rankObject = InstanceUtility.findOrCreateChild<StringValue>(leaderstats, "Rank", "StringValue")
        rankObject.Value = rank

        let vipObject = InstanceUtility.findOrCreateChild<StringValue>(leaderstats, "VIP", "StringValue")
        vipObject.Value = vip ? "VIP" : ""
    }

    export function getBuildPoints(player: Player) {
        let buildPointsObject = InstanceUtility.findOrCreateChild<NumberValue>(player, "BuildPointsTotal", "NumberValue")
        return buildPointsObject.Value
    }

    export function setBuildPoints(player: Player, buildPoints: number) {
        DebugXL.Assert(RunService.IsServer())
        let buildPointsObject = InstanceUtility.findOrCreateChild<NumberValue>(player, "BuildPointsTotal", "NumberValue")
        buildPointsObject.Value = buildPoints
    }

    export function characterMatchesTeam(characterRecord: CharacterRecordI, team: Team | undefined) {
        if (team === heroTeam) {
            return characterRecord instanceof Hero
        }
        else if (team === monsterTeam) {
            return characterRecord instanceof Monster
        }
        else {
            return false
        }
    }
}