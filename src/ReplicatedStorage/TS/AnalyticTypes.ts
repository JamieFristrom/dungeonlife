export interface BaseAnalyticInfoI
{
    category: string
    playerKey: number
    sessionKey: string
    time: number
}

export interface PlayerAnalyticInfoI extends BaseAnalyticInfoI
{
    category: "PlayerAdded"
    platform: string
    resX: number
    resY: number
    locale: string
}

export interface EventAnalyticInfoI extends BaseAnalyticInfoI
{
    action: string
    label: string
    value?: number
}