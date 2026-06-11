import * as THREE from 'three'

export class ThemeManager {
  constructor(scene) {
    this.scene = scene
    this.currentTheme = 'castle'
    this.pathMarkers = []
    this.breadcrumbMarkers = []
    this.lights = []
    this.wallMaterial = null
    this.floorMaterial = null
  }

  getWallMaterial() {
    if (!this.wallMaterial) {
      this.wallMaterial = this.createWallMaterial()
    }
    return this.wallMaterial
  }

  getFloorMaterial() {
    if (!this.floorMaterial) {
      this.floorMaterial = this.createFloorMaterial()
    }
    return this.floorMaterial
  }

  createWallMaterial() {
    const materials = {
      castle: new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.8,
        metalness: 0.2,
        map: this.createBrickTexture()
      }),
      space: new THREE.MeshStandardMaterial({
        color: 0x2a2a3a,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x0044ff,
        emissiveIntensity: 0.1
      }),
      garden: new THREE.MeshStandardMaterial({
        color: 0x2d5016,
        roughness: 0.9,
        metalness: 0.1,
        map: this.createGrassTexture()
      })
    }
    return materials[this.currentTheme]
  }

  createFloorMaterial() {
    const materials = {
      castle: new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.9,
        metalness: 0.1
      }),
      space: new THREE.MeshStandardMaterial({
        color: 0x1a1a2a,
        roughness: 0.2,
        metalness: 0.6,
        emissive: 0x003366,
        emissiveIntensity: 0.05
      }),
      garden: new THREE.MeshStandardMaterial({
        color: 0x3d6b1f,
        roughness: 0.8,
        metalness: 0.0,
        map: this.createGroundTexture()
      })
    }
    return materials[this.currentTheme]
  }

  createBrickTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#666'
    ctx.fillRect(0, 0, 256, 256)
    
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 2
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const offset = row % 2 === 0 ? 0 : 16
        ctx.strokeRect(
          col * 32 + offset,
          row * 32,
          32,
          16
        )
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    return texture
  }

  createGrassTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#3d6b1f'
    ctx.fillRect(0, 0, 128, 128)
    
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 128
      const y = Math.random() * 128
      const size = Math.random() * 3 + 1
      ctx.fillStyle = `rgba(40, 100, 20, ${Math.random() * 0.3})`
      ctx.fillRect(x, y, size, size * 2)
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(8, 8)
    return texture
  }

  createGroundTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#4a7c23'
    ctx.fillRect(0, 0, 128, 128)
    
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 128
      const y = Math.random() * 128
      ctx.fillStyle = `rgba(30, 60, 10, ${Math.random() * 0.2})`
      ctx.beginPath()
      ctx.arc(x, y, Math.random() * 4 + 1, 0, Math.PI * 2)
      ctx.fill()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(8, 8)
    return texture
  }

  applyTheme(theme) {
    this.currentTheme = theme
    
    this.lights.forEach(light => {
      this.scene.remove(light)
    })
    this.lights = []
    
    this.wallMaterial = this.createWallMaterial()
    this.floorMaterial = this.createFloorMaterial()
    
    this.updateLights()
  }

  updateLights() {
    this.scene.remove(...this.lights)
    this.lights = []
    
    const ambientLight = new THREE.AmbientLight(this.getAmbientColor(), 0.3)
    this.scene.add(ambientLight)
    this.lights.push(ambientLight)
    
    switch (this.currentTheme) {
      case 'castle':
        for (let i = 0; i < 8; i++) {
          const torchLight = new THREE.PointLight(0xff6600, 200, 15)
          torchLight.position.set(
            3 + (i % 4) * 6,
            2,
            3 + Math.floor(i / 4) * 6
          )
          this.scene.add(torchLight)
          this.lights.push(torchLight)
        }
        break
        
      case 'space':
        const neon1 = new THREE.PointLight(0x00ffff, 150, 20)
        neon1.position.set(5, 2, 5)
        this.scene.add(neon1)
        this.lights.push(neon1)
        
        const neon2 = new THREE.PointLight(0xff00ff, 150, 20)
        neon2.position.set(15, 2, 15)
        this.scene.add(neon2)
        this.lights.push(neon2)
        
        const stripLight = new THREE.RectAreaLight(0x0088ff, 50, 50, 0.5)
        stripLight.position.set(10, 3, 10)
        stripLight.rotation.x = -Math.PI / 2
        this.scene.add(stripLight)
        this.lights.push(stripLight)
        break
        
      case 'garden':
        const sunLight = new THREE.DirectionalLight(0xffffff, 1)
        sunLight.position.set(10, 20, 10)
        sunLight.castShadow = true
        this.scene.add(sunLight)
        this.lights.push(sunLight)
        
        const fillLight = new THREE.HemisphereLight(0x88cc88, 0x446644, 0.3)
        this.scene.add(fillLight)
        this.lights.push(fillLight)
        break
    }
  }

  getAmbientColor() {
    const colors = {
      castle: 0x333333,
      space: 0x111122,
      garden: 0x556644
    }
    return colors[this.currentTheme]
  }

  highlightPath(path, cellSize) {
    this.clearPathHighlight()
    
    path.forEach(cell => {
      const markerGeometry = new THREE.PlaneGeometry(cellSize * 0.8, cellSize * 0.8)
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.6
      })
      const marker = new THREE.Mesh(markerGeometry, markerMaterial)
      marker.rotation.x = -Math.PI / 2
      marker.position.set(
        cell.x * cellSize + cellSize / 2,
        0.02,
        cell.z * cellSize + cellSize / 2
      )
      this.scene.add(marker)
      this.pathMarkers.push(marker)
    })
  }

  clearPathHighlight() {
    this.pathMarkers.forEach(marker => {
      marker.geometry.dispose()
      marker.material.dispose()
      this.scene.remove(marker)
    })
    this.pathMarkers = []
  }

  markBreadcrumb(cellKey, cellSize) {
    const [x, z] = cellKey.split(',').map(Number)
    
    const color = this.currentTheme === 'space' ? 0x00ffff : 
                  this.currentTheme === 'garden' ? 0xffcc00 : 0x6666ff
    
    const markerGeometry = new THREE.CircleGeometry(cellSize * 0.15, 8)
    const markerMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.7
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.rotation.x = -Math.PI / 2
    marker.position.set(
      x * cellSize + cellSize / 2,
      0.02,
      z * cellSize + cellSize / 2
    )
    this.scene.add(marker)
    this.breadcrumbMarkers.push(marker)
  }

  clearBreadcrumbs() {
    this.breadcrumbMarkers.forEach(marker => {
      marker.geometry.dispose()
      marker.material.dispose()
      this.scene.remove(marker)
    })
    this.breadcrumbMarkers = []
  }
}