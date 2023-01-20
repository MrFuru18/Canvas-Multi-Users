var http = new XMLHttpRequest();
var xhr = new XMLHttpRequest();
var canvas;
var ctx;
var drawing;
var lineType = "drag";
var beginPos;
var psosHelper;
var pos;
var dateTime;

var myInteval = window.setInterval(function(){
    if (!drawing)
        loadFromJson();
  }, 1000);

window.onload = function()
{
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    dateTime = date + 't'+ time;
    
    document.getElementById("canvasId").textContent = dateTime;

    var canvId = JSON.parse(localStorage.getItem('myObject'));
    if (canvId.id==''){
        document.getElementById("canvasId").textContent = dateTime;
    }
    else {
        dateTime = canvId.id;
        document.getElementById("canvasId").textContent = dateTime;
    }

    localStorage.clear();
    

    xhr.open('GET', '/canvas.php?a=' + dateTime, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
    

    canvas = document.getElementById("surface");
    ctx = canvas.getContext("2d");
    ctx.canvas.width= window.innerWidth-20;
    ctx.canvas.height = window.innerHeight-150;

    document.getElementById("lineWidth").value = 4; 
    document.getElementById("lineWidth").addEventListener("change", function(){
        ctx.lineWidth = document.getElementById("lineWidth").value;
    })

    document.getElementById("color").addEventListener("change", function(){
        ctx.strokeStyle = document.getElementById("color").value;
    })


    canvas.addEventListener("mousedown", handleMouseDown, false);
    canvas.addEventListener("mouseup", handleMouseUp, false);
    canvas.addEventListener("mousemove", handleMouseMove, false);

    canvas.addEventListener("touchstart", handleTouchStart, false);
    canvas.addEventListener("touchend", handleTouchEnd, false);
    canvas.addEventListener("touchmove", handleTouchMove, false);

    ctx.lineWidth = 4;
    ctx.lineCap ="round";
    ctx.lineJoin="round";

    loadFromJson();
    
}


function getRadioValue(radio){
    lineType = radio.value;
}

function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    return {x: e.clientX - rect.left, y: e.clientY - rect.top};
}

function getTouchPos(e) {
    var touch = e.touches[0];
    return {x: touch.pageX - touch.target.offsetLeft, y: touch.pageY - touch.target.offsetTop};
}

function handleMouseDown(e){
    pos = getMousePos(canvas,e);

    startDrawing();
}

function handleTouchStart(e){
    pos = getTouchPos(e);

    startDrawing()
}

function startDrawing(){
    drawing = true;

    beginPos = pos;
    posHelper=pos;
    ctx.beginPath(); 
    if(lineType=="drag" || lineType=="line")
        ctx.moveTo(pos.x, pos.y);
}

function handleMouseMove(e){
    pos = getMousePos(canvas,e)
    draw();
    posHelper = pos;
}

function handleTouchMove(e){
    pos = getTouchPos(e);
    draw();
    posHelper = pos;
}

function draw(){
    if(drawing && lineType=="drag"){  
        ctx.lineTo(pos.x, pos.y);  
        ctx.stroke();
        saveToJson(lineType);
    }
}

function handleMouseUp(e){
    stopDrawing();
}

function handleTouchEnd(e){
    stopDrawing();
}

function stopDrawing(){
    if((drawing && lineType == "drag") || (drawing && lineType == "line")){
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.closePath();
        drawing = false;
    }
    else if(drawing && lineType == "rectangle"){
        ctx.rect(Math.min(beginPos.x, pos.x), Math.min(beginPos.y, pos.y), Math.abs(beginPos.x - pos.x), Math.abs(beginPos.y - pos.y));
        ctx.stroke();
        ctx.closePath();
        drawing = false;
    }
    else if (drawing && lineType == "circle"){
        ctx.arc(beginPos.x, beginPos.y, Math.sqrt((beginPos.x-pos.x)*(beginPos.x-pos.x)+(beginPos.y-pos.y)*(beginPos.y-pos.y)), 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        drawing = false;
    }
    
    saveToJson(lineType);
}

function saveToJson(type){
    var lineElement = new Object();
    lineElement.type =  type;
    if (type == "drag"){
        lineElement.beginX = posHelper.x;
        lineElement.beginY = posHelper.y;
    }
    else{
        console.log(type);
        lineElement.beginX = beginPos.x;
        lineElement.beginY = beginPos.y;
    }
    lineElement.posX = pos.x;
    lineElement.posY = pos.y;
    lineElement.lineWidth = document.getElementById("lineWidth").value;
    lineElement.strokeStyle = document.getElementById("color").value;

    var newJsonLine = JSON.stringify(lineElement);
    
    xhr.open('POST', '/canvas.php?a=' + dateTime, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(newJsonLine);
}

function loadFromJson(){

    http.open('GET', '/canvas.php?a=' + dateTime, true);
    http.setRequestHeader('Content-Type', 'application/json');


    http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log (this.response);
            var data = this.response;

            var jsonData = JSON.parse(data);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var lineWidth = document.getElementById("lineWidth").value;
            var strokeStyle = document.getElementById("color").value;
            for(var i = 0; i<jsonData.length; i++){

                ctx.beginPath(); 
                ctx.lineWidth = jsonData[i]["lineWidth"];
                ctx.strokeStyle = jsonData[i]["strokeStyle"];

                if((jsonData[i].type == "drag") || (jsonData[i].type == "line")){
                    ctx.moveTo(jsonData[i]["beginX"], jsonData[i]["beginY"]);
                    ctx.lineTo(jsonData[i]["posX"], jsonData[i]["posY"]);  
                    ctx.stroke();
                    ctx.closePath();
                }
                
                if (jsonData[i].type == "rectangle"){
                    ctx.rect(Math.min(jsonData[i]["beginX"], jsonData[i]["posX"]), Math.min(jsonData[i]["beginY"], jsonData[i]["posY"]), 
                                        Math.abs(jsonData[i]["beginX"]- jsonData[i]["posX"]), Math.abs(jsonData[i]["beginY"] - jsonData[i]["posY"]));
                    ctx.stroke();
                    ctx.closePath();
                }

                if (jsonData[i].type == "circle"){
                    ctx.arc(jsonData[i]["beginX"], jsonData[i]["beginY"], Math.sqrt((jsonData[i]["beginX"]-jsonData[i]["posX"])*(jsonData[i]["beginX"]-jsonData[i]["posX"])
                            +(jsonData[i]["beginY"]-jsonData[i]["posY"])*(jsonData[i]["beginY"]-jsonData[i]["posY"])), 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = strokeStyle;
        }
    }
    http.send();

   
}
