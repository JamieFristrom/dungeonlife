# dungeon life

Let me get this out of the way: I'm embarrassed to let people look at this code. My main excuse for the state it's in is that building up tech debt is a good idea for indies who don't know how long they're going to stick with a project, because it's a debt you probably never have to pay back. For me, the *most* embarrassing part are the Hero and Monster classes themselves; there is a lot of duplicate code in there. :scream:

The second most embarrassing part is that I switched to typescript partway through, learning typescript as I went, and the project is part lua, part n00b typescript.

But! I want to give back to the community, I want people to be able to do what they want with Dungeon Life, and I'm hoping that just maybe someone will make some cool stuff that they'll share back. So here goes.

And that said, there's more here I'm proud of than embarrassed of--for the most part it is data driven, and it doesn't do stateful things when not necessary, and those are usually my two priorities when architecting--so if you see something you don't like chances are I did it that way for a reason. Feel free to ask why!

And this is the first time I've released open soure in this manner - if there are common practices it would be nice for me to do let me know! A good place to ask would be on the Discord (https://discord.gg/7BQNSu which requires a Roblox username) or Twitter (https://twitter.com/happionlabs.)

# building

Anyways, here's how to build for the first time. Most of these instructions are adapted from (https://roblox-ts.github.io/docs/guides/github-installation) 

Open the rbxl/DungeonLifeOpenTemplate.rbxl in Roblox and publish it. Go to Game Settings and enable Studio API Access. 

Give me credit! Configure your place and in your description put: "Made with Dungeon Life by Jamie Fristrom: https://www.roblox.com/games/2184151436"

The place won't do anything by itself; you still need to build the source and suck it in with Rojo. How to use Rojo is beyond the scope of this article. (https://github.com/rojo-rbx/rojo)

I made my own clone of roblox-ts and used a submodule partly for the practice with submodules and partly as a way to make my own local fixes. 

>git submodule update --init --recursive

Overkill but that should get the roblox-ts branch to where I like

>npm install

>cd roblox-ts

>npm install typescript@3.3.4000

The version of roblox-ts I'm using doesn't compile with the latest typescript

>npm install

Gets the packages roblox-ts relies on

>npm link

I'm not entirely clear on what this step does. But now you can compile dungeon life

>tsc

(Might need to do npm link again here?  Not sure.)

Compiles roblox-ts 

>cd ..

>rbxtsc 

Then you should be able to use Rojo to transfer the source to the Place you've built, and it should work. 

If you have problems let me know but I can't promise speedy answers!

# it's not you it's me

Some current known problems: no custom animations are working, the localization is missing, and some of the images are missing. The in-app purchases are still wired to the original Game; you'll have to create your own in-app purchases and change the ids in order to let people buy things in yours.

If you spot other problems, it's probably because there are other issues running the code in a standalone place. You can check my test place https://www.roblox.com/games/4476008779: if the bug happens there too, it's not you, it's me. :)


