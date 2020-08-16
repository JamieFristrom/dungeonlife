
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { InventoryManagerI } from "ServerStorage/TS/InventoryManagerI"
import { CharacterRecordI } from "ReplicatedStorage/TS/CharacterRecord"
import { SkinTypeEnum } from "ReplicatedStorage/TS/SkinTypes"

import { Teams } from "@rbxts/services"

export namespace SkinUtility {
	export function getCurrentSkinset( inventoryMgr: InventoryManagerI, player: Player, characterRecord: CharacterRecordI) {
		let allActiveSkins = player ? 
			inventoryMgr.GetActiveSkinsWait(player) : 
			{ monster: new Map<SkinTypeEnum,string>(), hero: new Map<SkinTypeEnum,string>() }
		let activeSkins = characterRecord.getTeam() === Teams.FindFirstChild("Heroes") ? allActiveSkins.hero : allActiveSkins.monster
		return activeSkins
	}
}

