import React from 'react';
import './css/App.css';
import Home from './components/home.js'
import { Helmet } from 'react-helmet'

const App = props => {
  return (
      <div className="App">
        <Helmet><title>Solve The Next !</title></Helmet>
        <Home/>
      </div>
  );
}

export default App;