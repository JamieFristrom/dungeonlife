import * as MapTileData from "ReplicatedStorage/Standard/MapTileDataModule"
import * as FloorData from "ReplicatedStorage/Standard/FloorData"
import * as MathXL from "ReplicatedStorage/Standard/MathXL"

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
import { Workspace } from "@rbxts/services";
import { Math } from "ReplicatedStorage/TS/Math";

let cellWidth = 45 


interface DecimationInfoI { minSpots: number, maxSpots: number, spotSize: number, survivalPct: number, keep: boolean }

export namespace TileServer
{
    // 
    export function decimateClumps( mosaicParts: BasePart[], info: DecimationInfoI )
    {
        let partV3s = mosaicParts.map( (part)=>part.Position )
        let boundingBoxMin = partV3s.reduce( ( previousValue, currentValue )=>
            new Vector3(
                math.min( previousValue.X, currentValue.X ),
                math.min( previousValue.Y, currentValue.Y ),
                math.min( previousValue.Z, currentValue.Z ) ) )
        let boundingBoxMax = partV3s.reduce( ( previousValue, currentValue )=>
            new Vector3(
                math.max( previousValue.X, currentValue.X ),
                math.max( previousValue.Y, currentValue.Y ),
                math.max( previousValue.Z, currentValue.Z ) ) )

        // scatter some high-density spots around
        let highDensitySpots = new Array<Vector3>() // (  )
        let numSpots = MathXL.RandomInteger( info.minSpots, info.maxSpots )
        for( let i=0; i<numSpots; i++ )
        {
            highDensitySpots.push( new Vector3( MathXL.RandomNumber( boundingBoxMin.X, boundingBoxMax.X ),
                MathXL.RandomNumber( boundingBoxMin.Y, boundingBoxMax.Y ),
                MathXL.RandomNumber( boundingBoxMin.Z, boundingBoxMax.Z ) ) )            
        }

        // how close a thingy is to a high density spot determines its chance of existing
        mosaicParts.forEach( ( part )=>
        {
            let distances = highDensitySpots.map( (spot)=> spot.sub(part.Position).Magnitude )
            let shortestDistance = distances.reduce( (x,y)=>math.min(x,y), 0 ) 
            let chanceOfDestroy = Math.clamp( 1 - shortestDistance / info.spotSize, 0, 1 ) * info.survivalPct
            chanceOfDestroy = chanceOfDestroy ** 2
            if( info.keep ) chanceOfDestroy = 1 - chanceOfDestroy
            if( MathXL.RandomNumber() <= chanceOfDestroy )
            {
                part.Destroy()
            }
        } )
    }

    export function decimateIndividual( mosaicParts: BasePart[], info: DecimationInfoI )
    {
        mosaicParts.forEach( ( part )=>
        {
            DebugXL.Assert( info.keep )
            if( MathXL.RandomNumber() >= info.survivalPct )
            {
                part.Destroy()
            }
        } )
    }

    export function placeTile( tileTemplate: Model, x: number, z: number, compassRotation: number )
    {
        let startTime = tick()

        let tileModel = tileTemplate.Clone() as Model    
        let primaryPart = tileModel.PrimaryPart!
        tileModel.Name = "Tile_" + x + "_" + z
        let positionCFrame = new CFrame( ( x - MapTileData.CenterV3().X ) * cellWidth, 0, 
                                         ( z - MapTileData.CenterV3().Z ) * cellWidth ) 
        let rotationCFrame = CFrame.fromEulerAnglesXYZ( 0, compassRotation * math.pi / 2, 0 ) 
        let modelCFrame = positionCFrame.mul( rotationCFrame )
        tileModel.SetPrimaryPartCFrame( modelCFrame )	

        let materialSwapT = FloorData.CurrentFloor().materialSwapT 
        if( materialSwapT )
        {
            tileModel.GetDescendants().forEach( ( part )=>
            {
                if( part.IsA("BasePart" ))
                {
                    let materialSwap = materialSwapT.get( part.Material )
                    if( materialSwap )
                    {
                        Object.assign( part, materialSwap )
                    }
                }
            } )            
        }

        let colorSwapT = FloorData.CurrentFloor().colorSwapT
        if( colorSwapT )
        {
            tileModel.GetDescendants().forEach( ( part )=>
            {
                if( part.IsA("BasePart" ))
                {
                    let colorSwap = colorSwapT.get( part.BrickColor.Name )
                    if( colorSwap )
                    {
                        Object.assign( part, colorSwap )
                    }
                }
            } )            
        }
        
        let hideParts = FloorData.CurrentFloor().hidePartsSet
        if( hideParts )
        {
            tileModel.GetDescendants().forEach( (part)=>
            {
                if( hideParts[ part.Name ] )
                {
                    part.Destroy()
                }
            })
        }

        let decimateParts = FloorData.CurrentFloor().decimatePartsT
        if( decimateParts )
        {
            decimateParts.forEach( ( decimationInfo, partName )=>
            {
                let partsToDecimate = tileModel.GetDescendants().filter( (part)=>part.Name===partName ) as BasePart[]
                if( partsToDecimate[0] )
                {
                    if( decimationInfo.maxSpots > 0 )
                        decimateClumps( partsToDecimate, decimationInfo )
                    else
                        decimateIndividual( partsToDecimate, decimationInfo )
                }
            } )
        }
        tileModel.Parent = Workspace.FindFirstChild('Environment')
        let endTime = tick()
        //print( "Tile created in " + tostring(endTime - startTime))
    }
}