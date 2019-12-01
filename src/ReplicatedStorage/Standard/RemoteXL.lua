-- local DebugXL = require( game.ReplicatedStorage.Standard.DebugXL )

-- local RemoteXL = {}

-- -- thing I wasn't sure about with lua is what would happen with this func:
-- --
-- --function thisIsWeird()
-- --	local variable = 'x'
-- --	local crtn = coroutine.create( function()
-- --		--print("crtn!")
-- --		wait(4)
-- --		--print( variable )
-- --	end)
-- --	coroutine.resume( crtn )
-- --	wait(2)
-- --	variable = 'y'  -- we change it to y, but then the function ends. what happens to the local variable?
-- --end
-- --
-- -- the answer is the upvalues to the coroutine hang around.  I assume they get garbage collected later after the coroutine is done
-- -- but that means this can work:

-- -- for its second parameter it returns the result of the function
-- function RemoteXL:RemoteFuncCarefulInvokeClientWait( remoteFunctionObj, player, timeoutSecs, ... )
-- 	local functionReturned = false
-- 	local monitorCrtn = coroutine.create( function()
-- 		wait( timeoutSecs )
-- 		if not functionReturned then
-- 			warn( "RemoteFunction invoke timed out")
-- 			-- not sure what to do about this; it seems like it could be a sign of something bad but we've definitely been playing
-- 			-- it succesfully while there
-- --			DebugXL:Error( "RemoteFunction invoke timed out")
-- 		end		
-- 	end )
-- 	coroutine.resume( monitorCrtn )
-- 	local returnValue = remoteFunctionObj:InvokeClient( player, ... )
-- 	functionReturned = true
-- 	return returnValue
-- end


-- function RemoteXL:RemoteFuncCarefulInvokeServerWait( remoteFunctionObj, timeoutSecs, ... )
-- 	local functionReturned = false
-- 	local monitorCrtn = coroutine.create( function()
-- 		wait( timeoutSecs )
-- 		if not functionReturned then
-- 			DebugXL:Error( "RemoteFunction invoke timed out")
-- 			-- not sure what to do about this; it seems like it could be a sign of something bad but we've definitely been playing
-- 			-- it succesfully while there
-- --			DebugXL:Error( "RemoteFunction invoke timed out")
-- 		end		
-- 	end )
-- 	coroutine.resume( monitorCrtn )
-- 	local returnValue = remoteFunctionObj:InvokeServer( ... )
-- 	functionReturned = true
-- 	return returnValue
-- end


-- return RemoteXL
