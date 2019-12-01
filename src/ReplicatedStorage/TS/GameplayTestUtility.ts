import { DebugXL } from "ReplicatedStorage/TS/DebugXLTS"


export type TestGroups = Map<string,number>

export interface TestInfoHolder {
    testGroups: TestGroups | undefined
}

export namespace GameplayTestUtility {
    export function getTestGroup( testInfoHolder: TestInfoHolder, testGroup: string ) : number {
        // thought about evaluating this lazily but the latency for checking the database might be a killer
        let myTestGroups = testInfoHolder.testGroups
        if( myTestGroups )
        {         
            let testGroupValue = myTestGroups.get( testGroup )
            if( !testGroupValue ) {
                DebugXL.Error("Unable to find test group "+testGroup)
                return 0
            }
            else
            {
                return testGroupValue
            }
        }
        else
        {
            // could happen if we try to get the test group after player is removed
            DebugXL.Error("Unable to find test group in testinfoholder; did you forget to pass inventory?")
            return 0
        }
    }

    export function getTestGroups( testInfoHolder: TestInfoHolder ) {
        let myTestGroups = testInfoHolder.testGroups
        if( myTestGroups )
        {            
            return myTestGroups.entries();
        }
    }
}