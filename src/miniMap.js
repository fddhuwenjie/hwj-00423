export class MiniMap {
  constructor(size, maze) {
    this.size = size
    this.maze = maze
    this.canvas = document.getElementById('minimap')
    this.canvas.width = 180
    this.canvas.height = 180
    this.ctx = this.canvas.getContext('2d')
  }

  updateMaze(size, maze) {
    this.size = size
    this.maze = maze
  }

  update(exploredCells, currentCell, exitCell) {
    const ctx = this.ctx
    const size = this.canvas.width
    const cellSize = size / this.size
    
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, size, size)
    
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const key = `${x},${z}`
        const isExplored = exploredCells.has(key)
        const isCurrent = x === currentCell.x && z === currentCell.z
        const isExit = x === exitCell.x && z === exitCell.z
        
        if (isExplored) {
          ctx.fillStyle = '#333'
          ctx.fillRect(x * cellSize, z * cellSize, cellSize, cellSize)
        } else {
          ctx.fillStyle = '#0a0a0a'
          ctx.fillRect(x * cellSize, z * cellSize, cellSize, cellSize)
        }
        
        if (isCurrent) {
          ctx.fillStyle = '#4af'
          ctx.beginPath()
          ctx.moveTo(x * cellSize + cellSize / 2, z * cellSize)
          ctx.lineTo(x * cellSize + cellSize, z * cellSize + cellSize)
          ctx.lineTo(x * cellSize + cellSize / 2, z * cellSize + cellSize * 0.7)
          ctx.lineTo(x * cellSize, z * cellSize + cellSize)
          ctx.closePath()
          ctx.fill()
        }
        
        if (isExit) {
          ctx.fillStyle = '#ff0'
          ctx.font = `${cellSize * 0.8}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('★', x * cellSize + cellSize / 2, z * cellSize + cellSize / 2)
        }
      }
    }
    
    ctx.strokeStyle = '#444'
    ctx.lineWidth = 0.5
    
    for (let x = 0; x < this.size; x++) {
      for (let z = 0; z < this.size; z++) {
        const cell = this.maze[x][z]
        
        if (cell.north) {
          ctx.beginPath()
          ctx.moveTo(x * cellSize, z * cellSize)
          ctx.lineTo((x + 1) * cellSize, z * cellSize)
          ctx.stroke()
        }
        
        if (cell.south) {
          ctx.beginPath()
          ctx.moveTo(x * cellSize, (z + 1) * cellSize)
          ctx.lineTo((x + 1) * cellSize, (z + 1) * cellSize)
          ctx.stroke()
        }
        
        if (cell.west) {
          ctx.beginPath()
          ctx.moveTo(x * cellSize, z * cellSize)
          ctx.lineTo(x * cellSize, (z + 1) * cellSize)
          ctx.stroke()
        }
        
        if (cell.east) {
          ctx.beginPath()
          ctx.moveTo((x + 1) * cellSize, z * cellSize)
          ctx.lineTo((x + 1) * cellSize, (z + 1) * cellSize)
          ctx.stroke()
        }
      }
    }
  }
}