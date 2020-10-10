export namespace ObjectXL
{

    export function clone<T>( integral: T )
    {
        if( typeIs( integral, "table" ) )
        {
            let cloneObj = {} as {[k:string]:unknown}
            let objectCast = integral as unknown as {[k:string]:unknown}
            for( let attribute of Object.keys( objectCast )) 
            {
                cloneObj[ attribute ] = clone( objectCast[ attribute ] )
            }
            return cloneObj as unknown as T
        }
        else
        {
            return integral
        }
    }
}