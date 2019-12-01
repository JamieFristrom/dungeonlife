import * as RetentionAnalyticsServer from "ServerStorage/Standard/RetentionAnalyticsServer"
import { Config } from "ReplicatedStorage/TS/Config"

RetentionAnalyticsServer.ServerInit( Config.gameAnalyticsGKey, Config.gameAnalyticsSKey )
