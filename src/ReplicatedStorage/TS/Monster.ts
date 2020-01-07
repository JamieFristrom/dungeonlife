import { PC } from "./PCTS"
import { FlexToolI } from 'ReplicatedStorage/TS/FlexToolTS'
import { Teams } from "@rbxts/services";

export class Monster extends PC
{   
    constructor(
        id: string,
//        imageId: string,
//        walkSpeed: number,
//        jumpPower: number,        
        items: FlexToolI[],
        public monsterLevel: number )
        {
            super( id, items )
        }

    getLocalLevel() { return this.monsterLevel }
    getActualLevel() { return this.monsterLevel }
    getTeam()
    {
        return Teams.FindFirstChild<Team>('Monsters')!
    }
}

