<?php

$arr =array("gametype"=>$_GET['gameType'],
	"saveScript"=>'save.php',	
	"saveFile"=>"newgameData.txt", 
	"uniqueToken"=> uniqid('',true), 
	"user"=>$_GET['name']);

if($_GET['gameType']=='hangman'){
	$string = file_get_contents("questions.json");
	$qs=json_decode($string,true);
	//echo 'Last error: ', json_last_error(), PHP_EOL, PHP_EOL;

	$idx=rand(0,sizeof($qs)-1);
	$arr["clue"]=$qs[$idx]['clue'];
	$arr["answer"]=$qs[$idx]['answer'];

}

elseif($_GET['gameType']=='wordsearch'){
	$arr["clue"]= "Find all the animals";
	$arr["words"] =array("Elephant","giraffe", "noil","epa","ape","hippopotamus","monkey","Rhinoceros","Snake","leopard");
	$arr["rightleftlanguage"]=true;
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
