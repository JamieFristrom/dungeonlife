# Fixing
* Werewolf mobs don't chase and their transform hotbar option is gone
* Hero is respawning during preparation phase in 2 player game
* Zombie is not always getting a blue dot
* Sometimes there are spurious blue dots 
* Boss kill is still not quite right, it's thrashing between levels (there's a tiny instant TPK session that happens)
* Go back to old way of costume changes when sometimes it wasn't quite flush with floor and there was occasional decapitation risk - it felt better overall: werewolf transform was instantaneous, for one thing, and it didn't pop those loadanimation errors so frequently
* PlayerTracker should be called CharacterTracker
* Refactor: rename LevelSession -> FloorSession
* getCharacterRecordFromPlayer should return nullrecord instead of null

# Not fixing
* Using collection service Tag for characters is duplication of data. Instead do Mobs + workspace characters + destructibles?
