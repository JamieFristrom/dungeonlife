
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

// The CostumesServer lua file is composite because it has subfiles - it's code is in CostumesServer/Init
type Character = Model

declare class CostumeManager {
    CostumeKey( player: Player ) : string
    LoadCharacter( 
        player: Player, 
        srcCharactersA: Character[], 
        noAttachmentsSet: { [k:string]:boolean }, 
        alsoClothesB: boolean, 
        characterToReplace: Character | undefined,
        cframe: CFrame ) : Character | void
}

declare let Costumes: CostumeManager

export = Costumes
