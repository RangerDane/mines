

const minesweeper = ({ height, width, mines }) => {
  let board = [], row, box, seeded = false
  for (var y = 0; y < height; y++) {
    row = []
    for (var x = 0; x < width; x++) {
      row.push({
        revealed: false,
        adjacent: null,
        bomb: null
      })
    }
    board.push( row )
  }
  const revealbox = ({ x, y }) => {
    let board = JSON.parse(JSON.stringify(board))
    board[x][y].revealed = true
    return board
  }
  return { revealbox }
}

const creategame = ( boardel, settings ) => {
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

    if( invalidparams({ height, width, mines }, err) ) {
      console.log("failed to validate params.")
      return
    }

    let game = minesweeper({ height, width, mines })

    const handleclick = ({ x, y }) => () => {
      console.log("lol u clicked " + x + ", " + y);
    }

    // this is the messy way to do things
    boardel.innerHTML = ""

    // "virtual DOM"
    var row, box
    for (var y = 0; y < height; y++) {
      row = document.createElement("div")
      for (var x = 0; x < width; x++) {
        box = document.createElement("BUTTON")
        box.className = ""
        box.onclick = handleclick({ x, y })
        row.appendChild( box )
      }
      boardel.appendChild( row )
    }
  }

  // here's the ugly part of the code that a framework lets you abstract away
  const els = {
    beginner: document.getElementById("beginner"),
    intermediate: document.getElementById("intermediate"),
    expert: document.getElementById("expert"),
    newgame: document.getElementById("newgame"),

    error: document.getElementById("error"),

    height: document.getElementById("height"),
    width: document.getElementById("width"),
    mines: document.getElementById("mines")
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

creategame(
  document.getElementById("board"),
  document.getElementById("settings")
)
