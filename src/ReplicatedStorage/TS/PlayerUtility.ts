
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.GetFullName())

import { Teams } from "@rbxts/services";
import { PlacesManifest } from "./PlacesManifest";
import { InstanceUtility } from "./InstanceUtility";

export namespace PlayerUtility {
    //    return (((Character and Character.Parent and Humanoid and Humanoid.Parent and Humanoid.Health > 0 and Player and Player.Parent) and true) or false)

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

    export function publishClientValues(location: Player, buildPoints: number, heroRespawnCountdown: number, rank: string, vip: boolean) {
        let buildPointsObject = InstanceUtility.findOrCreateChild<NumberValue>(location, "BuildPoints", "NumberValue")
        buildPointsObject.Value = buildPoints

        let heroRespawnObject = InstanceUtility.findOrCreateChild<NumberValue>(location, "HeroRespawnCountdown", "NumberValue")
        heroRespawnObject.Value = heroRespawnCountdown

        let leaderstats = InstanceUtility.findOrCreateChild(location, "leaderstats", "Model")
        let rankObject = InstanceUtility.findOrCreateChild<StringValue>(leaderstats, "Rank", "StringValue")
        rankObject.Value = rank

        let vipObject = InstanceUtility.findOrCreateChild<StringValue>(leaderstats, "VIP", "StringValue")
        vipObject.Value = vip ? "VIP" : ""
    }
}