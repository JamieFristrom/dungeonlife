//
// For my own development, the easiest thing when I have an update to publish is to publish one project to several places.
// The way I do that is to then have the places, which are identical at the rbxl level, get their differences from this
// file and configure themselves accordingly.
//
// It could use some reorganization but it's
import { DebugXL } from "./DebugXLTS";
import { Workspace } from "@rbxts/services";

import { Hero } from "ReplicatedStorage/TS/HeroTS"

export namespace PlacesManifest
{        
    export function isPublicGame()
    {
        return getCurrentGame().public
    }
    
    export class Place
    {
        public getPlaceId() { return PlacesManifest.isPublicGame() ? this.publicId : this.devId }

        constructor( 
            public name: string,
            public publicId: number,  
            public devId: number,
            public startingBuildPoints: number,
            public maxAllowedLevel: number,   // if you're higher level than this you're not even permitted in
            public maxGrowthLevel: number,    // this is as high as you're allowed to be while here
            public minAllowedLevel: number,
            public nextServer: string,
            public imageId: string,
            public preparationDuration: number ) 
            {
            }

        public visitable( highestPCLevel: number )
        {
            return highestPCLevel <= this.maxAllowedLevel && highestPCLevel >= this.minAllowedLevel
        }
    }


    export let places: { [k: string]: Place } = 
    {
        LowLevelServer: new Place( "Standard Server", 2184151436, 2585229865, 100, math.huge, Hero.globalHeroLevelCap, 1, "HighLevelServer", "rbxassetid://2838350454", 60 ), 
        HighLevelServer: new Place( "High Level Server", 2289580605, 2585286238, 100, math.huge, Hero.globalHeroLevelCap, Hero.globalHeroLevelCap/3, "LowLevelServer", "rbxassetid://2838350800", 60 ),  
        //BeginnerServer: new Place( "Beginner Server", 2627669639, 2625072009, 100, 4, 4, 1, "LowLevelServer",  "rbxassetid://2838350800", 40 ),
        //Underhaven: new Place( "Underhaven", 2843742449, 2800350457, 2000, math.huge, math.huge, 1, "", "rbxassetid://2838350072", 0 ),

        //DevPlace: new Place( "Dev Place", 2274637642, 0, math.huge, 8, 1, "HighLevelServer","rbxassetid://2838350454",30 ),
        //SoloPlace: new Place( "Solo place", 0, 2541832283, math.huge, 8, 1, "HighLevelServer",  "rbxassetid://2838350800", 30 ),
    }
    
    
    export interface GameI
    {
        public: boolean,
        groupId: number
    }

    export let games: { [k: string]: GameI } = 
    {
        ["762106378"]:
        {
            public: true,
            groupId: 4303655
        },
        ["906231840"]:
        {
            public: false,
            groupId: 4303655            
        },
        ["907382269"]:  // no-team-build dev area
        {
            public: false,
            groupId: 4303655            
        },
        ["925403798"]:  // dungeon life dev team
        {
            public: false,
            groupId: 4474768
        },
        [""]:
        {
            public: true,
            groupId: 0
        }
    }

    let currentPlace: Place
    let currentGame: GameI

    export function getCurrentPlace()
    {
        if( !currentPlace )
        {
            // PrivateServerId can only be checked on client, so we cache it
            if( ( Workspace.FindFirstChild('GameManagement')!.FindFirstChild('VIPServer') as BoolValue).Value === true )
            {
                currentPlace = places.HighLevelServer
            }
            else
            {
                for( let k of Object.keys( places ) )
                {
                    if( game.PlaceId === places[k].getPlaceId() )
                    {
                        currentPlace = places[k]
                        break
                    }
                }
                warn("Unknown place "+game.PlaceId+": is it in the manifest? Defaulting to low level server configuration.")
                currentPlace = places.LowLevelServer
            }
        }
        return currentPlace
    }

    export function getCurrentGame()
    {
        if( !currentGame )
        {
            let stringId = tostring( game.GameId ) 
            if( games[ stringId ])
            {
                currentGame = games[ stringId ]
            }
            else
            {
                warn("Unknown game "+game.GameId+": is it in the manifest? Defaulting to public groupless game")
                currentGame = games[""]
            }
        }
        return currentGame
    }
}

