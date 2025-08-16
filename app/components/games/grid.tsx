import * as React from "react"
import * as Life from "./life"

export interface IGridProps {
  cells: Life.Grid
  onMouseDown: (row: number, column: number) => () => void
}

export const Grid = (props: IGridProps) => {
  /**
   * Render all cells in the grid.
   *
   * @param grid The grid that should be rendered.
   */
  const renderGrid = (grid: Life.Grid): React.JSX.Element[] => {
    return grid.map((row: number[], rowIndex: number) => {
      const rowCells = row.map((cell: number, columnIndex: number) => {
        return renderCell(rowIndex, columnIndex, cell)
      })
      return <tr key={rowIndex}>{rowCells}</tr>
    })
  }

  /**
   * Render a single cell.
   *
   * @param row    Row of the grid.
   * @param column Column of the grid.
   * @param value  Whether the cell is active or not.
   */
  const renderCell = (row: number, column: number, value: number): React.JSX.Element => {
    const key = row + "_" + column
    return (
      <td
        id={"cell_" + key}
        key={key}
        className={`border border-gray-700/30 transition-colors duration-150 cursor-pointer ${
          value
            ? "bg-gray-100/90 border-gray-400/50"
            : "bg-gray-800/30 hover:bg-gray-700/50 hover:border-gray-600/50"
        }`}
        style={{ width: "10px", height: "10px", padding: 0 }}
        onMouseDown={props.onMouseDown(row, column)}
      >
        <span className="sr-only">{value}</span>
      </td>
    )
  }

  return (
    <table className="border-collapse mx-auto border border-gray-600/50">
      <tbody>{renderGrid(props.cells)}</tbody>
    </table>
  )
}
