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
    // map click coords to 1d position
    let pos = (y * width + x)

    // build bool array of bombs. flat array for shuffling/moving simplicity
    let bombz = []
    for (var i = 0; i < (height * width); i++) {
      if( i < mines ) bombz.push(true)
      else bombz.push(false)
    }

    // shuffle (knuth-fisher-yates)
    let n = bombz.length, swap
    while( n > 0 ) {
      i = Math.floor(Math.random() * n--)
      swap = bombz[n]; bombz[n] = bombz[i]; bombz[i] = swap
    }

    // test if a bomb is found at first click position. if so, move it to the
    // first empty box (a la windows minesweeper)
    if( bombz[pos] ) {
      let empty = 0
      while ( bombz[empty] ) empty++
      bombz[empty] = true
      bombz[pos] = false
    }

    // do the thing
    bombz.forEach( (bomb, idx) => {
      if( bomb ) {
        let x = idx % width, y = Math.floor(idx / width)
        plantbomb({ x, y })
      }
    })
    seeded = true
  }

  const revealbombs = () => {
    board.map( row => row.map( box => {
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
      if( !revealed ) {
        board[y][x].revealed = true
        if( adjacent === 0 && !flagged ) {
          [ [0,-1], [1,0], [0,1], [-1,0] ].forEach( ([deltay, deltax]) => {
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
    if ( board[y][x].bomb ) {
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
