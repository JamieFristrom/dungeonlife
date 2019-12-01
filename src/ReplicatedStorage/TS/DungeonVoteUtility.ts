
// tricky thing: here, 0 is dungeon0, 1 is dungeon1;  in lua, 0 is 1, 1 is 2
export namespace DungeonVoteUtility
{
    export function ProcessVotes( votes: Map< Player, number > )
    {
        let votesPerDungeon = [0,0]
        votes.forEach( ( value, player )=> { if( player.Parent ) votesPerDungeon[value]++ } )
        return votesPerDungeon
    }
}