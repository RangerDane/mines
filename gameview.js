// utils
const querydom = id => document.getElementById(id)

// view logic: here's the ugly part of the code that a framework lets you abstract away
const creategameview = ( boardel, settingsel ) => {

  const els = {
    board: boardel,
    beginner: querydom("beginner"),
    intermediate: querydom("intermediate"),
    expert: querydom("expert"),
    newgame: querydom("newgame"),

    error: querydom("error"),

    height: querydom("height"),
    width: querydom("width"),
    mines: querydom("mines")
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
      if( bg )
        elements[y][x].style = "background-image: url('" + bg + "');"
      else
        elements[y][x].style = ""
    }

    const render = ({ board }) => {
      board.forEach( (row,y) => row.forEach( ({ revealed, adjacent, bomb, exploded, flagged },x) => {
        // elements[y][x].className = box
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

    const click = ({ x, y }) => () => render(game.reveal({ x, y }))

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

creategameview( querydom("board"), querydom("settings") )
