function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Obstacle(top = false) {
    this.element = newElement('div', 'obstacle')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')

    this.element.appendChild(top ? body : border)
    this.element.appendChild(top ? border : body)

    this.setHeight = height => {
        body.style.height = `${height}px`
    }

    this.putColor = (red, green, blue) => {
        border.style.background = `linear-gradient(90deg, #000, rgb(${red}, ${green}, ${blue}))`
        body.style.background = `linear-gradient(90deg, #000, rgb(${red}, ${green}, ${blue}))`
    }
}

function PairOfObstacles(gameHeight, aperture, x) {
    this.element = newElement('div', 'pair-of-obstacles')

    this.top = new Obstacle(true)
    this.bottom = new Obstacle(false)

    this.element.appendChild(this.top.element)
    this.element.appendChild(this.bottom.element)

    this.setAperture = () => {
        const topHeight = Math.random() * (gameHeight - aperture)
        const bottomHeight = gameHeight - aperture - topHeight
        this.top.setHeight(topHeight)
        this.bottom.setHeight(bottomHeight)
    }

    this.setColor = () => {
        const red = Math.random()*100 +50
        const green = red + Math.random() * 100 - 50
        const blue = red + Math.random() * 100 - 50
        this.top.putColor(red, green, blue)
        this.bottom.putColor(red, green, blue)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getLargura = () => this.element.clientWidth

    this.setAperture()
    this.setColor()
    this.setX(x)
}

function Obstacles(gameHeight, gameWidth, aperture, distance, notifyPoint) {
    this.pairs = [
        new PairOfObstacles(gameHeight, aperture, gameWidth)
    ]

    const moving = 1
    this.play = () => {
        this.pairs.forEach((pair, i) => {
            pair.setX(pair.getX() - moving)

            if (pair.getX() < gameWidth - distance - pair.element.clientWidth && this.pairs.length == i+1) {
                this.pairs.push(new PairOfObstacles(gameHeight, aperture, gameWidth))
                document.querySelector('[flappy-game]').appendChild(this.pairs[i+1].element)
            }

            if (pair.getX() < -pair.getLargura()) {
                pair.element.parentNode.removeChild(pair.element)
                this.pairs.shift()
            }

            const middle = gameWidth / 2
            const middleCross = pair.getX() + moving >= middle
                && pair.getX() < middle
            middleCross && notifyPoint()
        })
    }
}

function Duck(gameHeight) {
    let flying = false
    this.element = newElement('img', 'duck')
    this.element.src = 'imgs/duck.png'
    this.element.setAttribute('draggable', 'false')

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onmousedown = e => flying = true
    window.onmouseup = e => flying = false

    this.play = () => {
        const newY = this.getY() + (flying ? 2.7 : -2)

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= gameHeight - this.element.clientHeight) {
            this.setY(gameHeight - this.element.clientHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updateScore = score => {
        this.element.innerHTML = score
    }
    this.updateScore(0)
}

function checkOverlap(elementX, elementY) {
    const x = elementX.getBoundingClientRect()
    const y = elementY.getBoundingClientRect()

    const horizontal = x.left + x.width >= y.left
                    && y.left + y.width >= x.left
    const vertical = x.top + x.height >= y.top
                  && y.top + y.height >= x.top
    
    return horizontal && vertical
}

function checkCollision(duck, obstacles) {
    let collision = false

    obstacles.pairs.forEach(pairs => {
        if(!collision) {
            collision = checkOverlap(duck.element, pairs.top.element)
                    ||  checkOverlap(duck.element, pairs.bottom.element)
        }
    })

    return collision
}

function FlappyDuck() {
    let score = 0

    const gameArea = document.querySelector('[flappy-game]')
    const gameHeight = gameArea.clientHeight
    const gameWidth = gameArea.clientWidth

    const progress = new Progress()
    const obstacles = new Obstacles(gameHeight, gameWidth, 200, 180,
        () => progress.updateScore(++score))
    const duck = new Duck(gameHeight)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(duck.element)
    obstacles.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        const timer = setInterval(() => {
            obstacles.play()
            duck.play()

            if(checkCollision(duck, obstacles)) {
                clearInterval(timer)

                const restartBackground = gameArea.parentNode.appendChild(newElement('div', 'restart-background'))
                const restartButton = restartBackground.appendChild(newElement('button', 'restart'))
                restartButton.innerHTML = 'RESTART'

                restartButton.onclick = function() {
                    restartBackground.parentNode.removeChild(restartBackground)
                    while (gameArea.firstChild) {
                        gameArea.removeChild(gameArea.firstChild)
                    }
                    startGame()
                }
            }
        }, 6)
    }
}

function startGame() {
    const game = new FlappyDuck()
    let isNotRunning = 1

    window.onclick = e => {
        isNotRunning && game.start()
        isNotRunning = 0
    }
}

startGame()