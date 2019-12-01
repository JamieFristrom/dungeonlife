import { Workspace, UserInputService, GuiService, LocalizationService, RunService } from "@rbxts/services";

// still using GameAnalytics for now for retention until I have a working replacement
import * as RetentionAnalyticsClient from "ReplicatedStorage/Standard/RetentionAnalyticsClient"
print("About to init RetentionAnalyticsClient")
RetentionAnalyticsClient.ClientInit()
print("RetentionAnalyticsClient initialized")

// let googleAnalyticsEvent = game.ReplicatedStorage.WaitForChild("ReportGoogleAnalyticsEvent") as RemoteEvent

// let resX = Workspace.CurrentCamera.ViewportSize.X
// let resY = Workspace.CurrentCamera.ViewportSize.Y

// googleAnalyticsEvent.FireServer( "Resolution", resX+"x"+resY, "", 1 )

import { PlayerAnalyticInfoI } from "ReplicatedStorage/TS/AnalyticTypes"

let analtyicsRE = Workspace.WaitForChild('Signals').WaitForChild('AnalyticsRE') as RemoteEvent
let analyticsRF = Workspace.WaitForChild('Signals').WaitForChild('AnalyticsRF') as RemoteFunction


function getPlatform()
{
    let platform = 
        ( UserInputService.TouchEnabled && ( UserInputService.GyroscopeEnabled || UserInputService.AccelerometerEnabled ) ) ? "mobile" :  // includes tablets
        ( GuiService.IsTenFootInterface() ) ? "console" : "pc"
    return platform
}


analyticsRF.OnClientInvoke = ( ...args: unknown[] )=>
{
    print("analyticsRF invoked on client")
    let funcName = args[0] as string
    let _resX = Workspace.CurrentCamera!.ViewportSize.X
    let _resY = Workspace.CurrentCamera!.ViewportSize.Y    
    if( funcName === "gatherPlayerInfo")
    {
        let playerInfo : PlayerAnalyticInfoI = 
        {
            // the server populates these:
            playerKey: 0,
            sessionKey: "",
            time: 0,
            category: "PlayerAdded",
            platform: getPlatform(), 
            resX: _resX,
            resY: _resY,
            locale: LocalizationService.RobloxLocaleId
        }
        return playerInfo
    }
}


// periodically report framerate
let lastFrame = tick()
let lastFramerateReport = tick()
let frameDurations: number[] = []
let frameCount = 0

RunService.RenderStepped.Connect( ()=>
{
    let thisFrame = tick()    
    frameDurations.push( thisFrame - lastFrame )
    lastFrame = thisFrame
    frameCount++
    if( tick() > lastFramerateReport + 120 )
    {
        let averageDuration = frameDurations.reduce( (a,b)=>a+b, 0 ) / frameDurations.size()
        analtyicsRE.FireServer( "ReportEvent", "FrameDuration", getPlatform(), "", averageDuration )
        frameDurations = []
        lastFramerateReport = tick()
    }
})