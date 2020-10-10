//
// Server side functionality for destructible structures
//
import { CollectionService } from "@rbxts/services";

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"

import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { BlueprintUtility } from "ReplicatedStorage/TS/BlueprintUtility"
import { BalanceData } from "ReplicatedStorage/TS/BalanceDataTS"

import { LootServer } from "./LootServer";
import { HeroesManagerI } from "ServerStorage/Standard/HeroesManagerI";
import { ServerContext, ServerContextI } from "./ServerContext";

export namespace DestructibleServer {
	export function calibrateHealth(destructibleInstance: Model, averageHeroLocalLevel: number, numHeroes: number, dungeonDepth: number): void {
		const humanoid = (destructibleInstance.FindFirstChild('Humanoid') as Humanoid|undefined)
		DebugXL.Assert(humanoid !== undefined)
		if (humanoid) {
			const furnishingDatum = PossessionData.dataT[BlueprintUtility.getPossessionName(destructibleInstance)]
			let newMaxHealth = furnishingDatum.healthPerLevelN! * (averageHeroLocalLevel + BalanceData.effective0LevelStrength)
			newMaxHealth = newMaxHealth * (1 + BalanceData.dungeonFloorDifficultyK * dungeonDepth)
			// only the final trap door is balanced against everybody, because when there are more heroes there are usually more
			// monsters who could be throwing down a lot of barriers
			const structureHealthMultiplier = BalanceData.structureHealthMultiplier
			newMaxHealth = newMaxHealth * structureHealthMultiplier
			if (furnishingDatum.balanceAgainstNumHeroesB) {
				// I'm torn here. Often you get to the gate with only one hero left, so multiplying difficulty by number of heroes
				// straight up feels wrong. But is that really any different from in a single player game getting to the gate with only a 
				// certain amount of life left? So I think I'm going to straight up multiply.
				newMaxHealth = numHeroes * newMaxHealth
			}
			newMaxHealth = math.max(newMaxHealth, 1)
			humanoid.MaxHealth = newMaxHealth
			humanoid.Health = newMaxHealth
		}
	}

	export function calibrateAllDestructiblesHealth(averageHeroLocalLevel: number, numHeroes: number, dungeonDepth: number) {
		CollectionService.GetTagged('Destructible').forEach((destructible) => {
			DebugXL.Assert(destructible.IsA('Model'))
			if (destructible.IsA('Model')) {
				calibrateHealth(destructible, averageHeroLocalLevel, numHeroes, dungeonDepth)
			}
		})
	}

	// I'd rather have a test RNG with a fixed seed to test loot generation
	export function doDeathBookkeepingIfDestructible(context: ServerContextI, heroMgr: HeroesManagerI, structure: Model, attacker: Player, forceLootForTest: boolean) {
		DebugXL.Assert(context instanceof ServerContext)
		// can't verify heroMgr without requiring Heroes which would be a circular dependency
		DebugXL.Assert(structure.IsA("Model"))
		DebugXL.Assert(attacker.IsA("Player"))
		let structureNameObj = (structure.FindFirstChild("PossessionName") as StringValue|undefined)
		if (structureNameObj) {
			let structureRecord = PossessionData.dataT[structureNameObj.Value]
			DebugXL.Assert(structureRecord !== undefined)
			if (structureRecord) {
				if (structureRecord.lootOnDestroyPct) {
					LootServer.destructibleDrop(context, heroMgr, forceLootForTest ? 1.0 : structureRecord.lootOnDestroyPct, attacker)
				}
			}
		}
	}
}