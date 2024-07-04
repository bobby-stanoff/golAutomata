const nextbutton = document.getElementById("button");
const input = document.getElementById("inputfile");
const toggleButton = document.getElementById('toggleButton');
const clearButton = document.getElementById('clear');
const selectCAButton = document.getElementById('selectCA');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500
const BOARD_ROW = 100;
const BOARD_COL = BOARD_ROW;
const CELL_WIDTH = canvas.width/BOARD_COL;
const CELL_HEIGHT = canvas.height/BOARD_ROW;
const DEAD = 0;
const ALIVE = 1;

function AutomataState(options){
    this.color = options.color;
    this.default = options.default;   
    this.transition = options.transition || {}
}
function Automata(){
    this.states = [];
    this.numberOfStates = 0;
    this.addState = function(newState) {
        this.states.push(newState);
        this.numberOfStates++;
    };
}
const AUTOMATA_GOL = new Automata();
AUTOMATA_GOL.addState(new AutomataState(
    {
        'color': "black",
        'default': 0,
        'transition': {
            '53' : 1
        }
    }
))
AUTOMATA_GOL.addState(new AutomataState(
    {
        'color': "blue",
        'default': 0,
        'transition': {
            '53' : 1,
            '62' : 1
        }

    }
))

const AUTOMATA_BB = new Automata();
AUTOMATA_BB.addState(new AutomataState(
    {
        "transition": {
            "026": 1,
            "125": 1,
            "224": 1,
            "323": 1,
            "422": 1,
            "521": 1,
            "620": 1,
        },
        "default": 0,
        "color": "#000000",
    }
))
AUTOMATA_BB.addState(new AutomataState(
    {
        "transition": {},
        "default": 2,
        "color": "#808080",
    }
))
AUTOMATA_BB.addState(new AutomataState(
    {
        "transition": {},
        "default": 0,
        "color": "#FFFFFF",
    }
))
const AUTOMATON_LIST = [AUTOMATA_GOL , AUTOMATA_BB];

function CreateBoard(){
    const board = [];
    for(let i = 0; i< BOARD_ROW ; i++){
        board.push(new Array(BOARD_COL).fill(DEAD))
    }
    return board;
}
function mod(a, b){
    return (a%b + b)%b
}
function render(board1, Automaton){
    ctx.fillStyle = "#808080";
    ctx.fillRect(0,0, canvas.width,canvas.height);
    for(let r = 0; r < BOARD_ROW; r++){
        for(let c = 0; c < BOARD_COL; c++){
            x = r*CELL_WIDTH;
            y = c*CELL_HEIGHT;
            ctx.fillStyle = Automaton.states[board1[r][c]].color;
            ctx.fillRect(x,y, CELL_WIDTH,CELL_HEIGHT);
        }
    }
}

function CountNeighbor(r ,c, state, board){
    let aliveNeighbor = new Array(state).fill(0);
    for (let dy = -1; dy <= 1; ++dy) {
        for (let dx = -1; dx <= 1; ++dx) {
            if (dy != 0 || dx != 0) {
                const y = mod(c + dy, BOARD_COL);
                const x = mod(r + dx, BOARD_ROW);
                aliveNeighbor[board[x][y]]++;
            }
        }
    }

    return aliveNeighbor.join("");
}
function checkneighbor(board, nextboard, Automaton){
    for(let r = 0; r < BOARD_ROW; r++){
        for(let c = 0; c < BOARD_COL; c++){ 
            let currNeighbor = CountNeighbor(r,c,Automaton.numberOfStates,board);
            let state = Automaton.states[board[r][c]]
            nextboard[r][c] =state.transition[currNeighbor];
            if(state.transition[currNeighbor] === undefined){
                nextboard[r][c] = state.default;
            }
        }
    }
}
async function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
async function loadimg(files){
    const newcanvas = document.createElement("canvas")
    const newctx = newcanvas.getContext("2d");
    const image = new Image();
    const base64 = await toBase64(files);
    image.src = base64;
    return new Promise((resolve,reject) => {
        image.onload = function() {
            newcanvas.width = image.width;
            newcanvas.height = image.height;
            newctx.drawImage(image, 0, 0);
            const imgData = newctx.getImageData(0, 0, newcanvas.width, newcanvas.height);
            return resolve(imgData);
        };
        image.onerror = error => reject(error);
    })
    
}
function pixelColorAVG(array){
    return (array[0] + array[1] + array[2])/3;
}
function validateImage(event) {
    const filetemp = event.target.files[0];
    if (filetemp) {
      const imgtemp = new Image();
      imgtemp.src = window.URL.createObjectURL(filetemp);
      imgtemp.onload = function() {
        if (imgtemp.width > 500 || imgtemp.height > 500) {
          alert('Image dimensions should be less than 500x500 pixels.');
          event.target.value = '';
        } else {
          console.log('Image is valid');
        }
        window.URL.revokeObjectURL(imgtemp.src); 
      };
    }
  }
async function processImageToAutomaton(imgfile, board, Automaton){
    let imgData = await loadimg(imgfile);
    let pixelArray = new Uint8ClampedArray(imgData.data.length);
    pixelArray.set(imgData.data);
    for(let i = 0; i < imgData.height; i++){
        for(let j = 0; j < imgData.width; j++){
            const pixel = new Uint8ClampedArray(pixelArray.buffer, (i*imgData.width*4 + j*4), 4 );
            let sumAVG = pixelColorAVG(pixel);
            board[j][i] = 0; 
            if(Automaton.numberOfStates > 2){
                if(sumAVG > 170){
                    board[j][i] = 1;
                } else if(sumAVG> 85){
                    board[j][i] = 2
                }    
            }
            else{
                if(sumAVG > 128){
                    board[j][i] = 1;
                }
            }            
        }
    }
    render(board,Automaton);
}

window.onload = async () => {
    let currentBoard = CreateBoard();
    let nextBoard = CreateBoard();
    let currentAutomaton = AUTOMATA_GOL;
    let isRunning = false;
    let timeoutId;
    canvas.addEventListener("click" ,(e) =>{
        const row = Math.floor(e.offsetX/CELL_HEIGHT);
        const col = Math.floor(e.offsetY/CELL_WIDTH);
        if(currentBoard[row][col] === ALIVE){
            currentBoard[row][col] = DEAD;
        }else currentBoard[row][col] = ALIVE;
        render(currentBoard, currentAutomaton);
    })
    canvas.addEventListener("mousemove", (e) => {
        if (e.buttons&1) {
            const row = Math.floor(e.offsetX/CELL_HEIGHT);
            const col = Math.floor(e.offsetY/CELL_WIDTH);
            currentBoard[row][col] = ALIVE
            render(currentBoard, currentAutomaton);
        }
    });
    
    const nextState = () => {
            checkneighbor(currentBoard, nextBoard, currentAutomaton);
            [currentBoard,nextBoard] = [nextBoard,currentBoard];
            render(currentBoard,currentAutomaton);
            if (isRunning) {
                timeoutId = setTimeout(nextState, 100);
            }
    }
    nextbutton.addEventListener("click", nextState)
    function toggle() {
        if (isRunning) {
            isRunning = false;
            clearTimeout(timeoutId);
          nextbutton.disabled = false;
        } else {
            isRunning = true;
            nextState();
            nextbutton.disabled = true;
        }
      }
    toggleButton.addEventListener('click', toggle);
    clearButton.addEventListener('click', () => {
        currentBoard = CreateBoard();
        render(currentBoard,currentAutomaton);
    });
    selectCAButton.addEventListener('click', e => {
        let chooseValue = document.querySelector('input[name="radioa"]:checked').value;
        let choosenAutomata = AUTOMATON_LIST[chooseValue];
        let imgfile = input.files[0];
        input.value = '';
        isRunning = false;
        clearTimeout(timeoutId);
        nextbutton.disabled = false;
        currentAutomaton = choosenAutomata;
        currentBoard = CreateBoard();
        if(imgfile){
            processImageToAutomaton(imgfile, currentBoard, currentAutomaton);
        }
        render(currentBoard,currentAutomaton);
        

    })
    input.addEventListener("change", evt => {
        validateImage(evt);
        
    })

}

//to do