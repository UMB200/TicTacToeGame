let mainTable;
let firstPlayer = "O";
let secondPlayer = "X";
const spots = document.querySelectorAll('.spot');
const effectiveCombinations = [
[0, 1, 2], 
[0, 3, 6], 
[0, 4, 8], 
[1, 4, 7], 
[2, 5, 8],
[3, 4, 5], 
[6, 4, 2],
[6, 7, 8], 
];

gameOn();

function choosePlayer(option){
	firstPlayer = option;
	secondPlayer = option === 'O' ? 'X' : 'O';
	mainTable = Array.from(Array(9).keys());
	for (let i = 0; i < spots.length; i++) {
		spots[i].addEventListener('click', nextTurn, false);
	}
	if(secondPlayer === 'O'){
		nextMove(returnSpot(), secondPlayer);
	}

	document.querySelector('.optionToChose').style.display = "none";
}

function gameOn() {
 	//hide gameOver 
 	document.querySelector('.gameOver').style.display = "none";
 	document.querySelector('.gameOver .someMsg').innerText = "";
 	document.querySelector('.optionToChose').style.display = "block";
 	//pull all cells in array
 	for (let i = 0; i < spots.length; i++) {
 		spots[i].innerText = '';
 		spots[i].style.removeProperty('background-color');
 	}
 }

//Selects item inside table
function nextTurn(itemInSpot){
 	//check if any spot is taken by any player
 	if(typeof mainTable[itemInSpot.target.id == 'number']){
 		//if not then proceed and select item
 		nextMove(itemInSpot.target.id, firstPlayer);
 		if(!drawResult() && !whoWon(mainTable, firstPlayer)) nextMove(returnSpot(), secondPlayer);
 	}
 }

//checks selected item in the table
function nextMove(itemId, playerId){
 	//update array with the item that was selected by player
 	mainTable[itemId] = playerId;
 	//update table on the screen
 	document.getElementById(itemId).innerHTML = playerId;
 	//check who won the game
 	let gameResult = whoWon(mainTable, playerId);
 	if(gameResult) endGame(gameResult);
 	drawResult();
 }

//determine who is winning
function whoWon(tableVar, playerId){
	let games = tableVar.reduce((all, items, next) => (items === playerId) ? all.concat(next) : all, []);
	let gameResult = null;
	for(let [index, score] of effectiveCombinations.entries()){
		if(score.every(item => games.indexOf(item) > -1)){
			gameResult = {index: index, playerId: playerId};
			break;
		}
	} 
	return gameResult;
}
//this function was not change on 2/5
//shows result of the game
function endGame(gameResult){
	for(let i of effectiveCombinations[gameResult.index]){
		document.getElementById(i).style.backgroundColor = 
		gameResult.playerId === firstPlayer ? "yellow" : "green";
	}
	for(let i = 0; i < spots.length; i++){
		spots[i].removeEventListener('click', nextTurn, false);
	}
	winnerAnouncement(gameResult.playerId === firstPlayer ? "You won!" : "You lost!");
}

//check which spots are not taken
function availableSpots(){
	//check if elements in table is number using filter function
	return mainTable.filter((n, i)=>  i === n);
}

//show who won the game
function winnerAnouncement(gamer){
	//show hidden game elements
	document.querySelector(".gameOver").style.display = 'block';
	document.querySelector(".someMsg").innerText = gamer;
}

//select the best possible spot in the table
function returnSpot(){
	//check which spots are not taken
	return computerAlgorithm(mainTable, secondPlayer).index;
}
//check if game is draw
//this function was not change on 2/5 even though it differs from script
function drawResult(){
	//if all spots are filled up and 
	//nobody won then game result is draw or tie
	if(availableSpots().length === 0){
		for(var i = 0; i < spots.length; i++){
			//set color of every square to red
			spots[i].style.backgroundColor = 'pink';
			//remove event listener so game can't click anywhere
			spots[i].removeEventListener('click', nextTurn);
		}
		//announce who won
		winnerAnouncement("It's a draw");
		return true; //because it is draw game;
	}
	return false;
}

//main function that predicts winning pattern
function computerAlgorithm (secondaryBoard, playerId){
	//find available spots using relevant function
	var spotToTake = availableSpots(secondaryBoard);
	//count all spots to evaulate in an array
	var spotsActioned = [];
	//check if somebody is winning
	if(whoWon(secondaryBoard, playerId)){
		//if '0' wins return  negative10
		return{scoredValue: -10};
	}
	//if 'X' wins return positive 10
	else if(whoWon(secondaryBoard, secondPlayer)){
		return {scoredValue: 10};
	}
	//if no more spots available then tie or draw game;
	else if(spotToTake.length === 0){
		return {scoredValue: 0}
	}
	
	for (var i = 0; i < spotToTake.length; i++) {
		//if spotTaken variable is moved up, function stops applying best 
		//possible scenario
		var spotTaken = {};
		//store index in the secondary board
		spotTaken.index = secondaryBoard[spotToTake[i]];
		secondaryBoard[spotToTake[i]] = playerId;

		if(playerId === secondPlayer)
			//store property to a new object
		spotTaken.scoredValue = computerAlgorithm(secondaryBoard, firstPlayer).scoredValue;
		//if function does not find terminal state recursion happens
		else
			spotTaken.scoredValue = computerAlgorithm(secondaryBoard, secondPlayer).scoredValue;
		secondaryBoard[spotToTake[i]] = spotTaken.index;
		if((playerId === secondPlayer && spotTaken.scoredValue === 10) || playerId === (firstPlayer && spotTaken.scoredValue === -10))
			return spotTaken;
		else
			spotsActioned.push(spotTaken);	
	}
	//evaluate the most effective move in the array
	let effectiveStrategy;
	let neededValue;
	if(playerId === secondPlayer){
		neededValue = -1000;
		for(var i= 0; i < spotsActioned.length; i++){
			//if that strategy has higher score then store that move
			if(spotsActioned[i].scoredValue > neededValue){
				neededValue = spotsActioned[i].scoredValue;
				effectiveStrategy = i;
			}
		}
	}
	else {
		neededValue = 1000;
		for(var i= 0; i < spotsActioned.length; i++){
			//if that strategy has higher score then store that move
			if(spotsActioned[i].scoredValue < neededValue){
				neededValue = spotsActioned[i].scoredValue;
				effectiveStrategy = i;
			}
		}
	}
	return spotsActioned[effectiveStrategy];
}