import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
import { Hero } from "ReplicatedStorage/TS/HeroTS";

declare namespace RandomGear
{
    export function ChooseRandomGearForPlayer( minLevel: number, 
        maxLevel: number,
        player: Player, 
        hero: Hero, 
        useBoost: boolean,
        alreadyBoosted: boolean ): FlexTool
}


export = RandomGear