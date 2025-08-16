import * as React from "react"

export interface ISliderProps {
  id: string
  value: number
  onChange: (value: number) => void
}

export interface ISliderState {
  value: number
}

export class Slider extends React.Component<ISliderProps, ISliderState> {
  constructor(props: ISliderProps) {
    super(props)
    this.state = { value: props.value }

    this.handleChange = this.handleChange.bind(this)
  }

  public render = () => {
    return (
      <>
        <label htmlFor={this.props.id}>Speed:</label>
        <input
          id={this.props.id}
          type="range"
          min="1"
          max="10"
          value={this.state.value}
          onChange={this.handleChange}
        />
        <span className="speed-value">{this.state.value}</span>
      </>
    )
  }

  private handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10)
    this.setState({ value })
    this.props.onChange(value)
  }
}
