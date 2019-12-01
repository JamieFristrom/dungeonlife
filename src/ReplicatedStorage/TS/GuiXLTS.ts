import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"

import { Players, Workspace, GuiService, ContextActionService, ReplicatedFirst } from "@rbxts/services"

// I didn't want to search and replace 200 uses of GuiXL in the roblox codebase
// so I'm spoofing the GuiXL namespace with an object
// couldn't figure out how to get this enum in there

// GuiXL.TextSizeEnum =
// {
// 	Small    = "Small",
// 	Standard = "Standard",
// 	Large    = "Large"
// }

class GuiXLClass
{
    GetTextSize( textSizeEnum: string )
    {
        let currentCamera = Workspace.CurrentCamera!
        DebugXL.Assert( currentCamera!==undefined )
        if( !currentCamera ) return
        let closeScreenSize = 0
        if ( textSizeEnum === "Small" )        
        {
            if( GuiService.IsTenFootInterface() )
                closeScreenSize = 25  // 20 too small;  at '26' light crossbow didn't fit in the hotbar.  
            else if( currentCamera.ViewportSize.X < 800 )
                closeScreenSize = 9
            else
                closeScreenSize = 14
        }
        else if( textSizeEnum === "Standard" )
        {
            if( GuiService.IsTenFootInterface() )
                closeScreenSize = 32
            else if( currentCamera.ViewportSize.X < 800 )
                closeScreenSize = 13
            else
                closeScreenSize = 22
        }
        else
        {
            if( GuiService.IsTenFootInterface() )
                closeScreenSize = 48
            else if( currentCamera.ViewportSize.X < 800 )
                closeScreenSize = 18
            else
                closeScreenSize = 34
        }
        return closeScreenSize
    }

    waitForLoadingGoo()
    {
        let loadingScript = ReplicatedFirst.WaitForChild('TS').WaitForChild('Loading') as Script
        while( !loadingScript.Disabled )
        {
            wait(0.25)
        }

        let playerGui = Players.LocalPlayer!.FindFirstChild('PlayerGui')
        DebugXL.Assert( playerGui !== undefined ) 
        if( !playerGui ) return
        let introMessage = playerGui.WaitForChild('MessageGuiConfiguration').WaitForChild("IntroMessage") as GuiObject
        while( introMessage.Visible )
        {
            wait(0.25)
        }
    }


    wireHorizontalUIListMenuGamepad( uiList: UIListLayout )
    {
        DebugXL.Assert( uiList.Parent!.IsA("Frame") )
        let menuFrame = uiList.Parent as Frame
        let menuItems = menuFrame.GetChildren().filter( (item)=> !item.IsA("UIListLayout") ) as GuiObject[]
        let sortOrder = uiList.SortOrder
//        menuItems.sort( (a,b)=> a.LayoutOrder - b.LayoutOrder )  // array_sort not available yet
        table.sort( menuItems, ((a:GuiObject,b:GuiObject)=> sortOrder === Enum.SortOrder.LayoutOrder ? a.LayoutOrder < b.LayoutOrder : a.Name < b.Name ) as ()=>boolean )  
        let menuButtons = menuItems.map( (element)=> element.FindFirstChildWhichIsA("TextButton") as TextButton )
        for (let index = 0; index < menuButtons.size(); index++) {
            const button = menuButtons[index];            
            if( index>0 ) button.NextSelectionLeft = menuButtons[ index-1 ]
            if( index<menuButtons.size()-1 ) button.NextSelectionRight = menuButtons[ index+1 ]
        }
    }

    bindAction( name: string, func: ()=>void, ...inputTypes: (Enum.KeyCode | Enum.UserInputType | Enum.PlayerActions)[] )
    {
        return ContextActionService.BindAction( name, function( _: unknown, inputState: Enum.UserInputState )
            {
                if( inputState === Enum.UserInputState.Begin )
                    func()
            },
            false,
            ...inputTypes )
    }

    // just for symmetry
    unbindAction( name: string )
    {
        ContextActionService.UnbindAction( name )        
    }

    // have a feeling I wrote this already

/*    currentlyDisplayed( guiObject: GuiObject )
    {
        let traverser = guiObject
        for(;;) {
            if( !traverser.Visible ) {
                return false;
            }
            if( traverser.Parent!.IsA("ScreenGui") ) {
                return traverser.Parent!.Enabled;
    
            assert( traverser.Parent!.IsA("GuiObject") )
            if( traverser.Parent!.IsA("GuiObject")) {
                traverser = traverser.Parent!
            }
            else
            {
                return false;
            }
        }
    }*/
}

export let GuiXL = new GuiXLClass()

