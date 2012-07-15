//begin jQuery wordGame game plugin

(function( $ ){

	$._hangMan={ //hangman methods & state
			
		callBacks:{},
		
		getHangmanWord: function () {
			
			return $._hangMan.gameDescriptor["answer"];
		
		},
		
		getHangmanClue: function () {
			
			return $._hangMan.gameDescriptor["clue"];
		
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
			
		
			$._hangMan.gameState=new Object();
			$.extend($._hangMan.gameState,$._hangMan.gameDescriptor);
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
			$.getJSON( $._hangMan.gameDescriptor.saveScript, $._hangMan.gameState); 
			
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
	

  $.fn.wordGame = function(gd,callbacks	) {
		
	var gameTypes=new Array("hangman");
	
	$._hangMan.gameDescriptor=gd||{};
	
	$.extend($._hangMan.callBacks,callbacks||{});
	
	var gameType= gd["gametype"];
	
	if(gameType && jQuery.inArray(gameType,gameTypes)>=0){
		switch(gameType){
			case "hangman":
				$._hangMan.initHangmanGame(this);
		}
	}
	else{
		$.error( "Unknown Gametype:"+gameType);
	}
	
	return this;

  };
  
})( jQuery );


