# dungeon life

Let me get this out of the way: I'm embarrassed to let people look at this code. My main excuse for the state it's in is that building up tech debt is a good idea for indies who don't know how long they're going to stick with a project, because it's a debt you probably never have to pay back. For me, the *most* embarrassing part are the Hero and Monster classes themselves; there is a lot of duplicate code in there. :scream:

The second most embarrassing part is that I switched to typescript partway through, learning typescript as I went, and the project is part lua, part n00b typescript.

But! I want to give back to the community, I want people to be able to do what they want with Dungeon Life, and I'm hoping that just maybe someone will make some cool stuff that they'll share back. So here goes.

And that said, there's more here I'm proud of than embarrassed of--for the most part it is data driven, and it doesn't do stateful things when not necessary, and those are usually my two priorities when architecting--so if you see something you don't like chances are I did it that way for a reason. Feel free to ask why!

And this is the first time I've released open soure in this manner - if there are common practices it would be nice for me to do let me know! A good place to ask would be on the Discord (https://discord.gg/7BQNSu which requires a Roblox username) or Twitter (https://twitter.com/happionlabs.)

# don't download, clone

You must clone, you can't download, because Dungeon Life uses git-lfs. If you clone, it should prompt you to set git-lfs up automatically. (git-lfs is needed for the RBLX and other large files.)

# building

Anyways, here's how to build for the first time. Some of these instructions are adapted from (https://roblox-ts.github.io/docs/guides/github-installation.)

You'll need git. https://git-scm.com/

You'll need NodeJS if you don't already have it. https://nodejs.org/en/ 

You'll want to use VS Code for your text editor. https://code.visualstudio.com/

And you'll need Rojo. https://marketplace.visualstudio.com/items?itemName=evaera.vscode-rojo

Once you've got those things, you're ready to start. From a dos command line clone dungeon life:
```
  >git clone https://github.com/JamieFristrom/dungeonlife.git
```
Now you need to get the version of roblox-ts that I use, which is an old version with a fix of my own. (If anybody wanted to update Dungeon Life to use the latest I'd be graeful!):
```
  >cd dungeonlife
  >git submodule update --init --recursive
```
Now install the version of typescript that I know Dungeon Life compiles with. (We're installing locally--without the -g option, so we can use the latest version of typescript elsewhere on our PCs.):
```
  >npm install typescript@3.3.4000
```
Now install some packages that Dungeon Life uses:
```
  >npm install
```
And install some packages that roblox-ts (typescript for Roblox) uses:
```
  >cd roblox-ts
  >npm install
```
Now build roblox-ts using typescript:
```
  >npx tsc
```
Now we need to be able to access roblox-ts from the command line. This should link it up:
```
  >npx link
```
And now you should be able to build Dungeon Life:
```
  >cd ..
  >rbxtsc 
```
(As long as there are no error messages you should be in good shape, but I can understand being leery. I actually usually use `>rbxtsc -w` to see that 'success' message and then hit ctrl-break to get out.)

Now you need the Roblox place to actually put this code! Open the rbxl/DungeonLifeOpenTemplate.rbxl in Roblox and publish it. Go to Game Settings and enable Studio API Access. 

Give me credit! Configure your place and in your description put: "Made with Dungeon Life by Jamie Fristrom: https://www.roblox.com/games/2184151436"

The place won't do anything by itself; you still need to build the source and suck it in with Rojo. How to use Rojo is beyond the scope of this article. (https://github.com/rojo-rbx/rojo) The TL;DR is that you open the dungeonlife folder in VS Code and should then be able to use Rojo to transfer the files into Roblox.

Run the game from within Roblox! If you did everything exactly right and there are no unforseen problems with your setup it should work!

If you have problems let me know (join the Discord or message @happionlabs on twitter) but I can't promise speedy answers!

# adding the localization table

If you play the game now it'll seem weird because it's showing you localization key entries instead of the actual translations. To fix, use the Localization Tools plug in in Studio; choose 'Click hereo to configure your cloud localization table' and on the website choose English as the source language. 
Then Replace the entire cloud table with CSV and choose loc/GameLocalizationTable.csv. That should upload all the translations. 

# importing the animations

Ok this is a pain because unlike other assets Roblox doesn't let you share them. If that ever changes let me know!

To get the animations into your place you'll need the Animation Editor plug-in.

In your place, right click Workspace and **Insert from file**; choose rbxm/DungeonLifeAnimations.rbxm. That will insert an AnimationDummy into your place.

Open the Animation Editor, go to File -> Load -> AttackBothHands1.

Then File -> Export -> (Create New) and save it under the name AttackBothHands1.

Repeat the process for every animation in the Load menu. 

Now you have to teach the game the asset ids of those animations. You can find the animation ids by going to Create on the Roblox Website and choosing Animations. (If your place is under a group you'll also have to look under the Group Creations tab.) For each animation, click on it and copy the URL. Then go into the AnimationManifest.ts file and paste that URL into the AnimationId of the animation with the same name. Again, do this for every animation.

Thanks to that, your codebase now differs from the one in git, so you may want to have your own fork or branch with your own animation manifest. 

And now the animations should work! Your avatars should now swing their swords and fire their bows deliciously.

Sorry it's so much work! That's honestly the easiest way I've found for getting the animations up-and-running the first time, if anybody can think of a better way let me know.

# it's not you it's me

Known problem: the in-app purchases are still wired to the original Game; you'll have to create your own in-app purchases and change the ids in order to let people buy things in yours.

If you spot other problems, it's probably because there are other issues running the code in a standalone place. You can check my test place https://www.roblox.com/games/4476008779: if the bug happens there too, it's not you, it's me. :) Let me know! 


