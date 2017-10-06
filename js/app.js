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
	}

	updateIndex(index) {
		this.index = index;
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
let cards = initCards(CARD_ICONS, MATCH_NUMBER),
	openStack = [],
	matchStack = [],
	moveCounter = 0,
	starCounter = STAR_NUMBER;

startGame();

function startGame() {
	// TODO: (for testing) uncomment shuffle process
	shuffleCards();
	resetMatchStack();
	resetOpenStack();
	resetMoveCounter();
	resetStarCounter();

	// dynamically create card HTML
	createCardsHTML(cards);
}

function endGame() {
	// TODO: delete HTML and display winning status
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
	}

	return array;
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

function setIconAttr($element, attr) {
	$element.addClass(attr);
}

function addCardListener($element) {
	$element.on("click", function () {
		// open card and show the icon when clicked
		$(this).addClass("open show");

		// get corresponding card index
		let cardIndex = $(this).index();

		// add to open stack
		openStack.push(cards[cardIndex]);

		// check match and do something
		let match = checkMatch(openStack);
		handleMatch(openStack, match);
		updateMoveCounter();
		updatestarCounter();
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
		for (let $card of $cards) {
			// $cardIcon = $card.children().first();
			$card.addClass("match");

			//TODO: do something animating with matched card li

			// check win
			let won = checkWin();
			if (won) {
				//TODO: do something if won
			}

		}

		// if cards are not matched
	} else if (match === Match.NOT_MATCH) {
		//TODO: do something with failing match(change card color(background)) 
		//      AND card li(hide icon)
		for (let $card of $cards) {
			$card.addClass("match-fail");
		}
		setTimeout(() => {
			for (let $card of $cards) {
				$card.removeClass("open show match-fail");
			}
		}, 300);
	}
	// (further work) if cards are incompletely matched(match === Match.INCOMPLETE_MATCH), do something
	
	updateStacks(match);
}

function updatestarCounter() {
	starCounter -= Math.floor(moveCounter / CARD_ICONS.length);
	starCounter = Math.max(0, starCounter);
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