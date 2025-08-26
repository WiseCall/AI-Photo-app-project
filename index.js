const searchInput = document.getElementById('search-input')
const searchButton = document.getElementById('search-button')
const fileInput = document.getElementById('file-input')
const display = document.getElementById('photo-display')




searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value
})

fileInput.addEventListener('change', () => {
    display.innerHTML = ""
    const files = fileInput.files
      
    Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = e => {
            const itemDiv = document.createElement('div')
            itemDiv.className = 'item'
            const img = document.createElement('img')
            img.src = e.target.result
            itemDiv.appendChild(img)
            display.appendChild(itemDiv)
        }
        reader.readAsDataURL(file)
    })
})