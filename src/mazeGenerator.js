import * as THREE from 'three'

export class MazeGenerator {
  constructor(size, cellSize, wallHeight, themeManager) {
    this.size = size
    this.cellSize = cellSize
    this.wallHeight = wallHeight
    this.themeManager = themeManager
    this.maze = []
    this.walls = []
    this.floor = null
    this.exitCell = { x: size - 1, z: size - 1 }
  }

  generate(seed = Math.random()) {
    this.seed = seed
    this.maze = []
    
    for (let i = 0; i < this.size; i++) {
      this.maze[i] = []
      for (let j = 0; j < this.size; j++) {
        this.maze[i][j] = {
          north: true,
          south: true,
          east: true,
          west: true,
          visited: false
        }
      }
    }
    
    this.recursiveBacktracker(0, 0)
    this.create3DMaze()
  }

  recursiveBacktracker(x, z) {
    const stack = []
    this.maze[x][z].visited = true
    stack.push({ x, z })
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1]
      const neighbors = this.getUnvisitedNeighbors(current.x, current.z)
      
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)]
        
        this.removeWall(current.x, current.z, next.x, next.z)
        this.maze[next.x][next.z].visited = true
        stack.push(next)
      } else {
        stack.pop()
      }
    }
    
    this.maze[0][0].west = false
    this.maze[this.size - 1][this.size - 1].east = false
  }

  getUnvisitedNeighbors(x, z) {
    const neighbors = []
    
    if (x > 0 && !this.maze[x - 1][z].visited) neighbors.push({ x: x - 1, z })
    if (x < this.size - 1 && !this.maze[x + 1][z].visited) neighbors.push({ x: x + 1, z })
    if (z > 0 && !this.maze[x][z - 1].visited) neighbors.push({ x, z: z - 1 })
    if (z < this.size - 1 && !this.maze[x][z + 1].visited) neighbors.push({ x, z: z + 1 })
    
    return neighbors
  }

  removeWall(x1, z1, x2, z2) {
    if (x1 === x2) {
      if (z1 > z2) {
        this.maze[x1][z1].south = false
        this.maze[x2][z2].north = false
      } else {
        this.maze[x1][z1].north = false
        this.maze[x2][z2].south = false
      }
    } else {
      if (x1 > x2) {
        this.maze[x1][z1].west = false
        this.maze[x2][z2].east = false
      } else {
        this.maze[x1][z1].east = false
        this.maze[x2][z2].west = false
      }
    }
  }

  create3DMaze() {
    this.walls.forEach(wall => {
      if (wall.geometry) wall.geometry.dispose()
      if (wall.material) wall.material.dispose()
    })
    this.walls = []
    
    if (this.floor) {
      this.floor.geometry.dispose()
      this.floor.material.dispose()
    }
    
    const floorGeometry = new THREE.PlaneGeometry(
      this.size * this.cellSize,
      this.size * this.cellSize
    )
    const floorMaterial = this.themeManager.getFloorMaterial()
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial)
    this.floor.rotation.x = -Math.PI / 2
    this.floor.position.y = 0.01
    this.floor.position.x = (this.size * this.cellSize) / 2 - this.cellSize / 2
    this.floor.position.z = (this.size * this.cellSize) / 2 - this.cellSize / 2
    this.themeManager.scene.add(this.floor)
    
    const wallGeometry = new THREE.BoxGeometry(this.cellSize, this.wallHeight, 0.2)
    const wallMaterial = this.themeManager.getWallMaterial()
    
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const cell = this.maze[x][z]
        
        if (cell.north) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone())
          wall.position.set(
            x * this.cellSize + this.cellSize / 2,
            this.wallHeight / 2,
            z * this.cellSize
          )
          this.themeManager.scene.add(wall)
          this.walls.push(wall)
        }
        
        if (cell.south) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone())
          wall.position.set(
            x * this.cellSize + this.cellSize / 2,
            this.wallHeight / 2,
            (z + 1) * this.cellSize
          )
          this.themeManager.scene.add(wall)
          this.walls.push(wall)
        }
        
        if (cell.west) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone())
          wall.rotation.y = Math.PI / 2
          wall.position.set(
            x * this.cellSize,
            this.wallHeight / 2,
            z * this.cellSize + this.cellSize / 2
          )
          this.themeManager.scene.add(wall)
          this.walls.push(wall)
        }
        
        if (cell.east) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial.clone())
          wall.rotation.y = Math.PI / 2
          wall.position.set(
            (x + 1) * this.cellSize,
            this.wallHeight / 2,
            z * this.cellSize + this.cellSize / 2
          )
          this.themeManager.scene.add(wall)
          this.walls.push(wall)
        }
      }
    }
    
    const outerWallGeometry = new THREE.BoxGeometry(0.2, this.wallHeight, this.size * this.cellSize + 0.4)
    const outerWallMaterial = this.themeManager.getWallMaterial()
    
    const northOuterWall = new THREE.Mesh(outerWallGeometry, outerWallMaterial.clone())
    northOuterWall.position.set(
      (this.size * this.cellSize) / 2,
      this.wallHeight / 2,
      -0.2
    )
    this.themeManager.scene.add(northOuterWall)
    this.walls.push(northOuterWall)
    
    const southOuterWall = new THREE.Mesh(outerWallGeometry, outerWallMaterial.clone())
    southOuterWall.position.set(
      (this.size * this.cellSize) / 2,
      this.wallHeight / 2,
      this.size * this.cellSize + 0.2
    )
    this.themeManager.scene.add(southOuterWall)
    this.walls.push(southOuterWall)
    
    const westOuterWall = new THREE.Mesh(outerWallGeometry, outerWallMaterial.clone())
    westOuterWall.rotation.y = Math.PI / 2
    westOuterWall.position.set(
      -0.2,
      this.wallHeight / 2,
      (this.size * this.cellSize) / 2
    )
    this.themeManager.scene.add(westOuterWall)
    this.walls.push(westOuterWall)
    
    const eastOuterWall = new THREE.Mesh(outerWallGeometry, outerWallMaterial.clone())
    eastOuterWall.rotation.y = Math.PI / 2
    eastOuterWall.position.set(
      this.size * this.cellSize + 0.2,
      this.wallHeight / 2,
      (this.size * this.cellSize) / 2
    )
    this.themeManager.scene.add(eastOuterWall)
    this.walls.push(eastOuterWall)
  }

  canMove(x, z) {
    if (x < 0 || x >= this.size || z < 0 || z >= this.size) return false
    
    const cell = this.maze[x][z]
    return {
      north: !cell.north,
      south: !cell.south,
      east: !cell.east,
      west: !cell.west
    }
  }

  getStartPosition() {
    return {
      x: this.cellSize / 2,
      y: this.wallHeight / 2,
      z: this.cellSize / 2
    }
  }

  getExitCell() {
    return this.exitCell
  }

  getMaze() {
    return this.maze
  }

  findPath(start, end) {
    const queue = [{ x: start.x, z: start.z, path: [] }]
    const visited = new Set()
    
    while (queue.length > 0) {
      const current = queue.shift()
      const key = `${current.x},${current.z}`
      
      if (visited.has(key)) continue
      visited.add(key)
      
      const newPath = [...current.path, { x: current.x, z: current.z }]
      
      if (current.x === end.x && current.z === end.z) {
        return newPath
      }
      
      const cell = this.maze[current.x][current.z]
      
      if (!cell.north && !visited.has(`${current.x},${current.z - 1}`)) {
        queue.push({ x: current.x, z: current.z - 1, path: newPath })
      }
      if (!cell.south && !visited.has(`${current.x},${current.z + 1}`)) {
        queue.push({ x: current.x, z: current.z + 1, path: newPath })
      }
      if (!cell.east && !visited.has(`${current.x + 1},${current.z}`)) {
        queue.push({ x: current.x + 1, z: current.z, path: newPath })
      }
      if (!cell.west && !visited.has(`${current.x - 1},${current.z}`)) {
        queue.push({ x: current.x - 1, z: current.z, path: newPath })
      }
    }
    
    return null
  }
}