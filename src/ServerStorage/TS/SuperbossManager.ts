
// Copyright (c) Happion Laboratories - see license at https://github.com/JamieFristrom/dungeonlife/blob/master/LICENSE.md

import { DebugXL, LogArea } from "ReplicatedStorage/TS/DebugXLTS";
DebugXL.logI(LogArea.Executed, script.Name)

type Character = Model

// if we ever make a shapechanging superboss this system won't work
export class SuperbossManager {
    private superbossCharacter?: Character
    private myLevelSession = -1

    noteSuperbossSpawned(superboss: Character, currentLevelSession: number) {
        DebugXL.Assert( this instanceof SuperbossManager )
        this.superbossCharacter = superboss
        this.myLevelSession = currentLevelSession
    }

    getMyLevelSession() {
        return this.myLevelSession
    }

    superbossDefeated(currentLevelSession: number) {
        DebugXL.Assert( this instanceof SuperbossManager )
        if (currentLevelSession !== this.myLevelSession) {
            DebugXL.logV(LogArea.GameManagement, "Last superboss different level")
            return false
        }
        if (this.superbossCharacter) {
            if (!this.superbossCharacter.Parent) {
                DebugXL.logV(LogArea.GameManagement, "superboss no parent")
                return true
            }
            let humanoid = this.superbossCharacter.FindFirstChild<Humanoid>("Humanoid")
            if (humanoid) {
                if (humanoid.Health > 0) {
                    DebugXL.logV(LogArea.GameManagement, "superboss healthy")
                    return false
                }
                else {
                    DebugXL.logV(LogArea.GameManagement, "superboss unhealthy")
                    return true
                }
            }
            DebugXL.logV(LogArea.GameManagement, "superboss missing humanoid")
            return true
        }
        DebugXL.logV(LogArea.GameManagement, "superboss uninitialized")
        return false
    }
}