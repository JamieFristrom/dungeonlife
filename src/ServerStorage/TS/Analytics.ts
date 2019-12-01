print(script.Name + " executed")

import { HttpService, ScriptContext, Players, Workspace, RunService } from '@rbxts/services';
import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS';
import { HttpXL } from 'ServerStorage/TS/HttpXL'

import { PlayerAnalyticInfoI } from 'ReplicatedStorage/TS/AnalyticTypes'


let serverUrl = 'http://73.140.153.63'

let analyticsRF = Workspace.FindFirstChild('Signals')!.FindFirstChild('AnalyticsRF') as RemoteFunction
let analyticsRE = Workspace.FindFirstChild('Signals')!.FindFirstChild('AnalyticsRE') as RemoteEvent

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
            let dumpstr = 'ReportServerEvent:\n' + DebugXL.DumpToStr(event)
            print(dumpstr)
        }
        else {
            HttpXL.spawnJSONRequest('analytics', 'POST', event)
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
            let dumpstr = 'ReportEvent:\n' + DebugXL.DumpToStr(event)
            print(dumpstr)
        }
        else {
            HttpXL.spawnJSONRequest('analytics', 'POST', event)
        }

        // spawn( ()=> {
        //     let [ success, err ] = pcall( ()=> {
        //         HttpService.RequestAsync({
        //             Url: serverUrl + '/analytics',
        //             Method: 'POST',
        //             Headers: {
        //                 ['Content-Type']: 'application/json',
        //             },
        //             Body: body
        //         })
        //     })
        //     if( !success )
        //         DebugXL.Error( "RequestAsync failed: " + player.UserId + " " + category + ": " + err )
        // })
    }

    export function getSessionKey(player: Player) {
        let playerInfo = playerAnalyticInfos.get(player)
        DebugXL.Assert(playerInfo !== undefined)
        return playerInfo ? playerInfo.sessionKey : ""
    }

    function removePlayerNameFromStack(stack: string) {
        let retstack = stack.gsub("Players%.[^.]+%.", "Players.<Player>.")
        return retstack
    }

    // leave Google doing this
    //     function setupScriptErrorTracking()
    //     {
    //         ScriptContext.Error.Connect( (message, stack)=>
    //         {
    //             let body = HttpService.JSONEncode(
    //             {
    //                 message: removePlayerNameFromStack(message) + " | " + 
    //                     removePlayerNameFromStack(stack),
    //                 placeId: game.PlaceId,
    //                 time: os.time()
    //             })

    //             spawn( ()=> {
    //                 HttpService.RequestAsync({
    //                     Url: serverUrl + '/errorlog',
    //                     Method: 'POST',
    //                     Headers: {
    //                         ['Content-Type']: 'application/json',
    //                     },
    //                     Body: body
    //                 })
    //             })
    //         })
    // // -- add tracking for clients
    // // -- helper.Parent = game.StarterGui
    // // -- -- add to any players that are already in game
    // // -- for i, c in ipairs(game.Players:GetChildren()) do
    // // -- 	helper:Clone().Parent = (c:WaitForChild("PlayerGui"))
    // // -- end
    // // end
    //     }

    //     setupScriptErrorTracking()
    function playerAdded(player: Player) {
        print("Invoking gatherPlayerInfo on analyticsRF")
        let playerAnalyticInfo = analyticsRF.InvokeClient(player, "gatherPlayerInfo") as PlayerAnalyticInfoI
        playerAnalyticInfo.playerKey = player.UserId
        playerAnalyticInfo.sessionKey = HttpService.GenerateGUID()
        playerAnalyticInfo.time = os.time()
        if (player.Parent)  // ignore if they leave before it's begun
        {
            playerAnalyticInfos.set(player, playerAnalyticInfo)
            print("playerAnalyticInfos set")
            HttpXL.spawnJSONRequest('analytics', 'POST', playerAnalyticInfo)
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
                    Workspace.FindFirstChild('GameManagement')!.FindFirstChild<StringValue>("GameState")!.Value,
                    team.Name,
                    sessionLength,
                    {
                        'numPlayers': Players.GetPlayers().size(),
                        'stateLength': Workspace.FindFirstChild('GameManagement')!.FindFirstChild<NumberValue>("GameStateTime")!.Value
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
        if (funcName === 'ReportEvent') {
            let category = args[1] as string
            let action = args[2] as string
            let label = args[3] as string
            let value = args[4] as number
            ReportEvent(player, category, action, label, value)
            print("Reported client event " + category + (value ? "(" + value + ")" : "(nil)"))
        }
    })
}