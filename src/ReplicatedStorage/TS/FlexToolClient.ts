
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL } from 'ReplicatedStorage/TS/DebugXLTS'
DebugXL.logI( 'Executed', script.GetFullName())

import { LocalizationService } from "@rbxts/services"

import { Enhancements } from "./EnhancementsTS"
DebugXL.logD('Requires', script.Name+": Enhancements required" )
import { PCClient } from "ReplicatedStorage/TS/PCClient"
DebugXL.logD('Requires', script.Name+ ": PCClient required" )
import { FlexTool } from "ReplicatedStorage/TS/FlexToolTS";
DebugXL.logD('Requires', script.Name+": FlexTool required" )
import { ToolData } from "ReplicatedStorage/TS/ToolDataTS"
DebugXL.logD('Requires', script.Name+": ToolData required" )

import { SkinTypeEnum } from "ReplicatedStorage/TS/SkinTypes"
DebugXL.logD('Requires', script.Name+": SkinTypeEnum required" )
import { Localize } from "ReplicatedStorage/TS/Localize"
DebugXL.logD('Requires', script.Name+": Localize required" )

import * as FlexEquipUtility from "ReplicatedStorage/Standard/FlexEquipUtility"
import { AnalyticsClient } from "./AnalyticsClient";

export namespace FlexToolClient
{
    export function getFlexTool( tool: Tool )
    {        
        let possessionKeyValObj = tool.WaitForChild("PossessionKey",1) as StringValue
        DebugXL.Assert( possessionKeyValObj !== undefined )
        if( possessionKeyValObj )
        {
            let possessionKey = possessionKeyValObj.Value          
            DebugXL.Assert( PCClient.pc !== undefined )  
            if( !PCClient.pc ) {
                return FlexTool.nullTool
            }

            let flexTool = PCClient.pc.getFlexTool( possessionKey )
            DebugXL.Assert( flexTool !== undefined )
            if( !flexTool )
            {
                let errStr = "Couldn't find flextool "+possessionKey+"\n"
                errStr += DebugXL.DumpToStr( PCClient.pc )
                DebugXL.Error( errStr )
            }
            else
            {
                return flexTool
            }
        }
        return FlexTool.nullTool
    }

    
    function getLocKey( flexTool: FlexTool )
    {
        DebugXL.Assert( flexTool.levelN >= 1 )
        let baseData = ToolData.dataT[ flexTool.baseDataS ]
        // if( false )  // activeSkinsT[ baseData.skinType ] )  // just using to reskin image now
        //     return PossessionData.dataT[ activeSkinsT[ baseData.skinType ] ].readableNameS
        let keyName = ""
        // else
        // {
        if( baseData.namePerLevel )
        {            
            for(let i=0; i<= flexTool.levelN; i++ )  //I don't know how high levels are going to get. What if they 
            {
                if( baseData.namePerLevel[i] )
                    keyName = baseData.namePerLevel[i]
            }
        }
        else
        {
            keyName = baseData.readableNameS
        }
        if( keyName==="" )
        {
            let errStr = "No loc key for:\n"
            let dumped = DebugXL.DumpToStr( baseData )
            DebugXL.Error( errStr + dumped )
        }
        return keyName
    }

    export function getShortName( flexTool: FlexTool )
    {
        return Localize.formatByKey( getLocKey( flexTool ) )
        //}
    }

    // genderChar M or F, pluralChar S or P
    function getEnhancementAdjective( enhancement: Enhancements.EnhancementI, genderChar: string, pluralChar: string )  
    {
        let adjCode = genderChar + pluralChar
        return Localize.formatByKey( enhancement.flavorS + "Adjective" + adjCode + enhancement.levelN )
    }

    function getEnhancementNoun( enhancement: Enhancements.EnhancementI )
    {
        return Localize.formatByKey( enhancement.flavorS + "Noun" + enhancement.levelN )
    }

    function getGenderAndPlurality( flexTool: FlexTool )
    {
        let baseData = ToolData.dataT[ flexTool.baseDataS ]
        let locKey = getLocKey( flexTool )
        let genderChar = Localize.formatByKey( locKey + " Gender" )
        genderChar = genderChar.upper()
        if( genderChar !== 'M' && genderChar !== 'F' && genderChar !== 'N' )
        {
            AnalyticsClient.ReportEvent("LocMissing", "GenderInvalid:"+locKey, LocalizationService.RobloxLocaleId )
            genderChar = 'M'
        }
        // wishlist fix - german has 3 genders including a neutral one (N) so we're ignoring for now; to fix, return N and
        // add N gendered items to all the adjective lists
        genderChar = genderChar==='N' ? 'M' : genderChar
        let pluralChar = baseData.namePlural ? 'P' : 'S'
        return [ genderChar, pluralChar ]
    }

    export function getReadableName( flexTool: FlexTool )
    {
        let baseData = ToolData.dataT[ flexTool.baseDataS ]
        let baseNameS = FlexToolClient.getShortName( flexTool )
        let [ genderChar, pluralChar ] = getGenderAndPlurality( flexTool )

        if(  baseData.equipType !== "potion" )
        {        
            let descriptor = ["","","","",""]

            for( let i=0; i<flexTool.enhancementsA.size() ; i++ )
            {
                let enhancement = flexTool.enhancementsA[ i ]
                let enhancementFlavorDatum = Enhancements.enhancementFlavorInfos[ enhancement.flavorS ] // enhancement.flavorS ]
                let level = enhancement.levelN - 1
                if( i%2 === 0 || !enhancementFlavorDatum.suffixes[ level ] )
                    descriptor[ i ] = getEnhancementAdjective( enhancement, genderChar, pluralChar )
                else
                    descriptor[ i ] = getEnhancementNoun( enhancement )
            }
            
            let suffixS = ""
            if( flexTool.enhancementsA.size() >= 4 )
                suffixS = Localize.formatByKey( "ToolSuffixFormat2", { noun1 : descriptor[1], noun2 : descriptor[3] } )
            else if( flexTool.enhancementsA.size() >= 2 )
                suffixS = Localize.formatByKey( "ToolSuffixFormat1", { noun1 : descriptor[1] } )
            
            baseNameS = Localize.formatByKey( "ToolNameFormat", { tooltype: baseNameS, level: flexTool.levelN, adjective1: descriptor[0], adjective2: descriptor[2], suffix: suffixS } ) 
            baseNameS = Localize.squish( baseNameS )
            baseNameS = Localize.trim( baseNameS )
        }
        return baseNameS
    }

    // wishlist: show nerfing for your items
    export function getDescription( flexToolInst: FlexTool )
    {
        let baseData = ToolData.dataT[ flexToolInst.baseDataS ]
        let descriptionS = baseData.equipType ? Localize.formatByKey( "EquipType" + baseData.equipType ) + ", " : ""
        if( baseData.skinType !== SkinTypeEnum.Unskinnable ) {
            descriptionS = descriptionS + Localize.formatByKey( "SkinType" + baseData.skinType ) + "\n"
        } 
        if( baseData.damageNs ) {
            let [ damageN1, damageN2 ] = FlexEquipUtility.GetDamageNs( flexToolInst, 1, 1 )
            descriptionS = descriptionS + Localize.formatByKey( "ToolInfoBaseDamage", [ damageN1, damageN2 ] ) + "\n"
        }
        if( baseData.cooldownN && baseData.cooldownN > 0 ) {
            descriptionS = descriptionS + Localize.formatByKey( "ToolInfoCooldown", [ baseData.cooldownN ] ) + "\n"
        }	
        if( baseData.walkSpeedMulN !== 1 ) {
            descriptionS = descriptionS + Localize.formatByKey( baseData.useTypeS !== "worn" ? "ToolInfoWalkSpeedCooldown" : "ToolInfoWalkSpeed", [ baseData.walkSpeedMulN * 100 ] ) + "\n"
        }
        if( baseData.jumpPowerMulN ) {
            if( baseData.jumpPowerMulN === 0 ) {
                descriptionS = descriptionS + Localize.formatByKey( "ToolInfoCantJump" ) + "\n"
            }
            else if( baseData.jumpPowerMulN !== 1 ) {
                descriptionS = descriptionS + Localize.formatByKey( "ToolInfoJumpPower", [ baseData.jumpPowerMulN * 100 ] ) + "\n"
            }
        }
        if( baseData.descriptionArgs ) {
            // extra line feeds here to set off most important bit
            descriptionS = descriptionS + "\n" + Localize.formatByKey( baseData.idS + "Description", baseData.descriptionArgs( baseData, flexToolInst.levelN ) )+ "\n\n"
        }
        if( baseData.rangeN && baseData.rangeN > 0 ) {
            descriptionS = descriptionS + Localize.formatByKey( "ToolInfoRange" , [ baseData.rangeN ] ) + "\n"
        }		
        if( FlexEquipUtility.GetManaCost( flexToolInst ) > 0 ) {
            descriptionS = descriptionS + Localize.formatByKey( "ToolInfoManaCost", [ FlexEquipUtility.GetManaCost( flexToolInst ) ] ) + "\n"
        }
        for( let i = 0; i < flexToolInst.enhancementsA.size(); i++ )
        {
            let enhancement = flexToolInst.enhancementsA[ i ]
            let enhanceInfo = Enhancements.enhancementFlavorInfos[ enhancement.flavorS ]
            let enhanceLvl = flexToolInst.getEnhanceLocalLevel( i )//, heroActualLevel, currentMaxHeroLevel )   // -1 because typescript treats arr as 0 based
            let effect = 0
            if( enhanceInfo.damageMulFunc ) {
                effect = enhanceInfo.damageMulFunc( enhanceLvl ) * 100
            }
            else if( enhanceInfo.effectFunc ) {
                // oh so hack; effectFunc is used for both mathy and non-mathy, so stat buffs return 1-4 and % returns 0-1 which we need to mul
                if( enhanceInfo.typeS === "stat" )
                    effect = enhanceInfo.effectFunc( enhancement.levelN ) 
                else
                    effect = enhanceInfo.effectFunc( enhancement.levelN ) * 100
            }
            
            descriptionS = descriptionS + Localize.formatByKey( enhancement.flavorS + "Description", 
                { duration: enhanceInfo.durationFunc( enhanceLvl ), amount: effect } ) + "\n"
        }
        return descriptionS
    }
}