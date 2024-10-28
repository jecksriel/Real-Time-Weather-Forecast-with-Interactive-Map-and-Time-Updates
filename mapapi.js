let map;
let marker;

// Function to initialize the Leaflet map with GPS coordinates
function initializeMap(lat, lon) {

    const mapContainer = document.getElementById('map');
    // Check if the map is already initialized
    if (map) {
        // Remove the map from the DOM
        mapContainer.innerHTML = ''; // Clear existing map container
        map.remove(); // Remove the map instance
        map = null; // Set map to null to allow reinitialization
    }

    // Initialize the Leaflet map centered at the user's location
    map = L.map('map').setView([lat, lon], 10);
    // Add a tile layer to the map (e.g., OpenStreetMap tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add a draggable marker at the user's location
    marker = L.marker([lat, lon], { draggable: true }).addTo(map)
        .bindPopup('You can move me!<br>Latitude: ' + lat + '<br>Longitude: ' + lon)
        .openPopup();

    // Event listener to get new coordinates when the marker is moved
    marker.on('dragend', function(e) {
        const position = marker.getLatLng(); // Get new latitude and longitude
        const newLat = position.lat;
        const newLon = position.lng;
        console.log(`New Latitude: ${newLat}, New Longitude: ${newLon}`); // Log the new coordinates
        fetchCityNameByCoordinates(newLat, newLon);
        fetchCurrentTime(newLat, newLon);

        // Update the popup with the new coordinates
        marker.setPopupContent('You can move me!<br>Latitude: ' + newLat + '<br>Longitude: ' + newLon).openPopup();
    });
}

