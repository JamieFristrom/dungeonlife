export namespace BlueprintUtility
{
    export function getPossessionName( furnishing: Model ) : string
    {
        // not bothering to do debug checks because it will error hard later anyway; validation should protect us
        // we have to wait because when it gets cloned on the server it doesn't replicate to the client, and this
        // function can be called from the client. (Maybe we should have two, one for server & one for client...)
        let name = furnishing.WaitForChild<StringValue>('PossessionName')!.Value!
        return name 
    }
}