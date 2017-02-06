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

// was on a bus for 7 hours with spotty internet
// icons.blank = './blank.jpg'
// icons.pressed = './pressed.jpg'
// icons.exposedBomb = './exposedBomb.jpg'
// icons.explodedBomb = './explodedBomb.jpg'
// icons.flag = './flag.jpg'
// icons.bombs = [
//   './adj0.jpg',
//   './adj1.jpg',
//   './adj2.jpg',
//   './adj3.jpg',
//   './adj4.jpg',
//   './adj5.jpg',
//   './adj6.jpg',
//   './adj7.jpg',
//   './adj8.jpg' ]

// utils
const querydom = id => document.getElementById(id)

// view logic: here's the ugly part of the code that a framework lets you abstract away
const creategameview = ( boardel ) => {
  const els = {
    board: boardel,
    beginner: querydom("beginner"),
    intermediate: querydom("intermediate"),
    expert: querydom("expert"),
    newgame: querydom("newgame"),
    undo: querydom("undo"),

    error: querydom("error"),

    height: querydom("height"),
    width: querydom("width"),
    mines: querydom("mines")
  }

  const getparams = () => ({
    height: parseInt(els.height.value),
    width: parseInt(els.width.value),
    mines: parseInt(els.mines.value)
  })

  // passed as a callback to display errors on game creation
  const error = (message) => {
    els.error.innerHTML = message
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

  const newgame = () => {
    let state = getparams()
    if( invalidparams(state, error) ) return

    let previousStates = []
    state = minesweeper(state)

    // this is the messy way to do things
    els.board.innerHTML = ""

    // "virtual DOM"
    var elements = [], rowarr, rowdiv, box
    let { height, width } = state
    const buildboard = () => {
      els.undo.onclick = undo
      for (var y = 0; y < height; y++) {
        rowdiv = document.createElement("div")
        // rowdiv.style = "width: " + width * 2 + "rem;"
        rowarr = []
        for (var x = 0; x < width; x++) {
          box = document.createElement("BUTTON")
          box.onclick = click({ x, y })
          box.oncontextmenu = rightclick({ x, y })
          rowdiv.appendChild( box )
          rowarr.push( box )
        }
        boardel.appendChild( rowdiv )
        elements.push( rowarr )
      }
    }

    const setbg = ({ x, y, bg }) => {
      let style = ""
      if( bg )
        style = "background-image: url('" + bg + "');"
      if( elements[y][x].style !== style )
        elements[y][x].style = style
    }

    const render = () => {
      if( previousStates.length > 0 )
        els.undo.disabled = false
      else
        els.undo.disabled = true

      if( state.lost ) {
        els.board.className = "lost"
      } else if( state.won ) {
        els.board.className = "won"
      } else {
        els.board.className = ""
      }

      state.board.forEach( (row,y) => row.forEach( ({ revealed, adjacent, bomb, exploded, flagged },x) => {
        if( revealed ) {
          if( bomb && exploded ) {
            setbg({ x, y, bg: icons.explodedBomb })
          } else if ( bomb ) {
            setbg({ x, y, bg: icons.exposedBomb })
          } else {
            setbg({ x, y, bg: icons.bombs[adjacent] })
          }
        } else if ( flagged ) {
          setbg({ x, y, bg: icons.flag })
        } else {
          setbg({ x, y }) //removes style so CSS can take over
        }
      }))
    }

    const dispatch = ( action ) => {
      newstate = minesweeper(state, action)
      console.log("DISPATCHING");
      console.log(state);
      if( JSON.stringify(newstate) !== JSON.stringify(state) )
        previousStates.push(state)
      state = newstate
    }

    const click = ({ x, y }) => () => {
      dispatch({
        type: "REVEAL",
        data: { x, y }
      })
      render()
    }

    const rightclick = ({ x, y }) => (event) => {
      event.preventDefault()
      dispatch({
        type: "FLAG",
        data: { x, y }
      })
      render()
      return false
    }

    const undo = () => {
      state = previousStates.pop()
      render()
    }

    buildboard()
    render(state)
  }

  const renderpresets = ({ height, width, mines }) => () => {
    els.height.value = height
    els.width.value = width
    els.mines.value = mines
  }

  els.beginner.onclick = renderpresets({ height: 9, width: 9, mines: 10 })
  els.intermediate.onclick = renderpresets({ height: 16, width: 16, mines: 40 })
  els.expert.onclick = renderpresets({ height: 16, width: 30, mines: 99 })

  els.newgame.onclick = newgame
  newgame()
}

creategameview( querydom("board") )
