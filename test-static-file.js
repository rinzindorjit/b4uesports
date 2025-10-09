// Simple test to check if static files are being served
console.log('Testing static file serving...');

// Check if we can access the main page
fetch('https://b4uesports.vercel.app/')
  .then(response => {
    console.log('Main page status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('Main page content length:', data.length);
    console.log('Main page content (first 100 chars):', data.substring(0, 100));
  })
  .catch(error => {
    console.error('Error fetching main page:', error);
  });

// Check if we can access the JS file
fetch('https://b4uesports.vercel.app/index-CdZFCnM6.js')
  .then(response => {
    console.log('JS file status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('JS file content length:', data.length);
    console.log('JS file content (first 100 chars):', data.substring(0, 100));
  })
  .catch(error => {
    console.error('Error fetching JS file:', error);
  });

// Check if we can access the CSS file
fetch('https://b4uesports.vercel.app/index-BqeVzBDh.css')
  .then(response => {
    console.log('CSS file status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('CSS file content length:', data.length);
    console.log('CSS file content (first 100 chars):', data.substring(0, 100));
  })
  .catch(error => {
    console.error('Error fetching CSS file:', error);
  });

// Check if we can access the API
fetch('https://b4uesports.vercel.app/api/pi-price')
  .then(response => {
    console.log('API status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('API response:', data);
  })
  .catch(error => {
    console.error('Error fetching API:', error);
  });