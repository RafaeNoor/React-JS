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
    return e('div',{className : "square",}
      //onClick : this.props.onClick,},
      ,`${this.props.value || ''}`);
  }
}

class Board extends React.Component {
  constructor(props){
    super(props);
    let gameBoard = randomBoard();
    this.state = {
      board: gameBoard,
      score: 0,
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
    ls.push(e('h2',{},`Score: ${this.state.score}`));
    
    
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

    let newBoard = game2048(copyBoard,evt.keyCode);
    let updatedScore = -2;
    newBoard.forEach(val => { updatedScore += val;});

    
    let emptySpace = false;
    while(!emptySpace){
      let rand = Math.floor(Math.random()*16);
      if(newBoard[rand] === 0){
        console.log(`inserting random 2 at ${Math.floor(rand/4)},${rand%4}`);
        newBoard[rand] += 2;
        emptySpace = true;
      }
    }
        this.setState({
      board: newBoard,
      score: updatedScore,
    });
  }
  
  componentDidMount(){
    document.addEventListener("keydown", this.handleKeyPress, false);
  }
}


ReactDOM.render(
 e(Board,{},null) 
  ,document.getElementById('root')
);


function game2048(board,keyCode){
  let newBoard = board //Array(16).fill(0);
  switch(keyCode){
    case 65:
    case 37: 
      console.log('Left Shift');
      for(let i =0;i<16;i++){
        let leftLim = i - (i%4);
        let tempPos = i;
        for(let j = i-1; j>= leftLim; j--){
          if(newBoard[j] && newBoard[j] == newBoard[tempPos]){
            newBoard[j] *= 2;
            newBoard[tempPos] = 0;
            break;
          } else if(newBoard[j]){ // value is different
            break;
          } else { // if zero valued
            newBoard[j] = newBoard[tempPos];
            newBoard[tempPos] = 0;
            tempPos = j;
          }
        }
      }
      break;
    case 87:
    case 38:
      console.log('Up Shift');
      for(let i = 0; i<16;i++){
        let upLim = i%4;
        let tempPos = i;
        for(let j = i-4; j >= upLim; j-=4){
          
          if(newBoard[j] && newBoard[j] == newBoard[tempPos]){
            newBoard[j] *= 2;
            newBoard[tempPos] = 0;
            break;
          } else if(newBoard[j]){ // value is different
            break;
          } else { // if zero valued
            newBoard[j] = newBoard[tempPos];
            newBoard[tempPos] = 0;
            tempPos = j;
          }

        }
      }
      break;
    case 68:
    case 39:
      console.log('Right Shift');
      for(let i=15;i>=0;i--){
        let rightLim = i - (i%4) +3;
        let tempPos = i;
        for(let j = i+1; j <= rightLim; j++){
          if(newBoard[j] && newBoard[j] == newBoard[tempPos]){
            newBoard[j] *= 2;
            newBoard[tempPos] = 0;
            break;
          } else if(newBoard[j]){ // value is different
            break;
          } else { // if zero valued
            newBoard[j] = newBoard[tempPos];
            newBoard[tempPos] = 0;
            tempPos = j;
          }
        }
      }
      break;
    case 83:
    case 40:
      console.log('Down Shift')
      for(let i = 15;i>=0;i--){
        let downLim = i;
        let tempPos = i;
        while(downLim <12){
          downLim += 4;
        }
        for(let j = i+4; j <= downLim; j += 4){
          if(newBoard[j] && newBoard[j] == newBoard[tempPos]){
            newBoard[j] *= 2;
            newBoard[tempPos] = 0;
            break;
          } else if(newBoard[j]){ // value is different
            break;
          } else { // if zero valued
            newBoard[j] = newBoard[tempPos];
            newBoard[tempPos] = 0;
            tempPos = j;
          }

        }
      }
      break;
    
  }

  return newBoard;
}





