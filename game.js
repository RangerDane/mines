//  f u n c t i o n a l  game logic
const minesweeper = (state, action) => {
  // deep clone state without lodash
  let { height, width, board, seeded, lost, won, mines } = JSON.parse(JSON.stringify(state))

  if( lost || won )
    return state

  // set up default game board
  if( !board ) {
    board = []
    for (var y = 0; y < height; y++) {
      row = []
      for (var x = 0; x < width; x++) {
        row.push({ adjacent: 0 })
      }
      board.push( row )
    }
  }

  // util
  const withinbounds = ({ x, y }) => ( x < width && x >= 0 && y < height && y >= 0 )

  // plant bomb at x, y and increment each adjacent block
  const plantbomb = ({ x, y }) => {
    board[y][x].bomb = true;
    [-1,0,1].forEach( adjy => [-1,0,1].forEach( adjx => {
      if( withinbounds({ x: adjx + x, y: adjy + y }) && (adjy || adjx))
        board[adjy+y][adjx+x].adjacent += 1
    }))
  }

  const seedbombs = ({ x, y }) => {
    // let pos = ( y * width + x )

    let bombz = []
    let reduce = 9
    // first click is in a corner
    if(( x === 0 || x === width - 1 ) && ( y === 0 || y === height - 1 )) {
      reduce = 4
    // first click is on an edge
    } else if ( x === 0 || y === 0 || x === width - 1 || y === height - 1 ) {
      reduce = 6
    }

    // one-dimensional array of mine placement (reduced in length by the 3x3
    // box around the first click)
    for (var i = 0; i < (height * width) - reduce; i++) {
      if( i < mines ) bombz.push(true)
      else bombz.push(false)
    }

    // shuffle (knuth-fisher-yates)
    let n = bombz.length, swap
    while( n > 0 ) {
      i = Math.floor( Math.random() * n-- )
      swap = bombz[n]; bombz[n] = bombz[i]; bombz[i] = swap
    }

    for (var yy = 0; yy < height; yy++) {
      for (var xx = 0; xx < width; xx++) {
        if( (Math.abs( x - xx ) > 1 || Math.abs( y - yy ) > 1) ) {
          if( bombz.pop() )
            plantbomb({ x: xx, y: yy })
        }
      }
    }

    seeded = true
  }

  const revealbombs = () => {
    board.forEach( row => row.forEach( box => {
      if( box.bomb )
        box.revealed = true
    }))
  }

  // reveal the block at x, y, and spread via bfs if block is unmarked
  const bfs = ({ x, y }) => {
    let queue = [{ x, y }]
    while( queue.length > 0 ) {
      let { x, y } = queue.shift()
      let { revealed, adjacent, flagged } = board[y][x]
      if( !revealed && !flagged ) {
        board[y][x].revealed = true
        if( adjacent === 0 ) {
          [
            [-1,-1], [0,-1], [1,-1],
            [-1,0], [1,0],
            [-1,1], [0,1], [1,1], 
          ].forEach( ([deltay, deltax]) => {
            let next = { x: x + deltax, y: y + deltay }
            if (withinbounds(next)) queue.push(next)
          })
        }
      }
    }
  }

  // win condition is, all non-mines are revealed
  const checkifwon = (board) => {
    // note: originally tried with a .reduce pattern, ran into trouble
    let didiwin = true;
    board.forEach( row => row.forEach( box => {
      if( !box.bomb && !box.revealed )
        didiwin = false
    }))
    return didiwin
  }

  // logic for when a single block is revealed
  const reveal = ({ x, y }) => {
    if (!seeded) seedbombs({ x, y })
    if ( board[y][x].bomb && !board[y][x].flagged ) {
      board[y][x].exploded = true
      revealbombs()
      lost = true
    } else if ( !board[y][x].flagged ) {
      bfs({ x, y })
    }
  }

  // logic for when a single block is flagged
  const flag = ({ x, y }) => {
    board[y][x].flagged = !board[y][x].flagged
  }

  if( action && action.type === "REVEAL" )
    reveal(action.data)
  else if ( action && action.type === "FLAG" )
    flag(action.data)

  return {
    height,
    width,
    board,
    seeded,
    lost,
    mines,
    won: checkifwon(board)
  }
}
