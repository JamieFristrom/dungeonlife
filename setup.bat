echo on
:: Installing roblox-ts
git submodule update --init --recursive
:: Installing dungeon life packages
call npm install
cd roblox-ts
:: Installing roblox-ts packages
call npm install
:: Installing typescript version 3.3.4
call npm install typescript@3.3.4000
:: Compiling roblox-ts
call npx tsc
:: Setting up rbxtsc alias
call npm link
cd ..
