// why why why
import { AnalyticsClient } from "ReplicatedStorage/TS/AnalyticsClient"

let feedbackPanel = script.Parent!.Parent! as Frame

let main = feedbackPanel.WaitForChild("Main") as Frame
let starsFrame = main.WaitForChild("Stars") as Frame
let stars = starsFrame.GetChildren().filter(element => element.IsA("ImageButton")) as ImageButton[]

let currentStar = -1

function parseNumber(str: string) {
    return <number><unknown>str
}

function starNum(star: ImageButton) {
    return parseNumber(star.Name.sub(4))
}

let done = false
stars.forEach(star => {
    let myStarNum: number = starNum(star)
    star.MouseEnter.Connect(() => {
        currentStar = myStarNum
        stars.forEach(star => {
            if (starNum(star) < myStarNum) {
                star.Image = "rbxassetid://198997297"
            }
        })
    })

    star.MouseLeave.Connect(() => {
        if (currentStar === myStarNum) {
            currentStar = -1
            stars.forEach(star => {
                star.Image = "rbxassetid://65982508"
            })
        }
    })

    star.MouseButton1Click.Connect(() => {
        if (!done) {
            done = true
            currentStar = -1  // trick it into not un-highlighting
            AnalyticsClient.ReportEvent("PlayerRating", "", "", myStarNum)
            stars.forEach(star => {
                let thisStar: number = starNum(star)
                if (thisStar <= myStarNum) {
                    star.Image = "rbxassetid://198997297"
                }
            })
            wait(1)
            feedbackPanel.Parent = undefined
        }
    })
})

