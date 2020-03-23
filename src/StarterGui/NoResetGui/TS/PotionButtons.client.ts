import { Workspace, Players, Teams } from "@rbxts/services"
import { Hero } from "ReplicatedStorage/TS/HeroTS"
import { CharacterRecord } from "ReplicatedStorage/TS/CharacterRecord"
import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"
import { PCClient } from "ReplicatedStorage/TS/PCClient"

type Character = Model

interface PotionButtonConfigurationI
{
    funcName: string,
    itemName: string,
    warningFunc: ( character: Character )=>boolean,
    potionFrame: Frame
}

const signals = Workspace.WaitForChild<Folder>('Signals')

const heroREvent = signals.WaitForChild<RemoteEvent>('HeroesRE')

const playerGui = Players.LocalPlayer!.WaitForChild<PlayerGui>('PlayerGui')
const uiAudio = playerGui.WaitForChild<ScreenGui>('Audio')
const uiClick = uiAudio.WaitForChild<Sound>('UIClick')
const heroesTeam = Teams.WaitForChild<Team>('Heroes')

class PotionButton 
{
    guiFrame: Frame
    guiButton: TextButton
    imageLabel: ImageLabel
    title: TextLabel
    uiArrow: ImageLabel

    constructor( public potionButtonConfiguration: PotionButtonConfigurationI ) 
    {
        this.guiFrame = potionButtonConfiguration.potionFrame.WaitForChild<Frame>('Item')
        this.guiButton = this.guiFrame.WaitForChild<TextButton>('Button')
        this.imageLabel = this.guiFrame.WaitForChild<ImageLabel>('ImageLabel')
        this.title = this.guiFrame.WaitForChild<TextLabel>('Title')
        this.uiArrow = this.guiFrame.WaitForChild<ImageLabel>('UIArrow')
        this.guiButton.MouseButton1Click.Connect( ()=>
        {
            uiClick.Play()
            heroREvent.FireServer( potionButtonConfiguration.funcName )
        })
    }

    refresh( character: Character, pcData: CharacterRecord )
    {
        // wishlist - monsters could have potions someday. that day has just gotten closer with this refactor
        if( Players.LocalPlayer.Team !== heroesTeam )
        {
            this.guiFrame.Visible = false
        }
        else
        {
            if( pcData )
            {
                const potionsN = pcData.countBaseDataQuantity( this.potionButtonConfiguration.itemName )
                if( potionsN > 1 )
                {
                    this.imageLabel.Visible = true
                    this.title.Visible = true
                    this.title.Text = potionsN+" left"
                    this.guiFrame.Visible = true
                }
                else if( potionsN === 1 )
                {
                    this.imageLabel.Visible = true
                    this.title.Visible = false
                    this.guiFrame.Visible = true
                }
                else
                {
                    this.guiFrame.Visible = false
                }
            }
        }
        this.uiArrow.Visible = this.potionButtonConfiguration.warningFunc( character )
    }
}

let potionButtonL = new PotionButton({
    funcName: "TakeBestHealthPotion",
    itemName: "Healing",
    warningFunc: ( character: Character ) => {
        const humanoid = character.FindFirstChild<Humanoid>("Humanoid")		
        if( humanoid && humanoid.Health < humanoid.MaxHealth * 0.33 && humanoid.Health > 0 )
            return true
        return false
    },
    potionFrame: script.Parent!.Parent!.WaitForChild<Frame>('PotionbarL')
})

let potionButtonR = new PotionButton({
    funcName: "TakeBestManaPotion",
    itemName: "Mana",
    warningFunc: ( character: Character ) => {
        const manaValue = character.FindFirstChild<NumberValue>('ManaValue')
        const maxManaValue = character.FindFirstChild<NumberValue>('MaxManaValue')
        if( manaValue && maxManaValue && manaValue.Value < maxManaValue.Value * 0.33 ) 
            return true
        return false
    },
    potionFrame: script.Parent!.Parent!.WaitForChild<Frame>('PotionbarR')
})


PCClient.pcUpdatedConnect( ( pcData )=>{
    const character = Players.LocalPlayer.Character
    if( character )
    {
        potionButtonL.refresh(character, pcData)
        potionButtonR.refresh(character, pcData)
    }
})
