import { DebugXL } from "./DebugXLTS";

import * as MathXL from "ReplicatedStorage/Standard/MathXL"

export class Randomisher
{
    cards = new Array<number>()

    // creates a deck of cards numbered 0 to range-1
    constructor( public range: number )
    {
        DebugXL.Assert( range === math.ceil( range ) )
        this.buildDeck()
    }

    buildDeck()
    {
        for( let i=0; i<this.range; i++ ) this.cards[i] = i 
        this.cards = MathXL.ShuffleArray( this.cards )
    }

    nextInt()
    {
        let nextCard = this.cards.shift()!
        if( this.cards.size() === 0 )
        {
            this.buildDeck()
        }
        return nextCard
    }

    next0to1()
    {
        return ( this.nextInt() + 0.5 ) / this.range
    }
}