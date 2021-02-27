import React, { useState } from 'react'
import { IconContext } from 'react-icons'
import { GiCancel } from 'react-icons/gi'
import { AiOutlineSend, AiOutlineFileDone, AiOutlineEye } from 'react-icons/ai'
import '../css/timer.css'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import request from 'request'
require('dotenv').config()
const children = ({ remainingTime }) => {
  if(remainingTime===0){
    window.alert("Your time is up!")
    return <div style={{fontSize:"2em"}}>Your time is up!!</div>
  }
  const minutes = Math.floor(remainingTime / 60)
  const seconds = remainingTime%60
  let flag=""
  if(seconds < 10) flag="0"
  else flag=""
  const calculated= `${minutes}:${flag}${seconds}`
  return(
        <div style={{fontSize:"2em"}}>
          {calculated}
        </div>
      );
}
const start = (setPlaying, problem) => {
  setPlaying(true)
  window.open(`https://codeforces.com/contest/${problem["contestId"]}/problem/${problem["index"]}`, "_blank")
}

const verify = (handle, diff, cid, index, setPlaying, solved) => {
  request(`http://localhost:8080/verify/${handle}/${cid}/${index}`, (err, res, body) => {
    const data = JSON.parse(res.body)
    if(data["errorMessage"] !== undefined)
      window.alert(data["errorMessage"])
    else if(data["verified"]){
      setPlaying(false)
      solved(diff, cid, index)
    }
    else window.alert("Accepted submission not found!")
  })
}

const Timer = props => {

  const [playing, setPlaying] = useState(false)
  const [showTags, setShowTags] = useState(false)

  return(
    <div className = "timer-field">
      <div title = "Cancel">
        <IconContext.Provider value = {{size: "2em", color: "orange"}}>
          <span style = {{cursor: "pointer"}} onClick = {props.stopTimer}><GiCancel /></span>
        </IconContext.Provider>
      </div>
      <div className = "problem-fields">
        <div>
          <table><tbody>
            <tr>
              <td className = "field">Problem Name: </td>
              <td className = "data">
                <a style={{color:"orange"}} href = {`https://codeforces.com/contest/${props.problem["contestId"]}/problem/${props.problem["index"]}`} target="_blank" rel="noopener noreferrer">
                  {props.problem["name"]} ({props.problem["contestId"]}{props.problem["index"]})
                </a>
              </td>
            </tr>
            <tr>
              <td className = "field">Problem Tags: </td>
              <td className = "data" style = {{color: "orange"}}>
                {showTags ?
                  props.problem["tags"].map((tag, idx) => (tag + (idx+1 < props.problem["tags"].length ? " | " : "")))
                  :
                  <IconContext.Provider value = {{size: "2em"}}>
                    <span style = {{cursor: "pointer"}} onClick = {() => setShowTags(true)}>
                      <AiOutlineEye />
                    </span>
                  </IconContext.Provider>
                }
              </td>
            </tr>
            <tr>
              <td className = "field">Solved by: </td>
              <td className = "data">{props.problem["solvedBy"]}</td>
            </tr>
          </tbody></table>
        </div>
        <div style = {{padding: "10px"}}>
          <CountdownCircleTimer
            isPlaying = {playing}
            size = {250}
            duration={props.problem["practiceTime"] *60}    //to convert in seconds
             isLinearGradient
             trailColor = "#3b4b5c"
             colors={[["#ebb628"], ["#fcad44"]]}
            onComplete={() => {
              setPlaying(false)
              return [false, 1500]
            }}
          >
            {children}
          </CountdownCircleTimer>
        </div>
        <span title = {playing ? "Verify Submission" : "Solve"}>
          <IconContext.Provider value = {{color: "orange", size: "2.5em"}}>
   
            {playing ? <AiOutlineFileDone onClick = {() => verify(props.handle, props.problem["difficulty"], props.problem["contestId"], props.problem["index"], setPlaying, props.solved)} style = {{cursor: "pointer"}} />
             :
             <AiOutlineSend onClick = {() => start(setPlaying, props.problem)} style = {{cursor: "pointer"}} />
             }
          </IconContext.Provider>
        </span>
      </div>
    </div>
  )
}

export default Timer