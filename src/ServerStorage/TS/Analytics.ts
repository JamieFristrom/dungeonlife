print(script.Name + " executed")

import { HttpService, ScriptContext, Players, Workspace, RunService } from "@rbxts/services";
import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
import { HttpXL } from "ServerStorage/TS/HttpXL"

import { PlayerAnalyticInfoI } from "ReplicatedStorage/TS/AnalyticTypes"

let analyticsRF = Workspace.FindFirstChild("Signals")!.FindFirstChild("AnalyticsRF") as RemoteFunction
let analyticsRE = Workspace.FindFirstChild("Signals")!.FindFirstChild("AnalyticsRE") as RemoteEvent

let myServerKey = HttpService.GenerateGUID()

export namespace Analytics {
    let playerAnalyticInfos = new Map<Player, PlayerAnalyticInfoI>()

    export function ReportServerEvent(category: string, action?: string, label?: string, value?: number, notes?: { [k: string]: (string | number) }) {
        let event: { [k: string]: number | string | undefined } = {
            serverKey: myServerKey,
            category: category,
            action: action ? action : "",
            label: label ? label : "",
            value: value,
            time: os.time()
        }
        if (notes) {
            for (let [k, v] of Object.entries(notes)) {
                event[k] = v
            }
        }
        if (RunService.IsStudio()) {
            let dumpstr = "ReportServerEvent:\n" + DebugXL.DumpToStr(event)
            print(dumpstr)
        }
        else {
            HttpXL.spawnJSONRequest("analytics", "POST", event)
        }
    }

    export function ReportEvent(player: Player, category: string, action?: string, label?: string, value?: number, notes?: { [k: string]: (string | number) }) {
        while (!playerAnalyticInfos.has(player)) {
            wait()
            if (!player.Parent) return  // lost some data there...
        }
        let playerInfo = playerAnalyticInfos.get(player)
        let event: { [k: string]: number | string | undefined } = {
            serverKey: myServerKey,
            playerKey: player.UserId,
            sessionKey: playerInfo!.sessionKey,
            category: category,
            action: action ? action : "",
            label: label ? label : "",
            value: value,
            time: os.time()
        }

        if (notes) {
            for (let [k, v] of Object.entries(notes)) {
                event[k] = v
            }
        }

        if (RunService.IsStudio() || player.UserId === 128450567) {
            let dumpstr = "ReportEvent:\n" + DebugXL.DumpToStr(event)
            DebugXL.logD(LogArea.Analytics, dumpstr)
        }
        else {
            HttpXL.spawnJSONRequest("analytics", "POST", event)
        }
    }

    export function getSessionKey(player: Player) {
        let playerInfo = playerAnalyticInfos.get(player)
        //        DebugXL.Assert(playerInfo !== undefined)  // messing up tests and I don"t really care
        return playerInfo ? playerInfo.sessionKey : ""
    }

    function removePlayerNameFromStack(stack: string) {
        let retstack = stack.gsub("Players%.[^.]+%.", "Players.<Player>.")
        return retstack
    }

    //     setupScriptErrorTracking()
    function playerAdded(player: Player) {
        print("Invoking gatherPlayerInfo on analyticsRF")
        let playerAnalyticInfo = analyticsRF.InvokeClient(player, "gatherPlayerInfo") as PlayerAnalyticInfoI
        playerAnalyticInfo.playerKey = player.UserId
        playerAnalyticInfo.sessionKey = HttpService.GenerateGUID()
        playerAnalyticInfo.time = os.time()
        if (player.Parent)  // ignore if they leave before it"s begun
        {
            playerAnalyticInfos.set(player, playerAnalyticInfo)
            print("playerAnalyticInfos set")
            HttpXL.spawnJSONRequest("analytics", "POST", playerAnalyticInfo)
        }
        else {
            ReportEvent(player, "PlayerBounce")
        }
    }

    function playerRemoving(player: Player) {
        let playerInfo = playerAnalyticInfos.get(player)
        //DebugXL.Assert( playerInfo !== undefined )  // possible to remove before added
        if (playerInfo) {
            let sessionLength = os.time() - playerInfo.time
            let team = player.Team
            DebugXL.Assert(team !== undefined)
            if (team) {
                Analytics.ReportEvent(player,
                    "SessionLength",
                    (Workspace.FindFirstChild("GameManagement")!.FindFirstChild("GameState") as StringValue|undefined)!.Value,
                    team.Name,
                    sessionLength,
                    {
                        "numPlayers": Players.GetPlayers().size(),
                        "stateLength": (Workspace.FindFirstChild("GameManagement")!.FindFirstChild("GameStateTime") as NumberValue|undefined)!.Value
                    })
            }
            playerAnalyticInfos.delete(player)
        }
    }

    Players.GetPlayers().forEach(playerAdded)
    Players.PlayerAdded.Connect(playerAdded)
    Players.PlayerRemoving.Connect(playerRemoving)

    analyticsRE.OnServerEvent.Connect((player: Player, ...args: unknown[]) => {
        let funcName = args[0] as string
        if (funcName === "ReportEvent") {
            let category = args[1] as string
            let action = args[2] as string
            let label = args[3] as string
            let value = args[4] as number
            ReportEvent(player, category, action, label, value)
            print("Reported client event " + category + (value ? "(" + value + ")" : "(nil)"))
        }
    })
}