//begin jQuery wordGame game plugin

(function( $ ){
	
	$._wordGame={
		callbacks:{},
		gameDescriptor:{}
	},
	
	$._wordSearch={
		
		gameState:{"dragging":false},
	
		instructionsText:"Instructions",
		
		theGrid:[],
		
		initGame: function (theGame) {
			
			$.extend($._wordSearch.gameState,$._wordGame.gameDescriptor);
			
			theGame.html("<div id='title'><h1>WordSearch</h1><div id='help'></div></div>");
			
					
			$('<p class= "instructions" />', {
					text: $._hangMan.instructionText
					
					}).appendTo(theGame).hide();
					
			$('#title').click(function(){$('.instructions').slideToggle();});
			$('.instructions').click(function(){$('.instructions').slideToggle();});
			
			
			theGame.append("<div id='currentWord'>test</div>");
			/*
			$('#gameOver').hide();
			$('#btnNext').hide();
		
			theGame.append("<div id='clue'></div>");
			theGame.append("<div id='word'>Word</div>");
			theGame.append("<div id='letters'>Letters</div>");
			theGame.append("<div id='gameOver'></div>"+
				"<div class='nextButton'><button id='btnNext'>Continue...</button></div>");
			$('#gameOver').hide();
			$('#btnNext').hide();
			
			//$('#drawingBackground').spStop();*/
	
	
			/*
			$._wordSearch.newHangmanGame();
			$._WordSearch.upDateImage();
			if($._hangMan.callBacks.OnGameStart)
					$._hangMan.callBacks.OnGameStart($._hangMan.gameState);*/
					
			//populate the grid
			gridSize=$._wordSearch.gameState.gridSize=12;
			for(i=0;i<gridSize;i++){
				$._wordSearch.theGrid[i]=[];
				for(j=0;j<gridSize;j++){
					$._wordSearch.theGrid[i][j]=' ';
					
				}
			}
			
			var fitFuncs=[$._wordSearch.fitWordHoriz,$._wordSearch.fitWordVert,$._wordSearch.fitWordDiag]; // these are the3 directions for fitting words
			
			var words=$._wordGame.gameDescriptor.words;
			
			var numSqs=gridSize*gridSize;
			
			var numDirections=fitFuncs.length;
			var direction=Math.floor(Math.random()*numDirections); //pick one of horiz/vert,diag to start. Put it here so the each word is attempted to be placed in a different direction
			
			for(w in words){
				words[w]=words[w].toUpperCase();
				var word=words[w];
				if(word.length>gridSize){
					$.error( "word too long for grid:"+word);
					continue;
				}
				
				
				var wordPlaced=false;
				var sq=Math.floor(Math.random()*numSqs); //pick a random square to start trying to fit word
				

				var dirAttempts=0; //track how many different directions we've attempted
				do{
					
					var sqAttempts=0;
					do{ //try all available directions
						var pos=$._wordSearch.sqXY(sq,gridSize);
						wordPlaced=fitFuncs[direction](word,pos);
						sq++;  //try next square
						sq%=numSqs; //wrap around square zero
	
						
					}while(wordPlaced==false && (++sqAttempts)<numSqs); // try all squares
	
				direction++;
				direction%=numDirections;
				}while(wordPlaced==false && (++dirAttempts)<numDirections); // try all directions until word fits
				
				if(!wordPlaced){
					//$.error( "Unable to place word:"+word);
				}
				
				
				
			}
			
			$('<table>',{
				"id" : "wsGrid"
			}).appendTo(theGame);
			
			
				
			for(i=0;i<gridSize;i++){
				var row=$('<tr>',{
				"class":"row"});
				
				for(j=0;j<gridSize;j++){
					c=$._wordSearch.theGrid[i][j];
					if(c==' '){
						c=$._wordSearch.theGrid[i][j]='_';
					}
					
					$("<td>",{ 
						"class":"wsSquare",
						"text" :c,
						"data": {x:j,y:i}}).appendTo(row);
				}
				$('#wsGrid').append(row);
			}
			
			$._wordSearch.gameState.selectedWord='';
			
			$('.wsSquare').mouseenter(function(){
				//$(this).addClass("wsSelectedSquare");
				if($._wordSearch.gameState.dragging){
					$._wordSearch.gameState.endSq=$(this).data();
					$._wordSearch.computeSelectedSquares();
				}
				
				});
			
			$('.wsSquare').mousedown(function(){
				$._wordSearch.gameState.dragging=true;
				$._wordSearch.gameState.startSq=$(this).data();
				$._wordSearch.gameState.endSq=$(this).data();
				$._wordSearch.computeSelectedSquares();
				});
			
			$('.wsSquare').mouseup(function(){
				
				$._wordSearch.gameState.dragging=false;
				$._wordSearch.gameState.endSq=$(this).data();
				$._wordSearch.computeSelectedSquares();
				$('.wsSelectedSquare').removeClass('wsSelectedSquare');
				$('#currentWord').html($._wordSearch.selectedWord);
				});
			
			$('body').disableSelection();
			
			
		},
		
		computeSelectedSquares: function(){
			$(".wsSelectedSquare").removeClass('wsSelectedSquare');
			var s=$._wordSearch.gameState.startSq;
			var e=$._wordSearch.gameState.endSq;
			/*
			if(s.x>e.x){
				e=$._wordSearch.gameState.startSq;
				s=$._wordSearch.gameState.endSq;
			}
			if(s.x==e.x && s.y>e.y){
				e=$._wordSearch.gameState.startSq;
				s=$._wordSearch.gameState.endSq;
			}*/
			
			var xInc=0;
			var yInc=0;
			

			
				
			$._wordSearch.gameState.selectedWord='';
			var sqW=Math.abs(e.x-s.x);
			var sqH=Math.abs(e.y-s.y);
			
			
			var slope=sqW==0 ? Number.MAX_VALUE :sqH/sqW;
			
			if(s.x<e.x) xInc=1;
			if(s.x>e.x) xInc=-1;
			if(s.y<e.y) yInc=1;
			if(s.y>e.y) yInc=-1;

	
			
			if(slope<0.5){// dir is horiz
				
				for(i=s.x,c=0;c<=sqW;c++,i+=xInc){
					ch=$._wordSearch.highlightSquare(i,s.y);
					$._wordSearch.gameState.selectedWord+=ch;
				}
			}
			else if(slope>2){

				for(j=s.y,c=0;c<=sqH;c++,j+=yInc){
					ch=$._wordSearch.highlightSquare(s.x,j);
					$._wordSearch.gameState.selectedWord+=ch;
					
				
				}// dir is vert
			}
			else{
				var dMax=Math.max(sqW,sqH);// max length of diagonal word
				gridSize=$._wordSearch.gameState.gridSize;
				for(i=s.x,j=s.y,c=0;c<=dMax && i >=0 && j>=0 && i<gridSize && j< gridSize;i+=xInc,j+=yInc,c++){
					ch=$._wordSearch.highlightSquare(i,j);
					$._wordSearch.gameState.selectedWord+=ch;
				}}//dir is diag
			
			if(xInc==-1 || (xInc==0 && yInc==-1) ){
				$._wordSearch.gameState.selectedWord=$._wordSearch.gameState.selectedWord.split("").reverse().join("");
			}
			$('#currentWord').html($._wordSearch.gameState.selectedWord);
			
			
			var words=$._wordGame.gameDescriptor.words;
			for(w in words){
				if($._wordSearch.gameState.selectedWord.toUpperCase()==words[w].toUpperCase()){
					$('.wsSelectedSquare').addClass('wsCorrectSquare');
				}
			}
		},
		
		highlightSquare: function(x,y){
					idx=$._wordSearch.gridIdx(x,y);
					$('.wsSquare').eq(idx).addClass("wsSelectedSquare");
					return $('.wsSquare').eq(idx).html();
		},
		
		gridIdx: function(x,y){
		
			return idx=$._wordSearch.gameState.gridSize* y + x;
		},
		
		sqXY: function(sq,width){// get x & y coords of a square number in a box of width
			var pos={};
			pos.x=sq%width;
			pos.y=Math.floor((sq-pos.x)/width);
			return pos;
		},
		
		fitWordHoriz: function(word,pos){
			wl=word.length;
			if((wl+pos.x) > $._wordSearch.gameState.gridSize)
				return false;
			for(i=0;i<wl;i++){
				var gridC=$._wordSearch.theGrid[pos.x+i][pos.y];
				if(!(gridC==' ' || gridC==word.charAt(i)))
					return false;
			}
			
			//word can fit so fill it in
			for(i=0;i<word.length;i++){
				$._wordSearch.theGrid[pos.x+i][pos.y]=word.charAt(i);
			}
			return true;
			
		},
		
		fitWordVert: function(word,pos){
			wl=word.length;
			if((wl+pos.y) >$._wordSearch.gameState.gridSize)
				return false;
			for(i=0;i<wl;i++){
				var gridC=$._wordSearch.theGrid[pos.x][pos.y+i];;
				if(!(gridC==' ' || gridC==word.charAt(i)))
					return false;
			}
			
			//word can fit so fill it in
			for(i=0;i<wl;i++){
				$._wordSearch.theGrid[pos.x][pos.y+i]=word.charAt(i);
			}
			return true;
			
		},
		
		fitWordDiag: function(word,pos){
			wl=word.length;
			if((wl+pos.x) > $._wordSearch.gameState.gridSize ||(wl+pos.y) >$._wordSearch.gameState.gridSize )
				return false;
			for(i=0;i<wl;i++){
				var gridC=$._wordSearch.theGrid[pos.x+i][pos.y+i];
				if(!(gridC==' ' || gridC==word.charAt(i)))
					return false;
			}
			
			//word can fit so fill it in
			for(i=0;i<wl;i++){
				$._wordSearch.theGrid[pos.x+i][pos.y+i]=word.charAt(i);
			}
			
			return true;
			
		}
		
		
        
		
	},

	$._hangMan={ //hangman methods & state
			
		callBacks:{},
		
		getHangmanWord: function () {
			
			return $._wordGame.gameDescriptor["answer"];
		
		},
		
		getHangmanClue: function () {
			
			return $._wordGame.gameDescriptor["clue"];
		
		},
		
		
		
		
		initHangmanGame: function (theGame) {
			
			
			//$('meta[name="viewport"]').attr('content', 'width=' +300 + ', user-scalable:no');
			 
			$._hangMan.gameState={};
			
			$._hangMan.manImageProperties={file:"images/parachutist_small.png",framewidth:89,height:75};
			$._hangMan.instructionTxt="Hangman is a word-guessing game. The row of dashes indicates the number of letters to be guessed. "+
				"Click or tap a letter. If it's in the word, it replaces the dash(es). Each wrong guess results in a string being broken on the parachute. When all the strings are broken our friend falls to the ground. "+
				"Your role is to guess the word correctly before the victim meets his grisly fate. ";
			
			
			theGame.html("<div id='title'><h1>HangMan</h1><div id='help'></div></div>");
			
					
			$('<p class= "instructions" />', {
					text: $._hangMan.instructionTxt
					
					}).appendTo(theGame).hide();
					
			$('#title').click(function(){$('.instructions').slideToggle();});
			$('.instructions').click(function(){$('.instructions').slideToggle();});
			
			theGame.append("<div id='drawingBackground'><div id='para'></div>"+
				"<div id='para_man'></div></div>");
			
			$('#gameOver').hide();
			$('#btnNext').hide();
		
			theGame.append("<div id='clue'></div>");
			theGame.append("<div id='word'>Word</div>");
			theGame.append("<div id='letters'>Letters</div>");
			theGame.append("<div id='gameOver'></div>"+
				"<div class='nextButton'><button id='btnNext'>Continue...</button></div>");
			$('#gameOver').hide();
			$('#btnNext').hide();
			
			//$('#drawingBackground').spStop();
			
			$('#drawingBackground').pan({fps: 30, speed: 1, dir: 'up'});
			
			
	
			
			$._hangMan.newHangmanGame();
			$._hangMan.upDateImage();
			if($._hangMan.callBacks.OnGameStart)
					$._hangMan.callBacks.OnGameStart($._hangMan.gameState);
	
			
		},
		
		
		newHangmanGame: function () {
			$('#quit').show();
			$('#letters').show();
			$('#word').show();
			$('#gameOver').hide();
			$('#btnNext').hide();
			
		
			$._hangMan.gameState=new Object();
			$.extend($._hangMan.gameState,$._wordGame.gameDescriptor);
			$._hangMan.gameState.badGuesses=0;		   
			$._hangMan.gameState.correctGuesses = 0;
			$._hangMan.gameState.wordToGuess = $._hangMan.getHangmanWord().toLowerCase();
			$._hangMan.gameState.wordLength = $._hangMan.gameState.wordToGuess.length;
			$._hangMan.gameState.usedLetters="";
			$._hangMan.gameState.letterstoGuess=$._hangMan.gameState.wordLength;
			
			$("#clue").html("Clue: "+$._hangMan.getHangmanClue());
			
			// create row of underscores the same length as letters to guess
			var placeholders = '';
		
			for (var i = 0; i < $._hangMan.gameState.wordLength; i++) {
				var c= $._hangMan.gameState.wordToGuess.charAt(i); //use charAt fror ie6,7
				if(c>='a' && c<='z'){
					placeholders += '_';
				}
				else{
					placeholders += c;
				}
					
			}
			$('#word').html(placeholders) ;
			 
			$('#letters').html('');
			
			//generate buttons of the alphabet
			var buttonClass="";
			for (i = 0; i < 26; i++) {
				var c= String.fromCharCode(65 + i);
				if(i>=0 && i<9)		buttonClass="row9";
				if(i>=9 && i<17) 	buttonClass="row8";
				if(i>=17 && i <26) 	buttonClass="row9";
				$('<div/>', {
					click: function(){$._hangMan.letterTried($(this).html());},
					"id": "letterButton"+c,
					"class":buttonClass,
					"text":c
					}
					).appendTo('#letters'); //ie6,7 hack to add html after creation
			}
				
			
			$(document).keypress(function(event){
				$._hangMan.letterTried(String.fromCharCode(event.which).toUpperCase());
				});
				
			$._hangMan.gameState.onGoing=true;
		
			
		},
		
		letterTried: function (letter) {
			
			if(!$._hangMan.gameState.onGoing) return;
			
			//check if char is alphabetic
			var re = /^([a-zA-Z])$/;

			if(!re.test(letter)){
				return; //not apha, ignore
			}
			
			if($._hangMan.gameState.usedLetters.search(letter)==-1){
				$._hangMan.gameState.usedLetters+=letter;
				buttonID="#letterButton"+letter;
				//$(buttonID).fadeTo("quick",0.15);
				$(buttonID).addClass("letterDisabled");
				$._hangMan.checkLetter(letter);
			}
		},
		
		checkLetter: function (letter) {
		   var placeholders = $('#word').html(),
		   		wrongGuess = true;
		   
		   // split the placeholders into an array
		   placeholders = placeholders.split('');
		   // loop through the array
		   for (var i = 0; i < $._hangMan.gameState.wordLength; i++) {
			  // if the selected letter matches one in the word to guess,
			  // replace the underscore and increase the number of correct guesses
			  if ($._hangMan.gameState.wordToGuess.charAt(i).toUpperCase() == letter.toUpperCase()) {
				 placeholders[i] = letter;
				 wrongGuess = false;
				$._hangMan.gameState.letterstoGuess--;
				
				 
				 
			  }
		   }
		   if(wrongGuess===false){
			   $._hangMan.gameState.correctGuesses++;
		   }else{
			   $._hangMan.gameState.badGuesses++;
			   $('#drawingBackground').spSpeed($._hangMan.gameState.badGuesses+1); 
		   }
		   // if the guess was incorrect, increment the number of bad
		   // guesses and redraw the canvas
		   //drawCanvas();
		   $._hangMan.upDateImage();
		   
		   
		   // convert the array to a string and display it again
		   placeholders=placeholders.join('');
		   $('#word').html(placeholders);
		   
		   
		   
		   //check for wining condition
		   if($._hangMan.gameState.letterstoGuess===0){
				$._hangMan.gameState.won=true;
				$._hangMan.gameOver();
		   }
		   
		   if($._hangMan.gameState.badGuesses >=7){
				$._hangMan.gameState.lose=true;
				$._hangMan.gameOver()
		   }
		 
		},
		
		gameContinue: function(){
			if($._hangMan.callBacks.OnGameContinue)
					$._hangMan.callBacks.OnGameContinue($._hangMan.gameState);
					
			 window.location.reload();			
		},
		
		gameOver: function (){
			$._hangMan.gameState.onGoing=false;
			$._hangMan.showResult();
			var msg="";
			
			if($._hangMan.gameState.won===true){
				if($._hangMan.callBacks.OnGameWon)
					$._hangMan.callBacks.OnGameWon($._hangMan.gameState);
	

				msg="Well done! You found the word.";
				
				
			}
	
			if($._hangMan.gameState.lose===true){
				$('#para').fadeOut("slow");
				$('#para_man').animate({
					opacity: 0.0,
					bottom: '-=150'
					}, 
					2000
					);
				msg="Hard luck! You didn't find the word.";
				if($._hangMan.callBacks.OnGameLost)
					$._hangMan.callBacks.OnGameLost($._hangMan.gameState);
			}
			
			//save gamestate
			$.getJSON( $._hangMan.gameState.saveScript, $._hangMan.gameState); 
			
			$('#drawingBackground').spSpeed(0); 

			$('#letters').hide();
			
			$('#gameOver').html(msg).show("slow");
			$('#btnNext').show("slow").click($._hangMan.gameContinue);
			
			
		},
		

		

		// When the game is over, display missing letters in red
		showResult: function () {
			var placeholders = word.innerHTML;
			placeholders = placeholders.split('');
			for (i = 0; i < placeholders.length; i++) {
				if (placeholders[i] == '_') {
				placeholders[i] = '<span class="missedLetter">' + $._hangMan.gameState.wordToGuess.charAt(i).toUpperCase() + '</span>';
				}
			}
			word.innerHTML = placeholders.join('');
		},
		
		upDateImage: function (){
			var numStrings=7;
			var s=$._hangMan.gameState.badGuesses+1;
			$('#para').spState(s);
		}
	};
	

  $.fn.wordGame = function(callbacks,descriptor) {
		
	var gameTypes=new Array("hangman", "wordsearch");
	
	
	
	var gd = descriptor;

 	var params = {};
	//pull out params of query string
    var ps = window.location.search.split(/\?|&/);
    for (var i = 0; i < ps.length; i++) {
            if (ps[i]) {
                  var p = ps[i].split(/=/);
                  params[p[0]] = p[1];
            }
    }
	
	var userID={"name":params.name};
	
	if(!gd){
		$.ajax( //get the question & game
		{
				url: 'scripts/getGame.php',
				dataType: "json",
				async: false,
				data: userID,
				success: function(data)
				{
						gd = data;
				},
				complete: function(jqXHR, textStatus){
					j=jqXHR;
					}
	});	
	}
		
	$._wordGame.gameDescriptor=gd||{};
	
	$.extend($._wordGame.callBacks,callbacks||{});
	
	var gameType= gd["gametype"];
	
	if(gameType && jQuery.inArray(gameType,gameTypes)>=0){
		switch(gameType){
			case "hangman":
				$._hangMan.initHangmanGame(this);
				break;
			case "wordsearch":
				$._wordSearch.initGame(this);
				break;
		}
	}
	else{
		$.error( "Unknown Gametype:"+gameType);
	}
	
	return this;

  };
  
})( jQuery );


jQuery.fn.extend({ 
        disableSelection : function() { 
                return this.each(function() { 
                        this.onselectstart = function() { return false; }; 
                        this.unselectable = "on"; 
                        jQuery(this).css('user-select', 'none'); 
                        jQuery(this).css('-o-user-select', 'none'); 
                        jQuery(this).css('-moz-user-select', 'none'); 
                        jQuery(this).css('-khtml-user-select', 'none'); 
                        jQuery(this).css('-webkit-user-select', 'none'); 
                }); 
        } 
}); 
