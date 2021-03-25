let isStarted = false;
let allNodes = [];
// let targets;
let sidebar;
let count = 0;

console.log("content script on");
chrome.runtime.onMessage.addListener(onMessage);

function onMessage(data, sender, response) {
    console.log("message at content script");
    console.log(data);

    if (!data || !screen) {
        alert("ERROR");
        return;
    }

    switch (data.msg) {
        case "record":
            startRecord();
            break;
        case "buttons":
            followChat();
            displayButtons();
            break;
        case "save":
            saveJson();
            break;
    }
    
}

function saveJson() {
    let result = "[" + localStorage.getItem("item" + 0);
    for (let i = 1; i < count; i++) {
        result += ("," + localStorage.getItem("item" + i));
    }
    result += "]";

    var a = document.createElement("a");
    var file = new Blob([result], {type: "text/plain"});
    a.href = URL.createObjectURL(file);
    a.download = "data.json";
    a.click();
}


function startRecord() {
    // get timer started
    let timer = document.getElementById("timer");

    timer.addEventListener("click", function() {

        if (isStarted) return;

        console.log("clicked");
        isStarted = true;
        chrome.runtime.sendMessage({
            start: parseInt( timer.innerText )
        });

    });
}

function createNode(index) {
    let arr = [];
    // let speaker = -1;

    // // figure out speaker
    // targets.forEach(function(target, i) {
    //     // arr[i] = parseInt( getComputedStyle( target ).opacity );
    //     // console.log(i + "th opacity: " + arr[i]);

    //     if (speaker < 0 || arr[speaker] < arr[i]) {
    //         speaker = i; // max opacity
    //     }
    // });

    // let speaker_name = (speaker < 0) ? "Welcome" : targets[speaker].innerText;

    allNodes[index] = {
        // speaker: speaker_name,
        memo: "Trasncription started."
    }
}

function followChat() {
    
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

    var recognition = new SpeechRecognition();
    var speechRecognitionList = new SpeechGrammarList();
    recognition.grammars = speechRecognitionList;

    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // start
    recognition.start();
    createNode(0);

    recognition.onresult = function(event) {

        // console.log("* recognition result");
        // console.log(event.results);

        // update previous node
        allNodes[allNodes.length - 1].memo = event.results[event.resultIndex][0].transcript + '.';
        addNode(allNodes.length - 1);

        // create next node
        createNode(allNodes.length);
        
    }

    recognition.onend = function() {
        // start a new speech recognition again
        recognition.start();
    }

    recognition.onnomatch = function(event) {
        console.log( "No Match" );
    }

    recognition.onerror = function(event) {
        console.log( 'Error occurred in recognition: ' + event.error );
    }
}

function displayButtons() {
    let screen = document.querySelector("#root");
    // let speakerscreen = document.querySelector(".speaker-view > div:last-child");

    // get screen on left corner
    screen.style.width = "78%";
    screen.style.left = "0";

    // create a sidebar with heading and buttons
    sidebar = document.createElement("div");
    sidebar.setAttribute("id", "ravi");
    document.body.appendChild(sidebar);

    // add style
    let css = `
        #ravi {
            width: 22%;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;
            box-sizing: border-box;
            background: white;
        }
        #ravi .buttons .btn {
            width: 90px;
            margin-bottom: 10px;
            padding: 1rem 0;
            border-radius: 3px;
            font-size: .85rem;
            font-weight: 600;
            color: white;
            text-align: center;
            cursor: pointer;
            background-color: #c92a2a;
        }
        #ravi .boxes {
            overflow-y: scroll;
            height: 96%;
            padding: 1rem;
            box-sizing: border-box;
        }
        #ravi .box {
            padding: .5rem;
            line-height: 1.5;
            font-size: .85rem;
            position: relative;
        }
        `,
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);

    // add container of boxes
    sidebar = sidebar.appendChild( document.createElement('div') );
    sidebar.setAttribute("class", "boxes");
    sidebar.innerHTML = "<h4 style='margin-top: 0'>Transcript</h4>";

}

function addNode(index) {
    // create dom element
    let b = document.createElement('div');
    b.setAttribute("class", "box");
    b.innerHTML = contentOf(index);

    // show it
    sidebar.appendChild(b);
    b.scrollIntoView(false);
    b.setAttribute("index", index);

    // store data in the browser
    localStorage.setItem("item" + index, allNodes[index]);
}


function contentOf(index) {
    let ele = allNodes[index];

    return "<span> " + ele.memo + "</span>";
    // return ("<b>" + ele.speaker + " : </b>"
    // + "<span> " + ele.memo + "</span>");
}
