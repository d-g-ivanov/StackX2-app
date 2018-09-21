/************* GENERAL *************/
//disable default events
function disableEvent(evt) {
	evt.preventDefault();
	evt.stopPropagation();
	evt.stopImmediatePropagation();
}
//get index of child within parent
function getChildNumber(node) {
  return Array.prototype.indexOf.call(node.parentNode.children, node);
}
/***********************************/
//horizontal navigation to fiven screen
var screens = document.querySelectorAll('.screen');
function goto(screen) {
	//screen move
	var where = screen || event.target.getAttribute('data-where') || null;
	var destination = where ? document.querySelector('.' + where) : '';

	if (where) {
		//handle ads
		displayAdsOnScreenChange(where);
		
		//slide to new screen
		screens.forEach(function(screen){
			screen.classList.remove('active');
		});
		setTimeout(function(){
			destination.classList.add('active');
		}, 700);
		destination.scrollTop = 0;
		
		if (where !== 'startScreen') {
			document.getElementById('game').classList.add('background_move');
		} else {
			document.getElementById('game').classList.remove('background_move');
		}
	} else {
		return;
	}
}
/********* MENU NAVIGATION *********/
//handling menugroup events
function actionPicker(event) {
	event.preventDefault();
	event.stopPropagation();
	//button sound
	btnSound();
	//screen move
	goto();
	//action
	var action = event.target.getAttribute('data-action');
	if (action) {
		window[action](event);
	}
}
//display sub menu
function displaySubmenu(event) {
	event.preventDefault();
	event.stopPropagation();
	//toggle hamburger
	var mbuttons = document.querySelectorAll('.menu_icon');
	var submenu = document.querySelector('.submenu');
	//change button status
	mbuttons.forEach(function(mbutton){
		mbutton.classList.toggle('open');
	});
	//toggle submenu
	submenu.classList.toggle('active');
	//play button sound
	btnSound();
	//pause/start game
	if(game.settings.startTime && !game.settings.ended) {
		pauseStartToggle();
	}
}
//pause/start toggle
function pauseStartToggle() {
	game.settings.isPlaying = !game.settings.isPlaying;
	game.settings.isPlaying ? game.frame = requestAnimationFrame( game.gameLoop ) : '';
}
//resume game button
function resumeGame() {
	event.preventDefault();
	event.stopPropagation();
	//hide submenu
	var submenu = document.querySelector('.submenu');
	submenu.classList.remove('active');
	//reset player menu button
	var mbuttons = document.querySelectorAll('.menu_icon');
	mbuttons.forEach(function(mbutton){
		mbutton.classList.remove('open');
	});
	//pause/start game
	if(game.settings.startTime) {
		pauseStartToggle();
	}
}
//restart game
function restartGame() {
	event.preventDefault();
	event.stopPropagation();
	//toggle hamburger
	var mbuttons = document.querySelectorAll('.menu_icon');
	var submenu = document.querySelector('.submenu');
	//change button status
	mbuttons.forEach(function(mbutton){
		mbutton.classList.toggle('open');
	});
	//toggle submenu
	submenu.classList.toggle('active');
	//actual game restart
	startGame();
}

//button click sound
function btnSound() {
	event.preventDefault();
	event.stopPropagation();
	btn_sound.play();
}
//background sound toggle
function bg_sound_toggle() {
	event.preventDefault();
	event.stopPropagation();
	//button sound
	btnSound();
	this.checked ? bg_sound.play() : bg_sound.pause();
	bg_sound.volume = 0.2;
}

//single player game
function singlePlayer() {
	game.settings.singlePlayer = true;
}

//single player game
function multiPlayer() {
	game.settings.singlePlayer = false;
}
/***********************************/


/********* GAME RELATED *********/
//game loop
function startGame() {
	document.getElementById('start').style.display = 'none';
	document.getElementsByClassName('gameOverLabel')[0].style.display = 'none';
	game.init();

	game.settings.startTime = game.settings.lastSpeedUpdate = new Date().getTime();
	game.settings.isPlaying = true;
	game.settings.ended = false;
	
	var settings = document.querySelectorAll('.settingsScreen input[type="checkbox"]');
	settings.forEach(function(setting){
		game.settings[setting.value] = setting.checked ? true : false;
	});
	
	if (game.settings.doubleThePieces) game.settings.numPieces = game.pieces.length;
	
	if (game.settings.singlePlayer) {
		game.frame = requestAnimationFrame( game.gameLoopSingle );
	} else {
		game.frame = requestAnimationFrame( game.gameLoop );
	}
	
	console.log(game.settings);
}

// The keydown handler for handling direction key presses
function onKeyPressMove(event) {
	if (!game.settings.isPlaying) return;
	var key = event.keyCode;

	if (key === 37) { //left arrow
		game.blocks[1].moveHorizontal(-1);
	} else if (key === 39) { //right arrow
		game.blocks[1].moveHorizontal(1);
	} else if (key === 40) { // down arrow
		game.blocks[1].moveVertical();
	} else if (key === 190) { //rotate right >
		game.blocks[1].rotate(1);
	} else if (key === 188) { //rotate left <
		game.blocks[1].rotate(-1);
	}
	
	if (key === 65) { // move left a
		game.blocks[0].moveHorizontal(-1);
	} else if (key === 68) { //move right d
		game.blocks[0].moveHorizontal(1);
	} else if (key === 83) { // move down s
		game.blocks[0].moveVertical();
	} else if (key === 71) { //rotate right g
		game.blocks[0].rotate(1);
	} else if (key === 70) { //rotate left f
		game.blocks[0].rotate(-1);
	}
}

function onButtonMove(event) {
	if (!game.settings.isPlaying) return;
	var key = this.getAttribute('data-direction');
	var player = this.parentElement.parentElement.id;
	
	if (event.type === 'touchstart' || event.type === 'click') {
		if (player === 'player1') {
			if (key === 'goingLeft') { // move left a
				game.blocks[0].moveHorizontal(-1);
			} else if (key === 'goingRight') { //move right d
				game.blocks[0].moveHorizontal(1);
			} else if (key === 'goingDown') { // move down s
				game.blocks[0].goingDown = true;
				//game.blocks[0].moveVertical();
			} else if (key === 'rotateRight') { //rotate right g
				game.blocks[0].rotate(1);
			} else if (key === 'rotateLeft') { //rotate left f
				game.blocks[0].rotate(-1);
			}
		};
		if (player === 'player2') {
			if (key === 'goingLeft') { //left arrow
				game.blocks[1].moveHorizontal(-1);
			} else if (key === 'goingRight') { //right arrow
				game.blocks[1].moveHorizontal(1);
			} else if (key === 'goingDown') { // down arrow
				game.blocks[1].goingDown = true;
				//game.blocks[1].moveVertical();
			} else if (key === 'rotateRight') { //rotate right >
				game.blocks[1].rotate(1);
			} else if (key === 'rotateLeft') { //rotate left <
				game.blocks[1].rotate(-1);
			}
		};
	} else {
		if (key === 'goingDown') { // move down s
			game.blocks[0].goingDown = false;
		}
		
		if (key === 'goingDown') { // move down s
			game.blocks[1].goingDown = false;
		}
	}
}
/***********************************/




/********* ACTIVATE EVENTS *********/
/*screens*/
//screen buttons and navigation
var menuGroups = document.querySelectorAll('.screen button');
menuGroups.forEach(function(btn){
	if ( !btn.getAttribute('data-direction') ) {
		//btn.addEventListener('click', actionPicker);
		Utils.onEvent(btn, 'click tap', actionPicker);
	}
});

/*settings*/
//sounds
var sound = document.getElementById('sound');
sound.addEventListener('change', bg_sound_toggle);

var bg_sound = document.getElementById('background_sound');

var btn_sound = document.getElementById('button_press');

/*in-game events*/
//keypresses to move the snake
document.body.addEventListener('keydown', onKeyPressMove);

//click/touch of player buttons to move the snake
var playerGroups = document.querySelectorAll('.playerGroup-btn button');
playerGroups.forEach(function(btn){
	if (btn.classList.contains('menu_icon')) {
		//btn.addEventListener('click', displaySubmenu, true);
		Utils.onEvent(btn, 'click tap', displaySubmenu);
	} else {
		//btn.addEventListener('click', onButtonMove, true);
		Utils.onEvent(btn, 'touchstart touchend', onButtonMove);
	}
});
/***********************************/

































































//remove
Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
//designer
document.getElementById('designer').addEventListener('click', function(event){
	if (document.querySelector('.designerScreen .content').children.length < 6) {
		var limit = 6 - document.querySelector('.designerScreen .content').children.length;
		
		for (var i = 0; i < limit; i++) {
			appendBlock();
		}
	}
	
	document.querySelector('.intro').style.display = 'none';
	document.querySelector('.designerScreen').classList.add('textTop');
	document.querySelector('.designer').classList.toggle('visible');
});


//designer buttons
document.getElementById('new').addEventListener('click', appendBlock);

document.getElementById('delete').addEventListener('click', deleteLastBlock);

document.getElementById('save').addEventListener('click', saveBlocks);

document.querySelector('.designerScreen .content').addEventListener('click', fillBlock);

function appendBlock() {
	var block = "<div class='block'><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span><span class='segment' data-fill='0'></span></div>";
	
	document.querySelector('.designerScreen .content').innerHTML += block;
}

function deleteLastBlock() {
	if (document.querySelector('.designerScreen .content').children.length > 6) {
		document.querySelector('.designerScreen .content').lastChild.remove();
	}
}

function saveBlocks() {
	
	hideDesignerMessage();
	
	var blocks = [];
	var templates = document.querySelectorAll('.content .block');
	
	for (var i = 0; i < templates.length; i++) {
		var parts = templates[i].children;
		var block = [];
		var line = [];
		var counter = 1;
		var validBlock = false;
		for (var j = 0; j < parts.length; j++) {
			var value = parseInt( parts[j].getAttribute('data-fill') );
			
			//check value
			if ( value !== 0 ) validBlock = true;
			
			if (counter === 4) {
				line.push(value);
				block.push(line);
				line = [];
				counter = 1;
			} else {
				line.push(value);
				counter++;
			}
		}
		
		if (validBlock) {
			blocks.push(block);
		} else {
			addDesignerMessage('Cannot add an empty piece. Please fill out all templates.');
			return;
		}
	}
	
	game.customPieces = blocks;
	
	addDesignerMessage('Awesome! Go to Seetings to activate your custom pieces and play with them.');
}

function addDesignerMessage(message) {
	var messages = document.querySelector('.designer-message');
	messages.textContent = message;
	messages.classList.add('show');
}

function hideDesignerMessage() {
	var messages = document.querySelector('.designer-message');
	messages.classList.remove('show');
}

function fillBlock(event) {
	if (!event.target.classList.contains('segment')) return;
	
	var dataFill = parseInt( event.target.getAttribute('data-fill') );
	if (dataFill) {
		event.target.setAttribute('data-fill', 0);
	} else if (!dataFill) {
		event.target.setAttribute('data-fill', 15);
	}
}
