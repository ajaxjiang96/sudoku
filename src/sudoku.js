import React from 'react';
import update from 'immutability-helper'; // ES6

export default class Sudoku extends React.Component {
    constructor(props) {
        super(props)
        this.state = { table: this.createTable(), focused: { i: -1, j: -1 }, valid: true, violator: { i: -1, j: -1 } };
        this._handleInput = this._handleInput.bind(this)
        this.getAllAreas = this.getAllAreas.bind(this)
        this.getArea = this.getArea.bind(this)
    }

    componentDidMount() {
        document.addEventListener("keydown", this._handleInput);
    }

    createRow = (x) => Array(9).fill().map((_, y) => 0);
    createTable = () => Array(9).fill().map((_, x) => this.createRow(x));

    getRow = (row) => this.state.table[row];
    getCol = (col) => this.state.table.map(row => row[col]);
    getArea = (x, y) => Array.prototype.concat(...this.state.table.slice(3 * y, 3 * y + 3).map(row => row.slice(3 * x, 3 * x + 3)));
    getDiag = (back = false) => this.state.table.map((row, i) => row[8 * back + (back ? -1 : 1) * i]);

    getAllAreas = () => Array.prototype.concat(...[...Array(3).keys()].map(x =>
        [...Array(3).keys()].map(y => {
            return this.getArea(x, y)})));

    getAllConstraits = () => {
        const rows = this.state.table;
        const cols = [...Array(9).keys()].map(col => this.getCol(col));
        const areas = this.getAllAreas(this.state.table);
        console.log(areas)
        const diags = [this.getDiag(), this.getDiag(true)];
        return [
            ...rows,
            ...cols,
            ...areas,
            ...diags
        ];
    }

    allDistinct = vals => {
        const filtered = vals.filter(x => typeof x === "number" && x > 0)
        return [...new Set(filtered)].length === filtered.length
    }

    allListsDistinct = lists => lists.every(this.allDistinct)

    validGameState = () => this.allListsDistinct(this.getAllConstraits())

    focus(i, j) {
        if (this.state.valid) {
            this.setState({
                focused: { i: i, j: j }
            })
        }
    }

    _handleInput(e) {
        if (this.state.focused.i >= 0 && this.state.focused.j >= 0 && !isNaN(e.key)) {
            let i = this.state.focused.i;
            let j = this.state.focused.j;
            let inst = {}
            let val;
            try {
                val = parseInt(e.key)
            } catch (error) {
                return console.error(error);
            }

            inst[i] = {}
            inst[i][j] = { $set: val }

            this.setState({ table: update(this.state.table, inst) },
                () => this.allListsDistinct(this.getAllConstraits())
                    ? this.setState({ valid: true, violator: { i: -1, j: -1 } })
                    : this.setState({ valid: false, violator: { i: i, j: j } }))
        } else if (this.state.valid) {
            const inc = (x) => Math.min(x + 1, 8);
            const dec = (x) => Math.max(x - 1, 0);
            console.log(e.key)
            switch (e.key) {
                case "w":
                    this.setState({ focused: update(this.state.focused, { i: dec }) }); break;
                case "s":
                    this.setState({ focused: update(this.state.focused, { i: inc }) }); break;
                case "a":
                    this.setState({ focused: update(this.state.focused, { j: dec }) }); break;
                case "d":
                    this.setState({ focused: update(this.state.focused, { j: inc }) }); break;
                case "ArrowUp":
                    this.setState({ focused: update(this.state.focused, { i: dec }) }); break;
                case "ArrowDown":
                    this.setState({ focused: update(this.state.focused, { i: inc }) }); break;
                case "ArrowLeft":
                    this.setState({ focused: update(this.state.focused, { j: dec }) }); break;
                case "ArrowRight":
                    this.setState({ focused: update(this.state.focused, { j: inc }) }); break;
                default:
                    return;
            }
        }
    }

    render() {
        return <div className="sudoku-wrapper">
            <table className="sudoku-background" cellSpacing={0}>
                <tbody>
                    {this.state.table.map((row, i) => <tr key={`row_${i}`} className="table-row">
                        {row.map((_, j) =>
                            <td
                                className={`table-background-cell`}
                                key={`$cell-${i}-${j}`}
                            >
                            </td>
                        )}
                    </tr>)}
                </tbody>
            </table>
            <table className="sudoku" cellSpacing={0}>
                <tbody>
                    {this.state.table.map((row, i) => <tr key={`row_${i}`} className="table-row">
                        {row.map((_, j) =>
                            <td
                                className={`table-cell
                                        ${this.state.focused.i === i && this.state.focused.j === j ? 'focused' : ''}
                                        ${this.state.violator.i === i && this.state.violator.j === j ? 'violator' : ''}
                                        `}
                                key={`$cell-${i}-${j}`}
                                onClick={() => this.focus(i, j)}
                            >
                                {this.state.table[i][j] === 0 ? '' : this.state.table[i][j]}
                            </td>
                        )}
                    </tr>)}
                </tbody>
            </table>
            <div className="keyboard">
                {[...Array(9).keys()].map(i => <div className={"key-wrapper"} key={i}><div className={"key"} onClick={() => this._handleInput({ key: i + 1 })}>
                    {i + 1}
                </div></div>)}
            </div>
        </div>
    }
}