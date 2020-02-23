import { Players, DataStoreService, HttpService } from "@rbxts/services";

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"

import { PlayerServer } from "ServerStorage/TS/PlayerServer"

import * as AnalyticsXL from "ServerStorage/Standard/AnalyticsXL"
import * as CheatUtility from "ReplicatedStorage/TS/CheatUtility";
import * as Heroes from "ServerStorage/Standard/HeroesModule"
import * as Inventory from "ServerStorage/Standard/InventoryModule"

import * as CharacterI from "ServerStorage/Standard/CharacterI"


import { FlexTool, GearDefinition } from "ReplicatedStorage/TS/FlexToolTS";
import { GameplayTestUtility } from "ReplicatedStorage/TS/GameplayTestUtility"
import { ToolData } from "ReplicatedStorage/TS/ToolDataTS";
import { PlayerUtility } from "ReplicatedStorage/TS/PlayerUtility"

import { Analytics } from "./Analytics";
import { GameplayTestService } from "./GameplayTestService";
import { MessageServer } from "./MessageServer";

class AdminCommandsC
{
  banListStore = DataStoreService.GetOrderedDataStore( "BanList" )

  luaCommandHandlerFunc: ( player: Player, args: string[])=>void = function() { warn("Lua Command Handler Not Set")}

  setLuaCommandHandler( newFunc: ( player: Player, args: string[])=>void ) 
  {
    this.luaCommandHandlerFunc = newFunc
  }



  
  isBanned( player: Player )
  {
    let banListStore = this.banListStore
    let banEntry = undefined
    let [ result, err ] = pcall( function()
    {
      banEntry = banListStore.GetAsync( tostring( player.UserId ) )
    } )
    if( !result )
    {
      AnalyticsXL.ReportEvent( player, "PlaceId-"+game.PlaceId, "isBanned GetAsync fail: "+err, "", 1, true )
    }
    return banEntry !== undefined
  }
}

export let AdminCommands = new AdminCommandsC()
  
let CommandList: {[k:string]:unknown} =
{
    print: function( sender: Player, args: string[] ) { print( args ) },

    ban: function( sender: Player, args: string[] ) 
    {
      // takes user id
      DebugXL.Assert( args[0]==="ban" )
      let bannedPlayerId = args[1]  // not 0, that's the function name redundant, should be ban
      AdminCommands.banListStore.SetAsync( bannedPlayerId, tonumber(bannedPlayerId) )
      warn( bannedPlayerId + " banned" )
      AnalyticsXL.ReportEvent( sender, "Ban", bannedPlayerId, sender.Name, 0, true )
    },

    kick: function( sender: Player, args: string[] )
    {
      DebugXL.Assert( args[0]==="kick" )
      let kickedPlayer = Players.GetPlayers().find( (p)=> p.Name === args[1] )
      if( kickedPlayer )
      {
        kickedPlayer.Kick()
        warn( kickedPlayer.Name + " kicked" )
        AnalyticsXL.ReportEvent( sender, "Kick", kickedPlayer.Name, sender.Name, 0, true )
      }
    },

    gold: function( sender: Player, args: string[] )
    {
      if( CheatUtility.PlayerWhitelisted( sender ) )
      {
        DebugXL.Assert( args[0]==="gold" )
        Heroes.AdjustGold( sender, tonumber(args[1])!, "Cheat", "Cheat" )
      }
    },

    get: function( sender: Player, args: string[] )
    {
      if( CheatUtility.PlayerWhitelisted( sender ) )
      {
        DebugXL.Assert( args[0]==="get" )
        Inventory.AdjustCount( sender, args[1], 1, "Cheat", "Cheat" )
      }
    },

    // for cut and paste -
    // !equip {"baseDataS":"DaggersDual","levelN":1}
    // !equip {"baseDataS":"DaggersDual","levelN":1}
    // !equip {"baseDataS":"Shortsword","levelN":1,"enhancementsA":[{"flavorS":"cold","levelN":2}]}
    // !equip {"baseDataS":"Shortsword","levelN":1,"enhancementsA":[{"flavorS":"fire","levelN":2}]}
    // !equip {"baseDataS":"Shortsword","levelN":1,"enhancementsA":[{"flavorS":"explosive","levelN":2}]}
    // !equip {"baseDataS":"MagicHealing","levelN":2}
    // !equip {"baseDataS":"Bomb","levelN":2}
    // !equip {"baseDataS":"Longbow","levelN":1}
    equip: function( sender: Player, args: string[] )
    {
      if( CheatUtility.PlayerWhitelisted( sender ) )
      {
        print( "Equipping " + sender.Name + " with " + args[1] )
        DebugXL.Assert( args[0]==="equip")
        let myPC = CharacterI.GetPCDataWait( sender )      
        let gearDef = HttpService.JSONDecode( args[1] ) as GearDefinition 
        if( gearDef )
        {          
          if( !ToolData.dataT[ gearDef.baseDataS ] )
          {
            print( gearDef.baseDataS+" doesn't exist")
          }
          else
          {            
            let flexTool = new FlexTool(
              gearDef.baseDataS,
              gearDef.levelN ? gearDef.levelN : 1,
              gearDef.enhancementsA ? gearDef.enhancementsA : [] )
            myPC.giveTool( flexTool )
            PlayerServer.updateBackpack( sender, myPC )
          }
        }
        else
        {
          print( "Unable to decode" )
        }
      }
    },

    getTestGroups: function( sender: Player, args: string[] ) {
      let inventory = Inventory.GetWait( sender )
      let testGroups = GameplayTestUtility.getTestGroups( inventory )
      if( testGroups ) {
        testGroups.forEach(element => {
          print( sender.Name + " is in test group " + element[0] + ":" + element[1] )
        });
      }
      let serverTestGroups = GameplayTestService.getServerTestGroups()!
      for( let [name,group] of serverTestGroups.entries() ) {
        print( "Server test group " + name + ":" + group )
      }
    },

    setTestGroup: function( sender: Player, args: string[] ) {
      let inventory = Inventory.GetWait( sender )
      if( inventory.testGroups.has( args[1] ) )
      {
        let newGroupNum = tonumber( args[2] )
        newGroupNum = newGroupNum ? newGroupNum: 1
        inventory.testGroups.set( args[1], newGroupNum )
      }
      else
      {
        warn( "Test group "+args[1]+" doesn't exist for player")
      }
    },

    setServerTestGroup: function( sender: Player, args: string[] ) {
      let newGroupNum = tonumber( args[2] )
      newGroupNum = newGroupNum ? newGroupNum: 1
      GameplayTestService.setServerTestGroup( args[1], newGroupNum )
    },

    hurt: function( sender: Player, args: string[] )
    {
      if( CheatUtility.PlayerWhitelisted( sender ) )
      {
        let humanoid = sender.Character!.FindFirstChild('Humanoid') as Humanoid
        if( humanoid )
        {
          let amount = tonumber( args[1] ) 
          amount = amount ? amount : 10
          humanoid.Health = humanoid.Health - amount
        }
      }
    },
    
    kill: function( sender: Player, args: string[] )
    {
      if( CheatUtility.PlayerWhitelisted( sender ) )
      {
        let humanoid = sender.Character!.FindFirstChild('Humanoid') as Humanoid
        if( humanoid )
          humanoid.Health = 0
      }
    },
    
    potions: function( sender: Player, args: string[] )
    {
      if( CheatUtility.PlayerWhitelisted( sender ) )
      {
        let humanoid = sender.Character!.FindFirstChild('Humanoid') as Humanoid
        if( humanoid )
        {
          let healths = tonumber( args[1] ) 
          healths = healths ? healths : 1
          for( let i=0; i<healths; i++ ) {
            let potionInstance = new FlexTool( "Healing", 0, [] )
            Heroes.RecordTool( sender, potionInstance )
          }
          let manas = tonumber( args[2] )
          manas = manas ? manas : 0
          for( let i=0; i<manas; i++ ) {
            let potionInstance = new FlexTool( "Mana", 0, [] )
            Heroes.RecordTool( sender, potionInstance )
          }
        }
      }
    },

    stressanalytics: function( sender: Player, args: string[] )
    {
      let numFrames = tonumber(args[1]) || 1
      let requestsPerFrame = tonumber(args[2]) || 1
      for( let i=0; i<numFrames; i++ )
      {
        print( "Stress testing http "+requestsPerFrame+" requests per frame. Frame "+i)
        for( let j=0; j<requestsPerFrame; j++ )
        {
          Analytics.ReportEvent( sender, "stresstest", "a", "b", i*requestsPerFrame+j )
        }
        wait(0.034)
      }
    },

    testmessage: function( sender: Player, args: string[] )
    {
      let messageKey = args[1]
      MessageServer.PostMessageByKey( sender, messageKey, true, 0.0001, true )
    },

    resetanalytics: function( sender: Player )
    {
      let analyticsDataStore = DataStoreService.GetDataStore( "Analytics" )  
      let [ success, err ] = pcall( ()=>{
        analyticsDataStore.RemoveAsync( "user_" + sender.UserId ) } )
      if( success )
        print( "Reset analytics" )
      else
        print( "Failure: "+err )
    }
}

function playerAdded( player: Player )
  {
    // kind of want this at a lower rank than full on cheats so I could deputize mods, but rn there's not enough
    // work for mods to do anyway, so I'll just use the cheat whitelist here for now
    if( CheatUtility.PlayerWhitelisted( player ))
    {
      player.Chatted.Connect( function( message:string, recipientI: Instance )
      {
        print("Chatted "+player.Name)
        let recipient = recipientI as Player
        if( !recipient )
        {
          if( message.sub( 0, 0 ) ==='!' )
          {
            let args = message.sub( 1 ).split(" ")
            // a roblox-ts bug/quirk where it was including a this/self parameter with the functions but not invoking with one led us here:
            let dispatchFunc = CommandList[args[0]] as (_: unknown, sender:Player, args:string[])=>void 
            if( dispatchFunc )
            {
              print("Admin command from "+player.Name+": "+args[0])
              dispatchFunc( undefined, player, args )
            }
            else
            {
              AdminCommands.luaCommandHandlerFunc( player, args )
            }
          }
        }
      })
    }

    spawn( function()
    {
      for(;;)
      {
        if( AdminCommands.isBanned( player ))
        {
          player.Kick("Cheating")
          return
        }
        wait(240)
      }
    } )
  }

Players.PlayerAdded.Connect( function( player: Player )
{
  playerAdded( player )
})

Players.GetPlayers().forEach( function( player )
{
  playerAdded( player )
})
