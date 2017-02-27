// utils
const querydom = id => document.getElementById(id)

// view logic: here's the ugly part of the code that a framework lets you abstract away
const creategameview = ( boardel ) => {
  const BEGINNER = { height: 9, width: 9, mines: 10 }
  const INTERMEDIATE = { height: 16, width: 16, mines: 40 }
  const EXPERT = { height: 16, width: 30, mines: 99 }

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

  const newgame = ({ height, width, mines }) => {
    if( invalidparams({ height, width, mines }, error) ) return

    let previousStates = []
    let state = minesweeper({ height, width, mines })

    // this is the messy way to do things
    els.board.innerHTML = ""

    // "virtual DOM"
    var elements = [], rowarr, rowdiv, box
    const buildboard = () => {
      els.undo.onclick = undo
      for (var y = 0; y < height; y++) {
        rowdiv = document.createElement("div")
        rowarr = []
        for (var x = 0; x < width; x++) {
          box = document.createElement("BUTTON")
          box.onmousedown = click({ x, y })
          box.oncontextmenu = prevent
          rowdiv.appendChild( box )
          rowarr.push({ element: box, state: "uncovered" })
        }
        rowdiv.style = "min-width: " + (width*2) + "rem;"
        boardel.appendChild( rowdiv )
        elements.push( rowarr )
      }
    }

    const setstyle = ({ x, y, style }) => {
      style = style || "uncovered"

      if( elements[y][x].state !== style ) {
        elements[y][x].element.className = style
        elements[y][x].state = style
      }
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
            setstyle({ x, y, style: "exploded" })
          } else if ( bomb ) {
            setstyle({ x, y, style: "bomb" })
          } else {
            setstyle({ x, y, style: ("adj" + adjacent) })
          }
        } else if ( flagged ) {
          setstyle({ x, y, style: "flagged" })
        } else {
          setstyle({ x, y, style: "uncovered" })
        }
      }))
    }

    const dispatch = ( action ) => {
      newstate = minesweeper(state, action)
      if( JSON.stringify(newstate) !== JSON.stringify(state) )
        previousStates.push(state)
      state = newstate
    }

    const click = ({ x, y }) => (e) => {
      if( e.button === 0 || e.button === 1 ) {
        dispatch({
          type: "REVEAL",
          data: { x, y }
        })
      } else if( e.button === 2) {
        e.preventDefault()
        dispatch({
          type: "FLAG",
          data: { x, y }
        })
      }
      render()
      return false
    }

    const prevent = (e) => {
      e.preventDefault()
      return false;
    }

    const undo = () => {
      state = previousStates.pop()
      render()
    }

    buildboard()
    render(state)
    rendersettings(state)
  }

  const rendersettings = ({ height, width, mines }) => {
    els.height.value = height
    els.width.value = width
    els.mines.value = mines

    els.beginner.className = ""
    els.intermediate.className = ""
    els.expert.className = ""
    els.newgame.className = ""
    // els.newgame.disabled = true

    if( height === BEGINNER.height && width === BEGINNER.width && mines === BEGINNER.mines ) {
      els.beginner.className = "active"
    } else if( height === INTERMEDIATE.height && width === INTERMEDIATE.width && mines === INTERMEDIATE.mines ) {
      els.intermediate.className = "active"
    } else if( height === EXPERT.height && width === EXPERT.width && mines === EXPERT.mines ) {
      els.expert.className = "active"
    } else {
      els.newgame.className = "active"
    }

  }

  const attachbutton = (settings) => () => {
    newgame(settings)
  }

  const undisablecustom = () => {
    els.newgame.disabled = false;
  }

  els.beginner.onclick = attachbutton(BEGINNER)
  els.intermediate.onclick = attachbutton(INTERMEDIATE)
  els.expert.onclick = attachbutton(EXPERT)

  els.height.oninput = undisablecustom
  els.width.oninput = undisablecustom
  els.mines.oninput = undisablecustom

  els.newgame.onclick = () => { newgame(getparams()) }
  newgame(BEGINNER)
}

creategameview( querydom("board") )
