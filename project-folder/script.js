document.addEventListener('DOMContentLoaded', () => {
    const totalStudentsCountElement = document.getElementById("totalStudentsCount");
    const queriesCountElement = document.getElementById("queriesCount");
    const newRegistrationsCountElement = document.getElementById("newRegistrationsCount");
    const certificategeneratedCountElement = document.getElementById("certificategeneratedCount");
    const appliedInternshipsCountElement = document.getElementById("appliedInternshipsCount");
  
    // CSV URLs (Replace with your actual CSV URLs)
    const studentsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRGRsVHf_IQ3MhieEiJL34Shz4i3xLaK-CzxmX53Qtx8Uk7n7_FmyyVQNLofWl9bvVAG3N7XH7WDj1/pub?output=csv';
    const queriesCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWBd8u7ZRxnmfiwhJtWbPnAPWD4zxv9eCg9bFmXs_XFnGZgtSxLMk2J59DiaLowTLP8g7saukd85ba/pub?output=csv';
    const registrationsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRGRsVHf_IQ3MhieEiJL34Shz4i3xLaK-CzxmX53Qtx8Uk7n7_FmyyVQNLofWl9bvVAG3N7XH7WDj1/pub?output=csv';
    const certificatesCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT8OWQIbdH0FRQi_EdswhCnFRrfvQcvaUuQ6OHAhB9wti2LQICBiQcc_KDfRw-oGITtapYZ4HAMIQhs/pub?output=csv';
    const appliedInternshipsCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRgVDawdn_MGLRP5XSoRL3Z3HVnJJizuvLv-WMpBrr9qzthiFz-wW3ji7N7mWc3AigF65MmqVMr_MAK/pub?output=csv';
  
    // Function to fetch CSV and update count for different data
    function fetchAndUpdateCount(url, element, processDataCallback) {
      fetch(url)
        .then(response => response.text())
        .then(csvData => {
          const rows = csvData.split('\n'); // Split CSV by newlines to get each row
          const count = processDataCallback(rows); // Process the data (using the callback function)
          element.textContent = (count < 10 ? '0' : '') + count; // Format for 2 digits
        })
        .catch(error => {
          console.error(`Error fetching data from ${url}:`, error);
        });
    }
  
    // Process CSV data for students
    function processStudentsData(rows) {
      return rows.slice(1).filter(row => row.trim() !== "").length; // Exclude header and count valid rows
    }
  
    // Process CSV data for queries
    function processQueriesData(rows) {
      const nonEmptyRows = rows.slice(1).filter(row => row.trim() !== ""); // Skip first row (header)
      const messageColumnIndex = 3; // Assuming the message is in the 4th column (index 3)
      let queriesCount = 0;
  
      nonEmptyRows.forEach(row => {
        const columns = row.split(','); // Split the row by comma
        if (columns[messageColumnIndex] && columns[messageColumnIndex].trim() !== "") {
          queriesCount++; // Increment count if there is a non-empty message
        }
      });
  
      return queriesCount;
    }
  
    // Process CSV data for registrations
    function processRegistrationsData(rows) {
      return rows.slice(1).filter(row => row.trim() !== "").length; // Count valid registration rows
    }
  
    // Process CSV data for certificates
    function processCertificatesData(rows) {
      return rows.slice(1).filter(row => row.trim() !== "").length; // Count valid certificate rows
    }
  
    // Process CSV data for applied internships
    function processAppliedInternshipsData(rows) {
      return rows.slice(1).filter(row => row.trim()!== "").length; // Count valid internship application rows
    }
  
    // Fetch and update data for each type
    fetchAndUpdateCount(studentsCsvUrl, totalStudentsCountElement, processStudentsData);
    fetchAndUpdateCount(queriesCsvUrl, queriesCountElement, processQueriesData);
    fetchAndUpdateCount(registrationsCsvUrl, newRegistrationsCountElement, processRegistrationsData);
    fetchAndUpdateCount(certificatesCsvUrl, certificategeneratedCountElement, processCertificatesData);
    fetchAndUpdateCount(appliedInternshipsCsvUrl, appliedInternshipsCountElement, processAppliedInternshipsData);
  
    // Refresh button event listeners
    document.getElementById("refreshTotalStudents").addEventListener("click", () => {
      fetchAndUpdateCount(studentsCsvUrl, totalStudentsCountElement, processStudentsData);
    });
  
    document.getElementById("refreshNewRegistrations").addEventListener("click", () => {
      fetchAndUpdateCount(registrationsCsvUrl, newRegistrationsCountElement, processRegistrationsData);
    });
  
    document.getElementById("refreshQueries").addEventListener("click", () => {
      fetchAndUpdateCount(queriesCsvUrl, queriesCountElement, processQueriesData);
    });
  
    document.getElementById("refreshCertificates").addEventListener("click", () => {
      fetchAndUpdateCount(certificatesCsvUrl, certificategeneratedCountElement, processCertificatesData);
    });
  
    document.getElementById("refreshAppliedInternships").addEventListener("click", () => {
      fetchAndUpdateCount(appliedInternshipsCsvUrl, appliedInternshipsCountElement, processAppliedInternshipsData);
    });
  });
  