# Fixing
* ghosts are immune to being directly targeted with longbow (recorded movie)
* Bring back print money command
* Hero is respawning during preparation phase in 2 player game: mash ready button after changing level
* Upgrade typescript
* "Code redeemed" doesn't say what you get
* Sometimes there are spurious blue dots 
* Spawning inside structures, particularly orc tent
* Hide rack tooltip if dungeon lord
* Zombie is not always getting a blue dot
* Change timeout depending on monster hero ratio
* Boss kill is still not quite right, it's thrashing between levels (there's a tiny instant TPK session that happens)
* single player: ready button & preparation flicker...but only in studio?
* Go back to old way of costume changes when sometimes it wasn't quite flush with floor and there was occasional decapitation risk - it felt better overall: werewolf transform was instantaneous, for one thing, and it didn't pop those loadanimation errors so frequently
* Port to Minecraft
* PlayerTracker should be called CharacterTracker
* Refactor: rename LevelSession -> FloorSession
* getCharacterRecordFromPlayer should return nullrecord instead of null

# Not fixing
* Using collection service Tag for characters is duplication of data. Instead do Mobs + workspace characters + destructibles?
