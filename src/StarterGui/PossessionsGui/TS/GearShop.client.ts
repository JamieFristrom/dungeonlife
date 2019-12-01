import { Players, Teams, Workspace } from "@rbxts/services";

import { PCClient } from "ReplicatedStorage/TS/PCClient"

import * as GearUI from "ReplicatedStorage/Standard/GearUI"
import * as HeroUtility from "ReplicatedStorage/Standard/HeroUtility"
import * as InventoryClient from "ReplicatedStorage/Standard/InventoryClientStd"

import { PC } from "ReplicatedStorage/TS/PCTS"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { Localize } from "ReplicatedStorage/TS/Localize"
import { MessageGui } from "ReplicatedStorage/TS/MessageGui"

let possessionsFrame = script.Parent!.Parent!.WaitForChild('PossessionsFrame') as Frame
let shopButton = possessionsFrame.WaitForChild('GearBorder').WaitForChild('Shop') as TextButton
let gearShopFrame = script.Parent!.Parent!.WaitForChild('GearShopFrame') as Frame
let itemInfoFrame = gearShopFrame.WaitForChild('ItemInfoFrame') as Frame
let possessionsItemInfoFrame = possessionsFrame.WaitForChild('ItemInfoFrame') as Frame
let buyButton = itemInfoFrame.WaitForChild('Buy') as TextButton
let playerGui = Players.LocalPlayer!.WaitForChild('PlayerGui') as PlayerGui
let uiClick = playerGui.WaitForChild('Audio').WaitForChild( 'UIClick' ) as Sound
let heroEvent = Workspace.WaitForChild('Signals').WaitForChild('HeroesRE') as RemoteEvent
let goldCount = gearShopFrame.WaitForChild( 'Gold' ).WaitForChild( 'Count' ) as TextLabel
let buyGoldButton = gearShopFrame.WaitForChild('BuyGold') as TextButton
let closeButton = gearShopFrame.WaitForChild('CloseButton') as ImageButton

let curFlexToolShopKey = ''

shopButton.MouseButton1Click.Connect( ()=>
{
    gearShopFrame.Visible = !gearShopFrame.Visible
} )


function RefreshGearShop( pc: PC )
{
    let hero = pc as Hero
    if( !hero.statsT )
    {
        return
    }

    goldCount.Text = tostring( hero.statsT.goldN )

    GearUI.PopulateGearFrame( gearShopFrame.WaitForChild('Inlay'),
        gearShopFrame.WaitForChild('ItemTemplate'),
        gearShopFrame.WaitForChild('ItemInfoFrame'),
        hero.getShopItems(),
        {},
        30,
        ( toolIdx: string )=>
        {
            curFlexToolShopKey = toolIdx
            let tool = hero.shopT.get( toolIdx )!
            buyButton.Text = Localize.formatByKey( 'BuyFor', [ tool.getPurchasePrice() ] )
            possessionsItemInfoFrame.Visible = false
            itemInfoFrame.Visible = true
        } )
}


PCClient.pcUpdatedConnect( ( pc: PC ) =>
{
	print('Refreshing shop sheet due to pc update')
    RefreshGearShop( pc )
} )


buyButton.MouseButton1Click.Connect( function()
{
    uiClick.Play()
    let hero = PCClient.pc as Hero
    if( !hero.statsT ) return
    let shopItem = hero.shopT.get( curFlexToolShopKey )!
    if( hero.statsT.goldN >= shopItem.getPurchasePrice() )
    {        
        let gearCount = HeroUtility.CountGear( hero )
        if( gearCount < InventoryClient.GetCount( 'GearSlots' ) )
        {
            heroEvent.FireServer( 'BuyItem', curFlexToolShopKey )
            itemInfoFrame.Visible = false
        }
        else
        {
            MessageGui.PostMessage( Localize.formatByKey( 'OutOfGearSlots' ), false, 0, false )
        }
    }
    else
    {
        MessageGui.PostMessage( Localize.formatByKey( 'NotEnoughGold' ), false, 0, false )
    }
} )

closeButton.MouseButton1Click.Connect( function()
{
    gearShopFrame.Visible = false
} )

let inventoryRE = Workspace.WaitForChild('Signals').WaitForChild('InventoryRE') as RemoteEvent

gearShopFrame.GetPropertyChangedSignal( 'Visible' ).Connect( function()
{
    if( gearShopFrame.Visible===false )
    {
        if( InventoryClient.GetMessagesShown( 'StoreChanges' )<=0 )
        {
            MessageGui.PostMessage( Localize.formatByKey( 'StoreChanges'), true, 0.001, true )
            inventoryRE.FireServer( 'MarkMessageShown', 'StoreChanges' )
        }
    }
} )

let storeGui = playerGui.WaitForChild('StoreGui') as Frame
let storeGuiMain = storeGui.WaitForChild('Main') as Frame
let storeMainBE = storeGui.WaitForChild('StoreMainBE') as BindableEvent
let characterSheet = playerGui.WaitForChild('CharacterSheetGui').WaitForChild('CharacterSheet') as Frame
let skinGuiMain = playerGui.WaitForChild('SkinGui').WaitForChild('Main') as Frame

buyGoldButton.MouseButton1Click.Connect( function()
{
    uiClick.Play()
    storeGuiMain.Visible = true
    storeMainBE.Fire( 'JumpTo', storeGui.WaitForChild('Main').WaitForChild('MainHeader').WaitForChild('Gold') )
    gearShopFrame.Visible = false    
    possessionsFrame.Visible = false
    characterSheet.Visible = false
    skinGuiMain.Visible = false		
} )

