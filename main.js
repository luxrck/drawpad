var mainui = function() {
	chrome.app.window.create('index.html', {
		bounds: {
			width: 910,
			height: 550
		},
		minWidth: 910,
		minHeight: 550
	});
};

chrome.app.runtime.onLaunched.addListener(function() {
	mainui();
});

chrome.app.runtime.onRestarted.addListener(function() {
	mainui();
});
