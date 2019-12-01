--
-- ErrorMonitor
--
-- Part of Jamie's new XL libraries
--
game.LogService.MessageOut:Connect( function( message, messageType )
	if messageType == Enum.MessageType.MessageError then
		workspace.Standard.DebugGuiRE:FireAllClients( message )
	end
end)

