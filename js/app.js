const MATCH_NUMBER = 2;
const CARD_ICONS = ["fa-anchor", "fa-bolt", "fa-leaf", "fa-diamond", "fa-bomb", "fa-bicycle", "fa-paper-plane-o", "fa-cube"];
const CARD_NUMBER = MATCH_NUMBER * CARD_ICONS.length;
const STAR_NUMBER = 3;
const log = console.log.bind(console);

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

// mimic Enum in Java / C++ for simple use and not type safe
const Match = {
	NOT_MATCH: "not match",
	INCOMPLETE_MATCH: "incomplete match",
	COMPLETE_MATCH: "complete match"
};

Object.freeze(Match);

// init game
let cards = [],
	openStack = [],
	matchStack = [],
	moveCounter = 0,
	starCounter = 0,
	timers = [];


initGame();
startGame();

function initGame() {
	cards = initCards(CARD_ICONS, MATCH_NUMBER),
	openStack = [],
	matchStack = [],
	moveCounter = 0,
	starCounter = STAR_NUMBER;
	addRestartButtonListener($(".score-panel .restart"));
	addPlayAgainButtonListener($(".ending-modal button.play-again"));

	// hide ending modal

}

function startGame() {
	timers[0] = new Date();
	// TODO: (for testing) uncomment shuffle process
	shuffleCards();

	// TODO: bundle resest methods
	resetMatchStack();
	resetOpenStack();
	resetMoveCounter();
	renderMoves();
	resetStarCounter();
	renderStars();

	// dynamically create card HTML
	renderCards();
	hideEndingModal();
	displayGameBoard();
}

function endGame() {
	timers[1] = new Date();
	updateStatsText();
	setTimeout(() => {
		hideGameBoard();
		displayEndingModal();
	}, 500);
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

/**
 * 
 * 
 * @param {any} icons
 * @param {any} matchNumber 
 * @returns 
 */
function initCards(icons, matchNumber) {
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

// Shuffle function
// shuffle the card array in place, implementing Fisher–Yates shuffle algorithm.
function shuffle(array) {

	// TODO: modify shuffle method
	let currentIndex = array.length,
		temporaryValue, randomIndex;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
		array[currentIndex].updateIndex(currentIndex);
		array[currentIndex].resetState();
	}

	return array;
}

// TODO: add a cards html updating method and modify renderCards method

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
			return Match.NOT_MATCH;
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
		for (let $card of $cards) {
			// $cardIcon = $card.children().first();
			$card.addClass("match");

			//TODO: do something animating with matched card li
		}

		// if cards are not matched
	} else if (match === Match.NOT_MATCH) {
		//TODO: do something animating with failing match

		for (let card of openStack) {
			card.closeCard();
		}

		for (let $card of $cards) {
			$card.addClass("match-fail");
		}
		setTimeout(() => {
			for (let $card of $cards) {
				$card.removeClass("open show match-fail");
			}
		}, 300);
	}
	// TODO: (further work) if cards are incompletely matched(match === Match.INCOMPLETE_MATCH), do something

	// check win
	updateStacks(match);
	let won = checkWin();
	if (won) {
		endGame();
	}
}

// TODO: render stars
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

function updatestarCounter() {
	starCounter = STAR_NUMBER - Math.floor((moveCounter - 5) / CARD_ICONS.length);
	starCounter = Math.max(0, starCounter);
}

function renderMoves(match) {
	updateMoveCounter(match);
	$(".moves").text(moveCounter);
}

function updateMoveCounter(match) {
	if (match === Match.COMPLETE_MATCH || match === Match.NOT_MATCH) {
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

function updateOpenStack(match) {
	if (match === Match.COMPLETE_MATCH || match === Match.NOT_MATCH) {
		resetOpenStack();
	}
}

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