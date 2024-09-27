async function getAllowedPatientId(): Promise<string> {
    try {
      const response = await fetch('../assets/allowedPatientId.txt');
      
      // Check if the fetch was successful
      if (!response.ok) {
        throw new Error('Failed to load allowedPatientId.txt');
      }
  
      // Read the text content (patient ID)
      const patientId = await response.text();
      
      return patientId.trim(); // Trim to remove any extra spaces or new lines
    } catch (error) {
      console.error('Error fetching allowed patient ID:', error);
      return ''; // Return empty if there's an error
    }
}

export {
    getAllowedPatientId
}