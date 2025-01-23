document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particle-network")
  const ctx = canvas.getContext("2d")
  const welcomeScreen = document.getElementById("welcome-screen")
  const appInterface = document.getElementById("app-interface")
  const enterAppBtn = document.getElementById("enter-app-btn")
  const dropZone = document.getElementById("dropZone")
  const fileInput = document.getElementById("fileInput")
  const uploadForm = document.getElementById("uploadForm")
  const progressBarContainer = document.getElementById("progressBarContainer")
  const progressBar = document.getElementById("progressBar")

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  let particlesArray

  // get mouse position
  const mouse = {
    x: null,
    y: null,
    radius: 150,
  }

  window.addEventListener("mousemove", (event) => {
    mouse.x = event.x
    mouse.y = event.y
  })

  // create particle
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x
      this.y = y
      this.directionX = directionX
      this.directionY = directionY
      this.size = size
      this.color = color
    }
    // method to draw individual particle
    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
      ctx.fillStyle = "#00ffff"
      ctx.fill()
    }
    // check particle position, check mouse position, move the particle, draw the particle
    update() {
      //check if particle is still within canvas
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY
      }
      //check collision detection - mouse position / particle position
      const dx = mouse.x - this.x
      const dy = mouse.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < mouse.radius + this.size) {
        if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
          this.x += 10
        }
        if (mouse.x > this.x && this.x > this.size * 10) {
          this.x -= 10
        }
        if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
          this.y += 10
        }
        if (mouse.y > this.y && this.y > this.size * 10) {
          this.y -= 10
        }
      }
      // move particle
      this.x += this.directionX
      this.y += this.directionY
      // draw particle
      this.draw()
    }
  }

  // create particle array
  function init() {
    particlesArray = []
    const numberOfParticles = (canvas.height * canvas.width) / 9000
    for (let i = 0; i < numberOfParticles; i++) {
      const size = Math.random() * 5 + 1
      const x = Math.random() * (innerWidth - size * 2 - size * 2) + size * 2
      const y = Math.random() * (innerHeight - size * 2 - size * 2) + size * 2
      const directionX = Math.random() * 5 - 2.5
      const directionY = Math.random() * 5 - 2.5
      const color = "#00ffff"
      particlesArray.push(new Particle(x, y, directionX, directionY, size, color))
    }
  }

  // check if particles are close enough to draw line between them
  function connect() {
    let opacityValue = 1
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        const distance =
          (particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x) +
          (particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y)
        if (distance < (canvas.width / 7) * (canvas.height / 7)) {
          opacityValue = 1 - distance / 20000
          ctx.strokeStyle = "rgba(0, 255, 255," + opacityValue + ")"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
          ctx.stroke()
        }
      }
    }
  }

  // animation loop
  function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update()
    }
    connect()
  }

  // resize event
  window.addEventListener("resize", () => {
    canvas.width = innerWidth
    canvas.height = innerHeight
    mouse.radius = (canvas.height / 80) * (canvas.height / 80)
    init()
  })

  // mouse out event
  window.addEventListener("mouseout", () => {
    mouse.x = undefined
    mouse.y = undefined
  })

  init()
  animate()

  // Welcome screen transition
  enterAppBtn.addEventListener("click", () => {
    startTechTransition()
  })

  function startTechTransition() {
    const transitionOverlay = document.createElement("div")
    transitionOverlay.className = "transition-overlay"
    document.body.appendChild(transitionOverlay)

    const transitionLines = 20
    for (let i = 0; i < transitionLines; i++) {
      const line = document.createElement("div")
      line.className = "transition-line"
      line.style.left = `${(i / transitionLines) * 100}%`
      line.style.animationDelay = `${i * 0.1}s`
      transitionOverlay.appendChild(line)
    }

    setTimeout(() => {
      welcomeScreen.classList.add("hidden")
      appInterface.classList.remove("hidden")
      appInterface.style.opacity = "0"

      setTimeout(() => {
        appInterface.style.opacity = "1"
        transitionOverlay.style.opacity = "0"

        setTimeout(() => {
          transitionOverlay.remove()
        }, 1000)
      }, 500)
    }, 2000)
  }

  // Existing form handling code
  dropZone.addEventListener("click", () => fileInput.click())
  ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false)
  })

  function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
  }
  ;["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, highlight, false)
  })
  ;["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, unhighlight, false)
  })

  function highlight() {
    dropZone.classList.add("dragover")
  }

  function unhighlight() {
    dropZone.classList.remove("dragover")
  }

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault()
    dropZone.classList.remove("dragover")
    fileInput.files = e.dataTransfer.files
  })

  // Handle file upload
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const file = fileInput.files[0]
    if (!file) {
      alert("Please select a file first.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/")

    // Show progress bar
    progressBarContainer.style.display = "block"

    // Update progress bar during upload
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100
        progressBar.style.width = percent + "%"
      }
    })

    // Handle response
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        // Display QR code and file URL
        const qrContainer = document.createElement("div")
        qrContainer.className = "qr-container"
        qrContainer.innerHTML = `
                    <h2>QR Code:</h2>
                    <img src="${response.qr_image}" alt="QR Code">
                    <p><a href="${response.file_url}" target="_blank">Download File</a></p>
                `
        document.querySelector(".container").appendChild(qrContainer)
      } else {
        alert("Error uploading file. Please try again.")
      }
    }

    xhr.send(formData)
  })
})

