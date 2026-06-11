export class Leaderboard {
  constructor() {
    this.scores = this.loadScores()
    this.updateDisplay()
  }

  loadScores() {
    try {
      const saved = localStorage.getItem('maze_leaderboard')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  }

  saveScores() {
    localStorage.setItem('maze_leaderboard', JSON.stringify(this.scores))
  }

  saveScore(size, steps, time) {
    if (!this.scores[size]) {
      this.scores[size] = []
    }
    
    this.scores[size].push({ steps, time, date: new Date().toISOString() })
    this.scores[size].sort((a, b) => {
      if (a.steps !== b.steps) return a.steps - b.steps
      return a.time - b.time
    })
    this.scores[size] = this.scores[size].slice(0, 5)
    
    this.saveScores()
  }

  updateDisplay() {
    const table = document.getElementById('leaderboard-table')
    let html = ''
    
    const sizes = Object.keys(this.scores).sort((a, b) => parseInt(a) - parseInt(b))
    
    sizes.forEach(size => {
      const scores = this.scores[size]
      if (scores.length > 0) {
        html += `<tr><td colspan="3"><strong>${size}x${size}</strong></td></tr>`
        scores.slice(0, 3).forEach((score, index) => {
          const minutes = Math.floor(score.time / 60)
          const seconds = score.time % 60
          html += `<tr>
            <td>${index + 1}</td>
            <td>${score.steps}步</td>
            <td>${minutes}:${seconds.toString().padStart(2, '0')}</td>
          </tr>`
        })
      }
    })
    
    if (html === '') {
      html = '<tr><td colspan="3">暂无记录</td></tr>'
    }
    
    table.innerHTML = html
  }
}