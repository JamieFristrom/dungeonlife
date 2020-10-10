
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

declare class FurnishUtilityClass {
    CountFurnishings(furnishingName: string, player?: Player): [number, number] // total and then personal
}

declare let FurnishUtility: FurnishUtilityClass

export = FurnishUtility
