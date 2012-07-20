//begin jQuery wordGame game plugin

(function( $ ){
	
	$._wordGame={
		callbacks:{},
		gameDescriptor:{},
		
		theGame: {},
		
		insertTitle: function(title, instText){
			$._wordGame.theGame.html("<div id='title'><h1>"+title+"</h1><div id='help'></div></div>");
			
			$('<p class= "instructions" />').text(instText).appendTo(theGame).hide();
					
			$('#title').click(function(){$('.instructions').slideToggle();});
			$('.instructions').click(function(){$('.instructions').slideToggle();});
		}
	},
	
	$._wordSearch={
		
		gameState:{"dragging":false},
	
		theGrid:[],
		
		initGame: function (theGame) {
			
			$.extend($._wordSearch.gameState,$._wordGame.gameDescriptor);
			$(theGame).addClass('wordsearch');
			
			var instructionsText=
				"Find the listed words in the grid of letters below. Words may be vertical, horizontal or diagonal";
			
			$._wordGame.insertTitle("WordSearch",instructionsText)
			
			
			var words=$._wordGame.gameDescriptor.words;
			var table =$('<table id="wordsToFind">').appendTo(theGame);
			
			var row;
			for(i=0;i<words.length;i++){
				if(i%2==0)
					row=$('<tr>').appendTo(table);
				$('<td>',{"text" :words[i].toUpperCase()}).addClass(function(index) {
  					return "word-" + i;}).appendTo(row);
			}
			
			
					
			//populate the grid
			gridSize=$._wordSearch.gameState.gridSize=12;
			for(i=0;i<gridSize;i++){
				$._wordSearch.theGrid[i]=[];
				for(j=0;j<gridSize;j++){
					$._wordSearch.theGrid[i][j]=' ';
					
				}
			}
			
			var fitFuncs=[$._wordSearch.fitWordHoriz,$._wordSearch.fitWordVert,$._wordSearch.fitWordDiag]; // these are the3 directions for fitting words
			

			
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
				"id" : "grid"
			}).appendTo(theGame);
			
			
				
			for(i=0;i<gridSize;i++){
				var row=$('<tr>',{
				"class":"row"});
				
				var chars = "abcdefghijklmnopqrstuvwxyz";
	
				for(j=0;j<gridSize;j++){
					c=$._wordSearch.theGrid[i][j];
					if(c==' '){
						var rnum = Math.floor(Math.random() * chars.length);
						c=$._wordSearch.theGrid[i][j]=chars.substring(rnum,rnum+1);
					}
					
					var cell=$("<td>").appendTo(row);
					
					$("<div>",{ 
						"class":"square",
						"text" :c,
						"data": {x:j,y:i}}).appendTo(cell);
				}
				$('#grid').append(row);
			}
			
			theGame.append("<div id='currentWord'></div>");
			
			$._wordSearch.gameState.selectedWord='';
			
			$('.square').click(function(){;});
			
			$('.square').on("touchstart",function(event){
				event.preventDefault();
				event.stopPropagation();
				$._wordSearch.gameState.dragging=true;
				$._wordSearch.gameState.startSq=$(event.target).data();
				$._wordSearch.gameState.endSq=$._wordSearch.gameState.startSq;
				$._wordSearch.computeSelectedSquares();	
				$('#currentWord').html("ts:");			
				});
		
			$('.square').on("touchmove",function(event){
				event.preventDefault();
				event.stopPropagation();
				var evt=event.originalEvent;
				var elem = document.elementFromPoint(evt.pageX, evt.pageY);
				//$('#currentWord').html("te:"+evt.pageX+";"+evt.pageY+$(elem).html());	
				if($._wordSearch.gameState.dragging){
					$._wordSearch.gameState.endSq=$(elem).data();
					$._wordSearch.computeSelectedSquares();
					
				}
			});		
			
			$('.square').on("touchend",function(event){		
				event.preventDefault();
				event.stopPropagation();
				$._wordSearch.gameState.dragging=false;
				
				$._wordSearch.computeSelectedSquares();
				$._wordSearch.checkSelectedWord();
				$('.selectedSquare').removeClass('selectedSquare');
				$('#currentWord').html("mu:"+$._wordSearch.selectedWord);
				
			});	
				
				
			
			$('.square').mouseenter(function(){
				if($._wordSearch.gameState.dragging){
					$._wordSearch.gameState.endSq=$(this).data();
					$._wordSearch.computeSelectedSquares();
					
					}
				});
				
			
			
			$('.square').mousedown(function(){	
				$._wordSearch.gameState.dragging=true;
				$._wordSearch.gameState.startSq=$(this).data();
				$._wordSearch.gameState.endSq=$(this).data();
				$._wordSearch.computeSelectedSquares();
				});
			
	
			$('.square').mouseup(function(){
				$._wordSearch.gameState.dragging=false;
				
				$._wordSearch.gameState.endSq=$(this).data();
				$._wordSearch.computeSelectedSquares();
				$._wordSearch.checkSelectedWord();
				$('.selectedSquare').removeClass('selectedSquare');

				});		
				
			$('#grid').mouseleave(function(){
				$._wordSearch.gameState.dragging=false;
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
			$('.wordsearch').disableSelection();
			
			
		},
		
		computeSelectedSquares: function(){
			$(".selectedSquare").removeClass('selectedSquare');
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
			//$('#currentWord').html($._wordSearch.gameState.selectedWord);
			
			
			
			
		},
		
		checkSelectedWord: function(){
			var words=$._wordGame.gameDescriptor.words;
			for(w in words){
					if($._wordSearch.gameState.selectedWord.toUpperCase()==words[w].toUpperCase()){
						$('.selectedSquare').addClass('correctSquare');
						$('.word-'+w).addClass('wordFound');
					}
				}
				
			
		},
		
		highlightSquare: function(x,y){
					idx=$._wordSearch.gridIdx(x,y);
					$('.square').eq(idx).addClass("selectedSquare");
					return $('.square').eq(idx).html();
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
			$(theGame).addClass('hangman');
			$._hangMan.manImageProperties={file:"images/parachutist_small.png",framewidth:89,height:75};
			
			instructionsText="Hangman is a word-guessing game. The row of dashes indicates the number of letters to be guessed. "+
				"Click or tap a letter. If it's in the word, it replaces the dash(es). Each wrong guess results in a string being broken on the parachute. When all the strings are broken our friend falls to the ground. "+
				"Your role is to guess the word correctly before the victim meets his grisly fate. ";
			
			
			$._wordGame.insertTitle("WordSearch",instructionsText)
			
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
			 
			$._wordMix.gameState={};
			
			$._wordMix.instructionTxt="Wordmix is a word-guessing game. Use the letters below to complete the word which matches the clue. ";
			
			
			
			$(theGame).addClass('wordmix');
					
		
			$._wordGame.insertTitle("WordMix",$._wordMix.instructionTxt);
			
			
			var img=$._wordMix.getImage();
			$('<div id= "image" />')
				.css("background-image","url("+img+")")
				.appendTo(theGame);
			
			$('#gameOver').hide();
			$('#btnNext').hide();
		
			theGame.append("<div id='clue'></div>");
			theGame.append("<div id='word'></div>");
			theGame.append("<div id='letters'>Letters</div>");
			theGame.append("<div id='gameOver'></div>"+
				"<div class='nextButton'><button id='btnNext'>Continue...</button></div>");
			$('#gameOver').hide();
			$('#btnNext').hide();
			
			
			$._wordMix.newGame();
			//$._wordMix.upDateImage();
			
			//if($._wordMix.callBacks.OnGameStart)
					//$._wordMix.callBacks.OnGameStart($._wordMix.gameState);
	
			
		},
		
		
		newGame: function () {
			
			console.log("entering init");
			/*
			$('#quit').show();
			$('#letters').show();
			$('#word').show();
			$('#gameOver').hide();
			$('#btnNext').hide();*/
			
		
			$._wordMix.gameState=new Object();
			$.extend($._wordMix.gameState,$._wordGame.gameDescriptor);
			$._wordMix.gameState.MAX_LENGTH=9;		
			$._wordMix.gameState.LETTERS_TO_SELECT=12;
			$._wordMix.gameState.badGuesses=0;		   
			$._wordMix.gameState.correctGuesses = 0;
			$._wordMix.gameState.wordToGuess = $._wordMix.getWord().toUpperCase();
			$._wordMix.gameState.wordLength = $._wordMix.gameState.wordToGuess.length;
			$._wordMix.gameState.usedLetters="";
			$._wordMix.gameState.letterstoGuess=$._wordMix.gameState.wordLength;
			
			$("#clue").html("Clue: "+$._wordMix.getClue());
			
			// create row of underscores the same length as letters to guess
			var placeholders = '';
			var letters='';
			var lettercount=0;
		
			//strip out all non alphas and clip to max length
			for (var i = 0; i < $._wordMix.gameState.wordLength; i++) {
				var c= $._wordMix.gameState.wordToGuess.charAt(i); //use charAt fror ie6,7
				if(c>='A' && c<='Z' && lettercount <$._wordMix.gameState.MAX_LENGTH){
					placeholders += c;
					letters+=c;
					lettercount++
				}
			}
			
			$._wordMix.gameState.wordToGuess=placeholders;
			$._wordMix.gameState.wordLength=$._wordMix.gameState.wordToGuess.length;
			
			var ttable1=$('<table/>').appendTo('#word');
			var trow1=$('<tr/>').appendTo(ttable1);
			 
			for (var i = 0; i < $._wordMix.gameState.wordLength; i++) {
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
			for(i=letters.length;i<$._wordMix.gameState.LETTERS_TO_SELECT;i++){
				
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
				
			$._wordMix.gameState.onGoing=true;
		
			
		},
		
		letterTried: function (letter,btnID) {
			btnID='#'+btnID;
			if(!$._wordMix.gameState.onGoing) return;
			
			//check if char is alphabetic
			var re = /^([a-zA-Z])$/;

			if(!re.test(letter)){
				return; //not apha, ignore
			}
			
			
			
			if($(btnID).hasClass("letterDisabled"))
			    return; // button disabled ignore
			
			
			$._wordMix.gameState.usedLetters+=letter;
				
			
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
			
			if($._wordMix.gameState.wordToGuess===word){
				$('#word').addClass("wordCorrect");
				$._wordMix.gameState.won=true;
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
		
		checkLetter: function (letter) {
		   var placeholders = $('#word').html(),
		   		wrongGuess = true;
		   
		   // split the placeholders into an array
		   placeholders = placeholders.split('');
		   // loop through the array
		   for (var i = 0; i < $._wordMix.gameState.wordLength; i++) {
			  // if the selected letter matches one in the word to guess,
			  // replace the underscore and increase the number of correct guesses
			  if ($._wordMix.gameState.wordToGuess.charAt(i).toUpperCase() == letter.toUpperCase()) {
				 placeholders[i] = letter;
				 wrongGuess = false;
				$._wordMix.gameState.letterstoGuess--;
				
				 
				 
			  }
		   }
		   if(wrongGuess===false){
			   $._wordMix.gameState.correctGuesses++;
		   }else{
			   $._wordMix.gameState.badGuesses++;
			   
		   }
		   // if the guess was incorrect, increment the number of bad
		   // guesses and redraw the canvas
		   //drawCanvas();
		   //$._wordMix.upDateImage();
		   
		   
		   // convert the array to a string and display it again
		   placeholders=placeholders.join('');
		   $('#word').html(placeholders);
		   
		   
		   
		   //check for wining condition
		   if($._wordMix.gameState.letterstoGuess===0){
				$._wordMix.gameState.won=true;
				$._wordMix.gameOver();
		   }
		   
		   if($._wordMix.gameState.badGuesses >=7){
				$._wordMix.gameState.lose=true;
				$._wordMix.gameOver()
		   }
		 
		},
		
		gameContinue: function(){
			if($._wordMix.callBacks.OnGameContinue)
					$._wordMix.callBacks.OnGameContinue($._wordMix.gameState);
					
			 window.location.reload();			
		},
		
		gameOver: function (){
			$._wordMix.gameState.onGoing=false;
			$._wordMix.showResult();
			var msg="";
			
			if($._wordMix.gameState.won===true){
				if($._wordMix.callBacks.OnGameWon)
					$._wordMix.callBacks.OnGameWon($._wordMix.gameState);
	

				msg="Well done! You found the word.";
				
				
			}
	
			if($._wordMix.gameState.lose===true){
				$('#para').fadeOut("slow");
				$('#para_man').animate({
					opacity: 0.0,
					bottom: '-=150'
					}, 
					2000
					);
				msg="Hard luck! You didn't find the word.";
				if($._wordMix.callBacks.OnGameLost)
					$._wordMix.callBacks.OnGameLost($._wordMix.gameState);
			}
			
			//save gamestate
			$.getJSON( $._wordMix.gameState.saveScript, $._wordMix.gameState); 
			
			

			$('#letters').hide();
			
			$('#gameOver').html(msg).show("slow");
			$('#btnNext').show("slow").click($._wordMix.gameContinue);
			
			
		},
		

		

		// When the game is over, display missing letters in red
		showResult: function () {
			var placeholders = word.innerHTML;
			placeholders = placeholders.split('');
			for (i = 0; i < placeholders.length; i++) {
				if (placeholders[i] == '_') {
				placeholders[i] = '<span class="missedLetter">' + $._wordMix.gameState.wordToGuess.charAt(i).toUpperCase() + '</span>';
				}
			}
			word.innerHTML = placeholders.join('');
		},
		
		upDateImage: function (){
			var numStrings=7;
			var s=$._wordMix.gameState.badGuesses+1;
			$('#para').spState(s);
		}
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
			case "wordmix":
				$._wordMix.initGame(this);
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
