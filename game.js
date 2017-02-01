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

// utils
const query = id => document.getElementById(id)

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
        revealed: true,
        adjacent: 0,
        flagged: false,
        bomb: null
      })
    }
    state.board.push( row )
  }

  const seedmines = ({ x, y }) => {
    // build array of bombs [true, false]
    bombz = []
    for (var i = 0; i < (height * width); i++) {
      if( i < mines ) bombz.push(true)
      else bombz.push(false)
    }
    // shuffle (fisher-yates)
    let n = bombz.length
    while( n > 0 ) {
      i = Math.floor(Math.random() * n--)
      // swap elements in place
      bombz[n] = [bombz[i], bombz[i] = bombz[n]][0]
    }
    // test if first bomb found at first click
    if( bombz[x*(y+1)]) {
      i = 0
      while ( bombz[i] ) i++
      bombz[i] = true
      bombz[x*(y+1)] = false
    }

  }

  const bfs = ({ x, y }) => {
    if( x > 0 && x < width && y > 0 && y < height ) {
      let { revealed, adjacent, bomb } = state.board[y][x]

    }
  }

  const purify = ({ board, finished, won }) => ({
    won,
    finished,
    board: board.map(row => row.map(({ revealed, adjacent, bomb, flagged }) => {
      if( flagged ) return "flagged"
      if( revealed && bomb ) return "bomb"
      if( revealed ) return "revealed" + adjacent
      return "hidden"
    }))
  })

  const reveal = ({ x, y }) => {
    if (!state.seeded) seedmines({ x, y })
    bfs({ x, y })
    return purify(state)
  }

  const flag = ({ x, y }) => {
    state.board[y][x].flagged = true
    return purify(state)
  }

  return { reveal, flag }
}

const creategameview = ( boardel, settingsel ) => {
  // here's the ugly part of the code that a framework lets you abstract away
  const els = {
    board: boardel,
    beginner: query("beginner"),
    intermediate: query("intermediate"),
    expert: query("expert"),
    newgame: query("newgame"),

    error: query("error"),

    height: query("height"),
    width: query("width"),
    mines: query("mines")
  }

  const invalidparams = ({ height, width, mines }, err) => {
    message = []
    if ( height < 1 || width < 1 ) {
      message.push( "Height and width must be greater than 1." )
    } else if ( height > 100 || width > 100) {
      message.push( "Height and Width must be less than 100.")
    } else if ( mines > ( height * width ) - 1 ) {
      message.push( "The board can't fit that many mines!" )
    }
    err( message.join(" ") )
    return message.length > 0
  }

  const newgame = (thunk,err) => () => {
    let { height, width, mines } = thunk()
    if( invalidparams({ height, width, mines }, err) ) return
    let game = minesweeper({ height, width, mines })

    // this is the messy way to do things
    boardel.innerHTML = ""

    // "virtual DOM"
    var elements = [], rowarr, rowdiv, box
    const buildboard = () => {
      for (var y = 0; y < height; y++) {
        rowdiv = document.createElement("div")
        rowarr = []
        for (var x = 0; x < width; x++) {
          box = document.createElement("BUTTON")
          box.className = ""
          box.onclick = click({ x, y })
          box.oncontextmenu = rightclick({ x, y })
          rowdiv.appendChild( box )
          rowarr.push( box )
        }
        boardel.appendChild( rowdiv )
        elements.push( rowarr )
      }
    }

    const render = ({ board }) => {
      board.forEach( (row,y) => row.forEach( (box,x) => {
        elements[y][x].className = box
      }))
    }

    const click = ({ x, y }) => () => {
      render(game.reveal({ x, y }))
    }

    const rightclick = ({ x, y }) => (event) => {
      event.preventDefault()
      render(game.flag({ x, y }))
      return false
    }

    buildboard()
  }

  const renderpresets = ({ height, width, mines }) => () => {
    els.height.value = height
    els.width.value = width
    els.mines.value = mines
  }

  const getparams = () => ({
    height: parseInt(els.height.value),
    width: parseInt(els.width.value),
    mines: parseInt(els.mines.value)
  })

  const error = (message) => {
    els.error.innerHTML = message
  }

  els.beginner.onclick = renderpresets({ height: 9, width: 9, mines: 10 })
  els.intermediate.onclick = renderpresets({ height: 16, width: 16, mines: 40 })
  els.expert.onclick = renderpresets({ height: 16, width: 30, mines: 99 })

  els.newgame.onclick = newgame(getparams,error)
  newgame(getparams,error)()
}

creategameview( query("board"), query("settings") )
