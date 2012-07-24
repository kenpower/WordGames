<?php

$stringData= $_GET;

$fh = fopen($_GET['saveFile'], 'a') or die("can't open file");



fwrite($fh, json_encode($_GET));

fwrite($fh,  PHP_EOL);

fclose($fh);

$fh = fopen('test.txt', 'a') or die("can't open file");

fwrite($fh, 'test');
fwrite($fh, json_encode($_GET));
fclose($fh);



?>