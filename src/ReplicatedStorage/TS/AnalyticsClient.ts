import { Workspace } from "@rbxts/services";

let analyticsRE = Workspace.WaitForChild('Signals').WaitForChild('AnalyticsRE') as RemoteEvent

export namespace AnalyticsClient
{
    export function ReportEvent( category: string, action: string, label: string, value?: number )
    {
        analyticsRE.FireServer( "ReportEvent", category, action, label, value )
    }
}