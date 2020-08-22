import { DebugXL, LogArea } from './DebugXLTS'
print('MessageGui: DebugXL required')
import { RunService, Workspace, Players, LocalizationService } from "@rbxts/services";
print('MessageGui: rbx-services required')
import { GuiXL } from './GuiXLTS';
print('MessageGui: GuiXL required')
import { Localize } from 'ReplicatedStorage/TS/Localize'
print('MessageGui: Localize required')

import { FlexToolClient } from 'ReplicatedStorage/TS/FlexToolClient'
print('MessageGui: FlexToolClient required')
import { FlexTool } from './FlexToolTS';
import { GameplayTestUtility } from './GameplayTestUtility';
print('MessageGui: FlexTool required')

import * as InventoryClient from 'ReplicatedStorage/Standard/InventoryClientStd'

let levelUpText = Localize.formatByKey("LevelUp")
warn("LevelUp key translates to: " + levelUpText)

let timeoutDuration = 90

DebugXL.Assert(RunService.IsClient())

interface MessageI {
    messageS: string
    displayDelay: number
    modalB: boolean
    needsAckB: boolean
    answer1S?: string
    answer2S?: string
    messagebuttonclick: string
    ackFunc?: (answer: string) => void
    audioAsset?: string
}

// fuck decoupling, I'm tired
let voiceoverAssets = new Map<string, string>()
voiceoverAssets.set('TutorialWelcome2', 'rbxassetid://3578563593')  // TutorialWelcomeToDungeonLifeFull
voiceoverAssets.set('TutorialBecomeMonster', 'rbxassetid://3602250931') // TutorialBecomeMonster
voiceoverAssets.set('TutorialBlueprintCount', 'rbxassetid://3578559459')  // TutorialYouDontUseUpBlueprints
voiceoverAssets.set('TutorialBlueprintsCrate', 'rbxassetid://3602251415') // TutorialBlueprintsCrate
voiceoverAssets.set('TutorialDungeonLord', 'rbxassetid://3602252023') // TutorialDungeonLord
voiceoverAssets.set('TutorialHeroPrep', 'rbxassetid://3578558222')  // TutorialTheMonstersGetSomeTime
voiceoverAssets.set('TutorialOnMonsters', 'rbxassetid://3578557778')  // TutorialMonstersStartWeaker
voiceoverAssets.set('TutorialSpawn', 'rbxassetid://3602252655') // TutorialSpawn
voiceoverAssets.set('TutorialStore', 'rbxassetid://3578556234') // TutorialDifferentBlueprints
voiceoverAssets.set('TutorialTreasureChests', 'rbxassetid://3578556789') // TutorialIfAHeroOpensATreasureChest
voiceoverAssets.set('TutorialUnderhaven', 'rbxassetid://3602253347') // TutorialUnderhaven


let messageQueueA = new Array<MessageI>()

while (!Players.LocalPlayer) { wait(0.1) }
print('MessageGui: LocalPlayer ready')

let playerGui = Players.LocalPlayer.WaitForChild('PlayerGui')
print('MessageGui: PlayerGui ready')

let audio = playerGui.WaitForChild('Audio')
let vo = audio.WaitForChild('VO') as Sound

let messageGuiConfiguration = playerGui.WaitForChild('MessageGuiConfiguration')
print('MessageGui: MessageGuiConfiguration ready')

let starFeedbackFrameTemplate = messageGuiConfiguration.WaitForChild('StarFeedbackFrameTemplate') as Frame

let messagebuttonclick = ''

// wishlist displayDelay and modalB should be optional parameters but for some reason it was tricky and so I'm leaving it typed
// even though lua often sends nil in

class MessageGuiC {
    DisplayMessageWait() {
        let message = messageQueueA.shift();
        DebugXL.Assert(message !== undefined)
        if (!message) return

        this.ShowMessageWait(message)
    }

    // _needsAckB defaults to false
    PostMessage(_messageS: string, _needsAckB: boolean, _displayDelay: number, _modalB: boolean, _answer1S?: string, _answer2S?: string, _ackFunc?: (answer: string) => void, _audioAsset?: string) {
        //print( 'PostMessage. '+_messageS )
        //print( debug.traceback())
        DebugXL.Assert(!_displayDelay || _displayDelay < 0.05)  // it's ! a duration to put up, it's the delay between each character appearing
        if (_needsAckB === undefined) _needsAckB = false
        if (messageQueueA.size() === 0 || _messageS !== messageQueueA[0].messageS) {
            let newmsg =
            {
                messageS: _messageS,
                needsAckB: _needsAckB,
                displayDelay: _displayDelay,
                modalB: _modalB,
                answer1S: _answer1S,
                answer2S: _answer2S,
                messagebuttonclick: '',
                ackFunc: _ackFunc,
                audioAsset: _audioAsset
            }
            messageQueueA.push(newmsg)
            if (messageQueueA.size() > 1) {
                let messageDump = DebugXL.DumpToStr(messageQueueA)
                warn("Message queue expanding\n" + messageDump)
            }
            return newmsg
        }
        else {
            //print( 'message duplicate' )
            return messageQueueA[0]  // this will sometimes mean, if for some reason you've ShownMessageANdWaitResponse twice for the same message, that you'll have two threads waiting on the answer, and I *think* that's ok
        }
    }

    // only works with parameterless messages obv
    PostMessageByKey(_messageKeyS: string, _needsAckB: boolean, _displayDelay: number, _modalB: boolean, _answer1S?: string, _answer2S?: string, ackFunc?: (answer: string) => void) {
        let _messageS = Localize.formatByKey(_messageKeyS)
        let _audioAsset = voiceoverAssets.get(_messageKeyS)
        this.PostMessage(_messageS, _needsAckB, _displayDelay, _modalB, _answer1S, _answer2S, ackFunc, _audioAsset)
    }

    PostParameterizedMessage(_messageKeyS: string, _args: { [k: string]: string | number }, _needsAckB: boolean, _displayDelay: number, _modalB: boolean) {
        let _messageS = Localize.formatByKey(_messageKeyS, _args)
        this.PostMessage(_messageS, _needsAckB, _displayDelay, _modalB)
    }

    private ShowMessageWait(message: MessageI) {
        // this appears on top of whatever is already there and returns your answer
        messagebuttonclick = ''

        let localeId = LocalizationService.RobloxLocaleId.sub(0, 1)
        if (message.audioAsset && localeId === 'en') {
            vo.SoundId = message.audioAsset
            vo.Play()
        }

        if (message.messageS === '!StarFeedback' || message.messageS === '!StarFeedbackRepeat') {
            let starFeedbackFrame = starFeedbackFrameTemplate.Clone()
            let messageObj = starFeedbackFrame.WaitForChild('Main').WaitForChild('Message') as TextLabel
            messageObj.Text = message.messageS === '!StarFeedback' ?
                'How are you enjoying Dungeon Life so far?' :
                'How are you enjoying Dungeon Life lately?'
            starFeedbackFrame.Name = 'StarFeedbackFrame'
            starFeedbackFrame.Visible = true
            starFeedbackFrame.Parent = messageGuiConfiguration
            starFeedbackFrame.GetPropertyChangedSignal('Visible').Wait()
            assert(!starFeedbackFrame.Visible)
        }
        else {
            let newMessage = message.needsAckB ?
                messageGuiConfiguration.WaitForChild<Frame>('MessageFrameTemplate').Clone() :
                messageGuiConfiguration.WaitForChild<Frame>('MessageFrameNoAckTemplate').Clone()

            newMessage.Name = 'MessageFrame';

            //print( 'ShowMessage '+message.messageS );

            newMessage.FindFirstChild<Script>('MainScript')!.Disabled = false
            let messageMainObj = newMessage.WaitForChild<Frame>('Main').WaitForChild<TextLabel>('Message')
            messageMainObj.Text = message.messageS
            newMessage.FindFirstChild<NumberValue>('DisplayDelay')!.Value = message.displayDelay
            newMessage.FindFirstChild<BoolValue>('Modal')!.Value = message.modalB

            if (message.needsAckB) {
                let done = newMessage.FindFirstChild('Main')!.FindFirstChild('Done') as TextButton
                done.Visible = true
                if (message.answer1S)
                    done.Text = message.answer1S
            }
            else {
                GuiXL.shadowText(messageMainObj, 4)
            }

            if (message.answer2S) {
                let no = newMessage.FindFirstChild('Main')!.FindFirstChild('No') as TextButton
                no.Visible = true
                no.Text = message.answer2S
            }

            newMessage.Visible = true
            newMessage.Parent = messageGuiConfiguration

            let timeout = tick() + timeoutDuration
            if (message.needsAckB) {
                while (messagebuttonclick === '') {
                    if (tick() > timeout) {
                        DebugXL.Error("Waited too long for ack")
                        break
                    }
                    wait(0.1)
                }
                message.messagebuttonclick = messagebuttonclick
            }
            else {
                let timeout = tick() + math.max(1, 10 * message.messageS.size() / 120) // at 5, it would disappear just as *I* finished reading it, and I figure most Robloxians don't read as fast as me
                while (messagebuttonclick === "") {
                    if (tick() > timeout) {
                        break
                    }
                    wait(0.1)
                }
            }
            if (message.ackFunc)
                message.ackFunc(messagebuttonclick)
            newMessage.Destroy()
        }
        //print( 'Done showing message '+message.messageS )

        return messagebuttonclick
    }


    // puts message on queue and waits until message has been dealt with even if other messages are ahead of us
    ShowMessageAndAwaitResponse(_messageS: string, _needsAckB: boolean, _displayDelay: number, _modalB: boolean, _answer1S?: string, _answer2S?: string) {
        let message = this.PostMessage(_messageS, _needsAckB, _displayDelay, _modalB, _answer1S, _answer2S)
        DebugXL.Assert(message !== undefined)
        if (!message) return []

        while (message.messagebuttonclick === '') wait()
        // this is a not-smart return value, off by one errors easy and why did I do it this way?
        // not going to change it though because lua code rlies on it
        return [message.messagebuttonclick]
    }


    MessageButtonClick(buttonText: string) {
        messagebuttonclick = buttonText
    }
}

function processArgs(_args: { [k: string]: string | number | FlexTool })  // array or table of strings or undefined
{
    let args = undefined
    if (typeIs(_args, 'table')) {
        args = _args as { [k: string]: string | FlexTool }
        for (let k of Object.keys(args)) {
            if (k === 'class') {
                args[k] = Localize.formatByKey(args[k] as string)
            }
            else if (k === 'item') {
                // turns a flextool into a string in-place. gag
                args[k] = FlexToolClient.getReadableName(args[k] as FlexTool)
            }
        }
    }
    args = _args as { [k: string]: string | number }
    return args
}

export let MessageGui = new MessageGuiC()  // this has to come before below Waits otherwise a message might be posted before we've set the pointer

let messageRE = Workspace.WaitForChild('Standard').WaitForChild('MessageGuiXL').WaitForChild('MessageRE') as RemoteEvent
messageRE.OnClientEvent.Connect(function (_messageKeyS: string, _args: { [k: string]: string | number | FlexTool }, _needsAckB: boolean, _displayDelay: number, _modalB: boolean) {
    let args = processArgs(_args)
    let messageKeyS = _messageKeyS as string
    let _messageS = messageKeyS.sub(0, 0) === '!' ? messageKeyS : Localize.formatByKey(_messageKeyS as string, args)
    MessageGui.PostMessage(_messageS, _needsAckB as boolean, _displayDelay as number, _modalB as boolean)
})


// for modal dialog boxes
// making this a remote function was a bad idea - if anything goes wrong, or the player just disconnects, error
let queryBoxRE = Workspace.WaitForChild('Standard').WaitForChild('MessageGuiXL').WaitForChild('QueryBoxRE') as RemoteEvent
queryBoxRE.OnClientEvent.Connect(function (_queryId: number,
    _messageKeyS: string,
    _args: { [k: string]: string | number | FlexTool },
    _needsAckB: boolean,
    _displayDelay: number,
    _modalB: boolean,
    _answer1S: string,
    _answer2S: string) {
    let args = processArgs(_args)
    let _messageS = Localize.formatByKey(_messageKeyS, args)
    queryBoxRE.FireServer(_queryId, 'received')
    let result = MessageGui.ShowMessageAndAwaitResponse(_messageS as string, _needsAckB as boolean, _displayDelay as number, _modalB as boolean, _answer1S as string | undefined, _answer2S as string | undefined)
    queryBoxRE.FireServer(_queryId, result)
})


let stillAlive = tick()
let myMessagePumpThreadId = 0
// message pump

function messagePump() {
    let localMessagePumpId = myMessagePumpThreadId
    GuiXL.waitForLoadingGoo()
    while (true) {
        if (messageQueueA.size() >= 1) {
            let character = Players.LocalPlayer!.Character
            if (character) {
                if (!character.FindFirstChild('HideCharacter'))  // either we're in first load or teleporting out is currently what that means
                {
                    MessageGui.DisplayMessageWait()
                }
            }
        }
        if (myMessagePumpThreadId !== localMessagePumpId) {
            DebugXL.Error("Message pump recognized it was no longer needed")
            break
        }
        wait(0.25)
        stillAlive = tick()
    }
}

function messagePumpHealthWatcher() {
    // somewhere somehow the messages stop working and I haven't tracked it down yet. in the interim, this
    // will rekindle the message pump if it chokes
    while (true) {
        wait(1.1)
        if (tick() > stillAlive + timeoutDuration + 15) {
            let messageDump = DebugXL.DumpToStr(messageQueueA)
            DebugXL.Error("Message pump died\n" + messageDump)
            messageQueueA = new Array<MessageI>()
            myMessagePumpThreadId++
            spawn(messagePump)
        }
    }
}

spawn(messagePump)
spawn(messagePumpHealthWatcher)


