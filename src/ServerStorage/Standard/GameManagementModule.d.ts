declare class GameManagementClass
{
    MonitorPlayerbase(): void

    MarkPlayersCharacterForRespawn( player: Player, optionalRespawnPart?: BasePart ): void

    SetLevelReady( ready: boolean ): void
}

declare let GameManagement: GameManagementClass

export = GameManagement