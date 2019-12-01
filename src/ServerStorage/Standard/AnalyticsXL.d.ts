interface AnalyticsXL 
{
    ReportEvent( player: Player, name: string, category: string, label: string, integer: number, includeDevsB?: boolean ): void

    ReportHistogram( player: Player, name: string, variableN: number, binSize: number, binLabel: string, note: string ): void
}

declare let analyticsXL: AnalyticsXL

export = analyticsXL
