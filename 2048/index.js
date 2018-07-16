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

    /*let newBoard = Array(16).fill(0);

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
          let j = i + (4-i%4)-1;
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
      
    }*/

    let newBoard = game2048(copyBoard,evt.keyCode);
    
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


ReactDOM.render(
 e(Board,{},null) 
  ,document.getElementById('root')
);


function game2048(board,keyCode){
  let newBoard = Array(16).fill(0);
  newBoard = board;
  switch(keyCode){
    case 65:
    case 37: 
      console.log('Left Shift');
      for(let i = 15;i>=0;i--){
        if(i%4!=0){  //non left most column
          if(board[i] && board[i] == board[i-1]){
            newBoard[i-1] = board[i]*2;
            newBoard[i] = 0;
            board[i] = 0;
          } else if(board[i-1] == 0) {
            newBoard[i-1] = board[i];
            board[i] = 0;
          }
        }
      }
      break;
    case 87:
    case 38:
      console.log('Up Shift');
      for(let i = 15;i>=0;i--){
        if(i>3){
          if(board[i] && board[i-4] == board[i]){
            newBoard[i-4] = board[i-4]*2;
            newBoard[i] = 0;
            board[i] = 0;

          } else if(board[i-4] == 0){
            newBoard[i-4] = board[i];
            board[i] = 0;
          }
        }
      }
      break;
    case 68:
    case 39:
      console.log('Right Shift');
      for(let i = 0;i<16;i++){
        let j = i + (4-i%4)-1;
        if(i != j){// not right most column
          if(board[i] && board[i+1] == board[i]){
            newBoard[i+1] = board[i+1]*2;
            //newBoard[i] = 0;
            board[i] = 0; 
          } else if( board[i+1] == 0){
            newBoard[i+1] = board[i];
            board[i] = 0;
          }
        }
      }
      break;
    case 83:
    case 40:
      console.log('Down Shift')
      for(let i = 0;i<16;i++){
        //let j = i;
        //while(j<12){
        //  j+=4
        //}
        if(i < 12){
          if(board[i] && board[i+4] == board[i]){
            newBoard[i+4] = board[i+4]*2;
            board[i] = 0;
            newBoard[i] = 0;
          } else if( board[i+4] == 0){
            newBoard[i+4] = board[i];
            board[i] = 0;
          }
        }
      }
      break;
    
  }

  return newBoard;
}





