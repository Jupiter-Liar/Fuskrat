// background.js

//importScripts('fusking.js', 'create-gallery.js');

// Initialize context menu on extension installation
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "fusk-it",
		title: "Fusk...",
		contexts: ["image"]
	});
});

//// Context menu click handler
//chrome.contextMenus.onClicked.addListener((info, tab) => {
//	if (info.menuItemId === "fusk-it") {
//		chrome.scripting.executeScript({
//			target: {
//				tabId: tab.id
//			},
//			func: openPopup,
//			args: [info.srcUrl] // Pass the image URL as an argument
//		});
//	}
//});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "fusk-it") {
		// Inject a script to check and set the flag in the page context
		chrome.scripting.executeScript({
			target: {
				tabId: tab.id
			},
			func: (extId) => {
				// Use the extension ID to create a unique flag name
				const flagName = `fuskFlag_${extId}`;

				console.log('flagName:', flagName);

				// Check if the flag exists and is false; if not, set it and return true
				if (typeof window[flagName] === 'undefined') {
					window[flagName] = {
						firstClick: true
					};
					return true; // Indicates that this is the first click
				} else {
					return false; // Flag already exists, indicating subsequent clicks
				}
			},
			args: [chrome.runtime.id] // Pass the extension ID as an argument
		}, (results) => {
			const isFirstClick = results[0].result;

			if (isFirstClick) {
				console.log('Injecting helper scripts...');
				// Inject fusking.js into the page
				chrome.scripting.executeScript({
					target: {
						tabId: tab.id
					},
					files: ['fusking.js']
				}, () => {
					// After fusking.js is injected, inject create-gallery.js
					chrome.scripting.executeScript({
						target: {
							tabId: tab.id
						},
						files: ['create-gallery.js']
					}, () => {
						// After both scripts are injected, call the openPopup function
						chrome.scripting.executeScript({
							target: {
								tabId: tab.id
							},
							func: openPopup,
							args: [info.srcUrl] // Pass the image URL as an argument
						});
					});
				});
			} else {
				console.log('Helper scripts have already been injected.');
				chrome.scripting.executeScript({
					target: {
						tabId: tab.id
					},
					func: openPopup,
					args: [info.srcUrl] // Pass the image URL as an argument
				});
			}
		});
	}
});

// Function to open the shadow DOM popup
function openPopup(imageUrl) {
	fuskingFlagTest();

	const existingShadowElement = document.getElementById('fusk-it-popup-container');

	if (existingShadowElement) {
		console.log('Popup already exists.');
		return;
	}

	// Retrieve the stored hex value for the current domain
	const domain = new URL(imageUrl).hostname;
	let hex = localStorage.getItem(`hex-${domain}`) === 'true'; // Default to false if not found
	console.log('hex: ' + hex);

	// Create a container for the shadow DOM
	const shadowContainer = document.createElement('div');
	shadowContainer.id = 'fusk-it-popup-container';
	shadowContainer.style.position = 'fixed';
	shadowContainer.style.top = '0';
	shadowContainer.style.left = '0';
	shadowContainer.style.width = '100%';
	shadowContainer.style.height = '100%';
	shadowContainer.style.zIndex = '9999'; // Ensure it's on top

	// Attach shadow DOM
	const shadowRoot = shadowContainer.attachShadow({
		mode: 'open'
	});

	//	// Inject fusking logic
	//	const fuskScript = document.createElement('script');
	//	fuskScript.src = chrome.runtime.getURL('fusking.js'); // Use chrome.runtime.getURL to correctly resolve the path
	//	shadowRoot.appendChild(fuskScript);
	//
	//	// Inject gallery logic
	//	const galleryScript = document.createElement('script');
	//	galleryScript.src = chrome.runtime.getURL('create-gallery.js'); // Use chrome.runtime.getURL to correctly resolve the path
	//	shadowRoot.appendChild(galleryScript);

	// Create some link elements to reference CSS
	const pagePopupDivCSS = document.createElement('link');
	pagePopupDivCSS.setAttribute('rel', 'stylesheet');
	pagePopupDivCSS.setAttribute('href', chrome.runtime.getURL('page-popup-div.css')); // Replace with the actual path to your CSS file

	const galleryCSS = document.createElement('link');
	galleryCSS.setAttribute('rel', 'stylesheet');
	galleryCSS.setAttribute('href', chrome.runtime.getURL('gallery.css'));

	// Append the link elements to the shadow root
	shadowRoot.appendChild(pagePopupDivCSS);
	shadowRoot.appendChild(galleryCSS);

	//	// Append the helper scripts
	//	const fuskingScript = document.createElement('script');
	//	fuskingScript.src = chrome.runtime.getURL('fusking.js');
	//	shadowRoot.appendChild(fuskingScript);
	//	const galleryScript = document.createElement('script');
	//	galleryScript.src = chrome.runtime.getURL('create-gallery.js');
	//	shadowRoot.appendChild(galleryScript);
	//
	//	fuskingFlagTest();

	// Create the popup div
	const popupDiv = document.createElement('div');
	popupDiv.id = 'popup-container';
	// A few specified styles, to prevent a flash frame of the div in the wrong position
	popupDiv.style.top = '50%';
	popupDiv.style.left = '50%';
	popupDiv.style.transform = 'translate(-50%, -50%)';
	popupDiv.style.textAlign = 'center';

	// Create and append the image inside the popup div
	const img = document.createElement('img');
	img.src = imageUrl;
	img.id = 'popup-image';

	// Create and append the close button
	const closeButton = document.createElement('div');
	closeButton.id = 'close-button';
	closeButton.innerHTML = '&times;'; // The "×" symbol
	closeButton.onclick = () => {
		document.body.removeChild(shadowContainer); // Remove the shadow element
	};

	// Append the close button and image to the popup div
	popupDiv.appendChild(closeButton);
	popupDiv.appendChild(img);

	// Create a div to explain URL selection
	const urlSelectionExplanation = document.createElement('span');
	urlSelectionExplanation.id = 'url-selection-explanation';
	urlSelectionExplanation.textContent = 'Choose which part to fusk:';
	popupDiv.appendChild(urlSelectionExplanation);

	// Create the URL container
	const urlContainer = document.createElement('div');
	urlContainer.id = 'url-container';

	// Function to handle button clicks
	function handleFuskButtonClick(popupDiv, location) {
		// Find the URL container
		const urlContainer = popupDiv.querySelector('#url-container');

		// Get all child nodes of the urlContainer
		const nodes = Array.from(urlContainer.childNodes);

		// Find the index of the [selected] span
		const selectedSpanIndex = nodes.findIndex(node => node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('selected'));

		// Extract the prefix by joining the text content of nodes before the selected span
		const prefix = nodes.slice(0, selectedSpanIndex).map(node => node.textContent || '').join('');

		// Extract the suffix by joining the text content of nodes after the selected span and before the hex-container
		const hexContainerIndex = nodes.findIndex(node => node.id === 'hex - container');
		const suffix = nodes.slice(selectedSpanIndex + 1, hexContainerIndex).map(node => node.textContent || '').join('');

		// Get the values from the fusking input fields
		const beginRange = popupDiv.querySelector('#fusking-input-start').value;
		const endRange = popupDiv.querySelector('#fusking-input-end').value;

		// Get the hex value
		const hexCheckbox = popupDiv.querySelector('#hex-checkbox');
		const hex = hexCheckbox.checked;

		// Print the extracted values to the console
		console.log('Location:', location);
		console.log('Prefix:', prefix);
		console.log('Begin Range:', beginRange);
		console.log('End Range:', endRange);
		console.log('Suffix:', suffix);
		console.log('Hex:', hex);
		console.log('Location:', location);

		// Call the fusking logic from fusking.js
		const urls = fuskUrls({
			prefix,
			suffix,
			beginRange,
			endRange,
			hex
		});

		// Create an output div
		const existingOutputDiv = popupDiv.querySelector('#output');
		var outputDiv;

		if (existingOutputDiv) {
			outputDiv = existingOutputDiv;
		} else {
			outputDiv = document.createElement('div');
			outputDiv.id = 'output';
			popupDiv.appendChild(outputDiv);
		}

		outputDiv.innerHTML = ''; // Clear previous output

		// Check if urls is an array
		if (Array.isArray(urls)) {
			if (location === 'here') {
				// Call createGallery and place the returned gallery in the output div
				const gallery = createGallery(urls);
				outputDiv.appendChild(gallery);
			} else if (location === 'new-tab') {
				const div = document.createElement('div');
				div.textContent = 'The gallery is in a new tab.';
				outputDiv.appendChild(div);

				// Construct the URL with query parameters
				const baseURL = chrome.runtime.getURL('gallery.html');
				const params = new URLSearchParams({
					prefix,
					suffix,
					beginRange,
					endRange,
					hex: hex ? 'true' : 'false'
				});

				const url = `${baseURL}?${params.toString()}`;

				// Open the new tab with the constructed URL
				window.open(url, '_blank');
			}
		} else {
			// Handle the case where urls is not an array
			const div = document.createElement('div');
			div.textContent = urls; // Assume urls is a string in this case
			outputDiv.appendChild(div);
		}
	}

	// Debounce function to limit the rate at which a function can fire
	function debounce(func, wait) {
		let timeout;
		return function (...args) {
			const context = this;
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(context, args), wait);
		};
	}

	// Function to create the button div and append it to the shadow DOM
	function createButtonDiv(popupDiv) {
		const buttonDiv = document.createElement('div');
		buttonDiv.id = 'button-div';

		const buttonFuskNewTab = document.createElement('button');
		buttonFuskNewTab.textContent = 'Fusk in a new tab';

		const buttonFuskHere = document.createElement('button');
		buttonFuskHere.textContent = 'Fusk right here';

		// Attach event listeners to the buttons to handle the clicks
		buttonFuskNewTab.addEventListener('click', () => handleFuskButtonClick(popupDiv, 'new-tab'));
		buttonFuskHere.addEventListener('click', () => handleFuskButtonClick(popupDiv, 'here'));

		buttonDiv.appendChild(buttonFuskNewTab);
		buttonDiv.appendChild(buttonFuskHere);

		const fuskingRange = popupDiv.querySelector('#fusking-range');
		popupDiv.appendChild(buttonDiv); // Append buttons below the input boxes
	}

	// Function to check the state of the input boxes and handle the button div creation/removal
	function handleInputChange(popupDiv, inputStart, inputEnd) {
		const buttonDiv = popupDiv.querySelector('#button-div');

		if (inputStart.value && inputEnd.value) {
			if (!buttonDiv) {
				// Both inputs have content and button div doesn't exist - create the buttons
				createButtonDiv(popupDiv);
			}
		} else {
			if (buttonDiv) {
				// Either input is empty and button div exists - remove the buttons (debounced)
				debouncedRemoveButtonDiv(popupDiv, inputStart, inputEnd, buttonDiv);
			}
		}
	}

	// Function to remove the button div
	function removeButtonDivWithCheck(popupDiv, inputStart, inputEnd, buttonDiv) {
		if (inputStart.value && inputEnd.value) {
			console.log('The inputs have values. Not removing button div.');
			return;
		} else if (buttonDiv) {
			removeButtonDiv(popupDiv);
		}
	}

	// Function to remove the button div
	function removeButtonDiv(popupDiv) {
		const buttonDiv = popupDiv.querySelector('#button-div');
		if (buttonDiv) {
			buttonDiv.remove();
		}
	}

	// Debounced intermediary version of the removeButtonDiv function
	const debouncedRemoveButtonDiv = debounce(removeButtonDivWithCheck, 1000);

	// Function to create the fusking-range div and populate it
	function createFuskingRange(popupDiv) {
		// Check if the fusking-range div already exists
		let fuskingRange = popupDiv.querySelector('#fusking-range');
		if (!fuskingRange) {
			// Create the fusking-range div
			fuskingRange = document.createElement('div');
			fuskingRange.id = 'fusking-range';

			// Create a leading span
			const fuskFrom = document.createTextNode('Fusk from ');

			// Create the first input box
			const inputStart = document.createElement('input');
			inputStart.type = 'text';
			inputStart.id = 'fusking-input-start';

			// Create the "to" text node
			const toText = document.createTextNode(' to ');

			// Create the second input box
			const inputEnd = document.createElement('input');
			inputEnd.type = 'text';
			inputEnd.id = 'fusking-input-end';

			// Append the input boxes and "to" text to the fusking-range div
			fuskingRange.appendChild(fuskFrom);
			fuskingRange.appendChild(inputStart);
			fuskingRange.appendChild(toText);
			fuskingRange.appendChild(inputEnd);

			// Append the fusking-range div to the popupDiv
			popupDiv.appendChild(fuskingRange);

			// Attach input event listeners with the necessary arguments
			inputStart.addEventListener('input', () => handleInputChange(popupDiv, inputStart, inputEnd));
			inputEnd.addEventListener('input', () => handleInputChange(popupDiv, inputStart, inputEnd));
		}
	}

	// Add event listener for span clicks
	function addSpanEventListeners(container, popupDiv) {
		console.log('addSpanEventListeners is running.');
		const spans = container.querySelectorAll('.url-number');
		spans.forEach(span => {
			console.log('Adding an event listener for a span.');
			span.addEventListener('click', () => {
				const selectedSpan = container.querySelector('.url-number[selected]');
				if (selectedSpan === span) {
					// Deselect the span and remove fusking-range if it exists
					span.removeAttribute('selected');
					const fuskingRange = popupDiv.querySelector('#fusking-range');
					if (fuskingRange) {
						fuskingRange.remove();
					}
					removeButtonDiv(popupDiv);
				} else {
					// Select the span, remove 'selected' from other spans, and create fusking-range div
					if (selectedSpan) {
						selectedSpan.removeAttribute('selected');
					}
					span.setAttribute('selected', '');

					// Create fusking-range div if it doesn't exist
					let fuskingRange = popupDiv.querySelector('#fusking-range');
					if (!fuskingRange) {
						createFuskingRange(popupDiv);
					}
				}
			});
		});
	}

	// Function to generate URL spans with numerical groups
	function generateUrlSpans(url, container, popupDiv) {
		// Select the hex container
		const hexContainer = container.querySelector('#hex-container');

		// Clear existing content except for hex container
		const existingContent = Array.from(container.childNodes).filter(node => node !== hexContainer);
		existingContent.forEach(node => container.removeChild(node));

		// Create a URL object to easily access different parts
		const urlObj = new URL(url);

		// Extract the protocol, domain, pathname, and search components
		const protocol = urlObj.protocol;
		const domain = urlObj.hostname;
		const pathAndQuery = urlObj.pathname + urlObj.search;

		// Create a regex to match numerical parts based on hex mode
		const regex = hex ? /([0-9a-fA-F]+)/g : /([0-9]+)/g;

		// Create a container for the protocol and domain
		const protocolAndDomain = document.createTextNode(protocol + '//' + domain);
		container.appendChild(protocolAndDomain);

		// Create a span for the path and query parts
		const pathAndQueryParts = pathAndQuery.split(regex).map(part => {
			if (part && regex.test(part)) {
				const span = document.createElement('span');
				span.className = 'url-number';
				span.textContent = part;
				return span;
			} else {
				const textNode = document.createTextNode(part);
				return textNode;
			}
		});

		// Append the path and query parts to the container, ensuring hex container is not affected
		pathAndQueryParts.forEach(part => container.appendChild(part));

		// Finally, append the hex container
		container.appendChild(hexContainer);

		// Add event listeners to the spans
		addSpanEventListeners(container, popupDiv);
	}

	// Create the hex container and its content
	const hexContainer = document.createElement('div');
	hexContainer.id = 'hex-container';

	const hexCheckbox = document.createElement('input');
	hexCheckbox.type = 'checkbox';
	hexCheckbox.id = 'hex-checkbox';
	hexCheckbox.checked = hex; // Set the checkbox state based on the hex value
	hexCheckbox.onchange = () => {
		hex = hexCheckbox.checked;
		localStorage.setItem(`hex-${domain}`, hex); // Store the hex value
		// Placeholder for additional functionality when checkbox state changes
		generateUrlSpans(imageUrl, urlContainer, popupDiv);
	};

	const hexLabel = document.createElement('label');
	hexLabel.htmlFor = 'hex-checkbox';
	hexLabel.textContent = 'Hex';

	// Append the checkbox and label to the hex container
	hexContainer.appendChild(hexCheckbox);
	hexContainer.appendChild(hexLabel);

	// Append the hex container to the URL container
	urlContainer.appendChild(hexContainer);

	// Append the URL container to the popup div
	popupDiv.appendChild(urlContainer);

	// Generate spans for the URL
	generateUrlSpans(imageUrl, urlContainer, popupDiv);


	// Append the popup div to the shadow root
	shadowRoot.appendChild(popupDiv);

	// Finally, append the shadow container to the document body
	document.body.appendChild(shadowContainer);

	// Optionally, send a message back to the extension (if needed)
	//chrome.runtime.sendMessage({
	//	imageUrl
	//});
}
