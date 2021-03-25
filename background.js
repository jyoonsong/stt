let isRecording = false;
let chatTabId = 0;

chrome.browserAction.onClicked.addListener(function(t) {

    console.log("chrome.browserAction.onClicked " + isRecording);

    if (t.url.includes("zoom.us") && confirm("Would you like to start transcription?")) {
        console.log(isRecording);
        console.log(t.id);

        if (!isRecording) {
            // Start it
            chrome.tabs.sendMessage(t.id, {msg: "buttons"});
            isRecording = true;
        }
        else {
            // if (confirm('회의를 종료하셨으면 [확인], 단순 새로고침하신 거면 [취소]를 눌러주세요')) {
            //     // Save json
            //     chrome.tabs.sendMessage(t.id, {msg: "save"});
            //     isRecording = false;
            // }
            // else {
                // Restart it
                chrome.tabs.sendMessage(t.id, {msg: "buttons"});
            // }
        }

    }
    else {
        alert("This app only works with Zoom!");
    }
});

chrome.runtime.onMessage.addListener(function(data, sender, sendResponse) {
    
    console.log("background received: ");
    console.log(data);

    if (data.start) {
        // get ready for the buttons

        chrome.tabs.update(chatTabId, { highlighted: true }, function(tab) {
            chrome.tabs.sendMessage(chatTabId, {msg: "buttons", startTime: data.start});
        });
    }
    
});
