interface LootModuleI
{
    ChestDrop(targetLevel: number, player: Player, worldPosV3: Vector3) : void
}

declare let LootModule: LootModuleI

export = LootModule
