import * as THREE from 'three'

export class Player {
  constructor(scene, x, y, z, mazeGenerator) {
    this.scene = scene
    this.mazeGenerator = mazeGenerator
    this.cellSize = mazeGenerator.cellSize
    this.wallHeight = mazeGenerator.wallHeight
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.set(x, y, z)
    
    this.spotLight = new THREE.SpotLight(0xffffff, 500, 15, Math.PI / 6, 0.5, 2)
    this.spotLight.position.copy(this.camera.position)
    this.spotLight.target = this.camera
    this.scene.add(this.spotLight)
    
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.speed = 5
    this.rotationSpeed = 0.002
    
    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false
    
    this.pitch = 0
    this.yaw = -Math.PI / 2
    
    this.setupControls()
  }

  setupControls() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e))
    document.addEventListener('keyup', (e) => this.onKeyUp(e))
    document.addEventListener('mousemove', (e) => this.onMouseMove(e))
    document.addEventListener('mousedown', () => {
      document.body.requestPointerLock = document.body.requestPointerLock ||
        document.body.mozRequestPointerLock ||
        document.body.webkitRequestPointerLock
      document.body.requestPointerLock()
    })
  }

  onKeyDown(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true
        break
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true
        break
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true
        break
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true
        break
    }
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false
        break
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false
        break
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false
        break
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false
        break
    }
  }

  onMouseMove(e) {
    if (document.pointerLockElement !== document.body) return
    
    const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0
    const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0
    
    this.yaw += movementX * this.rotationSpeed
    this.pitch -= movementY * this.rotationSpeed
    
    this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch))
  }

  update() {
    const deltaTime = 0.016
    
    this.velocity.set(0, 0, 0)
    
    const forward = new THREE.Vector3(
      Math.sin(this.yaw),
      0,
      Math.cos(this.yaw)
    ).normalize()
    
    const right = new THREE.Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    ).normalize()
    
    if (this.moveForward) this.velocity.add(forward)
    if (this.moveBackward) this.velocity.sub(forward)
    if (this.moveLeft) this.velocity.sub(right)
    if (this.moveRight) this.velocity.add(right)
    
    this.velocity.normalize().multiplyScalar(this.speed * deltaTime)
    
    if (this.velocity.length() > 0) {
      const newPos = this.camera.position.clone().add(this.velocity)
      
      if (this.canMoveTo(newPos)) {
        this.camera.position.copy(newPos)
        this.spotLight.position.copy(this.camera.position)
      }
    }
    
    const quaternion = new THREE.Quaternion()
    quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw)
    quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch))
    this.camera.quaternion.copy(quaternion)
    
    this.spotLight.target.position.copy(this.camera.position)
    this.spotLight.target.position.add(forward.multiplyScalar(10))
  }

  canMoveTo(pos) {
    const halfCell = this.cellSize / 2
    const margin = 0.3
    
    const x = Math.floor((pos.x) / this.cellSize)
    const z = Math.floor((pos.z) / this.cellSize)
    
    if (x < 0 || x >= this.mazeGenerator.size || z < 0 || z >= this.mazeGenerator.size) {
      return false
    }
    
    const cell = this.mazeGenerator.maze[x][z]
    
    const offsetX = pos.x - (x * this.cellSize + halfCell)
    const offsetZ = pos.z - (z * this.cellSize + halfCell)
    
    if (offsetZ < -halfCell + margin && cell.south) return false
    if (offsetZ > halfCell - margin && cell.north) return false
    if (offsetX < -halfCell + margin && cell.west) return false
    if (offsetX > halfCell - margin && cell.east) return false
    
    return true
  }

  resetPosition(x, y, z) {
    this.camera.position.set(x, y, z)
    this.spotLight.position.copy(this.camera.position)
    this.pitch = 0
    this.yaw = -Math.PI / 2
  }

  getPosition() {
    return this.camera.position
  }
}