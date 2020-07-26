import { Workspace, MarketplaceService } from "@rbxts/services"

import * as AnalyticsXL from "ServerStorage/Standard/AnalyticsXL" 
import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"

import { DataStoreXL } from "./DataStoreXLTS"
import { GameplayTestService } from "./GameplayTestService"
import { MessageServer } from "./MessageServer"

import { GameplayTestUtility } from "ReplicatedStorage/TS/GameplayTestUtility"
import { InventoryI, ReviewEnum } from "ReplicatedStorage/TS/InventoryI"
import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS"
import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility";
import { CharacterClasses } from "ReplicatedStorage/TS/CharacterClasses";
import { Hero } from "ReplicatedStorage/TS/HeroTS";

let codeStore = new DataStoreXL( "CodeWarehouse" )

interface CodeInfoI
{
    name: string
    unlimited: boolean
    numAvailable: number
    rewards: { item: string, count: number }[]
}

interface RedeemersI 
{
    userIds: number[]
} 

let youtuberCode = 
{
    name: "Promotional Code",
    unlimited: false,
    numAvailable: 1,
    rewards: [{ item: "Rubies", count: 2000}, { item: "Boost", count: 7200 }]
}

let compensationCode =
{
    name: "Compensation Code",
    unlimited: false,
    numAvailable: 1,
    rewards: [{ item: "Rubies", count: 800 }, { item: "Boost", count: 3600 }]
}

let rubiesCode =
{
    name: "Rubies Code",
    unlimited: true,
    numAvailable: 0,
    rewards: [{ item: "Rubies", count: 400 }]
}

let blueprintsCode =
{
    name: "Blueprints Code",
    unlimited: false,
    numAvailable: 5,
    rewards: [
        { item: "Rubies", count: 2000 },
        { item: "Boost", count: 7200 },
		{ item: "SpawnCyclops", count: 1 },
		{ item: "SpawnDragon", count: 1 },
		{ item: "SpawnDaemon", count: 1 },
		{ item: "SpawnGhost", count: 1 },
		{ item: "SpawnOrc", count: 1 },
		{ item: "SpawnGremlin", count: 1 },
        { item: "SpawnSasquatch", count: 1 },
		{ item: "SpawnSkeleton", count: 1 },
		{ item: "SpawnWerewolf", count: 1 },
		{ item: "SpawnZombie", count: 1 },
		{ item: "Fence", count: 1 },
        { item: "Gate", count: 2 },
        { item: "Chest", count: 2 },
        { item: "TrappedChest", count: 1 },
        { item: "Altar", count: 1 },
        { item: "WoodChair", count: 4 },    
    	{ item: "Statue", count: 1 },
        { item: "Pedestal", count: 1 },
		{ item: "GargoyleFountain", count: 1 },
		{ item: "Brazier", count: 8 },
		{ item: "PitTrap", count: 1 } ]
}

let codeInfos: { [k:string]: CodeInfoI } =
{
    drawoutput: youtuberCode,  // bigbst4tz2
    lungincapable: youtuberCode, // chloe games
    foodobservation: youtuberCode, // cookieswirlc & gamingwithjen, whoops
    meowsalot: youtuberCode, //denisdaily
    midnightpure: youtuberCode, // gratedfamilygaming
    rarestructure: youtuberCode, // itsfunneh
    awfulhero: youtuberCode, // jesse tc
    shortagedoll: youtuberCode, // nathorix
    divetemple: youtuberCode, // nicsterv
    economyriot: youtuberCode, // productivemrduck
    worrytwitch: youtuberCode, // znac
    absencedollar: youtuberCode, // js films 
    stingsolid: youtuberCode, // musworld
    familiarglass: youtuberCode, 
    fraser: youtuberCode,
    
    kavra: blueprintsCode,

    caple222: compensationCode,

    disco: rubiesCode,
    
    xxdeathpwnagexx: { name: "xxdeathpwnagexx", unlimited: false, numAvailable: 1, rewards: [{ item: "Boost", count: 600000 }] },
    
    daggy: { name: "daggy", unlimited: true, numAvailable: 0, rewards: [{ item: "DaggersDualClean", count: 1 }]},

    brasilgood123: { name: "brasilgood123", unlimited: false, numAvailable: 1, rewards: [{ item: "Boost", count: 360000 }]},
    kakaki33: { name: "kakaki33", unlimited: false, numAvailable: 1, rewards: [{ item: "Boost", count: 360000 }]},

    // old codes
    // happion: launchCode,
    // launch: launchCode,
    // free: launchCode,
    // beta: launchCode,
    // boost: launchCode,
    // feature: launchCode,

}

export namespace InventoryServer
{
    export function awardAlphaMail( myInventory: InventoryI, player: Player )
    {
        let alphaRankedB = false
        let alphaMailNotFoundB = false
        if( player.Parent )
        {
            if( PlayerUtility.getRank( player ) >= 128 )
            {
                alphaRankedB = true
                warn( player.Name +" is alpha ranked" )		
                if( !myInventory.itemsT.LightAlphaMailTorso )
                {
                    alphaMailNotFoundB = true
                    warn( player.Name+" does not yet have alpha mail. Awarding." )		
                    let inventoryRE = Workspace.FindFirstChild('Signals')!.FindFirstChild('InventoryRE') as RemoteEvent
                    inventoryRE.FireClient( player, "Award", "LightAlphaMailTorso", "AlphaReward" )	
                    myInventory.itemsT.LightAlphaMailTorso = 1
                }
            }
            // AnalyticsXL.ReportEvent( player, 
            //     "Alpha Mail Check", 
            //     player.Name+" alphaRank: "+tostring(alphaRankedB)+"; mailNotFound: "+tostring(alphaMailNotFoundB), 
            //     "", 
            //     myInventory.itemsT.LightAlphaMailTorso ? myInventory.itemsT.LightAlphaMailTorso : 0, true )
        }
    }

    export function update( player: Player, myInventory: InventoryI )
    {
        // choose test groups
        GameplayTestService.playerAdded( player, myInventory )

        if( !myInventory.settingsT )
        {
            myInventory.settingsT = { monstersT: {} } 
            // if( GameplayTestUtility.getTestGroup( myInventory, 'FreeGearSlots' ) === 1 )
            // {
            //     myInventory.itemsT.GearSlots = 30
            // }
        }
        let monsters = PossessionData.dataA.filter( ( pd )=> pd.flavor === PossessionData.FlavorEnum.Monster )
        monsters.forEach( function( monster )
        {
            if( !myInventory.settingsT.monstersT[ monster.idS ] )            
                myInventory.settingsT.monstersT[ monster.idS ] = { hideAccessoriesB: monster.defaultHideAccessoriesB }
        } )
    }

    export function setMonsterSetting( player: Player, myInventory: InventoryI, monsterIdS: string, setting: string, value: boolean )  // maybe we'll expand the value type later
    {
        if( !myInventory.settingsT.monstersT[ monsterIdS ])
        {
            AnalyticsXL.ReportEvent( player, "Invalid settings change", tostring(player.UserId), player.Name, 1, false )            
        }
        else
        {
            if( myInventory.settingsT.monstersT[ monsterIdS ][ setting ]===undefined )
            {
                AnalyticsXL.ReportEvent( player, "Invalid settings change", tostring(player.UserId), player.Name, 1, false )     
            }
            else
            {
                myInventory.settingsT.monstersT[ monsterIdS ][ setting ] = value
            }       
        }
    }

    export function submitCode( myInventory: InventoryI, player: Player, codeS: string )
    {
        let codeLwrS = codeS.lower()
        let codeInfo = codeInfos[ codeLwrS ]
        if( !codeInfo )
        {
            MessageServer.PostMessageByKey( player, "IncorrectCode", true, 0, true )
            return
        }
        if( codeInfo.unlimited )
        {
            return redeemCode( codeInfo, myInventory, player )
        }
        else
        {
            let redeemedRaw = codeStore.GetAsync( codeLwrS )
            let redeemed = redeemedRaw ? ( redeemedRaw as RedeemersI ) : { userIds: [] }
            if( redeemed.userIds.size() < codeInfo.numAvailable )
            {
                // code available
                redeemCode(codeInfo, myInventory, player);
                redeemed.userIds.push( player.UserId )  // possible it won't go through but not life and death
                codeStore.SetAsync( codeLwrS, redeemed )
                return true  /// need to save
            }
            else
            {
                MessageServer.PostMessageByKey( player, "UnavailableCode", true, 0, true )
            }
        }
    }

    function redeemCode(codeInfo: CodeInfoI, myInventory: InventoryI, player: Player) {        
        if( myInventory.redeemedCodesT[ codeInfo.name ] )
        {
            MessageServer.PostMessageByKey(player, "CodeAlreadyRedeemed", true, 0, true);
            return false
        }
        else
        {
            //let redeemedmsg = "Code redeemed! You now have: ";
            DebugXL.Assert(codeInfo.rewards.size() > 0);
            codeInfo.rewards.forEach(element => {
                let currentCount = myInventory.itemsT[element.item] || 0;
                myInventory.itemsT[element.item] = currentCount + element.count;
                myInventory.redeemedCodesT[codeInfo.name] = 1
               // redeemedmsg = redeemedmsg + myInventory.itemsT[element.item] + " " + element.item + ". ";
                if (PossessionData.dataT[element.item].publishValueB)
                    player.FindFirstChild<NumberValue>(element.item)!.Value = myInventory.itemsT[element.item];
            });
            if (codeInfo.rewards.size() === 1 && codeInfo.rewards[0].count === 1) {
                let inventoryRE = Workspace.FindFirstChild('Signals')!.FindFirstChild('InventoryRE') as RemoteEvent;
                inventoryRE.FireClient(player, "Award", codeInfo.rewards[0].item, "CodeRedeemed");
            }
            else {
                MessageServer.PostMessageByKey(player, "CodeRedeemed", true, 0, true);
            }
            return true
        }
    }

    export function changeReview( myInventory: InventoryI, review: ReviewEnum )
    {
        // well that was a lot of work for one line of code
        myInventory.review = review
    }

    export function postFeedback( myInventory: InventoryI, player: Player, feedback: string )
    {
        AnalyticsXL.ReportEvent( player, "Feedback", feedback, player.Name, myInventory.review, true )
    }

   
    
    /*
	local codeLwrS = codeS:lower()
--	-- jack: ad
--	-- pumpkin: discord
--	-- halloween: twitter
--	-- scary: group
--	-- eek: my roblox following
	if codeLwrS == "henry" or codeLwrS == "ninja" then
		local hadItemB = Inventory:EverHadItem( player, "BowDarkage" )
		if hadItemB == false then
			Inventory:AdjustCount( player, "BowDarkage", 1 )
			workspace.Signals.InventoryRE:FireClient( player, "Award", "BowDarkage", "History lesson: it's how Henry V won Agincourt. But without ninjas." )
			AnalyticsXL:ReportEvent( player, "Code", codeS, "", 1, true )	
		end	
	end
*/
}


