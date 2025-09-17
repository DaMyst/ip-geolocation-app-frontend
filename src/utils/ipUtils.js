/**
 * Fetches the user's public IP address using ipinfo.io
 * @returns {Promise<string>} The user's public IP address
 */
export const getPublicIP = async () => {
  const token = "2333abd29a1eae"; // replace with your actual token
  try {
    const response = await fetch(`https://ipinfo.io/ip?token=${token}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ip = await response.text();
    const trimmedIp = ip.trim();
    console.log("ip:" + ip)
    console.log("ip:" + trimmedIp)
    
    // Validate the IP format
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmedIp)) {
      throw new Error('Invalid IP address format received');
    }
    
    return trimmedIp;
  } catch (error) {
    console.error('Error fetching public IP:', error);
    return 'unknown';
  }
};
