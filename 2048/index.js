import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function randomBoard(){
  let rndBrd = Array(16).fill(0);
  for(let i =0 ;i <4;i++){
    let index = Math.floor(Math.random()*16);
    
    rndBrd[index] += 2;
  }

  return rndBrd;
}

let e = React.createElement;


class Square extends React.Component {
  render() {
    return e('div',{className : "square",},
      //onClick : this.props.onClick,},
      `${this.props.value || ''}`);
  }
}

class Board extends React.Component {
  constructor(props){
    super(props);
    let gameBoard = randomBoard();
    this.state = {
      board: gameBoard,
    }
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }
  render() {
    let ls = [];
    ls.push(e('div',{className: "status",},'Welcome to 2048'));
    for(let i = 0 ; i < 4; i++){
      let rowDiv = [];
      for(let j = 0; j< 4; j++){
        rowDiv.push(e(Square,{value: this.state.board[i*4+j],
          onClick: () => {
            this.handleClick(i*4+j);
          },
        }));
      }
      ls.push(e('div',{className:"board-row"},rowDiv))
    }
    
    
    return e('div',null
    ,ls);
  }

  handleClick(i){
    const copyBoard = this.state.board.slice();
        
    copyBoard[i] = i+1;

    this.setState({
      board: copyBoard,
    });
  }
  
  
  
  
  handleKeyPress(evt){
    let copyBoard = this.state.board.slice();

    let newBoard = Array(16).fill(0);

    switch(evt.keyCode){
      case 65:
      case 37: 
        console.log('Left Shift');
        for(let i = 0;i<16;i++){
          newBoard[i-i%4] += copyBoard[i];
        }
        break;
      case 87:
      case 38:
        console.log('Up Shift');
        for(let i = 0;i<16;i++){
          newBoard[i%4] += copyBoard[i];
        }
        break;
      case 68:
      case 39:
        console.log('Right Shift');
        for(let i = 0;i<16;i++){
          let j;
          if(i <= 3){
            j = 3;
          } else if(i <= 7) {
            j = 7;
          } else if(i <= 11){
            j = 7;
          } else {
            j = 15;
          }
          newBoard[j] += copyBoard[i];
        }
        break;
      case 83:
      case 40:
        console.log('Down Shift')
        for(let i = 0;i<16;i++){
          let j = i;
          while(j<12){
            j+=4
          }
          newBoard[j] += copyBoard[i];
        }
        break;
      
    }
    
    let emptySpace = false;
    while(!emptySpace){
      let rand = Math.floor(Math.random()*16);
      if(newBoard[rand] === 0){
        newBoard[rand] += 2;
        emptySpace = true;
      }
    }
    this.setState({
      board: newBoard,
    });
  }
  
  componentDidMount(){
    document.addEventListener("keydown", this.handleKeyPress, false);
  }
}

let myBoard = e(Board,{},null);


ReactDOM.render(
 e(Board,{},null) 
  ,document.getElementById('root')
);




