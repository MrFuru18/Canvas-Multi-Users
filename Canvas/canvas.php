<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
   
    if ($_SERVER["REQUEST_METHOD"] == "GET") {
        $filePath = $_GET['a'];
        if(file_exists("{$filePath}.json")) {
            $elements = file_get_contents("{$filePath}.json");
            $data = json_decode($elements);
            echo $elements;
        } else {
            $myfile = fopen("{$filePath}.json", "w");
            $text = "[]";
            fwrite($myfile, $text);
            fclose($myfile);
        }
    }
   
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $filePath = $_GET["a"];
        if(file_exists("{$filePath}.json")) {
            $newData = file_get_contents('php://input');
            $decodeNewData = json_decode($newData);
            $inp = file_get_contents("{$filePath}.json");
            $tempArray = json_decode($inp);
            array_push($tempArray, $decodeNewData);
            $jsonData = json_encode($tempArray);
            file_put_contents("{$filePath}.json", $jsonData);
            echo "Saved to data.json successfully!";
        } else {
            $myfile = fopen("{$filePath}.json", "w");
            $text = "[]";
            fwrite($myfile, $text);
            fclose($myfile);

            $newData = file_get_contents('php://input');
            $decodeNewData = json_decode($newData);
            $inp = file_get_contents("{$filePath}.json");
            $tempArray = json_decode($inp);
            array_push($tempArray, $decodeNewData);
            $jsonData = json_encode($tempArray);
            file_put_contents("{$filePath}.json", $jsonData);
            echo "Saved to data.json successfully!";
        }
    }
?>