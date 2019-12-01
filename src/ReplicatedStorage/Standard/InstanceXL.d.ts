declare class InstanceXLC
{
    CreateInstance( className: string, parameters: { [k: string]:unknown }, singletonB: Boolean ) : Instance
    CreateSingleton( className: string, parameters: { [k: string]:unknown } ) : Instance
    ClearAllChildrenBut( parentInstance: Instance, safeChildName: string ) : void
}

declare let InstanceXL : InstanceXLC

export = InstanceXL