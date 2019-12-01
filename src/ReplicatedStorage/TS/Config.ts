// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

// So first I tried Google Analytics.
// But didn't like how it didn't help with game stuff.
// So then I tried Game Analytics.
// But didn't like how I couldn't see my own data.
// So then I rolled my own thing; if you'd like me to share the source for my servers get in touch.
// In the meantime, I kept using Google Analytics for error tracking; and I kept using Game Analytics for engagement. So there is a bloody mess here.

export namespace Config
{
    export const telemetryEnabled = false
    export const gameAnalyticsEnabled = false
    export const errorTrackingEnabled = false

    export const telemetryServerURL = ''
    export const gameAnalyticsGKey =  ''
    export const gameAnalyticsSKey = ''
    export const googleAnalyticsUserId = ''
}