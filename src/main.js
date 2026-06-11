import * as THREE from 'three'
import { MazeGenerator } from './mazeGenerator.js'
import { Player } from './player.js'
import { MiniMap } from './miniMap.js'
import { ThemeManager } from './themeManager.js'
import { Leaderboard } from './leaderboard.js'

class Game {
  constructor() {
    this.scene = null
    this.camera = null
    this.renderer = null
    this.player = null
    this.mazeGenerator = null
    this.miniMap = null
    this.themeManager = null
    this.leaderboard = null
    this.mazeSize = 20
    this.cellSize = 2
    this.wallHeight = 3
    this.isGameRunning = true
    this.startTime = Date.now()
    this.steps = 0
    this.exploredCells = new Set()
    this.hintPath = []
    this.breadcrumbs = new Set()
    
    this.init()
    this.setupEventListeners()
    this.animate()
  }

  init() {
    const container = document.getElementById('game-container')
    
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x0a0a0a)
    container.appendChild(this.renderer.domElement)
    
    this.themeManager = new ThemeManager(this.scene)
    this.mazeGenerator = new MazeGenerator(this.mazeSize, this.cellSize, this.wallHeight, this.themeManager)
    this.mazeGenerator.generate()
    
    const startPos = this.mazeGenerator.getStartPosition()
    this.player = new Player(this.scene, startPos.x, startPos.y, startPos.z, this.mazeGenerator)
    
    this.miniMap = new MiniMap(this.mazeSize, this.mazeGenerator.getMaze())
    this.leaderboard = new Leaderboard()
    
    this.exploredCells.add(`${Math.floor(startPos.x / this.cellSize)},${Math.floor(startPos.z / this.cellSize)}`)
    this.updateMiniMap()
    
    this.themeManager.applyTheme('castle')
    
    this.statsInterval = setInterval(() => this.updateStats(), 1000)
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize())
    document.getElementById('regenerate').addEventListener('click', () => this.regenerateMaze())
    document.getElementById('reset').addEventListener('click', () => this.resetPosition())
    document.getElementById('hint').addEventListener('click', () => this.showHint())
    document.getElementById('theme').addEventListener('change', (e) => this.changeTheme(e.target.value))
    document.getElementById('size-slider').addEventListener('input', (e) => this.updateSize(e.target.value))
    document.getElementById('play-again').addEventListener('click', () => {
      document.getElementById('completion-modal').style.display = 'none'
      this.regenerateMaze()
    })
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') this.showHint()
    })
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  updateSize(value) {
    this.mazeSize = parseInt(value)
    document.getElementById('size-value').textContent = `${this.mazeSize}x${this.mazeSize}`
  }

  regenerateMaze() {
    this.isGameRunning = true
    this.startTime = Date.now()
    this.steps = 0
    this.exploredCells.clear()
    this.breadcrumbs.clear()
    this.hintPath = []
    
    this.mazeGenerator = new MazeGenerator(this.mazeSize, this.cellSize, this.wallHeight, this.themeManager)
    this.mazeGenerator.generate()
    
    const startPos = this.mazeGenerator.getStartPosition()
    this.player.resetPosition(startPos.x, startPos.y, startPos.z)
    
    this.miniMap.updateMaze(this.mazeSize, this.mazeGenerator.getMaze())
    this.exploredCells.add(`${Math.floor(startPos.x / this.cellSize)},${Math.floor(startPos.z / this.cellSize)}`)
    this.updateMiniMap()
    
    document.getElementById('steps').textContent = '0'
    document.getElementById('time').textContent = '00:00'
  }

  resetPosition() {
    const startPos = this.mazeGenerator.getStartPosition()
    this.player.resetPosition(startPos.x, startPos.y, startPos.z)
    this.steps = 0
    document.getElementById('steps').textContent = '0'
    this.startTime = Date.now()
  }

  showHint() {
    const currentCell = this.getPlayerCell()
    const exitCell = this.mazeGenerator.getExitCell()
    const path = this.mazeGenerator.findPath(currentCell, exitCell)
    
    if (path) {
      this.hintPath = path
      this.themeManager.highlightPath(path, this.cellSize)
      setTimeout(() => {
        this.themeManager.clearPathHighlight()
        this.hintPath = []
      }, 3000)
    }
  }

  getPlayerCell() {
    const pos = this.player.getPosition()
    return {
      x: Math.floor(pos.x / this.cellSize),
      z: Math.floor(pos.z / this.cellSize)
    }
  }

  updateStats() {
    if (!this.isGameRunning) return
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60
    document.getElementById('time').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  updateMiniMap() {
    const pos = this.player.getPosition()
    const currentCell = {
      x: Math.floor(pos.x / this.cellSize),
      z: Math.floor(pos.z / this.cellSize)
    }
    this.miniMap.update(this.exploredCells, currentCell, this.mazeGenerator.getExitCell())
  }

  changeTheme(theme) {
    this.themeManager.applyTheme(theme)
  }

  checkCompletion() {
    const currentCell = this.getPlayerCell()
    const exitCell = this.mazeGenerator.getExitCell()
    
    if (currentCell.x === exitCell.x && currentCell.z === exitCell.z) {
      this.isGameRunning = false
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      const explorationRate = Math.round((this.exploredCells.size / (this.mazeSize * this.mazeSize)) * 100)
      
      document.getElementById('final-time').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      document.getElementById('final-steps').textContent = this.steps
      document.getElementById('exploration-rate').textContent = `${explorationRate}%`
      document.getElementById('completion-modal').style.display = 'block'
      
      this.leaderboard.saveScore(this.mazeSize, this.steps, elapsed)
      this.leaderboard.updateDisplay()
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    
    if (this.isGameRunning) {
      this.player.update()
      
      const pos = this.player.getPosition()
      const cellKey = `${Math.floor(pos.x / this.cellSize)},${Math.floor(pos.z / this.cellSize)}`
      this.exploredCells.add(cellKey)
      
      if (!this.breadcrumbs.has(cellKey)) {
        this.breadcrumbs.add(cellKey)
        this.themeManager.markBreadcrumb(cellKey, this.cellSize)
        this.steps++
        document.getElementById('steps').textContent = this.steps
      }
      
      this.updateMiniMap()
      this.checkCompletion()
    }
    
    this.renderer.render(this.scene, this.player.camera)
  }
}

new Game()