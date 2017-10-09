const MATCH_NUMBER = 2;
const CARD_ICONS = ["fa-anchor", "fa-bolt", "fa-leaf", "fa-diamond", "fa-bomb", "fa-bicycle", "fa-paper-plane-o", "fa-cube"];
const PATTERN_NUMBER = CARD_ICONS.length;
const CARD_NUMBER = MATCH_NUMBER * PATTERN_NUMBER;
const STAR_NUMBER = 3;
const FULL_STAR_ERROR_TOLERANCE = 4;

class Card {
	constructor(icon, index) {
		this.icon = icon;
		this.faClasses = "fa " + icon;
		this.index = index;
		this.open = false;
		this.matched = false;
	}

	updateIndex(index) {
		this.index = index;
	}

	openCard() {
		this.open = true;
	}

	closeCard() {
		this.open = false;
	}

	matchCard() {
		this.match = true;
	}

	resetState() {
		this.open = false;
		this.matched = false;
	}
}

// mimic Enum in Java / C++ for simple use (not type safe)
const Match = {
	MISMATCH: "not matched",
	INCOMPLETE_MATCH: "incomplete match",
	COMPLETE_MATCH: "complete match"
};

// prevent properties in Match from being modified
Object.freeze(Match);

//global variable declaration
let cards, openStack, matchStack, 
	moveCounter, starCounter, timers;


// init game, called only once
initGame();

// start game, called either restart button or play-again button is clicked
startGame();

function initGame() {
	cards = createCards(CARD_ICONS, MATCH_NUMBER),
	openStack = [],
	matchStack = [],
	moveCounter = 0,
	starCounter = STAR_NUMBER,
	timers = [];
	addRestartButtonListener($(".score-panel .restart"));
	addPlayAgainButtonListener($(".ending-modal button.play-again"));
}

function startGame() {
	shuffleCards();

	// reset global variables / card stacks
	resetGlobalVars();

	// dynamically create / update card HTML
	renderCards();

	// hide ending modal and display game board
	hideEndingModal();
	displayGameBoard();

	// set timer, game starts
	startTimer(timers);
}

function endGame() {
	endTimer(timers);
	updateStatsText();
	setTimeout(() => {
		hideGameBoard();
		displayEndingModal();
	}, 500);
}

function resetGlobalVars() {
	resetMatchStack();
	resetOpenStack();
	resetMoveCounter();
	renderMoves();
	resetStarCounter();
	renderStars();
}

function displayGameBoard() {
	$(".game-board").css("display", "flex");
}

function hideGameBoard() {
	$(".game-board").css("display", "none");
}

function displayEndingModal() {
	$(".ending-modal").css("display", "flex");
}

function hideEndingModal() {
	$(".ending-modal").css("display", "none");
}

function startTimer(timers) {
	timers[0] = new Date();
}

function endTimer(timers) {
	timers[1] = new Date();
}

// unpdate info statistics
function updateStatsText() {
	// stars / moves / time
	let starText = "stars",
		moveText = "moves",
		timeElapsed = timers[1] - timers[0],
		timeText = formatMilliseconds(timeElapsed);

	if (moveCounter < 2 || starCounter < 2) {
		if (moveCounter < 2) {
			moveText = "move";
		}
		if (starCounter < 2) {
			starText = "star";
		}
	}

	let msStats = `With ${moveCounter} ${moveText} and ${starCounter} ${starText}`,
		timeStats = `Time: ${timeText}`;
	$(".moves-stars").text(msStats);
	$(".time").text(timeStats);
}

function addPlayAgainButtonListener($button) {
	$button.on("click", () => {
		startGame();
	});
}

// create new cards and return
function createCards(icons, matchNumber) {
	let cards = [],
		index = 0,
		number = matchNumber;

	for (let icon of icons) {
		while (number-- > 0) {
			let card = new Card(icon, index);
			cards.push(card);
			index++;
		}
		number = matchNumber;
	}
	return cards;
}

// shuffle array in place, implementing Fisher–Yates shuffle algorithm.
function shuffle(arr) {
	let currentIndex = arr.length,
		randomIndex;

	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// swap by destructuring
		[arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
		// change card attrbute after shuffling
		arr[currentIndex].updateIndex(currentIndex);
		arr[currentIndex].resetState();
	}

	return arr;
}

function renderCards() {
	deleteCardsHTML();
	createCardsHTML(cards);
}

function createCardsHTML(cards) {
	const $deck = $(".deck");
	for (let card of cards) {
		const $card = $("<li>", {
				"class": "card"
			}),
			$cardIcon = $("<i>", {
				"class": card.faClasses
			});

		setIconAttr($cardIcon, card.faClasses);
		addCardListener($card);

		$card.append($cardIcon);
		$deck.append($card);
	}
}

function deleteCardsHTML() {
	$(".deck").empty();
}

function addRestartButtonListener($button) {
	$button.on("click", () => {
		startGame();
	});
}

function setIconAttr($element, attr) {
	$element.addClass(attr);
}

function addCardListener($element) {
	$element.on("click", function () {
		// open card and show the icon when clicked
		$(this).addClass("open show");

		// get corresponding card index
		let cardIndex = $(this).index();
		let card = cards[cardIndex];

		// skip further actions if this card is already open or has been matched before click
		if (!card.open && !card.matched) {
			// add to open stack
			card.openCard();
			openStack.push(card);
			// check match and update
			let match = checkMatch(openStack);
			renderMoves(match);
			renderStars();
			handleMatch(openStack, match);
		}
	});
}

function checkMatch(cards) {
	let match = Match.INCOMPLETE_MATCH;
	if (cards.length > 1) {
		let matched = true;
		for (let i = 1; i < cards.length && matched; i++) {
			matched = (cards[i].icon === cards[i - 1].icon);
		}
		// not matched at all
		if (!matched) {
			return Match.MISMATCH;
		}
	}

	// if a incomplete match, further check if it's a complete match
	if (match === Match.INCOMPLETE_MATCH && cards.length === MATCH_NUMBER) {
		match = Match.COMPLETE_MATCH;
	}
	return match;
}

function handleMatch(openStack, match) {
	let $cards = getNodeListFromCards(openStack);

	// if cards are completely matched, 
	if (match === Match.COMPLETE_MATCH) {
		for (let card of openStack) {
			card.matchCard();
		}

		// timeout to create simple matching effect
		setTimeout(() => {
			for (let $card of $cards) {
				$card.addClass("match");
				//TODO: (future work) do something animating with card matching
			}
		}, 300);

		// if cards are not matched
	} else if (match === Match.MISMATCH) {
		for (let card of openStack) {
			card.closeCard();
		}

		// timeouts to create simple dismatching effect
		setTimeout(() => {
			for (let $card of $cards) {
				$card.addClass("match-fail");
			}
		}, 300);

		setTimeout(() => {
			for (let $card of $cards) {
				$card.removeClass("open show match-fail");
			}
		}, 600);
		//TODO: (future work) do something animating with failing match
	}
	// TODO: (future work) if cards are incompletely matched(match === Match.INCOMPLETE_MATCH), do something

	// check win
	updateStacks(match);
	let won = checkWin();
	if (won) {
		endGame();
	}
}

// render stars in the page according to the current star count
function renderStars() {
	updatestarCounter();
	if(starCounter < STAR_NUMBER) {
		let $star = $(".score-panel .stars .fa").eq(starCounter);
		if($star.hasClass("fa-star")) {
			$star.removeClass("fa-star").addClass("fa-star-o");
		}
	// all stars
	} else {
		let $stars = $(".score-panel .stars .fa");
		$stars.removeClass("fa-star-o").addClass("fa-star");
	}
}

// count stars based on current moves
// full stars when moves <= pattern-number + fullstar error tolerance  (12 moves)
// decrease one star after then when every pattern-number moves added (8 moves)
function updatestarCounter() {
	starCounter = STAR_NUMBER - Math.floor((moveCounter - FULL_STAR_ERROR_TOLERANCE - 1) / PATTERN_NUMBER);
	starCounter = Math.max(0, starCounter);
}

function renderMoves(match) {
	updateMoveCounter(match);
	$(".moves").text(moveCounter);
}

// one move is added as a complete match or a mismatch is presented
function updateMoveCounter(match) {
	if (match === Match.COMPLETE_MATCH || match === Match.MISMATCH) {
		moveCounter++;
	}
}

function shuffleCards() {
	cards = shuffle(cards);
}

function resetMatchStack() {
	matchStack = [];
}

function resetOpenStack() {
	openStack = [];
}

function resetMoveCounter() {
	moveCounter = 0;
}

function resetStarCounter() {
	starCounter = STAR_NUMBER;
}

function getNodeListFromCards(cards) {
	let $cards = [];
	for (let card of cards) {
		let $card = getNodeFromCard(card);
		$cards.push($card);
	}
	return $cards;
}

function getNodeFromCard(card) {
	return $(".card").eq(card.index);
}

function updateStacks(match) {
	updateMatchStack(match);
	updateOpenStack(match);
}

// empty open stack when cards inside are completely matched or not matched
function updateOpenStack(match) {
	if (match === Match.COMPLETE_MATCH || match === Match.MISMATCH) {
		resetOpenStack();
	}
}

// if a complete match, add matched cards to matchStack
function updateMatchStack(match) {
	if (match === Match.COMPLETE_MATCH) {
		for (let card of openStack) {
			matchStack.push(card);
		}
	}
}

function checkWin() {
	return matchStack.length === CARD_NUMBER;
}

// format ms to readable time string
function formatMilliseconds(time) {
	let formattedTime = "";
	time = Math.floor(time / 1000);
	let h = Math.floor(time / 3600);
	time %= 3600;
	let m = Math.floor(time / 60);
	let s = time % 60;

	if (h === 0) {
		if (m === 0) {
			formattedTime = `${s}s`;
		} else {
			formattedTime = `${m}m ${s}s`;
		}
	} else {
		formattedTime = `${h}h ${m}m ${s}s`;
	}

	return formattedTime;
}