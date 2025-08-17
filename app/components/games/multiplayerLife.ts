/**
 * Cell state: 0 = dead, 1 = player1, 2 = player2
 */
export type CellState = 0 | 1 | 2
export type MultiplayerGrid = CellState[][]

export interface PlayerStats {
  player1: number
  player2: number
}

export interface GameStats {
  currentCells: PlayerStats
  peakCells: PlayerStats
  totalBirths: PlayerStats
}

/**
 * Multiplayer version of Conway's Game of Life
 * Two players compete by placing cells of different colors
 */
export class MultiplayerGame {
  private readonly blueGrid: MultiplayerGrid
  private readonly greenGrid: MultiplayerGrid
  private currentGrid: MultiplayerGrid
  private nextGrid: MultiplayerGrid
  private stats: GameStats

  constructor(rows: number, columns: number, seed: MultiplayerGrid | null = null) {
    if (rows <= 0 || columns <= 0) {
      throw new Error("Row and column count must be positive integers")
    }

    this.blueGrid = this.initialise(rows, columns)
    this.greenGrid = this.initialise(rows, columns)
    this.currentGrid = this.blueGrid
    this.nextGrid = this.greenGrid

    this.stats = {
      currentCells: { player1: 0, player2: 0 },
      peakCells: { player1: 0, player2: 0 },
      totalBirths: { player1: 0, player2: 0 },
    }

    if (seed) {
      this.applySeed(seed)
    }
  }

  private initialise(rows: number, columns: number): MultiplayerGrid {
    return Array(rows)
      .fill(0)
      .map(() => Array(columns).fill(0))
  }

  private applySeed(seed: MultiplayerGrid): void {
    seed.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (rowIndex < this.height && colIndex < this.width) {
          this.currentGrid[rowIndex][colIndex] = cell
        }
      })
    })
    this.updateStats()
  }

  /**
   * Place a cell for a specific player
   */
  public placeCell(row: number, column: number, player: 1 | 2): MultiplayerGrid {
    if (row >= 0 && row < this.height && column >= 0 && column < this.width) {
      // If cell is empty, place it
      if (this.currentGrid[row][column] === 0) {
        this.currentGrid[row][column] = player
      } else if (this.currentGrid[row][column] === player) {
        // If it's the same player's cell, remove it
        this.currentGrid[row][column] = 0
      }
      // If it's the opponent's cell, do nothing
    }
    this.updateStats()
    return this.currentGrid
  }

  /**
   * Get neighbors of a cell
   */
  private getNeighbors(row: number, column: number): CellState[] {
    const neighbors: CellState[] = []

    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = column - 1; j <= column + 1; j++) {
        if (i === row && j === column) continue // Skip the cell itself
        if (i >= 0 && i < this.height && j >= 0 && j < this.width) {
          neighbors.push(this.currentGrid[i][j])
        }
      }
    }

    return neighbors
  }

  /**
   * Count active neighbors for Conway's rules
   */
  private countActiveNeighbors(row: number, column: number): number {
    return this.getNeighbors(row, column).filter((cell) => cell > 0).length
  }

  /**
   * Determine the color of a new cell based on its neighbors
   */
  private determineBirthColor(neighbors: CellState[]): CellState {
    const activeNeighbors = neighbors.filter((n) => n > 0)

    if (activeNeighbors.length !== 3) return 0 // Should not happen in valid Conway rules

    const player1Count = activeNeighbors.filter((n) => n === 1).length
    const player2Count = activeNeighbors.filter((n) => n === 2).length

    if (player1Count > player2Count) return 1
    if (player2Count > player1Count) return 2

    // In case of tie, choose randomly
    return Math.random() < 0.5 ? 1 : 2
  }

  /**
   * Apply Conway's rules with color inheritance
   */
  private updateCell(row: number, column: number): void {
    const currentState = this.currentGrid[row][column]
    const activeNeighbors = this.countActiveNeighbors(row, column)

    if (currentState > 0) {
      // Live cell rules
      if (activeNeighbors === 2 || activeNeighbors === 3) {
        this.nextGrid[row][column] = currentState // Survives
      } else {
        this.nextGrid[row][column] = 0 // Dies
      }
    } else {
      // Dead cell rules
      if (activeNeighbors === 3) {
        const neighbors = this.getNeighbors(row, column)
        const birthColor = this.determineBirthColor(neighbors)
        this.nextGrid[row][column] = birthColor
        if (birthColor === 1) {
          this.stats.totalBirths.player1++
        } else if (birthColor === 2) {
          this.stats.totalBirths.player2++
        }
      } else {
        this.nextGrid[row][column] = 0
      }
    }
  }

  /**
   * Evolve the game one generation
   */
  public evolve(): MultiplayerGrid {
    // Update all cells
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        this.updateCell(row, col)
      }
    }

    // Switch grids
    const temp = this.nextGrid
    this.nextGrid = this.currentGrid
    this.currentGrid = temp

    this.updateStats()
    return this.currentGrid
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    let player1Count = 0
    let player2Count = 0

    this.currentGrid.forEach((row) => {
      row.forEach((cell) => {
        if (cell === 1) player1Count++
        else if (cell === 2) player2Count++
      })
    })

    this.stats.currentCells = { player1: player1Count, player2: player2Count }

    // Update peak cells
    if (player1Count > this.stats.peakCells.player1) {
      this.stats.peakCells.player1 = player1Count
    }
    if (player2Count > this.stats.peakCells.player2) {
      this.stats.peakCells.player2 = player2Count
    }
  }

  /**
   * Reset the game
   */
  public reset(): MultiplayerGrid {
    this.currentGrid.forEach((row) => row.fill(0))
    this.nextGrid.forEach((row) => row.fill(0))

    this.stats = {
      currentCells: { player1: 0, player2: 0 },
      peakCells: { player1: 0, player2: 0 },
      totalBirths: { player1: 0, player2: 0 },
    }

    return this.currentGrid
  }

  // Getters
  public get width(): number {
    return this.currentGrid[0].length
  }

  public get height(): number {
    return this.currentGrid.length
  }

  public get cells(): MultiplayerGrid {
    return this.currentGrid
  }

  public get gameStats(): GameStats {
    return this.stats
  }

  public getCellCounts(): PlayerStats {
    return { ...this.stats.currentCells }
  }
}
