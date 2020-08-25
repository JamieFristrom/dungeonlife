
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { LogLevel, DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
DebugXL.logI(LogArea.Executed, script.Name)

import { CollectionService, Workspace } from "@rbxts/services"

import { CharacterKey } from "ReplicatedStorage/TS/CharacterRecord"
import { MonsterServer } from "./MonsterServer"
import { ServerContextI } from "./ServerContext"
import { Structure } from "ServerStorage/TS/Structure"
import { Monster } from "ReplicatedStorage/TS/Monster"
import { ToolCaches } from "./ToolCaches"

// wishlist - only works on players so can"t work on mobs if we one decide to be able to allow the players to place chests
const lootDropRE = Workspace.FindFirstChild<Folder>("Signals")!.FindFirstChild<RemoteEvent>("LootDropRE")!

let hotbarRE = Workspace.WaitForChild("Signals")!.WaitForChild("HotbarRE") as RemoteEvent

export class WeaponsRack extends Structure {
    // each monster can only open once
    private readonly serverContext: ServerContextI

    charactersWhoUsed = new Set<CharacterKey>()
    private clientAcknowledged = false

    use(player: Player) {
        const characterKey = this.serverContext.getPlayerTracker().getCharacterKeyFromPlayer(player)
        const characterRecord = this.serverContext.getPlayerTracker().getCharacterRecord(characterKey)
        if (characterRecord instanceof Monster && characterRecord.idS !== "DungeonLord") {
            if (!this.charactersWhoUsed.has(characterKey)) {
                this.charactersWhoUsed.add(characterKey)

                // weapon could be any physical weapon
                let weaponList = ["DaggersDual", "Crossbow", "Longbow", "Bomb", "Shortsword", "Broadsword", "Greatsword", "Staff", "Hatchet", "Axe", "Club", "Mace"]

                let newTool = MonsterServer.giveUniqueWeapon(this.serverContext.getPlayerTracker(), characterKey, weaponList)
                newTool.levelN = math.max(newTool.levelN, 2) // needs to be at least level 2 to have 1 enchantment
                const activeSkins = this.serverContext.getInventoryMgr().GetActiveSkinsWait(player)

                const badjuju = ["str", "dex", "con", "will", "radiant"]
                newTool.addRandomEnhancements(this.serverContext.getInventoryMgr().BoostActive(player), 1, badjuju)   // fun fact, having boost on gives you better weapons rack drops. that"s real pay to win right there
                ToolCaches.updateToolCache(this.serverContext.getPlayerTracker(), characterKey, characterRecord, activeSkins.monster)
                lootDropRE.FireClient(player, "item", newTool, activeSkins)  // shows travelling widget
                hotbarRE.FireClient(player, "Refresh", characterRecord)
            }
        }
    }

    hasClientAcknowledged() { return this.clientAcknowledged }

    constructor(serverContext: ServerContextI, public rackInstance: Model) {
        super(serverContext, rackInstance)
        this.serverContext = serverContext
        CollectionService.AddTag(rackInstance, "WeaponsRack")  // notifies client to spin up client-side object
        let clickRE = rackInstance.FindFirstChild("ClickRE") as RemoteEvent
        clickRE.OnServerEvent.Connect((player: Player, message) => {
            if (message === "use") {
                this.use(player)
            }
            else if (message === "ack") {
                DebugXL.logI(LogArea.Network, "weapons rack acknowledged by client")
                this.clientAcknowledged = true
            }
        })
    }
}