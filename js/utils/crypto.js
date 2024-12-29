// Generate SHA-256 hash
export async function generateSHA256Hash(data) {
    // Encode the data as UTF-8
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
 
    // Compute the hash
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
 
    // Convert the hash to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}