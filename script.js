/*
    SETTINGS
*/
const rollOffset = 2900;
const rollTime = 5000;

/*
    SETUP
*/
const redOutput =       "red";
const blackOutput =     "black";
const greenOutput =     "green";
const ROULETTE_DISPLAY =    document.querySelector('.roulette-display');
const ROULETTE_BUTTON =     document.querySelector('.roulette-button');
const ROULETTE_HISTORY =    document.querySelector('.roulette-history');

const INPUT_ERROR_CONTAINER = document.querySelectorAll('.input-error-container');
const PLAYER_BALANCE = document.querySelector('#balance');
const BET_BUTTON = document.querySelectorAll('.bet-button');
const ROULETTE_INPUT_COLOR = document.querySelectorAll('.betinput');
const ROULETTE_INPUT_RED =  document.querySelector('#betting-input-red');
const ROULETTE_INPUT_BLACK =  document.querySelector('#betting-input-black')
const ROULETTE_INPUT_GREEN =  document.querySelector('#betting-input-green')
var isRolling = false;
var roll = rollOffset;
var playerBalance = 10000;

var redBet = 0;
var blackBet = 0;
var greenBet = 0;

PLAYER_BALANCE.innerHTML = playerBalance;

ROULETTE_DISPLAY.style.transition = rollTime + "ms ease-in-out";

//PLAYER BALANCE UPDATE
{
    function updateBalance(number){
        let currentBalance = parseInt(PLAYER_BALANCE.innerHTML, 10);
        PLAYER_BALANCE.innerHTML = currentBalance + parseInt(number, 10);
        playerBalance = currentBalance + parseInt(number, 10);
    }
}

//RESETING BETS
{
    function clearBets(){
        redBet = 0;
        blackBet = 0;
        greenBet = 0;
        ROULETTE_INPUT_COLOR.forEach(e => {
            e.value = "";
            e.readOnly = false;
        });
    }
}

//ROLLING ROULETTE
{
    ROULETTE_BUTTON.addEventListener('click', () => {
        if(isRolling == false){
            isRolling = true;
            roll = roll + Math.floor(Math.random()*10000+3700*3);
            ROULETTE_DISPLAY.style.backgroundPositionX = -roll + "px";
            ROULETTE_BUTTON.style.backgroundColor = "gray";
            INPUT_ERROR_CONTAINER.forEach(f => {
                f.classList.remove('active-error');
            });
            ROULETTE_INPUT_COLOR.forEach(e => {
                e.readOnly = true;
            });
            setTimeout(() => {
                ROULETTE_BUTTON.style.backgroundColor = "orange";
                drawnColor(-roll);
                isRolling = false;
            }, rollTime);
        }
        
    })

    function drawnColor(num){
        updateBalance(0);
        let relpos = Math.abs(num + rollOffset) % 3700;
        let clr = Math.round(relpos/100);
        if(clr % 2 == 0){
            if(clr != 0){
                updateBalance(redBet * 2);
                clearBets();
                console.log("red");
                return "red";
            } else {
                updateBalance(greenBet * 14);
                clearBets();
                console.log("green");
                return "green";
            }
        }
        if(clr % 2 == 1){
            updateBalance(blackBet * 2);
            clearBets();
            console.log("black");
            return "black";
        }
    };

    function updateHistory(color){
        return color;
    }   
}

//INPUT VALUE
{
   BET_BUTTON.forEach(e => {
    e.addEventListener('click', () => {
        const input = e.parentElement.lastElementChild;
        const errorholder = e.parentElement.firstElementChild.nextElementSibling.nextElementSibling.nextElementSibling;
        if(input.value <= 0 || isNaN(input.value) || input.value == null || input.value == undefined || input.value > playerBalance){
            errorholder.classList.add('active-error');
            errorholder.innerHTML = "Invalid value!";
            input.value = "";
        } else {
            updateBalance(-input.value);
            errorholder.classList.remove('active-error');
            errorholder.classList.add('active-succes');
            errorholder.innerHTML = "Bet placed!";
            setTimeout(() => {
                errorholder.classList.remove('active-succes');
            }, 1500)
            console.log(input.value);
            input.readOnly = true;
            if(input.id == 'betting-input-red'){
                redBet = input.value;
                console.log(redBet + "na czerwone")
            }
            else if(input.id == 'betting-input-black'){
                blackBet = input.value;
                console.log(blackBet + "na czarne")
            }
            else if(input.id == 'betting-input-green'){
                greenBet = input.value;
                console.log(greenBet + "na zielone")
            }
        }
        
    })
}) 
}
