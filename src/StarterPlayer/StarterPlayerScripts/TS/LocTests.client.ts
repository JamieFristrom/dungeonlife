import { Players } from "@rbxts/services";

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { SkinTypes } from "ReplicatedStorage/TS/SkinTypes"
import { Enhancements } from "ReplicatedStorage/TS/EnhancementsTS"
import { Localize } from "ReplicatedStorage/TS/Localize"
import { ToolData } from "ReplicatedStorage/TS/ToolDataTS"

// import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

// let testKeys = [
//     { k: "IntroMessage" },
//     { k: "strN" },
//     { k: "dexN" },
//     { k: "willN" },
//     { k: "conN" },
//     { k: "DeepestFloor", args: [ 666 ] }
// ]

// DebugXL.Assert( Localize.trim( "  hoo")==="hoo" )
// DebugXL.Assert( Localize.trim( "  hoo  ")==="hoo" )
// DebugXL.Assert( Localize.trim( "hoo  ")==="hoo" )
// print( Localize.squish("  hoo  "))
// print( Localize.squish("and   nae  nae"))
// DebugXL.Assert( Localize.squish( "  hoo  ")===" hoo " )
// DebugXL.Assert( Localize.squish( "and   nae  nae")==="and nae nae" )

// warn( "Test translations")
// testKeys.forEach( function(key) 
// {
//     let newStr = ""
//     let [ status ] = pcall( function()
//     {
//         newStr = Localize.formatByKey( key.k, key.args )
//     })
//     if( !status )
//     {
//         DebugXL.Error("Failed to translate key " + key.k )
//     }
//     print( key.k + ": " + newStr )
// } )

// for( let k in SkinTypes )
// {
//     let v = SkinTypes[k]
//     print( k + "," + v.readableNameS )
// }
// // let baseNameS = Localize.formatByKey("ToolNameFormat", {
// //     tooltype : "toolType",
// //     level : 6,
// //     adjective1 : "adjectivey",
// //     adjective2 : "adverby",
// //     suffix : "of this and that"
// // });
// // print( baseNameS )

// // PossessionData.dataA.forEach( function( element )
// // {
// //     if( element.idS )
// //         print( element.idS+","+ Localize.getName( element ) )
// // } )


// // for( let k in Enhancements.enhancementFlavorInfos )
// // {
// //     let enhancement = Enhancements.enhancementFlavorInfos[k]
// //     enhancement.prefixes.forEach( ( word )=> print( word ) )
// //     enhancement.suffixes.forEach( ( word )=> print( word ) )
// // }

ToolData.dataA.forEach((baseData) => {
    // if( false )  // activeSkinsT[ baseData.skinType ] )  // just using to reskin image now
    //     return PossessionData.dataT[ activeSkinsT[ baseData.skinType ] ].readableNameS
    // else
    // {
    if (baseData.namePerLevel) {
        for (let i = 0; i < 10; i++) {
            let v = baseData.namePerLevel[i]
            if (v) {
                Localize.formatByKey(v)
                //                print( v + " Gender" )          
            }
        }
    }
    else {
        Localize.formatByKey(baseData.readableNameS)
        //        print( baseData.readableNameS + " Gender")
    }
})