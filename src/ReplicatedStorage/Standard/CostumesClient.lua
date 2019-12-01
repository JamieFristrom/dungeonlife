local CostumesClient = {}

-- not using the built in Roblox asset type because user generated stuff doesn't necessarily have it set up
-- and it takes time to load
CostumesClient.AssetFlavorEnum =
	{
		Hair = "Hair",
		Hat  = "Hat",
		Prop = "Prop",
		Face = "Face"
	}	

return CostumesClient
