let threshold_map = {
	"text": 0.9,
	"html": 0.7,
	"css": 0.7,
	"all": 0.7,
}

// This is a function that inserts the script into the current tab
function insertScript() {
	let feature = document.getElementById("feature").value;
	let threshold = document.getElementById("threshold").value;

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			function: scanWeb,
			args: [feature, threshold]
		});
	});

	window.close();
}

// Event listener that detects clicks on "Scan" button
document.getElementById("scanButton").addEventListener("click", insertScript);

document.getElementById("feature").addEventListener("change", function() {
	let feature = document.getElementById("feature").value;
	// set threshold by threshold_map
	document.getElementById("threshold").value = threshold_map[feature];
});

function scanWeb(feature, threshold) {
    // get current url
    const url = window.location.href;
    let document_dom = document.documentElement.innerHTML;

    // add html tag to document_dom
    document_dom = "<html>" + document_dom + "</html>";

    // Do post request to server
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:5555/scan", true);
    // CORS policy
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader("Access-Control-Allow-Methods", "*");
    xhr.setRequestHeader("Access-Control-Allow-Headers", "*");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({url: url, html_dom: document_dom, feature: feature}));

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // decode response as json
            const response = JSON.parse(xhr.responseText);
			// format similarity score to 2 decimal places

			let similarity_score_percent = response.data.similarity * 100;
            // get response data
            if (response.data.similarity > threshold){
                alert("This website is similar as phishing website that we have in our database with similarity score " + similarity_score_percent.toFixed(2) + "% with brand \"" + response.data.brand + "\", please be careful!")
            }else{
                alert("There is no similar phishing website in our database, you are safe!")
            }
        }
    };
}