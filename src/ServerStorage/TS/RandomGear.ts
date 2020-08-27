import { Hero } from 'ReplicatedStorage/TS/HeroTS'
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'
import { ToolData } from 'ReplicatedStorage/TS/ToolDataTS'
import { Randomisher } from 'ReplicatedStorage/TS/Randomisher'

import * as MathXL from 'ReplicatedStorage/Standard/MathXL'

import * as FlexibleTools from 'ServerStorage/Standard/FlexibleToolsModule'
import { DebugXL, LogArea } from 'ReplicatedStorage/TS/DebugXLTS'

export namespace RandomGear {
    // these things do random-ish-ing for different players
    const playerLootLevelRandomishers = new Map<Player, Randomisher>()

    export function ChooseRandomGearForPlayer(
        minLevel: number,
        maxLevel: number,
        player: Player,
        hero: Hero,
        useBoost: boolean,
        alreadyBoosted: boolean): FlexTool | undefined {
        minLevel = math.max(1, minLevel)
        maxLevel = math.max(1, maxLevel)
        let randomisher = playerLootLevelRandomishers.get(player)
        if (!randomisher) {
            randomisher = new Randomisher(10)
            playerLootLevelRandomishers.set(player, randomisher)
        }

        const boundedMinLevel = math.max(1, minLevel)
        // from the loot drop math spreadsheet - B$2 * 0.8 + ( rand()^2 * ( min( $A3, B$2*2.5 ) + 1 - ( B$2 * 0.75)))    
        let toolLevelN = boundedMinLevel + ((randomisher.next0to1() ** 2) * (maxLevel - boundedMinLevel))
        toolLevelN = MathXL.Round(toolLevelN)

        if (useBoost) {
            if (MathXL.RandomNumber() < 0.5) {
                toolLevelN++
                alreadyBoosted = true
            }
        }

        const dieRoll = MathXL.RandomNumber()
        // 45% armor, 45% weapon, 10% power    
        const useTypeS = (dieRoll < 0.45) ? 'worn' : (dieRoll < 0.9) ? 'held' : 'power'

        // choose a random required stat, weighting towards what you're good at
        const statWeights = new Map([
            ['strN', hero.statsT.strN],
            ['dexN', hero.statsT.dexN],
            ['willN', hero.statsT.willN],
            ['conN', hero.statsT.conN]
        ])
        const randomStat = MathXL.RandomBiasedKey(statWeights)

        const possibleGearDrops =
            ToolData.dataA.filter((gearItem) =>
                gearItem.equipType !== 'potion' &&
                gearItem.minLevelN <= toolLevelN &&
                gearItem.useTypeS === useTypeS &&
                gearItem.dropLikelihoodN > 0)

        if (possibleGearDrops.size() === 0) {
            // no valid options for that stat
            warn(`${player.Name}: no valid tool to drop of type ${useTypeS} and level <= ${toolLevelN}`)
            return undefined
        }

        // rather than choosing a stat first, we separate into separate piles so if there are empty piles we can ignore them
        const statRelatedPiles = new Map<ToolData.ToolDatumI[], number>()
        for (let stat of ['strN', 'dexN', 'willN', 'conN']) {
            const statRelatedPile = possibleGearDrops.filter((gearItem) => gearItem.statReqS ? gearItem.statReqS === stat : false)
            if (statRelatedPile.size() > 0)
                statRelatedPiles.set(statRelatedPile, hero.statsT[stat])
        }
        const noStatPile = possibleGearDrops.filter((gearItem) => gearItem.statReqS === undefined)
        if (noStatPile.size() > 0) {
            statRelatedPiles.set(noStatPile, 10)
        }

        // ok, theoretically impossible. If there was at least one item it must be in one of the piles
        DebugXL.Assert(statRelatedPiles.size() !== 0)

        const winningGearPile = MathXL.RandomBiasedKey(statRelatedPiles)
        const dropLikelihoods = winningGearPile.map((gearItem) => gearItem.dropLikelihoodN)
        const winningGearIndex = MathXL.RandomBiasedInteger1toN(dropLikelihoods)
        const gearDrop = winningGearPile[winningGearIndex - 1]

        const gearInstance = new FlexTool(gearDrop.idS, toolLevelN, [], undefined, undefined, alreadyBoosted)
        gearInstance.addRandomEnhancements(useBoost)
        return gearInstance
    }
}