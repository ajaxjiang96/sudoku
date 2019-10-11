import React from 'react';
import update from 'immutability-helper'; // ES6

export default class Sudoku extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            table: this.createTable(),
            focused: { i: -1, j: -1 },
            valid: true,
            violator: { i: -1, j: -1 },
            invalidRows: [],
            invalidCols: [],
            invalidAreas: [],
            invalidDiags: [],
        };
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
        [...Array(3).keys()].map(y =>
            this.getArea(y, x))));

    getAllConstraits = () => {
        const rows = this.state.table;
        const cols = [...Array(9).keys()].map(col => this.getCol(col));
        const areas = this.getAllAreas(this.state.table);
        const diags = [this.getDiag(), this.getDiag(true)];
        return [
            ...rows,
            ...cols,
            ...areas,
            ...diags
        ];
    }

    allDistinct = (vals, i) => {
        const filtered = vals.filter(x => typeof x === "number" && x > 0)
        let result = [...new Set(filtered)].length === filtered.length;
        if (!result) {
            console.log(i, vals)
            if (i <= 8) {
                // row invalid
                this.setState({invalidRows: update(this.state.invalidRows, {
                    $push: [i]
                })})
            } 
            if (i >= 9 && i <= 17) {
                // col invalid
                this.setState({invalidCols: update(this.state.invalidCols, {
                    $push: [i === 17 ? 8 : i % 9]
                })})
            }
            if (i >= 18 && i <= 26) {
                // col invalid
                this.setState({invalidAreas: update(this.state.invalidAreas, {
                    $push: [i === 26 ? 8 : i % 9]
                })})
            }
            if (i === 27) {
                // col invalid
                this.setState({invalidDiags: update(this.state.invalidDiags, {
                    $push: [0]
                })})
            }
            if (i === 28) {
                // col invalid
                this.setState({invalidDiags: update(this.state.invalidDiags, {
                    $push: [1]
                })})
            }
        }
        return result;
    }


    allListsDistinct = lists => lists.map(this.allDistinct).every((x) => x)

    validGameState = () => {
        return this.allListsDistinct(this.getAllConstraits())
    }

    focus(i, j) {
        if (this.state.valid) {
            this.setState({
                focused: { i: i, j: j }
            })
        }
    }

    _handleInput(e) {
        if (this.state.focused.i >= 0 && this.state.focused.j >= 0 && (!isNaN(e.key) || e.key === "Backspace") ) {
            let i = this.state.focused.i;
            let j = this.state.focused.j;
            let inst = {}
            let val;
            try {
                if (e.key === "Backspace") {
                    val = 0;
                } else if (e.key === " ") {
                    val = 0
                } else {
                    val = parseInt(e.key)
                }
            } catch (error) {
                return console.error(error);
            }

            inst[i] = {}
            inst[i][j] = { $set: val }

            this.setState({ table: update(this.state.table, inst) },
                () => this.setState({
                    invalidRows: [],
                    invalidCols: [],
                    invalidAreas: [],
                    invalidDiags: [],
                }, () => this.allListsDistinct(this.getAllConstraits())
                ? this.setState({ valid: true, violator: { i: -1, j: -1 } })
                : this.setState({ valid: false, violator: { i: i, j: j } })))
        } else if (this.state.valid) {
            const inc = (x) => Math.min(x + 1, 8);
            const dec = (x) => Math.max(x - 1, 0);
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
                                className={`table-background-cell \
                                ${(this.state.invalidRows.indexOf(i) >= 0
                                    || this.state.invalidCols.indexOf(j) >= 0
                                    || this.state.invalidAreas.map(x => (i < Math.floor(x / 3) * 3 + 3) && (i >= Math.floor(x / 3) * 3) && (j < x % 3 * 3 + 3) && (j >= x % 3 * 3)).some(x => x))
                                    || (this.state.invalidDiags.indexOf(0) >= 0 && i === j)
                                    || (this.state.invalidDiags.indexOf(1) >= 0 && i === (8 - j)) ? "invalid" : ""}`}
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
            <div className="keyboard">
               <div className={"key-backspace"} onClick={() => this._handleInput({ key: 0 })}>
                    {`DEL`}
                </div>
            </div>
        </div>
    }
}