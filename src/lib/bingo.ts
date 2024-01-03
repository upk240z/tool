export type BingoData = {
  no: number,
  x: number,
  y: number,
  state: 'close' | 'open' | 'reach' | 'bingo',
}

export default class Bingo {
  private readonly stock: number[];
  public readonly cells: BingoData[];

  static shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      let r = Math.floor(Math.random() * (i + 1));
      let tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
  }

  constructor() {
    this.stock = [];
    const seed: number[] = [];
    for (let i = 1; i <= 24; i++) {
      this.stock.push(i);
      seed.push(i);
    }

    Bingo.shuffle(this.stock);
    Bingo.shuffle(seed);

    this.cells = [];
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        if (x == 2 && y == 2) {
          this.cells.push({
            no: 0,
            x: x,
            y: y,
            state: 'open',
          });
        } else {
          this.cells.push({
            no: seed.pop()!,
            x: x,
            y: y,
            state: 'close',
          });
        }
      }
    }
  }

  public open(): void {
    let pickNo = this.stock.pop()
    if (pickNo == undefined) {
      return
    }
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].no == pickNo) {
        this.cells[i].state = 'open'
      }
    }
  }

  private markCells(length: number, state: 'reach' | 'bingo'): void {
    // 縦
    for (let x = 0; x < 5; x++) {
      let openCells: BingoData[] = [];
      for (let y = 0; y < 5; y++) {
        let cell = this.cell(x, y);
        if (cell.state != 'close') {
          openCells.push(cell);
        }
      }
      if (openCells.length == length) {
        openCells.forEach((cell) => {
          cell.state = state
        })
      }
    }

    // 横
    for (let y = 0; y < 5; y++) {
      let openCells: BingoData[] = [];
      for (let x = 0; x < 5; x++) {
        let cell = this.cell(x, y);
        if (cell.state != 'close') {
          openCells.push(cell);
        }
      }
      if (openCells.length == length) {
        openCells.forEach((cell) => {
          cell.state = state
        })
      }
    }

    // 斜め
    let openCells1: BingoData[] = [];
    let openCells2: BingoData[] = [];
    for (let i = 0; i < 5; i++) {
      let cell = this.cell(i, i);
      if (cell.state != 'close') {
        openCells1.push(cell);
      }
      cell = this.cell(i, 4 - 1);
      if (cell.state != 'close') {
        openCells2.push(cell);
      }
    }
    if (openCells1.length == length) {
      openCells1.forEach((cell) => {
        cell.state = state
      })
    }
    if (openCells2.length == length) {
      openCells2.forEach((cell) => {
        cell.state = state
      })
    }
  }

  public mark(): void {
    this.markCells(4, 'reach');
    this.markCells(5, 'bingo');
  }

  public cell(x: number, y: number): BingoData {
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i].x == x && this.cells[i].y == y) {
        return this.cells[i];
      }
    }

    throw Error();
  }
}
