const icons = {
  blank: './images/uncovered.png',
  exposedBomb: './images/bomb.png',
  explodedBomb: './images/explodedbomb.png',
  flag: './images/flagged.png',
  bombs: [
    './images/adj0.png',
    './images/adj1.png',
    './images/adj2.png',
    './images/adj3.png',
    './images/adj4.png',
    './images/adj5.png',
    './images/adj6.png',
    './images/adj7.png',
    './images/adj8.png' ]
}

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
        rowarr = []
        for (var x = 0; x < width; x++) {
          box = document.createElement("BUTTON")
          box.onmousedown = click({ x, y })
          box.oncontextmenu = prevent
          rowdiv.appendChild( box )
          rowarr.push( box )
        }
        rowdiv.style = "min-width: " + (width*2) + "rem;"
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

    // const rightclick = ({ x, y }) => (event) => {
    //   render()
    //   return false
    // }

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
