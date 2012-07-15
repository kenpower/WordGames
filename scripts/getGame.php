<?php

$string = file_get_contents("questions.json");
$qs=json_decode($string,true);
//echo 'Last error: ', json_last_error(), PHP_EOL, PHP_EOL;

$idx=rand(0,sizeof($qs)-1);
$arr = array ("gametype"=>"hangman","clue"=>$qs[$idx]['clue'],"answer"=>$qs[$idx]['answer'],"saveScript"=>'scripts\save.php',"saveFile"=>"newgameData.txt", "uniqueToken"=> uniqid('',true), "user"=>$_GET['name']);


if($_GET['name']=='w'){
	$arr = array ("gametype"=>"wordsearch","clue"=>"Find all the animals","words"=> array("Elephant","giraffee", "lion","ape","hippopotamus"),"saveScript"=>'scripts\save.php',"saveFile"=>"newgameData.txt", "uniqueToken"=> uniqid('',true), "user"=>$_GET['name']);
		
}
echo json_encode($arr);
    
 ?>
