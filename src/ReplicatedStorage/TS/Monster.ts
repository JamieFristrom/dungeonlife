import { PC } from "./PCTS"
import { FlexTool } from 'ReplicatedStorage/TS/FlexToolTS'
import { Teams } from "@rbxts/services";

export class Monster extends PC
{   
    constructor(
        id: string,
//        imageId: string,
//        walkSpeed: number,
//        jumpPower: number,        
        items: FlexTool[],
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

