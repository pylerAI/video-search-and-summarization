/**
 * Shared video upload utilities
 * Agent API upload (for search profiles) - get upload URL first, then PUT
 */ /**
 * Response from agent API when getting upload URL
 */ /**
 * Get upload URL from Agent API
 * This is step 1 for agent API uploads (search profile)
 */ export async function getUploadUrl(filename, uploadUrl, formData, signal) {
    const response = await fetch(`${uploadUrl}/videos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            filename,
            ...formData
        }),
        signal
    });
    if (!response.ok) {
        throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }
    const data = await response.json();
    return data.url;
}
/**
 * Upload file (two-step process)
 * Step 1: Get upload URL
 * Step 2: PUT file to the URL
 */ export async function uploadFile(file, uploadUrl, formData, onProgress, abortSignal) {
    // Create AbortController for the getUploadUrl request
    const getUrlController = new AbortController();
    // If parent signal is aborted, abort the getUploadUrl request
    if (abortSignal?.aborted) {
        throw new Error('Upload was cancelled');
    }
    const abortListener = ()=>getUrlController.abort();
    abortSignal?.addEventListener('abort', abortListener);
    try {
        // Step 1: Get upload URL
        const presignedUrl = await getUploadUrl(file.name, uploadUrl, formData, getUrlController.signal);
        // Clean up abort listener after getting URL
        abortSignal?.removeEventListener('abort', abortListener);
        // Check if aborted between steps
        if (abortSignal?.aborted) {
            throw new Error('Upload was cancelled');
        }
        // Step 2: Upload file using XHR (for progress tracking)
        return new Promise((resolve, reject)=>{
            const xhr = new XMLHttpRequest();
            // Listen to parent abort signal
            if (abortSignal) {
                abortSignal.addEventListener('abort', ()=>xhr.abort());
            }
            xhr.upload.addEventListener('progress', (event)=>{
                if (event.lengthComputable && onProgress) {
                    const progress = Math.round(event.loaded / event.total * 100);
                    onProgress(progress);
                }
            });
            xhr.addEventListener('load', ()=>{
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const result = JSON.parse(xhr.responseText);
                        resolve(result);
                    } catch  {
                        reject(new Error('Failed to parse upload response'));
                    }
                } else {
                    reject(new Error(`Upload failed with status: ${xhr.status}`));
                }
            });
            xhr.addEventListener('error', ()=>{
                reject(new Error('Network error during upload'));
            });
            xhr.addEventListener('abort', ()=>{
                reject(new Error('Upload was cancelled'));
            });
            xhr.open('PUT', presignedUrl);
            xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
            xhr.send(file);
        });
    } finally{
        abortSignal?.removeEventListener('abort', abortListener);
    }
}

//# sourceMappingURL=videoUpload.js.map