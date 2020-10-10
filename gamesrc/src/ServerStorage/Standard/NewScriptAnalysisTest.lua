
local Namespace = {}

function Namespace:MemberFnHasColon()
end

Namespace:MemberFnHasColon()

local fib = nil

function combined( n )
    return fib(n-1) + fib(n-2)
end

function fib( n )
    if n == 1 then
        return 1
    end
    if n == 2 then
        return 3
    end
    return combined(n)
end


function Namespace.TwoParams(a,b)
    return a+b
end

function Ellipsis(...)
    return Namespace:TwoParams(...)
end

Ellipsis(1,2)

function Namespace.SelflessTwoParams(a,b)
    return a+b
end

-- function Passthrough(...)
--     return Namespace.SelflessTwoParams(...)


-- game.RenderStepped:Connect( function(...)
--     Namespace.SelflessTwoParams(...)
-- end )
