import { Players, Teams } from "@rbxts/services";

import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"

// dungeon life UI common code
// doing it this way instead of namespace so on the Lua side it will use method calling :

let LocalPlayer = Players.LocalPlayer!
let playerGui = LocalPlayer.FindFirstChild('PlayerGui') as PlayerGui

interface PanelI
{
    mainFrame: Frame
    showFunc: ()=>void
    hideFunc: ()=>void
}

class Panel implements PanelI
{
    constructor(
        public mainFrame: Frame,
    ) {}

    showFunc()
    {
        this.mainFrame.Visible = true
    }

    hideFunc()
    {
        this.mainFrame.Visible = false
    }
}

class ActivePanel extends Panel
{
    constructor( mainFrame: Frame, public mainEvent: BindableEvent ) 
    {
        super( mainFrame )
    }

    showFunc()
    {
        this.mainEvent.Fire("Build")
    }

    hideFunc()
    {
        this.mainEvent.Fire("Close")
    }
}

let managedPanels: Panel[] =
[
    new Panel(
        playerGui.WaitForChild("SkinGui").WaitForChild("Main") as Frame,
    ),
    new Panel(
        playerGui.WaitForChild("StoreGui").WaitForChild("Main") as Frame,
    ),
    new Panel(
        playerGui.WaitForChild("CharacterSheetGui").WaitForChild("CharacterSheet") as Frame,
    ),
    new Panel(
        playerGui.WaitForChild("PossessionsGui").WaitForChild("PossessionsFrame") as Frame,
    ),
    new Panel(
        playerGui.WaitForChild("NoResetGui").WaitForChild("FeedbackPanel") as Frame,
    ),
    new ActivePanel(
        playerGui.WaitForChild("FurnishGui").WaitForChild("ActiveCategoryListFrame") as Frame,
        playerGui.WaitForChild("FurnishGui").WaitForChild("Event") as BindableEvent
    )
]

export namespace DLUI
{
    export function activateFrame( frame: Frame )
    {
        let foundIt = false
        managedPanels.forEach( ( panel ) =>
        {
            if( panel.mainFrame === frame )
            {
                panel.showFunc()
                foundIt = true
            }
            else
            {
                panel.hideFunc()
            }
        } )
        if( !foundIt )
            DebugXL.Error( frame.GetFullName()+" not managed" )
    }

    export function closeAllFrames()
    {
        managedPanels.forEach( ( panel ) => panel.hideFunc() )
    }

    export function toggleFrame( frame: Frame )
    {
        if( frame.Visible )
            closeAllFrames()
        else
            activateFrame( frame )
    }
}

LocalPlayer.GetPropertyChangedSignal("Team").Connect( ()=>
{
    DLUI.closeAllFrames()
} )

LocalPlayer.GetPropertyChangedSignal("Character").Connect( ()=>
{
    DLUI.closeAllFrames()
} )
