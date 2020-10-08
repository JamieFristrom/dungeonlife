# Fixing
* You don't turn back into a monster when you choose mosnter - have to manually respawn
* make between levels look good
* superbosses too easy in co-op
* ghosts are immune to being directly targeted with longbow (recorded movie)
* Bring back print money command
* Hero is respawning during preparation phase in 2 player game: mash ready button after changing level
* "Code redeemed" doesn't say what you get
* Choosing team button going back to monster from hero has big lag
* Sometimes there are spurious blue dots 
* Spawning inside structures, particularly orc tent
* Hide rack tooltip if dungeon lord
* Zombie is not always getting a blue dot
* Change timeout depending on monster hero ratio
* Boss kill is still not right, it's thrashing between levels (there's a tiny instant TPK session that happens?)
* single player: ready button & preparation flicker...but only in studio?
* Go back to old way of costume changes when sometimes it wasn't quite flush with floor and there was occasional decapitation risk - it felt better overall: werewolf transform was instantaneous, for one thing, and it didn't pop those loadanimation errors so frequently
* Make sure killing a superboss drops good loot
* Port to Minecraft
* PlayerTracker should be called CharacterTracker
* Refactor: rename LevelSession -> FloorSession
* getCharacterRecordFromPlayer should return nullrecord instead of null
* when smashing through the exit activate whole level. that would require pathfinding


# Not fixing
* Using collection service Tag for characters is duplication of data. Instead do Mobs + workspace characters + destructibles?
