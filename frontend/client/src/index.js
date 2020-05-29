import React from "react";
import ReactDOM from "react-dom";
import PhoneBook from './PhoneBook/index';
//import './index.css';

const App = () => {
  return (
    <div className="" style={{border:"1px solid black",margin:"2%"}}>
        <PhoneBook />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));

