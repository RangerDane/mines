var icons = {
  blank: 'http://i.imgur.com/HM1e3Tbb.jpg',
  pressed: 'http://i.imgur.com/bGT8xGEb.jpg',
  exposedBomb: 'http://i.imgur.com/pTJ8Swhb.jpg',
  explodedBomb: 'http://i.imgur.com/UFmXprFb.jpg',
  flag: 'http://i.imgur.com/nLPvW15b.jpg',
  // Index is # of adjacent bombs
  bombs: [
    'http://i.imgur.com/Flqdqi1b.jpg', // 0
    'http://i.imgur.com/bM8oExob.jpg', // 1
    'http://i.imgur.com/bQKSbqYb.jpg', // 2
    'http://i.imgur.com/5jNcEeVb.jpg', // 3
    'http://i.imgur.com/BnxjHgHb.jpg', // 4
    'http://i.imgur.com/RaFrMYcb.jpg', // 5
    'http://i.imgur.com/GlwQOy0b.jpg', // 6
    'http://i.imgur.com/8ngsVa8b.jpg', // 7
    'http://i.imgur.com/lJ8P1wab.jpg'  // 8
  ]
};

icons = {
  blank: './blank.jpg',
  pressed: './pressed.jpg',
  exposedBomb: './exposedBomb.jpg',
  explodedBomb: './explodedBomb.jpg',
  flag: './flag.jpg',
  bombs: [
    './adj0.jpg',
    './adj1.jpg',
    './adj2.jpg',
    './adj3.jpg',
    './adj4.jpg',
    './adj5.jpg',
    './adj6.jpg',
    './adj7.jpg',
    './adj8.jpg'
  ]
}

// game logic
const minesweeper = ({ height, width, mines }) => {
  var state = {
    board: [],
    seeded: false,
    finished: false,
    won: false
  }, row, box

  // set up game board
  for (var y = 0; y < height; y++) {
    row = []
    for (var x = 0; x < width; x++) {
      row.push({
        revealed: false,
        adjacent: 0,
        flagged: false,
        bomb: false,
        exploded: false
      })
    }
    state.board.push( row )
  }

  const withinbounds = ({ x, y }) => ( x < width && x >= 0 && y < height && y >= 0 )

  const plantbomb = ({ x, y }) => {
    state.board[y][x].bomb = true;
    [-1,0,1].forEach( adjy => [-1,0,1].forEach( adjx => {
      if( withinbounds({ x: adjx + x, y: adjy + y }))
        state.board[adjy+y][adjx+x].adjacent += 1
    }))
  }

  const seedmines = ({ x, y }) => {
    let pos = (y * width + x) // map click coords to 1d position
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
    // test if a bomb is found at first click position. if so, move it to the top left,
    // moving rightwards until an empty box is found (a la windows minesweeper)
    if( bombz[pos] ) {
      i = 0
      while ( bombz[i] ) i++
      bombz[i] = true
      bombz[pos] = false
    }
    // do the thing
    bombz.forEach( (bomb, idx) => {
      if( bomb ) {
        let x = idx % width, y = Math.floor(idx / width)
        plantbomb({ x, y })
      }
    })
    state.seeded = true
  }

  const bfs = ({ x, y }) => {
    let queue = [{ x, y }]
    while( queue.length > 0 ) {
      let { x, y } = queue.shift()
      let { revealed, adjacent, flagged } = state.board[y][x]
      if( !revealed ) {
        state.board[y][x].revealed = true
        if( adjacent === 0 && !flagged ) {
          [ [0,-1], [1,0], [0,1], [-1,0] ].forEach( ([deltay, deltax]) => {
            let next = { x: x + deltax, y: y + deltay }
            if( withinbounds(next) )
              queue.push(next)
          })
        }
      }
    }
  }

  const purify = ({ board, finished, won }) => ({
    won,
    finished,
    board: board.map(row => row.map(({ revealed, adjacent, bomb, flagged, exploded }) => {
      if( revealed )
        return { revealed, adjacent, bomb, exploded }
      else
        return { revealed, flagged }
    }))
  })

  const reveal = ({ x, y }) => {
    if (!state.seeded) seedmines({ x, y })
    bfs({ x, y })
    return purify(state)
  }

  const flag = ({ x, y }) => {
    state.board[y][x].flagged = !state.board[y][x].flagged
    return purify(state)
  }

  // console.log(purify(state));
  return { reveal, flag }
}
