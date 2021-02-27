import React, { Component } from 'react'
import NotificationBadge,{Effect} from 'react-notification-badge';
import { MdRefresh } from 'react-icons/md'
import { IconContext } from 'react-icons';
import { FiSearch , FiSettings} from 'react-icons/fi'
import {AiOutlineUserDelete} from 'react-icons/ai';
import Card from './card.js'
import Timer from './timer';
import '../css/home.css'
const request = require('request')
require('dotenv').config()
const rankColor = rating => {
  if(rating < 1200) return "whitesmoke"
  else if(rating < 1400) return "#36993f"
  else if(rating < 1600) return "cyan"
  else if(rating < 1900) return "blue"
  else if(rating < 2100) return "violet"
  else if(rating < 2400) return "orange"
  else return "#E03737"
}
class Home extends Component{
  constructor(props) {
    super(props);
    this.state = {
      userHandle : "",
      userRating : 0,
      userFName : "",
      userLName : "",
      userRank : "",
      userPic : "",
      userOrganization : "",
      counts : { easy : 3, medium : 4, hard : 2 },
      showProblemPage : false,
      problemSet : {},
      showStopwatch : false,
      ongoingProblem : {},
    }
  }
  
  handleSearch = event => {
    this.setState({problemSet : {}})
    const url = `http://localhost:8080/suggest/${this.state.userHandle.trim()}/${this.state.counts.easy}/${this.state.counts.medium}/${this.state.counts.hard}` + (this.state.ratingLow ? `/${this.state.ratingLow}/${this.state.ratingHigh}` : ``)
    request(url, (error, response, body) => {
      const data = JSON.parse(response.body)
      if(data["errorMessage"] !== undefined){
        window.alert(data["errorMessage"])
        this.setState({userHandle: "", problemSet: {}})
      }
      else{
        for(var key in data)  this.setState({[key] : data[key]})
        this.setState({showProblemPage: true})
      }
    })
    if(event) event.preventDefault()
  }
  handleHandleInput = event => this.setState({userHandle: event.target.value})

  handleReset = () => {
    this.setState({showProblemPage: false,showStopwatch:false})
    setTimeout(() => this.setState({userHandle: "", userFName: "", userLName: "", userRating: 0, userRank: "", userPic: "", userOrg: "", problemSet: {}}), 1000)
  }

  startTimer = (problem, diff) => {
    const dProb = problem
    dProb["difficulty"] = diff
    this.setState({showProblemPage:false,showStopwatch: true, ongoingProblem: dProb})
  }

  stopTimer = () => this.setState({showStopwatch: false ,showProblemPage:true})

  solved = (diff, cid, index) => this.state.problemSet[diff].forEach((prob, idx) => {
    if(prob["contestId"] === cid && prob["index"] === index){
      const newData = this.state.problemSet
      newData[diff][idx]["solved"] = true
      this.setState({problemSet: newData})
    }
  })

  render(){
    return (
      <div className = "home"> 
        {!this.state.showProblemPage && !this.state.showStopwatch ? 
        <div className="hello">
          <div>
        <form onSubmit = {this.handleSearch} >
          <div className = "search-box">
            <input className = "search-input" spellCheck = {false} required name = "handle" value = {this.state.userHandle} onChange = {this.handleHandleInput} placeholder = "Codeforces Handle" />
            <button type = "submit" className = "search-button">
              <IconContext.Provider value = {{color: "orange", size: "2.5em"}}><FiSearch/></IconContext.Provider>
            </button> 
          </div>
        </form>
        
        </div>
        <div data-text="Welcome..." className="welcome">Welcome...</div>
        </div>

        :null}
      {!this.state.showProblemPage ? null : 
        <div className = "full-page show-page" id = "#main">
          
          <div>
            <img className = "profile-pic" src = {`https:${this.state.userPic}`} alt = {this.state.userHandle} />
            <span className = "user">
              
              <span><a href = {`http://codeforces.com/profile/${this.state.userHandle}`} target="_blank" rel="noopener noreferrer" style = {{color: rankColor(this.state.userRating), textDecoration: "none"}}>{this.state.userHandle}</a></span>
              <span className = "ratingBadge"><NotificationBadge count={this.state.userRating} style = {{backgroundColor: rankColor(this.state.userRating), color: "#1d1e22", top: "0", right: "0"}} effect={Effect.SCALE}/></span>
              
              <span title = "Reset user" className = "reset-button" onClick = {this.handleReset}>
                <IconContext.Provider value = {{color: "orange", size: "2em"}}><AiOutlineUserDelete/></IconContext.Provider>
              </span>
            </span>
            <div style = {{fontSize: "18px"}}>{this.state.userFName}  {this.state.userLName}</div>
            <span style = {{fontSize: "18px"}}>{this.state.userOrganization}</span>
          </div>

          {(this.state.problemSet.easy === undefined) ? null : <>
            <h2 style = {{color: "orange"}}>Unsolved problems from your last contest</h2>
            <div className = "Suggestions1">
              {this.state.problemSet.solveNext.sort((a, b) => a["solvedBy"] < b["solvedBy"]).map(problem => (
                <Card handle = {this.state.userHandle} problem = {problem} difficulty = "solveNext" startTimer = {this.startTimer} />
              ))}
            </div>
            <h2 style = {{color: "orange"}}>Suggested problems from contests you have taken part in</h2>
            <div>
              <span>
                {this.state.problemSet.pastContest.easy.map(problem => (
                  <Card handle = {this.state.userHandle} problem = {problem} difficulty = "easy" startTimer = {this.startTimer} />
                ))}</span>
              <span>
                {this.state.problemSet.pastContest.medium.map(problem => (
                  <Card handle = {this.state.userHandle} problem = {problem} difficulty = "medium" startTimer = {this.startTimer} />
                ))}</span>
              <span>
                {this.state.problemSet.pastContest.hard.map(problem => (
                  <Card handle = {this.state.userHandle} problem = {problem} difficulty = "hard" startTimer = {this.startTimer} />
                ))}</span>
            </div>
            <div>
              <h2 style = {{color: "orange"}}>Suggested Practice problems from past contests
              <a href = "#settings" className = "seticon"><IconContext.Provider value = {{size: "1em", color: "orange"}}>
              <FiSettings/>
              </IconContext.Provider></a></h2>
            </div>
            {this.state.counts.easy+this.state.counts.medium+this.state.counts.hard > 0 && this.state.ratingLow <= this.state.ratingHigh? 
            <div className = "Suggestions">
              <span>
                {this.state.problemSet.easy.map(problem => (
                  <Card handle = {this.state.userHandle} problem = {problem} difficulty = "easy" startTimer = {this.startTimer} />
                ))}</span>
              <span>
                {this.state.problemSet.medium.map(problem => (
                  <Card handle = {this.state.userHandle} problem = {problem} difficulty = "medium" startTimer = {this.startTimer} />
                ))}</span>
              <span>
                {this.state.problemSet.hard.map(problem => (
                  <Card handle = {this.state.userHandle} problem = {problem} difficulty = "hard" startTimer = {this.startTimer} />
                ))}</span>
            </div>
            :
            <div><h3>No Problems Found!</h3></div>
            }</>
            }
        </div>}
        {!this.state.showStopwatch ? null :
          <Timer problem = {this.state.ongoingProblem} solved = {this.solved} stopTimer = {this.stopTimer} handle = {this.state.userHandle}/>
        }
        <div id="settings" className="popup">
          <a href="#main" className="close">&times;</a>
          <h3 style = {{color: "orange"}}>Settings</h3>
          Rating Range :&nbsp;
          <input className = "toggler" type = "number" name = "low"  step = "50" required value = {this.state.ratingLow} onChange = {e => this.setState({ratingLow: e.target.value})} />
          -
          <input className = "toggler" type = "number" name = "high" step = "50" required value = {this.state.ratingHigh} onChange = {e => this.setState({ratingHigh: e.target.value})} />
          <hr />
          Problem Counts :&nbsp;
          <input className = "toggler" type = "number" name = "easy" required value = {this.state.counts.easy} onChange = {e => this.setState({counts: {...this.state.counts, easy : e.target.value}})} />
          <input className = "toggler" type = "number" name = "medium" required value = {this.state.counts.medium} onChange = {e => this.setState({counts: {...this.state.counts, medium : e.target.value}})} />
          <input className = "toggler" type = "number" name = "hard" required value = {this.state.counts.hard} onChange = {e => this.setState({counts: {...this.state.counts, hard : e.target.value}})} />
          <hr />
          <div style = {{cursor: "pointer"}} onClick = {() => {this.handleSearch(); window.history.replaceState(null, null, "#main")}}>
          <IconContext.Provider value = {{size: "50px", color: "orange"}}>
            <MdRefresh />
          </IconContext.Provider></div>
          <div style = {{fontSize: "14px"}}>Click to Reload Problems</div>
        </div>
      </div>
    )
  }
}

export default Home