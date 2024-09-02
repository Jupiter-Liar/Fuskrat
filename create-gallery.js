function createGallery(urls, newTab) {
	// Create the gallery-outer div
	const galleryOuter = document.createElement('div');
	galleryOuter.id = 'gallery-outer';

	// Create a container div for the reload button and grid width controls
	const controlsContainer = document.createElement('div');
	controlsContainer.id = 'controls-container';
	galleryOuter.appendChild(controlsContainer);

	// Create a reload button
	const reloadButton = document.createElement('button');
	reloadButton.id = 'reload-failed-images';
	reloadButton.textContent = 'Reload any failed images';
	controlsContainer.appendChild(reloadButton);

	reloadButton.addEventListener('click', () => {
		const images = galleryInner.querySelectorAll('img');
		images.forEach((img) => {
			if (!img.complete || img.naturalWidth === 0) {
				const originalSrc = img.src;
				img.src = ''; // Clear the src to trigger reloading
				img.src = originalSrc; // Reset the src to attempt reload
			}
		});
	});

	// Create a div for the grid width controls
	const gridWidthControlDiv = document.createElement('div');
	gridWidthControlDiv.id = 'grid-width-control-div';
	controlsContainer.appendChild(gridWidthControlDiv);

	// Create a span to explain the input box
	const gridWidthSpan = document.createElement('span');
	gridWidthSpan.id = 'grid-width-span';
	gridWidthSpan.textContent = 'Number of images per row:';
	gridWidthControlDiv.appendChild(gridWidthSpan);

	// Create the number input for setting grid width
	const gridWidthInput = document.createElement('input');
	gridWidthInput.type = 'number';
	gridWidthInput.id = 'grid-width';
	gridWidthInput.min = '1';
	gridWidthInput.value = '3'; // Default grid width

	// Create the gallery-inner div
	const galleryInner = document.createElement('div');
	galleryInner.id = 'gallery-inner';
	galleryInner.style.display = 'grid';
	galleryInner.style.gridTemplateColumns = `repeat(${gridWidthInput.value}, 1fr)`; // Default grid layout
	galleryOuter.appendChild(galleryInner);

	// Retrieve grid width from storage and update input field
	if (newTab) {
		console.log('New tab grid width...');
		chrome.storage.local.get(['newTabGridWidth'], (result) => {
			const storedGridWidth = parseInt(result.newTabGridWidth) || 3;
			gridWidthInput.value = storedGridWidth;
			galleryInner.style.gridTemplateColumns = `repeat(${storedGridWidth}, 1fr)`;
		});
	} else {
		chrome.storage.local.get(['gridWidth'], (result) => {
			const storedGridWidth = parseInt(result.gridWidth) || 3;
			gridWidthInput.value = storedGridWidth;
			galleryInner.style.gridTemplateColumns = `repeat(${storedGridWidth}, 1fr)`;
		});
	}

	gridWidthControlDiv.appendChild(gridWidthInput);

	// Add event listener to update grid width
	gridWidthInput.addEventListener('input', () => {
		const gridWidth = gridWidthInput.value || 1;
		galleryInner.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
		if (newTab) {
			chrome.storage.local.set({
				newTabGridWidth: gridWidth
			}); // Save the value to local storage
		} else {
			chrome.storage.local.set({
				gridWidth: gridWidth
			}); // Save the value to local storage
		}
	});

	// Populate the gallery with images
	urls.forEach(url => {
		const cell = document.createElement('div');
		cell.className = 'gallery-cell';

		const img = document.createElement('img');
		img.src = url;

		const urlText = document.createElement('span');
		urlText.textContent = url;

		cell.appendChild(img);
		cell.appendChild(urlText);
		galleryInner.appendChild(cell);
	});

	// Return the entire galleryOuter element
	return galleryOuter;
}
