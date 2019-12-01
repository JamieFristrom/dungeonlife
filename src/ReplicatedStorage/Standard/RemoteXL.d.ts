declare class RemoteXL
{
    RemoteFuncCarefulInvokeClientWait( remoteFunctionObj: RemoteFunction, player: Player, timeoutSecs: number, ...args: unknown[] ): unknown[]
    RemoteFuncCarefulInvokeServerWait( remoteFunctionObj: RemoteFunction, timeoutSecs: number, ...args: unknown[] ): unknown[]
}

declare let remoteXL: RemoteXL

export = remoteXL