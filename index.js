const canvas =  document.getElementById("canvas");
const button = document.getElementById("button");
const toggleButton = document.getElementById('toggleButton');
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#0000F8";
canvas.width = 600;
canvas.height = 600
const BOARD_ROW = 32;
const BOARD_COL = BOARD_ROW;
const CELL_WIDTH = canvas.width/BOARD_COL;
const CELL_HEIGHT = canvas.height/BOARD_ROW;
const DEAD = 0;
const ALIVE = 1;
let isRunning = false;
let timeoutId;
let nextboard = [];
let board = [];
function CreateBoard(){
    const board = [];
    for(let i = 0; i< BOARD_ROW ; i++){
        board.push(new Array(BOARD_COL).fill(DEAD))
    }
    return board;
}
nextboard = CreateBoard();
board = CreateBoard();

function mod(a, b){
    return (a%b + b)%b
}
function render(board1){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, canvas.width,canvas.height);
    for(let r = 0; r < BOARD_ROW; r++){
        for(let c = 0; c < BOARD_COL; c++){
            if(board1[r][c] === ALIVE){
                x = r*CELL_WIDTH;
                y = c*CELL_HEIGHT;
                ctx.fillStyle = "#0000F8";
                ctx.fillRect(x,y, CELL_WIDTH,CELL_HEIGHT);
            }
        }
    }
}
canvas.addEventListener("click" ,(e) =>{
    const row = Math.floor(e.offsetX/CELL_HEIGHT);
    const col = Math.floor(e.offsetY/CELL_WIDTH);
    if(board[row][col] === ALIVE){
        board[row][col] = DEAD;
    }else board[row][col] = ALIVE;
    render(board);
    console.log(CountNeighbor(row,col))
})
function CountNeighbor(r ,c){
    let aliveNeighbor = 0;
    for (let dy = -1; dy <= 1; ++dy) {
        for (let dx = -1; dx <= 1; ++dx) {
            if (dy != 0 || dx != 0) {
                const y = mod(c + dy, BOARD_COL);
                const x = mod(r + dx, BOARD_ROW);
                aliveNeighbor += board[x][y];
            }
        }
    }
    return aliveNeighbor;
}
function checkneighbor(){
    for(let r = 0; r < BOARD_ROW; r++){
        for(let c = 0; c < BOARD_COL; c++){
            
            let currNeighbor = CountNeighbor(r,c);
            if(board[r][c] === DEAD){
                if(currNeighbor === 3){
                    nextboard[r][c] = ALIVE;
                }else nextboard[r][c] = DEAD;
            }
            else if(board[r][c] === ALIVE){
                if(currNeighbor === 2 || currNeighbor === 3){
                    nextboard[r][c] = ALIVE;
                }else nextboard[r][c] = DEAD;
            }
        }
    }
}
function play() {
    if (!isRunning) {
      isRunning = true;
      main();
    }
  }
  

function stop() {
    if (isRunning) {
        isRunning = false;
        clearTimeout(timeoutId);
    }
}
function toggle() {
    if (isRunning) {
      stop();
      button.disabled = false;
    } else {
      play();
      button.disabled = true;
    }
  }
button.addEventListener("click", (e) =>{
    main()
})
toggleButton.addEventListener('click', toggle);
function main(){
    checkneighbor();
    [board,nextboard] = [nextboard,board];
    render(board);
    if (isRunning) {
        timeoutId = setTimeout(main, 100);
    }
}
