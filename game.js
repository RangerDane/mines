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
        adjacent: null,
        bomb: null
      })
    }
    state.board.push( row )
  }

  const seedmines = ({ x, y }) => {
    state.seeded = true
    console.log("seeding")
  }

  const bfs = ({ x, y }) => {
    if( state.board[x][y] ) {
      console.log("nice");
    }
  }

  const purify = ({ board, finished, won }) => ({
    won,
    finished,
    board: board.map(row => row.map(({ revealed, adjacent, bomb }) => {
      let box = { revealed }
      if (revealed) {
        box.adjacent = adjacent
        box.bomb = bomb
      }
      return box
    }))
  })

  const reveal = ({ x, y }) => {
    // state.board[x][y].revealed = true
    bfs({ x, y })
    return purify(state)
  }

  const flag = ({ x, y }) => {

  }

  return { reveal, flag }
}

const creategameview = ( boardel, settings ) => {
  // here's the ugly part of the code that a framework lets you abstract away
  const els = {
    board: boardel,
    beginner: document.getElementById("beginner"),
    intermediate: document.getElementById("intermediate"),
    expert: document.getElementById("expert"),
    newgame: document.getElementById("newgame"),

    error: document.getElementById("error"),

    height: document.getElementById("height"),
    width: document.getElementById("width"),
    mines: document.getElementById("mines")
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

    if( invalidparams({ height, width, mines }, err) ) return;

    boardel.innerHTML = ""

    // "virtual DOM"
    var elements = [], rowarr, rowdiv, box
    for (var y = 0; y < height; y++) {
      row = document.createElement("div")
      for (var x = 0; x < width; x++) {
        box = document.createElement("BUTTON")
        box.className = ""
        box.onclick = handleclick({ x, y })
        row.appendChild( box )
        rowarr.push( box )
      }
      boardel.appendChild( row )
      elements.
    }

    let game = minesweeper({ height, width, mines })

    const handleclick = ({ x, y }) => () => {
      console.log("lol u clicked " + x + ", " + y);
      render(game.reveal({ x, y }))
    }

    // this is the messy way to do things
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
    console.log(message);
    els.error.innerHTML = message
  }

  els.beginner.onclick = renderpresets({ height: 9, width: 9, mines: 10 })
  els.intermediate.onclick = renderpresets({ height: 16, width: 16, mines: 40 })
  els.expert.onclick = renderpresets({ height: 16, width: 30, mines: 99 })

  els.newgame.onclick = newgame(getparams,error)
  newgame(getparams,error)()
}

creategameview(
  document.getElementById("board"),
  document.getElementById("settings")
)
