
// canvas.width= window.innerWidth;
// canvas.height = wind


let canvas = document.querySelector("#board");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tool= canvas.getContext('2d')
let isDraw=false;
const toolsArr= document.getElementsByClassName('tool')
var currentTool= 'pencil';
for (let i=0; i< toolsArr.length; i++){
    const toolName= toolsArr[i].id;
    // console.log(item);
    toolsArr[i].addEventListener("click", function (e) {
        const toolName = toolsArr[i].id;
        if (toolName == "pencil") {
            currentTool = "pencil";
            tool.strokeStyle = "blue";
            console.log("pencil clicked");
        }
        else if (toolName == "eraser") {
            currentTool = "eraser";
            tool.strokeStyle = "white";
            tool.lineWidth = 8;
        } else if (toolName == "download") {
            console.log("download clicked");
            currentTool = "download";
            downloadFile();

        }
        else if (toolName == "sticky") {
            currentTool = "sticky";
            console.log('sticky clicked');
            createSticky()


        } else if (toolName == "upload") {
            currentTool = "upload";
            uploadFile()

        }
        else if (toolName == "undo") {
            currentTool = "undo";
            console.log('undo clicked')
            undoFn() 

        } else if (toolName == "redo") {
            console.log("redo clicked");
            redoFn()

        }
    })
}

// sticky 
function createOuterShell(){
   const stickyDiv= document.createElement('div');
   const nav = document.createElement('div')
   const close= document.createElement('div')
   const minimizeDiv= document.createElement('div')
   stickyDiv.setAttribute('class','sticky')
   nav.setAttribute('class', 'nav')
   minimizeDiv.setAttribute('id','minimize')
   stickyDiv.appendChild(nav)
   close.setAttribute('class','close')
   nav.appendChild(close)
   nav.appendChild(minimizeDiv)
   close.innerHTML='X';
   minimizeDiv.innerHTML='min';
   document.body.appendChild(stickyDiv);
   close.addEventListener('click', ()=>(
    stickyDiv.remove()
   ))

   let isStickyDown = false;
   // navbar -> mouse down , mouse mousemove, mouse up 

   nav.addEventListener("mousedown", function (e) {
       // initial point
       initialX = e.clientX
       initialY = e.clientY
       console.log("mousedown", initialX, initialY);
       isStickyDown = true;
      
   })
   nav.addEventListener('mousemove', function(e){
    if (isStickyDown == true) {
        // final point 
        let finalX = e.clientX;
        let finalY = e.clientY;
        //  distance
        let dx = finalX - initialX;
        let dy = finalY - initialY;
        //  move sticky
        //original top left
        let { top, left } = stickyDiv.getBoundingClientRect()
        // stickyPad.style.top=10+"px";
        stickyDiv.style.top = top + dy + "px";
        stickyDiv.style.left = left + dx + "px";
        initialX = finalX;
        initialY = finalY;
    }
   })
   nav.addEventListener('mouseup', function(){
        isStickyDown= false;
   })


   
   return stickyDiv

}
function createSticky() {
    let stickyDiv = createOuterShell();
    let textArea = document.createElement("textarea");
    stickyDiv.appendChild(textArea);
    const minimizeDiv= document.getElementById('minimize')
    textArea.setAttribute('class', 'textarea')
    let isMinimized=false;
    minimizeDiv.addEventListener("click", function () {
     textArea.style.display = isMinimized == true ? "block" : "none";
     isMinimized = !isMinimized
 })
   
}

//-- adding features to canvas
let undoStack = [];
let redoStack = [];
canvas.addEventListener('mousedown', function(e){
    console.log(e);
    let sidex=e.clientX
    let sidey= e.clientY
    tool.beginPath()
    isDraw=true;
    const toolBarHeight= getYDelta()
    tool.moveTo(sidex, sidey - toolBarHeight);
    let pointDesc = {
        desc: "md",
        x: sidex,
        y: sidey - toolBarHeight,
        color: tool.strokeStyle
    }
    undoStack.push(pointDesc);
    tool.stroke();

})
canvas.addEventListener('mousemove', function(e){
    if (!isDraw){
        return
    }
    const toolBarHeight = getYDelta()
    let sidex=e.clientX
    let sidey=e.clientY
    tool.lineTo(sidex,sidey-toolBarHeight)
    let pointDesc = {
        desc: "mm",
        x: sidex,
        y: sidey - toolBarHeight,
        color: tool.strokeStyle
    }
    undoStack.push(pointDesc);

    tool.stroke();
    
})
canvas.addEventListener('mouseup',function(e){
    isDraw=false
    return
})


// upload function /...................................
let inputTag = document.querySelector(".input-tag")
function uploadFile(){
    inputTag.click()
    inputTag.addEventListener("change", function () {
        let data = inputTag.files[0];
        // 5. add UI 
        let img = document.createElement("img");
        // src -> file url
        let url = URL.createObjectURL(data);
        img.src = url;
        img.setAttribute("class", "upload-img");
        // 6. add to body

        let stickyDiv = createOuterShell();
        stickyDiv.appendChild(img);

        // to minimise
        const minimizeDiv= document.getElementById('min')
        let isMinimized=false;
        minimizeDiv.addEventListener("click", function () {
        img.style.display = isMinimized == true ? "block" : "none";
        isMinimized = !isMinimized
 })

    })

}


// download functions...............
function downloadFile(){
    let a= document.createElement('a')
    a.download= 'file.jpeg';
    let url = canvas.toDataURL("image/jpeg;base64");
    a.href= url;
    a.click();
    a.remove()
}

// undo and redo functins ..................................
function undoFn() {
    // clear screen
    // pop
    if (undoStack.length > 0) {
        tool.clearRect(0, 0, canvas.width, canvas.height);
        redoStack.push(undoStack.pop());
        // last removal
        // redraw
        redraw();
    }
}
function redoFn() {
    if (redoStack.length > 0) {
        // screen clear
        tool.clearRect(0, 0, canvas.width, canvas.height);
        undoStack.push(redoStack.pop());
        redraw();
    }
}
function redraw() {
   
    for (let i = 0; i < undoStack.length; i++) {
        let { x, y, desc } = undoStack[i];
        if (desc==='md'){
            tool.beginPath()
            tool.moveTo(x,y)
        }
        else{
            tool.lineTo(x,y);
            tool.stroke()
        }

    }
}





// fixing the height bug of canvas.........................
let toolBar = document.querySelector(".toolbar");
function getYDelta() {
    let heightOfToolbar = toolBar.getBoundingClientRect().height;
    return 1.5*heightOfToolbar
}
let isClose= true;
let cross= document.querySelector('.cross');
let toolBarOption= document.querySelector('.toolbar-option')
cross.addEventListener('click', function(e){
    toolBarOption.style.display= (isClose)? 'none':' flex';
    isClose=!isClose;
    console.log('close is clicked')
})
