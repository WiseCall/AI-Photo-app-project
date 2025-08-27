const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const fileInput = document.getElementById('file-input');
const display = document.getElementById('photo-display');

let uploadedImages = []; // { src: base64, score: null }

function renderImages(images, searchTerm = null, scores = null) {
    display.innerHTML = ""
    if (images.length === 0) {
        display.innerHTML = "No images uploaded."
        return
    }
    images.forEach((imgObj, idx) => {
        const itemDiv = document.createElement('div')
        itemDiv.className = 'item'
        const img = document.createElement('img')
        img.src = imgObj.src
        itemDiv.appendChild(img)

        // If searching, show score
        if (searchTerm && scores && scores[idx] !== undefined) {
            const tagDiv = document.createElement('div')
            tagDiv.style.fontSize = "0.9em"
            tagDiv.style.textAlign = "center"
            tagDiv.textContent = `${searchTerm}: ${(scores[idx] * 100).toFixed(1)}%`
            itemDiv.appendChild(tagDiv)
        }

        display.appendChild(itemDiv)
    })
}

fileInput.addEventListener('change', () => {
    uploadedImages = []
    const files = fileInput.files
    Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = e => {
            uploadedImages.push({ src: e.target.result })
            renderImages(uploadedImages)
        }
        reader.readAsDataURL(file)
    })
})

// Show all images if search is cleared
searchInput.addEventListener('input', () => {
    if (!searchInput.value.trim()) {
        renderImages(uploadedImages)
    }
});

searchButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value.trim()
    if (!searchTerm) {
        renderImages(uploadedImages)
        return;
    }

    display.innerHTML = "Searching..."

    const threshold = 0.8
    const scores = []

    // For each image, get score for the search term vs. a dummy label
    for (const imgObj of uploadedImages) {
        const response = await fetch("http://localhost:5000/clip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                image: imgObj.src,
                labels: [searchTerm, "randomword"]
            })
        });
        const result = await response.json()
        scores.push(result[searchTerm])
    }

    // Filter images by threshold
    const filtered = uploadedImages.filter((imgObj, idx) => scores[idx] > threshold)

    if (filtered.length === 0) {
        display.innerHTML = "No matching images found."
    } else {
        // Only show filtered images, with scores
        const scoredImages = uploadedImages.map((imgObj, idx) => ({
            ...imgObj,
            score: scores[idx]
        }));
        scoredImages.sort((a, b) => b.score - a.score);
        renderImages(scoredImages, searchTerm, scoredImages.map(img => img.score));
    }
})

// Initial render (in case images are preloaded)
renderImages(uploadedImages)