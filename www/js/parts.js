var Parts = (function Parts(){
	var publicAPI;
	
	/****************************************************************/
	
	/* THE BLOCK CONSTRUCTOR */
	var Block = function(ctx, arena) {
		this.matrix = null;
		this.nextMatrix = null;
		this.x = null;
		this.y = null;
		this.score = 0;
		this.collided = false;
		//context and arena
		this.ctx = ctx;
		this.arena = arena;
		//delta
		this.currentMove = 0;
		this.lastTime = 0;
		this.delta = 0;
		//reset piece during new block creation to fill matrix information
		this.reset();
	}

	Block.prototype.draw = function() {
		//save the context initial values in order to draw the next piece
		this.ctx.save();
			//lower canvas alpha and scale
			this.ctx.globalAlpha = 0.3;
			this.ctx.scale(0.7, 0.7);
			//draw next piece
			game.drawMatrix(this.ctx, this.nextMatrix, 0.2, 0.2);
		//restore canvas alpha
		this.ctx.restore();
		
		//draw game piece
		game.drawMatrix(this.ctx, this.matrix, this.x, this.y);
	}

	Block.prototype.drawScore = function() {
		this.ctx.font = '50px tetris';
		this.ctx.fillStyle = '#9b9b9b';
		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'top';
		this.ctx.fillText( this.score, game.c_width - 5, 2);
	}

	Block.prototype.moveVertical = function() {
		var arena = this.arena;
		this.y++;
		this.currentMove = 0;
		if ( this.collide(arena) ) {
			this.collided = true;
			this.y--;
			this.merge(arena);
			this.reset();
		}
	}

	Block.prototype.moveHorizontal = function(dir) {
		var arena = this.arena; // added line
		this.x += dir;
		
		if ( this.collide(arena) ) this.x -= dir;
	}

	Block.prototype.collide = function(arena) {
		for (var y = 0; y < this.matrix.length; y++) {
			for (var x = 0; x < this.matrix[y].length; x++) {
				if (this.matrix[y][x] !== 0 && (arena[y + this.y] && arena[y + this.y][x + this.x]) !== 0 ) return true;
			}
		}
		return false;
	}

	Block.prototype.merge = function(arena) {
		for (var y = 0; y < this.matrix.length; y++) {
			var row = this.matrix[y];
			for (var x = 0; x < row.length; x++) {
				if ( row[x] !== 0 ) arena[y + this.y][x + this.x] = row[x];
			}
		}
	}

	Block.prototype.rotate = function(dir) {
		//transpose the matrix
		var newMatrix = [];
		for(var i = 0; i < this.matrix.length; i++){
			newMatrix.push([]);
		};	
		
		for(var y = 0; y < this.matrix.length; y++){
			for(var x = 0; x < this.matrix[y].length; x++){
				newMatrix[x].push(this.matrix[y][x]);
			};
		};
		
		if (dir > 0) {
			newMatrix.forEach(function(row){
				row.reverse();
			});
		} else {
			newMatrix.reverse();
		}
		
		this.matrix = newMatrix;
		
		//check collision
		var offset = 1;
		var currentPos = this.x;
		var arena = this.arena; // added line
		while(this.collide(arena)) {
			this.x += offset;
			offset = -(offset + (offset > 0 ? 1 : -1));
			if (offset > this.matrix[0].length+1) {
				this.rotate(-dir);
				this.x = currentPos;
				return;
			}	
		}
	}

	Block.prototype.reset = function() {
		var arena = this.arena; // added line
		var pieces = ( game.settings.customPieces && game.customPieces ) ? game.customPieces : game.pieces;
		
		if (this.nextMatrix === null) {
			this.nextMatrix = pieces[ Math.random() * game.settings.numPieces | 0 ];
		}
		
		this.matrix = this.nextMatrix;
		this.nextMatrix = pieces[ Math.random() * game.settings.numPieces | 0 ];
		this.y = 0;
		this.x = ( arena[0].length / 2 | 0 ) - ( this.matrix[0].length / 2 | 0 );
		//check for game over
		if (this.collide(arena)) {
			game.gameOver();
			/*arena.forEach(function(row){
				row.fill(0);
			});*/
		}
		
		pieces = null;
	}

	Block.prototype.calculateDelta = function(time) {
		this.delta = time - this.lastTime;
		this.lastTime = time;
		this.currentMove += this.delta;
	}	
	
	
	/****************************************************************/
	
	publicAPI = {
		Block: Block,
	};
	
	return publicAPI;
})();