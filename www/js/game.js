//game object
var Game = function Game() {
	this.init = function init() {
		//determine sizes	
		this.calculate();
	
		//grab the canvas elements
		var canvases = document.getElementsByTagName('canvas');
		this.blocks = [];
		for (var i = 0; i < canvases.length; i++) {
			//set canvas sizes
			canvases[i].width = this.c_width;
			canvases[i].height = this.c_height;

			//initiate block with context and an arena
			var block = new Parts.Block(canvases[i].getContext('2d'), this.createArena(this.c_cols, this.c_rows));
			this.blocks.push(block);
		}
		//block image
		this.blockImage = new Image();
		this.blockImage.src = './images/patterns/classic_background.png';
	};
	
	this.calculate = function() {
		var border = 15;
		// Get the width and height from the canvas element
		var w = window.innerWidth - border;
		var b = this.blockSize = Math.floor( (w/2) / this.c_cols );
		//set width and height
		this.c_width = this.c_cols * b;
		this.c_height = this.c_rows * b;
	}
	
	this.blocks = [];
	this.blockImage = null;
	
	this.c_width = null;
	this.c_height = null;
	this.blockSize = null;
	this.c_cols = 10;
	this.c_rows = 20;
	
	this.pieces = [
		//T
		[
			[0,1,0],
			[1,1,1],
			[0,0,0],
		],
		//Z
		[
			[2,2,0],
			[0,2,2],
			[0,0,0],
		],
		//S
		[
			[0,3,3],
			[3,3,0],
			[0,0,0],
		],
		//L
		[
			[0,0,4],
			[4,4,4],
			[0,0,0],
		],
		//J
		[
			[5,0,0],
			[5,5,5],
			[0,0,0],
		],
		//O
		[
			[6,6],
			[6,6],
		],
		//I
		[
			[0,0,0,0],
			[7,7,7,7],
			[0,0,0,0],
			[0,0,0,0],
		],
		// new pieces
		//U
		[
			[8,0,8],
			[8,8,8],
			[0,0,0],
		],
		//G
		[
			[9,9],
			[9,0],
		],
		//A
		[
			[10,0,0],
			[10,10,10],
			[0,0,10],
		],
		//B
		[
			[0,0,10],
			[10,10,10],
			[10,0,0],
		],
		//X
		[
			[0,11,0],
			[11,11,11],
			[0,11,0],
		],
		//C
		[
			[12,0,0],
			[12,12,0],
			[12,12,12],
		],
		//D
		[
			[13,0,0,0],
			[13,13,13,13],
			[0,0,13,0],
			[0,0,0,0],
		],
		//E
		[
			[0,14,0,0],
			[0,14,14,0],
			[0,14,14,0],
			[0,14,0,0],
		],
	];
	
	this.customPieces = null;
	
	this.colors = [null, '#27b86f', '#24b89f', '#248cc0', '#df9f02', '#e14b00', '#c01315', '#b24385', '#185960', '#873f2a', '#cf6057', '#c19600', '#28846b', '#f9b599', '#dad1da', '#f4f142', '#606060'];
	
	this.settings = {
		moveDuration : 1000,
		oneWithOne: false,
		//more pieces settings
		doubleThePieces: false,
		numPieces: 6,
		//speed up settings
		speed: false,
		lastSpeedUpdate: null,
		//custom Pieces
		customPieces: false,
		//various
		isPlaying: false,
		ended: false,
		startTime: null,
		endTime: null,
		timePlayed: null,
		singlePlayer: false,
		adsViewed: false,
	};
	
	this.createArena = function createArena(width, height) {
		var arena = [];
		while (height--) arena.push( new Array(width).fill(0) );
		return arena;
	};
	
	this.drawMatrix = function drawMatrix(ctx, matrix, offX, offY) { // added line
		//draw each position
		for (var y = 0; y < matrix.length; y++) {
			var row = matrix[y];
			for (var x = 0; x < row.length; x++) {
				var value = row[x];
				if (value) {
					ctx.fillStyle = game.colors[value];
					ctx.fillRect( (x + offX) * this.blockSize, (y + offY) * this.blockSize, this.blockSize, this.blockSize);
					ctx.drawImage(this.blockImage, (x + offX) * this.blockSize, (y + offY) * this.blockSize, this.blockSize, this.blockSize );
				}
			}
		}
	};
	
	this.sweep = function sweep(arena, block) {
		var rows = 1;
		outer: for (var y = arena.length - 1; y > 0; y--) {
			for (var x = 0; x < arena[y].length; x++) {
				if (arena[y][x] === 0) {
					continue outer;
				}
			}
			
			var row = arena.splice(y, 1)[0].fill(0);
			arena.unshift(row);
			y++;
			
			block.score += rows * 10;
			rows *= 2;
		}
	};
	
	this.sweepAll = function() {
		var arena1 = this.blocks[0].arena, arena2 = this.blocks[1].arena, rows = 1;
		for (var i = arena1.length - 1; i > 0; i--) {
			if ( arena1[i].indexOf(0) < 0 && arena2[i].indexOf(0) < 0 ) {
				//matched row remove, make empty and insert on top of array
				var row1 = arena1.splice(i, 1)[0].fill(0);
				arena1.unshift(row1);
				var row2 = arena2.splice(i, 1)[0].fill(0);
				arena2.unshift(row2);
				//update scores
				this.blocks[0].score += rows * 10;
				this.blocks[1].score += rows * 10;
				rows *= 2;
				//check row again
				i++;
				console.log(i);
			} else if ( arena1[i].indexOf(0) < 0 || arena2[i].indexOf(0) < 0 ) {
				//change color if one of the players has made a row
				arena1[i].indexOf(0) < 0 ? arena1[i].fill( (this.colors.length - 1) ) : arena2[i].fill( (this.colors.length - 1) );
			}
		}
	};
	
	this.frame = null;
	this.gameLoop = function gameLoop(time = 0) {
		//game paused
		if (!game.settings.isPlaying) return;
		//speed up game
		if (game.settings.speed && game.settings.moveDuration > 300) {
			var now = new Date().getTime();
			if (now - game.settings.lastSpeedUpdate > 60000) { //60000ms in a minute
				game.settings.lastSpeedUpdate = now;
				game.settings.moveDuration -= 140;
			}
		}
		//block action
		for (var b = 0; b < game.blocks.length; b++) {
			var block = game.blocks[b];
			//track elapsed time for a block
			block.calculateDelta(time);
			//clear context of the block
			block.ctx.clearRect(0, 0, game.c_width, game.c_height);
			//draw block's arena
			game.drawMatrix(block.ctx, block.arena, 0, 0);
			//make a move
			if (block.currentMove > game.settings.moveDuration) {
				block.moveVertical();
				if ( block.collided ) {
					!game.settings.oneWithOne ? game.sweep(block.arena, block) : game.sweepAll();
					block.collided = false;
				}
			} else if (block.currentMove > 30 && block.goingDown) {
				block.moveVertical();
			}
			
			//draw block
			block.draw();
			
			//draw score
			block.drawScore();
		}
			
		//loop
		requestAnimationFrame(game.gameLoop);
	};
	
	this.gameLoopSingle = function gameLoopSingle(time = 0) {
		//game paused
		if (!game.settings.isPlaying) return;
		//speed up game
		if (game.settings.speed && game.settings.moveDuration > 300) {
			var now = new Date().getTime();
			if (now - game.settings.lastSpeedUpdate > 60000) { //60000ms in a minute
				game.settings.lastSpeedUpdate = now;
				game.settings.moveDuration -= 140;
			}
		}
		//block action
		var block = game.blocks[0];
		//track elapsed time for a block
		block.calculateDelta(time);
		//clear context of the block
		block.ctx.clearRect(0, 0, game.c_width, game.c_height);
		//draw block's arena
		game.drawMatrix(block.ctx, block.arena, 0, 0);
		//make a move
		if (block.currentMove > game.settings.moveDuration) {
			block.moveVertical();
			if ( block.collided ) {
				game.sweep(block.arena, block);
				block.collided = false;
			}
		} else if (block.currentMove > 30 && block.goingDown) {
			block.moveVertical();
		}
		
		//draw block
		block.draw();
		
		//draw score
		block.drawScore();
			
		//loop
		requestAnimationFrame(game.gameLoopSingle);
	};
	
	this.gameOver = function gameOver() {
		//clearInterval(intervalId);
		cancelAnimationFrame(game.frame);
		game.frame = null;
		game.settings.isPlaying = false;
		game.settings.ended = true;
		//stop time counting
		game.settings.endTime = new Date().getTime();
		game.settings.timePlayed = game.settings.endTime - game.settings.startTime;
		//gameover text
		document.getElementsByClassName('gameOverLabel')[0].style.display = 'block';
		//update scores
		setTimeout(updateScore, 1000);
		//display play button again
		document.getElementById('start').style.display = 'block';
	}
};

//update score screen
function updateScore() {
	//get scores
	var scores = calculateScores();
	//set scores
	for (score_place in scores) {
		document.querySelector('.' + score_place + ' .result').innerHTML = scores[score_place];
	}
	//display scores
	goto('gameOver');
}
function calculateScores() {
	var scorescreen = document.querySelector('.gameOver');
	var gameScores = {
		time_played: null,
		final_score: null,
		//fun_details: null
	};
	//calculate time played
	var hours = ((game.settings.timePlayed / (1000*60*60)) % 60);
	var minutes = ((game.settings.timePlayed / (1000*60)) % 60);
	var seconds = (game.settings.timePlayed / 1000) % 60 ;
	gameScores.time_played = game.settings.time = (Math.floor(hours) < 10 ? ('0' + Math.floor(hours)) : Math.floor(hours)) + ':' + (Math.floor(minutes) < 10 ? ('0' + Math.floor(minutes)) : Math.floor(minutes)) + ':' + (Math.floor(seconds) < 10 ? ('0' + Math.floor(seconds)) : Math.floor(seconds));
	//calculate total apples
	gameScores.final_score = game.blocks[0].score + ' : ' + game.blocks[1].score;
	//return the scores object
	return gameScores;
}



