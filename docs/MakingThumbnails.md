# Making a Thumbnail for an In Game Model (skins, blueprints, etc)

It has been so long since I've done this I've forgotten how.
In general, you take the model you're making a thumbnail for and position the camera how you like (I set the viewport to square) then copy the camera to the model and name it ThumbnailCamera
Then save and upload to Roblox - the thumbnail will look wrong in the save-upload dialog box but it will look right once the item is live in their content delivery network.
Now the question is what id do you use for that thumbnail in game. This seems to work well:
"http://www.roblox.com/Game/Tools/ThumbnailAsset.ashx?aid=YOURASSETIDHERE&fmt=png&wd=420&ht=420"
