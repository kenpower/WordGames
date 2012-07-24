<?php

$arr =array("gametype"=>$_GET['gameType'],
	'saveScript'=>'scripts//save.php',	
	'saveFile'=>'gameData1.txt', 
	'uniqueToken'=> uniqid('',true), 
	'user'=>$_GET['name']);

if($_GET['gameType']=='hangman'){
	$string = file_get_contents("questions.json");
	$qs=json_decode($string,true);
	//echo 'Last error: ', json_last_error(), PHP_EOL, PHP_EOL;

	$idx=rand(0,sizeof($qs)-1);
	$arr["clue"]=$qs[$idx]['clue'];
	$arr["answer"]=$qs[$idx]['answer'];

}

elseif($_GET['gameType']=='wordsearch'){
	//$arr["clue"]= "Find all the animals";
	//$arr["words"] =array("Elephant","giraffe", "Lion","ape","hippopotamus","monkey","Rhinoceros","Snake","leopard");

	$used_idx=array();
	
	$string = file_get_contents("wordMixQuestions.json");
	$qs=json_decode($string,true);
	//echo 'Last error: ', json_last_error(), PHP_EOL, PHP_EOL;

	for($i = 0; $i < 4; $i++){
	
		do{
			$idx=rand(0,sizeof($qs)-1);//pick a random question
		}while(in_array($idx,$used_idx) && sizeof($qs)>sizeof($used_idx)); // make sure it has not been picked already
		
		$used_idx[]=$idx;
		$arr["clues"][]=$qs[$idx]['clue'];
		$arr["words"][]=$qs[$idx]['answer'];
	}
}


elseif($_GET['gameType']=='wordmix'){
	$string = file_get_contents("wordMixQuestions.json");
	$qs=json_decode($string,true);
	//echo 'Last error: ', json_last_error(), PHP_EOL, PHP_EOL;

	$idx=rand(0,sizeof($qs)-1);
	$arr["clue"]=$qs[$idx]['clue'];
	$arr["answer"]=$qs[$idx]['answer'];
	$arr["image"]=$qs[$idx]['image'];
	

}

else{
	$arr["error"]="gametype not found";
}


echo json_encode($arr);
    
?>
