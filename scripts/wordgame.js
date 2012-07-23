//begin jQuery wordGame game plugin

(function( $ ){
	
	
	/* the wordGame object contains data and method which are common to all the wordgames*/
	$._wordGame={
		callbacks:{}, //list of external functions to be called on variuos game events
		gameDescriptor:{}, //information required to setup game
		gameState:{}, //state of game at any time
		
		theGame: {}, //element (div) containg game
		
		
		//title creation and help behaviour
		insertTitle: function(title, instText){
			$._wordGame.theGame.html("<div id='title'><h1>"+title+"</h1><div id='help'></div></div>");
			
			$('<p class= "instructions" />').text(instText).appendTo(theGame).hide();
					
			$('#title').click(function(){$('.instructions').slideToggle();});
			$('.instructions').click(function(){$('.instructions').slideToggle();});
		},
		
		// create quit button and quit dialog behaviour
		insertQuitButton: function(){	
			
			$('<button id="quitBtn"/>').text('Exit Game').appendTo(theGame);
			$('<div id="quitConfirm">Are you sure you want to quit this game?<button id="btnQuitCancel">Cancel</button><button id="btnQuitConfirm">QUIT</button></div>').hide().appendTo(theGame);
					
			$('#quitBtn').click(function(){
				$('#quitBtn').hide();
				$('#quitConfirm').show("fast");
				});
			
			$('#btnQuitCancel').click(function(){
				$('#quitConfirm').hide();
				$('#quitBtn').show("fast");
				});
				
			$('#btnQuitConfirm').click(function(){
					$._wordGame.gameState.quit=true;
					$._wordGame.recordGameState();
					if($._wordGame.callBacks.OnGameQuit)
						$._wordGame.callBacks.OnGameQuit($._wordGame.gameState);
	
					$._wordGame.nextGame();
				});
				
				
		},
		
		//game over message and behaviour
		gameOver: function(win,msg){
			$._wordGame.gameState.won=win;
			$._wordGame.recordGameState();
			
			if(win==true && $._wordGame.callBacks.OnGameWon)
					$._wordGame.callBacks.OnGameWon($._wordGame.gameState);
			if(win==false && $._wordGame.callBacks.OnGameLost)
					$._wordGame.callBacks.OnGameLost($._wordGame.gameState);
					
			$('#quitBtn').hide();
			if(!msg){
				msg="You lost the game";
				if(win==true){
					msg="You won the game!";
				}
			}
			$._wordGame.theGame.append("<div id='gameOver'></div>"+
				"<div class='nextButton'><button id='btnNext'>Continue...</button></div>");
			
			$('#btnNext').click(function(){
				$._wordGame.nextGame();
				
				});
			
			$('#gameOver').html(msg).show("slow");
			
	
		},
		
		//write game state to a file
		recordGameState: function(){
			if($._wordGame.gameDescriptor.saveScript)
			$.getJSON($._wordGame.gameDescriptor.saveScript, $._wordGame.gameState);
		},
		
		nextGame:function(){// called when a game is over (win/lose or quit) loads follow on game
			 //reload this page (play again)
			 window.location.reload();		
		}
		
		
	},
	
	//=======================================================================
	//Word Search Game
	//=======================================================================
	//User is given a square (10x10) grid of seemingly random letters
	//User is given a  number of clues
	//user must find and select the answers to the clues in the grid
	//answers can be  horizontal or vertical or diagonal
	//=======================================================================
	$._wordSearch={
		
		gridState:{"dragging":false}, //for mouse control
	
		theGrid:[],// main 2d array of letters for game
		
		initGame: function (theGame) {
			
			$(theGame).addClass('wordsearch');
			
			var instructionsText=
				"Find the listed words in the grid of letters below. Words may be vertical, horizontal or diagonal";
			$._wordGame.insertTitle("WordSearch",instructionsText);
			
			
					
			
			var words=$._wordGame.gameDescriptor.words;
			var clues=$._wordGame.gameDescriptor.clues;
			gridSize=$._wordSearch.gridState.gridSize=10;
			
			//construct & populate the grid with spaces
			for(i=0;i<gridSize;i++){
				$._wordSearch.theGrid[i]=[];
				for(j=0;j<gridSize;j++){
					$._wordSearch.theGrid[i][j]=' ';
					
				}
			}
			
			var fitFuncs=[$._wordSearch.fitWordHoriz,$._wordSearch.fitWordVert,$._wordSearch.fitWordDiag]; 
			// these are the function &  directions for fitting words
			//we'll pick a function from this array later to fit a word in the grid
			

			
			var numSqs=gridSize*gridSize;
			
			var numDirections=fitFuncs.length;
			
			var direction=Math.floor(Math.random()*numDirections); 
			//pick one of horiz/vert,diag to start. Put it here so the each word is attempted to be placed in a different direction
			
			for(w in words){
				words[w]=words[w].toUpperCase();
				var word=words[w];
				if(word.length>gridSize){
					console.log( "word too long for grid(removed):"+word);
					words[w]='*';
					continue;
				}
				
				
				var wordPlaced=false;
				var sq=Math.floor(Math.random()*numSqs); //pick a random square to start trying to fit word
				

				var dirAttempts=0; //track how many different directions we've attempted (diag, horiz & vert)
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
					//we've tried all squares and all directions of each square and still cound't fit word
					console.log( "Unable to place word:"+word+" sq:"+sq+"d:"+dirAttempts);
					words[w]='*';//mark for deletion
				}
				
				
				
			}
			
			//delete all that coldn't fit
			for (var i = words.length-1; i >= 0; i--) {
				if (words[i]=='*') {
					words.splice(i, 1);
	
				}
			}
			
			//create a array to record which words are found (init to false)
			$._wordGame.gameState.wordsFound=[];
			for(w in words){
				$._wordGame.gameState.wordsFound.push(false);
			}
			
			//create the main grid for the game
			$('<table>',{
				"id" : "grid"
			}).appendTo(theGame);
			
			
				
			//populate the grid with fitted letters
			for(i=0;i<gridSize;i++){
				var row=$('<tr>',{
				"class":"row"});
				
				//var chars = "abcdefghijklmnopqrstuvwxyz";
				var chars = "-"; //for debug
	
				for(j=0;j<gridSize;j++){
					c=$._wordSearch.theGrid[i][j];
					if(c==' '){ // unfilled grid slots get a random char
						var rnum = Math.floor(Math.random() * chars.length);
						c=$._wordSearch.theGrid[i][j]=chars.substring(rnum,rnum+1);
					}
					
					var cell=$("<td>").appendTo(row);
					
					$("<div>",{ 
						"class":"square",
						"text" :c,
						"data": {x:j,y:i}}).appendTo(cell);// grid slot
				}
				$('#grid').append(row);
			}
			
			theGame.append("<div id='currentWord'>test</div>");//debug
			
			$._wordSearch.gridState.selectedWord='';
			
			$('.square').click(function(){;}); //debug
			
			//
			$('.square').on("touchstart",function(event){
				event.preventDefault();
				event.stopPropagation();
				$._wordSearch.gridState.dragging=true;
				$._wordSearch.gridState.startSq=$(event.target).data();
				$._wordSearch.gridState.endSq=$._wordSearch.gameState.startSq;
				$._wordSearch.computeSelectedSquares();	
				$('#currentWord').html("ts:");	//debug		
				});
		
			$('.square').on("touchmove",function(event){
				event.preventDefault();
				event.stopPropagation();
				var evt=event.originalEvent;
				var elem = document.elementFromPoint(evt.pageX, evt.pageY);
				//$('#currentWord').html("te:"+evt.pageX+";"+evt.pageY+$(elem).html());	
				if($._wordSearch.gridState.dragging){
					$._wordSearch.gridState.endSq=$(elem).data();
					$._wordSearch.computeSelectedSquares();
					
				}
			});		
			
			$('.square').on("touchend",function(event){		
				event.preventDefault();
				event.stopPropagation();
				$._wordSearch.gridState.dragging=false;
				
				$._wordSearch.computeSelectedSquares();
				$._wordSearch.checkSelectedWord();
				$('.selectedSquare').removeClass('selectedSquare');
				$('#currentWord').html("mu:"+$._wordSearch.selectedWord);
				
			});	
				
			//start selecting letters
			$('.square').mousedown(function(){	
				$._wordSearch.gridState.dragging=true;
				$._wordSearch.gridState.startSq=$(this).data();
				$._wordSearch.gridState.endSq=$(this).data();
				$._wordSearch.computeSelectedSquares();//this will highlight the selected squares
				});
		
			//if we drag into a new square
			$('.square').mouseenter(function(){
				if($._wordSearch.gridState.dragging){
					$._wordSearch.gridState.endSq=$(this).data();
					$._wordSearch.computeSelectedSquares();
					}
				});
	
			//end selection
			$('.square').mouseup(function(){
				if($._wordSearch.gridState.dragging==false) return;
				$._wordSearch.gridState.dragging=false;
				$._wordSearch.gridState.endSq=$(this).data();
				$._wordSearch.computeSelectedSquares(); //this will highlight the selected squares
				$._wordSearch.checkSelectedWord(); //check if the word is in the list & higlight as correct
				$('.selectedSquare').removeClass('selectedSquare');// unselect selected squares

				});		
				
			// if mouse drags of the grid, treat as selection ended
			$('#grid').mouseleave(function(){
				if($._wordSearch.gridState.dragging==false) return;
				$._wordSearch.gridState.dragging=false;
				$._wordSearch.computeSelectedSquares();
				$._wordSearch.checkSelectedWord();
				$('.selectedSquare').removeClass('selectedSquare');

				});		
			
			/*$('.wsSquare').on("touchend",function(event){
				event.preventDefault();
				event.stopPropagation();
				$._wordSearch.gameState.dragging=false;
				
				var evt=event.originalEvent;

				var elem = document.elementFromPoint(evt.changedTouches[0].pageX, evt.changedTouches[0].pageY);	
				
				var s=evt.pageX+';'+evt.pageY+';' +$(elem).html()+'|';
				for(i=0;i< event.originalEvent.changedTouches.length;i++){
					s+=String(event.originalEvent.changedTouches[i].pageX);
				}
				$('#currentWord').html(s);
				
			
				$._wordSearch.gameState.endSq=$(elem).data();
				$._wordSearch.computeSelectedSquares();
				$._wordSearch.checkSelectedWord();
				$('.wsSelectedSquare').removeClass('wsSelectedSquare');
				
				});
			*/	
			$('.wordsearch').disableSelection();//don't want mouse drags to do default browser selection
			
			
			//add list of clues to bottom
			$('<div id="wordsToFind">Words to find</div>').appendTo(theGame);
				
			var table =$('<table id="wordsToFind">').appendTo(theGame);
			
			var row;
			for(i=0;i<words.length;i++){
				if(i%2==0)
					row=$('<tr>').appendTo(table);
				
				$('<td>',{"text" :words[i].toUpperCase()}).addClass(function(index) {
  					return "word-" + i;}).appendTo(row);
			}
			
			//quitbutton
			$._wordGame.insertQuitButton();
			
		},
		
		//select sqyaues based on mouse start and end dragging
		//also figure out word selected
		computeSelectedSquares: function(){
			//deselect currently selected squares
			$(".selectedSquare").removeClass('selectedSquare');
			var s=$._wordSearch.gridState.startSq;
			var e=$._wordSearch.gridState.endSq;

			
			var xInc=0;
			var yInc=0;
			
			$._wordSearch.gridState.selectedWord='';
			
			var sqW=Math.abs(e.x-s.x); // width and height of rectangle encloseing start and end
			var sqH=Math.abs(e.y-s.y);
			
			//slope of dragging gesture use to determin horiz/vert or diag selection
			var slope=sqW==0 ? Number.MAX_VALUE : sqH/sqW ;
			
			if(s.x<e.x) xInc=1; //slection goes left to right
			if(s.x>e.x) xInc=-1;//right to left
			if(s.y<e.y) yInc=1;//bottom to top
			if(s.y>e.y) yInc=-1;// top to bottom

	
			
			if(slope<0.5){// dir is horiz
				
				for(i=s.x,c=0;c<=sqW;c++,i+=xInc){ //select a row
					ch=$._wordSearch.highlightSquare(i,s.y);
					$._wordSearch.gridState.selectedWord+=ch;
				}
			}
			else if(slope>2){// dir is vert

				for(j=s.y,c=0;c<=sqH;c++,j+=yInc){// select a column
					ch=$._wordSearch.highlightSquare(s.x,j);
					$._wordSearch.gridState.selectedWord+=ch;
					
				
				}
			}
			else{
				var dMax=Math.max(sqW,sqH);// max length of diagonal word
				gridSize=$._wordSearch.gridState.gridSize;
				for(i=s.x,j=s.y,c=0;
					c<=dMax &&  
					i >=0 && j>=0 && i<gridSize && j< gridSize; // make sure selection stays inside grid
					i+=xInc,j+=yInc,c++){
					ch=$._wordSearch.highlightSquare(i,j);
					$._wordSearch.gridState.selectedWord+=ch;
				}}//dir is diag
			
			if(xInc==-1 || (xInc==0 && yInc==-1) ){// reverse word in case of bottom -top or right-left selection
				$._wordSearch.gridState.selectedWord=$._wordSearch.gridState.selectedWord.split("").reverse().join("");
			}
			

			if($._wordGame.gameDescriptor.rightleftlanguage==true){// reverse for right/left languages
				$._wordSearch.gridState.selectedWord=$._wordSearch.gridState.selectedWord.split("").reverse().join("");
			};
			
			
			$('#currentWord').html($._wordGame.gameState.selectedWord);//debug
			
			
			
			
		},
		
		//check select word in list of words
		//mark as found
		checkSelectedWord: function(){
			var words=$._wordGame.gameDescriptor.words;
			for(w in words){
					if($._wordSearch.gridState.selectedWord.toUpperCase()==words[w].toUpperCase()){
						$._wordGame.gameState.wordsFound[w]=true;// mark as found in array of bools
						$('.selectedSquare').addClass('correctSquare'); // highlight
						$('.word-'+w).addClass('wordFound'); // strike throug clue
					}
				}
			
			//check for winning condition
			var won =true;
			for(i in $._wordGame.gameState.wordsFound){
				if($._wordGame.gameState.wordsFound[i]==false){
					won=false;
					break;
				}
			}
			
			if(won==true){ // all words found
				$._wordGame.gameOver(true,"You found all the words");
			}
				
			
		},
		
		highlightSquare: function(x,y){
					idx=$._wordSearch.gridIdx(x,y);// convert 2d grid coords into 1d index of all squares
					$('.square').eq(idx).addClass("selectedSquare");
					return $('.square').eq(idx).html(); //return letter in square
		},
		
		gridIdx: function(x,y){// convert 2d grid coords into 1d index of all squares
		
			return idx=$._wordSearch.gridState.gridSize* y + x;
		},
		
		sqXY: function(sq,width){// get x & y coords of a square number in a box of width
			var pos={};
			pos.x=sq%width;
			pos.y=Math.floor((sq-pos.x)/width);
			return pos;
		},
		
		fitWordHoriz: function(word,pos){ // try to put word horisontaly in to partially filled grid at position pos
			wl=word.length;
			if((wl+pos.x) > $._wordSearch.gridState.gridSize)
				return false; // word too long to fit
			for(i=0;i<wl;i++){ //check if putting word into grid will not clash with previous words
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
		
		fitWordVert: function(word,pos){//same logic as fitWordHoriz
			wl=word.length;
			if((wl+pos.y) >$._wordSearch.gridState.gridSize)
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
		
		fitWordDiag: function(word,pos){//same logic as fitWordHoriz
			wl=word.length;
			if((wl+pos.x) > $._wordSearch.gridState.gridSize ||(wl+pos.y) >$._wordSearch.gridState.gridSize )
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
			 
	
			$(theGame).addClass('hangman');
			$._hangMan.manImageProperties={file:"images/parachutist_small.png",framewidth:89,height:75};
			
			instructionsText="Hangman is a word-guessing game. The row of dashes indicates the number of letters to be guessed. "+
				"Click or tap a letter. If it's in the word, it replaces the dash(es). Each wrong guess results in a string being broken on the parachute. When all the strings are broken our friend falls to the ground. "+
				"Your role is to guess the word correctly before the victim meets his grisly fate. ";
			
			
			$._wordGame.insertTitle("HangMan",instructionsText)
			
			theGame.append("<div id='drawingBackground'><div id='para'></div>"+
				"<div id='para_man'></div></div>");
			
			$('#gameOver').hide();
			$('#btnNext').hide();
		
			theGame.append("<div id='clue'></div>");
			theGame.append("<div id='word'>Word</div>");
			theGame.append("<div id='letters'>Letters</div>");
			
			$('#drawingBackground').pan({fps: 30, speed: 1, dir: 'up'});
			
			$._hangMan.newHangmanGame();
			$._hangMan.upDateImage();
			
			$._wordGame.insertQuitButton();
			
		},
		
		
		newHangmanGame: function () {
	
			$('#letters').show();
			$('#word').show();
		
		
			$._wordGame.gameState=new Object();
			$.extend($._wordGame.gameState,$._wordGame.gameDescriptor);
			$._wordGame.gameState.badGuesses=0;		   
			$._wordGame.gameState.correctGuesses = 0;
			$._wordGame.gameState.wordToGuess = $._hangMan.getHangmanWord().toLowerCase();
			$._wordGame.gameState.wordLength = $._wordGame.gameState.wordToGuess.length;
			$._wordGame.gameState.usedLetters="";
			$._wordGame.gameState.letterstoGuess=$._wordGame.gameState.wordLength;
			
			$("#clue").html("Clue: "+$._hangMan.getHangmanClue());
			
			// create row of underscores the same length as letters to guess
			var placeholders = '';
		
			for (var i = 0; i < $._wordGame.gameState.wordLength; i++) {
				var c= $._wordGame.gameState.wordToGuess.charAt(i); //use charAt fror ie6,7
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
				
			$._wordGame.gameState.onGoing=true;
		
			
		},
		
		letterTried: function (letter) {
			
			if(!$._wordGame.gameState.onGoing) return;
			
			//check if char is alphabetic
			var re = /^([a-zA-Z])$/;

			if(!re.test(letter)){
				return; //not apha, ignore
			}
			
			if($._wordGame.gameState.usedLetters.search(letter)==-1){
				$._wordGame.gameState.usedLetters+=letter;
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
		   for (var i = 0; i < $._wordGame.gameState.wordLength; i++) {
			  // if the selected letter matches one in the word to guess,
			  // replace the underscore and increase the number of correct guesses
			  if ($._wordGame.gameState.wordToGuess.charAt(i).toUpperCase() == letter.toUpperCase()) {
				 placeholders[i] = letter;
				 wrongGuess = false;
				$._wordGame.gameState.letterstoGuess--;
				
				 
				 
			  }
		   }
		   if(wrongGuess===false){
			   $._wordGame.gameState.correctGuesses++;
		   }else{
			   $._wordGame.gameState.badGuesses++;
			   $('#drawingBackground').spSpeed($._wordGame.gameState.badGuesses+1); 
		   }
		   // if the guess was incorrect, increment the number of bad
		   // guesses and redraw the canvas
		   //drawCanvas();
		   $._hangMan.upDateImage();
		   
		   
		   // convert the array to a string and display it again
		   placeholders=placeholders.join('');
		   $('#word').html(placeholders);
		   
		   
		   
		   //check for wining condition
		   if($._wordGame.gameState.letterstoGuess===0){
				$._wordGame.gameState.won=true;
				$._hangMan.gameOver();
		   }
		   
		   if($._wordGame.gameState.badGuesses >=7){
				$._wordGame.gameState.lose=true;
				$._hangMan.gameOver()
		   }
		 
		},
		
		/*gameContinue: function(){
			if($._hangMan.callBacks.OnGameContinue)
					$._hangMan.callBacks.OnGameContinue($._wordGame.gameState);
					
			 window.location.reload();			
		},*/
		
		gameOver: function (){
			$._wordGame.gameState.onGoing=false;
			$._hangMan.showResult(); //show unsolved letters in red
			var msg="";
			$._wordGame.gameState=$._wordGame.gameState;
			
			if($._wordGame.gameState.won===true){
				msg="Well done! You found the word.";
				$._wordGame.gameOver(true,msg);
				
				
			}
	
			if($._wordGame.gameState.lose===true){
				$('#para').fadeOut("slow");
				$('#para_man').animate({
					opacity: 0.0,
					bottom: '-=150'
					}, 
					2000
					);
				msg="Hard luck! You didn't find the word.";
				
				$._wordGame.gameOver(false,msg);
			}
			
			//save gamestate
			//$.getJSON( $._wordGame.gameState.saveScript, $._wordGame.gameState); 
			
			$('#drawingBackground').spSpeed(0); 

			$('#letters').hide();
			
			//$('#gameOver').html(msg).show("slow");
			//$('#btnNext').show("slow").click($._hangMan.gameContinue);
			
			
		},
		

		

		// When the game is over, display missing letters in red
		showResult: function () {
			var placeholders = word.innerHTML;
			placeholders = placeholders.split('');
			for (i = 0; i < placeholders.length; i++) {
				if (placeholders[i] == '_') {
				placeholders[i] = '<span class="missedLetter">' + $._wordGame.gameState.wordToGuess.charAt(i).toUpperCase() + '</span>';
				}
			}
			word.innerHTML = placeholders.join('');
		},
		
		upDateImage: function (){
			var numStrings=7;
			var s=$._wordGame.gameState.badGuesses+1;
			$('#para').spState(s);
		}
	};
	
$._wordMix={ //word mix game methods & state
			
		callBacks:{},
		
		getWord: function () {
			
			return $._wordGame.gameDescriptor["answer"];
		
		},
		
		getClue: function () {
			
			return $._wordGame.gameDescriptor["clue"];
		
		},
		
		getImage: function () {
			
			var img= $._wordGame.gameDescriptor["image"];
			if(!img)
				img="images/default-wordmix.png";
				
			return img;
		
		},
		
		
		
		
		initGame: function (theGame) {
			
			
			//$('meta[name="viewport"]').attr('content', 'width=' +300 + ', user-scalable:no');
			 
		
			
			$._wordMix.instructionTxt="Wordmix is a word-guessing game. Use the letters below to complete the word which matches the clue. ";
			
			
			
			$(theGame).addClass('wordmix');
					
		
			$._wordGame.insertTitle("WordMix",$._wordMix.instructionTxt);
			
			
			var img=$._wordMix.getImage();
			$('<div id= "image" />')
				.css("background-image","url("+img+")")
				.appendTo(theGame);
			
			
			theGame.append("<div id='clue'></div>");
			theGame.append("<div id='word'></div>");
			theGame.append("<div id='letters'>Letters</div>");
			
			$._wordMix.newGame();
			//$._wordMix.upDateImage();
			
			//if($._wordMix.callBacks.OnGameStart)
					//$._wordMix.callBacks.OnGameStart($._wordGame.gameState);
			$._wordGame.insertQuitButton();
			
		},
		
		
		newGame: function () {
			
			console.log("entering init");
			/*
			$('#quit').show();
			$('#letters').show();
			$('#word').show();
			$('#gameOver').hide();
			$('#btnNext').hide();*/
			
		
			$._wordGame.gameState=new Object();
			$.extend($._wordGame.gameState,$._wordGame.gameDescriptor);
			$._wordGame.gameState.MAX_LENGTH=9;		
			$._wordGame.gameState.LETTERS_TO_SELECT=12;
			$._wordGame.gameState.badGuesses=0;		   
			$._wordGame.gameState.correctGuesses = 0;
			$._wordGame.gameState.wordToGuess = $._wordMix.getWord().toUpperCase();
			$._wordGame.gameState.wordLength = $._wordGame.gameState.wordToGuess.length;
			$._wordGame.gameState.usedLetters="";
			$._wordGame.gameState.letterstoGuess=$._wordGame.gameState.wordLength;
			
			$("#clue").html("Clue: "+$._wordMix.getClue());
			
			// create row of underscores the same length as letters to guess
			var placeholders = '';
			var letters='';
			var lettercount=0;
		
			//strip out all non alphas and clip to max length
			for (var i = 0; i < $._wordGame.gameState.wordLength; i++) {
				var c= $._wordGame.gameState.wordToGuess.charAt(i); //use charAt fror ie6,7
				if(c>='A' && c<='Z' && lettercount <$._wordGame.gameState.MAX_LENGTH){
					placeholders += c;
					letters+=c;
					lettercount++
				}
			}
			
			$._wordGame.gameState.wordToGuess=placeholders;
			$._wordGame.gameState.wordLength=$._wordGame.gameState.wordToGuess.length;
			
			var ttable1=$('<table/>').appendTo('#word');
			var trow1=$('<tr/>').appendTo(ttable1);
			 
			for (var i = 0; i < $._wordGame.gameState.wordLength; i++) {
				var tcell1=$('<td/>').appendTo(trow1);
				$('<div/>', {
					click: function(){$._wordMix.removeLetter($(this))},
					"id": "letter"+i,
					"class":"letterPlace letterEmpty letterBtn",
					"text":"?"
					}).appendTo(tcell1); 
			}
			 
			$('#letters').html('');
			
			console.log("entering init0:" + letters);	
			
			// fill remianing slots in letters array with random characters
			var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			for(i=letters.length;i<$._wordGame.gameState.LETTERS_TO_SELECT;i++){
				
				do{// only add letters not already in set
					var rnum = Math.floor(Math.random() * chars.length);
					c=chars.substring(rnum,rnum+1);
					console.log("getting rnd letter:"+letters+"+"+c);
				}while(letters.indexOf(c)!=-1);
				letters+=c;
				
			}
			console.log("entering init1");
			
			//shuffle letters using Fisher-Yates shuffle
			var a = letters.split("");
 			while (--i) {
				  var j = Math.floor(Math.random() * (i + 1))
				  var temp = a[i];
				  a[i] = a[j];
				  a[j] = temp;
			}
			
			letters=a.join("");
			
			var buttonClass="letterBtn";
			var ttable=$('<table/>').appendTo('#letters');
			var trow=trow=$('<tr/>').appendTo(ttable);
			for (i = 0; i < letters.length; i++) {
				
				if(i==6) {
					trow=$('<tr/>').appendTo(ttable);
					
				}
				var tcell=$('<td/>').appendTo(trow);
				$('<div/>', {
					click: function(){$._wordMix.letterTried($(this).html(),$(this).attr('id'));},
					"id": "letterButton"+i,
					"class":buttonClass,
					"text":letters[i]
					}
					).appendTo(tcell); //ie6,7 hack to add html after creation
			}
			
			console.log("entering init2");	
			
			/*$(document).keypress(function(event){
				$._wordMix.letterTried(String.fromCharCode(event.which).toUpperCase());
				});*/
				
			$._wordGame.gameState.onGoing=true;
			
		
			
		},
		
		letterTried: function (letter,btnID) {
			btnID='#'+btnID;
			if(!$._wordGame.gameState.onGoing) return;
			
			//check if char is alphabetic
			var re = /^([a-zA-Z])$/;

			if(!re.test(letter)){
				return; //not apha, ignore
			}
			
			
			
			if($(btnID).hasClass("letterDisabled"))
			    return; // button disabled ignore
			
			
			$._wordGame.gameState.usedLetters+=letter;
				
			
			if($._wordMix.addLetter(letter,btnID)) // if letter gets added, disable this one
				$(btnID).addClass("letterDisabled",btnID);
			
		},
		
		addLetter:function(letter,btnID){
			if($(".letterEmpty").length==0)
				return false;
				
			$(".letterEmpty").first().
				html(letter).
				data('srcBtn',btnID).
				removeClass("letterEmpty");
			
			if($(".letterEmpty").length==0)	
			{
				$._wordMix.checkWord();
			}
			
			return true;
		
		},
		
		checkWord: function(){
			var word='';
			$('.letterPlace').each(function(){
					word+=$(this).html()
					});
			
			if($._wordGame.gameState.wordToGuess===word){
				$('#word').addClass("wordCorrect");
				$._wordGame.gameState.won=true;
				$._wordMix.gameOver();
				
		   	}
			else{
				$('#word').addClass("wordWrong");
			}
		   
	
			
		},
		
		removeLetter: function(elem){
			if(elem.hasClass("letterEmpty"))
				return;
				
	
			$('#word').removeClass("wordCorrect");	
			$('#word').removeClass("wordWrong");
			
			var btnSrc=elem.data('srcBtn');
			$(btnSrc).removeClass("letterDisabled");
			
			elem.html('?')
				.addClass("letterEmpty")
				.removeData('srcBtn');
				

			
			
		},
		
		/*
		checkLetter: function (letter) {
		   var placeholders = $('#word').html(),
		   		wrongGuess = true;
		   
		   // split the placeholders into an array
		   placeholders = placeholders.split('');
		   // loop through the array
		   for (var i = 0; i < $._wordGame.gameState.wordLength; i++) {
			  // if the selected letter matches one in the word to guess,
			  // replace the underscore and increase the number of correct guesses
			  if ($._wordGame.gameState.wordToGuess.charAt(i).toUpperCase() == letter.toUpperCase()) {
				 placeholders[i] = letter;
				 wrongGuess = false;
				$._wordGame.gameState.letterstoGuess--;
				
				 
				 
			  }
		   }
		   if(wrongGuess===false){
			   $._wordGame.gameState.correctGuesses++;
		   }else{
			   $._wordGame.gameState.badGuesses++;
			   
		   }
		   // if the guess was incorrect, increment the number of bad
		   // guesses and redraw the canvas
		   //drawCanvas();
		   //$._wordMix.upDateImage();
		   
		   
		   // convert the array to a string and display it again
		   placeholders=placeholders.join('');
		   $('#word').html(placeholders);
		   
		   
		   
		   //check for wining condition
		   if($._wordGame.gameState.letterstoGuess===0){
				$._wordGame.gameState.won=true;
				$._wordMix.gameOver();
		   }
		   
		   if($._wordGame.gameState.badGuesses >=7){
				$._wordGame.gameState.lose=true;
				$._wordMix.gameOver();
		   }
		 
		},
		
		*/
	
		
		gameOver: function (){
			$._wordGame.gameState.onGoing=false;
			//$._wordMix.showResult();
			
			$._wordGame.gameOver($._wordGame.gameState.won);
			
/*			var msg="";
			
			if($._wordGame.gameState.won===true){
				if($._wordMix.callBacks.OnGameWon)
					$._wordMix.callBacks.OnGameWon($._wordGame.gameState);
	

				msg="Well done! You found the word.";
				
				
			}
	
			if($._wordGame.gameState.lose===true){
				$('#para').fadeOut("slow");
				$('#para_man').animate({
					opacity: 0.0,
					bottom: '-=150'
					}, 
					2000
					);
				msg="Hard luck! You didn't find the word.";
				if($._wordMix.callBacks.OnGameLost)
					$._wordMix.callBacks.OnGameLost($._wordGame.gameState);
			}
			
			//save gamestate
			$.getJSON( $._wordGame.gameState.saveScript, $._wordGame.gameState); 
			
			

			$('#letters').hide();
			
			$('#gameOver').html(msg).show("slow");
			$('#btnNext').show("slow").click($._wordMix.gameContinue);
			*/
			
		},
		

		
		/*
		// When the game is over, display missing letters in red
		showResult: function () {
			var placeholders = word.innerHTML;
			placeholders = placeholders.split('');
			for (i = 0; i < placeholders.length; i++) {
				if (placeholders[i] == '_') {
				placeholders[i] = '<span class="missedLetter">' + $._wordGame.gameState.wordToGuess.charAt(i).toUpperCase() + '</span>';
				}
			}
			word.innerHTML = placeholders.join('');
		},
		
		upDateImage: function (){
			var numStrings=7;
			var s=$._wordGame.gameState.badGuesses+1;
			$('#para').spState(s);
		}
		*/
	};
	
  $.fn.wordGame = function(callbacks) {
		
	var gameTypes=new Array("hangman", "wordsearch", "wordmix");
	
	
	
	var gd = {};

 	var params = {};
	//pull out params of query string
    var ps = window.location.search.split(/\?|&/);
    for (var i = 0; i < ps.length; i++) {
            if (ps[i]) {
                  var p = ps[i].split(/=/);
                  params[p[0]] = p[1];
            }
    }
	
	
	var gameData={"name":params.name,"gameType":params.gameType};
	
	$.ajax( //get the question & game
		{
				url: 'scripts/getGame.php',
				dataType: "json",
				async: false,
				data: gameData,
				success: function(data)
				{
						gd = data;
				},
				complete: function(jqXHR, textStatus){
					j=jqXHR;
					}
	});	
	
		
	$._wordGame.gameDescriptor=gd||{};
	$._wordGame.theGame=this;
	$._wordGame.callBacks=callbacks||{};
	
	var gameType= gd["gametype"];
	
	
	if(gameType && jQuery.inArray(gameType,gameTypes)>=0){
		if($._wordGame.callBacks.OnGameStart)
					$._wordGame.callBacks.OnGameStart(gd);
		switch(gameType){
			case "hangman":
				$._hangMan.initHangmanGame(this);
				break;
			case "wordsearch":
				$._wordSearch.initGame(this);
				break;			
			case "wordmix":
				$._wordMix.initGame(this);
				break;
		}
	}
	else{
		$.console.log( "Unknown Gametype:"+gameType);
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
