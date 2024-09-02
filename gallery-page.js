console.log('Script loaded');

// Define global constants
let prefix, suffix, beginRange, endRange, hex;

// Function to get query parameters from URL
function getQueryParams() {
	const params = new URLSearchParams(window.location.search);
	prefix = params.get('prefix') || '';
	suffix = params.get('suffix') || '';
	beginRange = params.get('beginRange') || '';
	endRange = params.get('endRange') || '';
	hex = params.get('hex') === 'true';
}

// Run the function
getQueryParams();

console.log("hex =", hex);

// Construct and set the page title
function setPageTitle() {
	const baseTitle = "Fuskrat Gallery - ";
	const range = `${beginRange}-${endRange}`;
	const hexSuffix = hex ? " (hex)" : "";
	document.title = `${baseTitle}${prefix}[${range}]${suffix}${hexSuffix}`;
}

// Initialize page title
setPageTitle();

// Get array of image URL's
const urls = fuskUrls({
	prefix,
	suffix,
	beginRange,
	endRange,
	hex
});

if (Array.isArray(urls)) {
	// Create and append gallery
	const gallery = createGallery(urls, true);
	document.body.appendChild(gallery);
} else {
	// Handle the case where urls is not an array
	const errorDiv = document.createElement('div');
	errorDiv.id = 'error-div';
	errorDiv.textContent = urls; // Assume urls is a string in this case
	document.body.appendChild(errorDiv);
}

//// Create and append gallery
//const gallery = createGallery(urls);
//document.body.appendChild(gallery);
