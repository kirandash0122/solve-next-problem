import React, { useState } from 'react'
import NotificationBadge from 'react-notification-badge';
import '../css/card.css'
import { IconContext } from 'react-icons';
import { RiTimerLine } from 'react-icons/ri'
import { IoMdDoneAll } from 'react-icons/io'
import { MdSnooze } from 'react-icons/md'
import request from 'request';
require('dotenv').config()
const rankColor = difficulty => {
  if(difficulty === "easy") return "#F6AA4D"
  else if(difficulty === "medium") return "#E03737"
  else if(difficulty === "hard")  return "#3E7BE6"
}
const Card = props => {
  const [showButtons, setshowButtons] = useState(false)
  const [active, setActive] = useState(false)
  const [hide, setHide] = useState(false)
  const [hideAnimation, setHideAnimation] = useState(false)
  const handleSkip = () => {
    const choice = window.confirm(`Are you sure you want to skip the problem ${props.problem["name"]}? It will be considered as problem that you are able to solve!`)
    if(choice){
      const pid = props.problem["contestId"]+props.problem["index"]
      request(`http://localhost:8080/skip/${props.handle}/${pid}`, (err, res, body) => {
        const data = JSON.parse(res.body)
        if(data["errorMessage"] !== undefined)  window.alert(data["errorMessage"])
        else{
          setHideAnimation(true)
          setTimeout(() => setHide(true), 300)
        }
      })
    }
  }

  const handleSnooze = () => {
    const choice = window.confirm(`Snoozing problem: ${props.problem["name"]}\nIt will be available after 72 hours!`)
    if(choice){
      const pid = props.problem["contestId"]+props.problem["index"]
      request(`http://localhost:8080/later/${props.handle}/${pid}`, (err, res, body) => {
        const data = JSON.parse(res.body)
        if(data["errorMessage"] !== undefined)  window.alert(data["errorMessage"])
        else{
          setHideAnimation(true)
          setTimeout(() => setHide(true), 300)
        }
      })
    }
  }

  const checkSolved = () => {
    if(props.problem["solved"] && !hideAnimation){
      setHideAnimation(true)
      setHide(true)
    }
  }

  return(
    hide ? null :
    <tr key = {props.problem["name"]} className = {(hideAnimation?"hiddenCard ":"")}>
      {checkSolved()}
      <div className = {"card " + props.difficulty} onMouseEnter = {() => {setshowButtons(true); setTimeout(() => setActive(true), 1000)}} onMouseLeave = {() => {setshowButtons(false); setTimeout(() => setActive(false), 1000)}}>
        <span style = {{float: "left", width: (showButtons ? "70%" : "100%")}}>
          <a href = {active ? `https://codeforces.com/contest/${props.problem["contestId"]}/problem/${props.problem["index"]}` : "#"} target={active ? "_blank" : null} rel="noopener noreferrer">{props.problem["name"]}</a>
          {!showButtons ? null :
            <NotificationBadge count={props.problem["rating"]} style = {{backgroundColor: rankColor(props.difficulty), color: "#fff",margin:"2px"}}effect={["scale(1)"]}/>
          }
        </span>
        {!showButtons ? null :
          <span className = "buttons">
            <IconContext.Provider value = {{size: "1.25em", color: "whitesmoke"}}>
              <span title = "Timer" style = {{padding: "4px", cursor: "pointer"}} onClick = {() => props.startTimer(props.problem, props.difficulty)}>
                <RiTimerLine />
              </span>
              <span title = "Skip" style = {{padding: "4px", cursor: "pointer"}} onClick = {handleSkip}>
                <IoMdDoneAll />
              </span>
              <span title = "Snooze" style = {{padding: "4px", cursor: "pointer"}} onClick = {handleSnooze}>
                <MdSnooze />
              </span>
            </IconContext.Provider>
          </span>
        }
      </div>
    </tr>
  )
}

export default Card