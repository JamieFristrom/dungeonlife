export namespace ValueHelper
{
    export function AddStringValue( instance: Instance, name: string, value: string )
    {
        let stringValueObj = new Instance('StringValue')
        stringValueObj.Name = name
        stringValueObj.Value = value
        stringValueObj.Parent = instance
    }

    export function AddNumberValue( instance: Instance, name: string, value: number )
    {
        let stringValueObj = new Instance('NumberValue')
        stringValueObj.Name = name
        stringValueObj.Value = value
        stringValueObj.Parent = instance
    }
}