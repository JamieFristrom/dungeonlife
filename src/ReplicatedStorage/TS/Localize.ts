import { Players, RunService, LocalizationService } from "@rbxts/services";

import { DebugXL } from "./DebugXLTS";
print( "Localize: DebugXLTS required")
import * as PossessionData from "ReplicatedStorage/Standard/PossessionDataStd"
print( "Localize: PossessionData required")

import { AnalyticsClient } from "ReplicatedStorage/TS/AnalyticsClient"
print( "Localize: Analytics required")

export namespace DeveloperProducts 
{
    export enum FlavorEnum 
    {
        Rubies       = "Rubies",
        Gold         = "Gold",
        Boost        = "Boost",
        HeroExpress  = "HeroExpress",
        Expansions   = "Expansions",
        Specials     = "Specials"
    }
}

export interface DeveloperProductI
{
    Name: string
    inventoryKeyS: string
    amountN: number
    infoType: Enum.InfoType
    flavor: DeveloperProducts.FlavorEnum
    Price: string
}


export namespace Localize
{
    let errorHasBeenReported : { [k:string]: boolean } = {}

    let localPlayer = Players.LocalPlayer!

    let translator : Translator | undefined = undefined
    pcall( function() 
    {
        translator = //RunService.IsStudio() ?
            //LocalizationService.GetTranslatorForPlayer( localPlayer ) as Translator:
            LocalizationService.GetTranslatorForPlayerAsync( localPlayer ) as Translator
        print( "Localize: got translator")
    } )
    let supportedLanguage = false
    if( translator !== undefined )
    {
        pcall( function() 
        {
            supportedLanguage = translator!.FormatByKey( "supportedLanguage" ) !== ""
        } )

        warn( "Locale id "+LocalizationService.RobloxLocaleId+(supportedLanguage?" supported":" unsupported") )
    }

    // for fallback english if we can't find it in the cloud
    // we don't have access to the cloud english so we needed to do it this way
    let fallbackTranslator = LocalizationService.GetTranslatorForLocaleAsync("en-us") as Translator
    if( translator === undefined )
        translator = fallbackTranslator

    export function formatByKey( key: string, args?: (string | number)[] | { [k:string]: string | number } )
    {
        let result = key  // worst case scenario (key neither in real table nor fallback table, which started happening when I had my Roblox uploading issues) return key
        if( supportedLanguage )
        {
            let [ status, err ] = pcall( function() 
            {
                result = translator!.FormatByKey( key, args )
            } )
            if( !status )
            {
                if( key === undefined )
                {
                    DebugXL.Error( "key undefined" )
                }
                pcall( ()=>
                    result = "Key " + key + " NT:" + fallbackTranslator.FormatByKey( key, args ) )
                // only report each error once per player
                if( !errorHasBeenReported[key] )
                {
                    AnalyticsClient.ReportEvent( "LocMissing", key, LocalizationService.RobloxLocaleId )
                    errorHasBeenReported[key] = true
                }
            }
        }
        else
        {
            pcall( ()=> result = fallbackTranslator.FormatByKey( key, args ) )
        }
        return result
    }

    export function translate( text: string, context?: Instance )
    {
        let result = ""
        if( supportedLanguage )
        {
            result = translator!.Translate( context!, text )
            if( result==="" )
            {
                result = "NT: " + fallbackTranslator.Translate( context!, text )
                if( !errorHasBeenReported[ text ] )
                {
                    DebugXL.Error( "translate err: " + text )
                    errorHasBeenReported[ text ] = true
                }
            }
        }
        else
        {
            result = fallbackTranslator.Translate( context!, text )
        }
        return result
    }

    export function getName( item: { idS: string })
    {
        return formatByKey( item.idS )
    }

    export function getNameFromId( id: string )
    {
        return formatByKey( id )
    }

    export function getDeveloperProductName( item: DeveloperProductI )
    {
        if( item.flavor === DeveloperProducts.FlavorEnum.HeroExpress )
        {
            return Localize.formatByKey( "HeroExpress" )
        }
        else if( item.flavor === DeveloperProducts.FlavorEnum.Boost )
        {
            if( item.infoType === Enum.InfoType.GamePass )
                return Localize.formatByKey( "Permaboost" )
            if( item.amountN < 60 * 60 )
                return Localize.formatByKey( "MinutesBoost", [ item.amountN / 60 ] )
            else if( item.amountN === 60 * 60 )
                return Localize.formatByKey( "HourBoost" )
            else 
                return Localize.formatByKey( "HoursBoost", [ item.amountN / 60 / 60 ] )
        }
        else if( item.flavor === DeveloperProducts.FlavorEnum.Rubies )
        {
            return Localize.formatByKey( "RubyAmount", [ item.amountN ] )
        }
        else if( item.flavor === DeveloperProducts.FlavorEnum.Gold )
        {
            return Localize.formatByKey( "GoldAmount", [ item.amountN ] )
        }
        else if( item.flavor === DeveloperProducts.FlavorEnum.Specials )
        {
            if( PossessionData.dataT[ item.inventoryKeyS ].flavor === PossessionData.FlavorEnum.Skin )
                return Localize.formatByKey( "SkinSpecial", [ Localize.getNameFromId( item.inventoryKeyS )])
            else
                return Localize.getNameFromId( item.inventoryKeyS )
        }
        else if( item.flavor === DeveloperProducts.FlavorEnum.Expansions )
        {
            return Localize.formatByKey( "GearSlots", [ item.amountN ] )
        }
        else
        {
            DebugXL.Error( item.Name + " has invalid flavor")
        }
    }

    export function squish( s: string )
    {
        return s.gsub( " +", " " )
    }

    export function trim( s: string )
    {
        return s.gsub("^%s*(.-)%s*$", "%1")
    }
}
