const MATCH_NUMBER = 2;
const CARD_ICONS = ["fa-anchor", "fa-bolt", "fa-leaf", "fa-diamond", "fa-bomb", "fa-bicycle", "fa-paper-plane-o", "fa-cube"];
const CARD_NUMBER = MATCH_NUMBER * CARD_ICONS.length;
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

// list holding all cards
let cards = initCards(CARD_ICONS, MATCH_NUMBER),
	clickStack = [],
	matchStack = [],
	moveCounter = 0,
	stars = 3;

startGame();

function startGame() {
	// TODO: uncomment shuffle process
	// cards = shuffle(cards);
	clickStack = [];
	matchStack = [];
	moveCounter = 0;
	stars = 3;
	// TODO: dynamically create card HTML
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
		const $cardLi = $("<li>", {
				"class": "card"
			}),
			$cardIcon = $("<i>", {
				"class": card.faClasses
			});

		setIconAttr($cardIcon, card.faClasses);
		addCardListener($cardLi);

		$cardLi.append($cardIcon);
		$deck.append($cardLi);
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

		// add to click stack
		clickStack.push(cards[cardIndex]);

		// if there're more than one card in the stack, check match and do something
		if (clickStack.length > 1) {
			let match = checkMatch(clickStack);
			handleMatch(clickStack, match);
			updateMoveCounter();
			updateStars();
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

function handleMatch(clickStack, match) {
	while (clickStack.length > 0) {
		const card = clickStack.pop();
		const index = card.index;

		// if cards are completely matched, 
		if (match === Match.COMPLETE_MATCH) {
			matchStack.push(card);
			$(".card").eq(index).addClass("match");

			//TODO: do something animating with matched card li

			// check win
			let won = checkWin();
			if (won) {
				//TODO: do something if won
			}

			// if cards are not matched
		} else if (match === Match.NOT_MATCH) {

			//TODO: do something with failing match(change background) 
			//      AND card li(hide icon)

			moveCounter++;
			// clear clickStack
			clickStack = [];

		}
		// (further work) if cards are incompletely matched(match === Match.INCOMPLETE_MATCH), do something



	}





}

function updateStars() {
	stars -= Math.floor(moveCounter / 8);
	stars = Math.max(0, stars);
}

function updateMoveCounter(match) {
	if (match === Match.COMPLETE_MATCH || match === Match.NOT_MATCH) {
		moveCounter++;
	}
}

function checkWin() {
	return matchStack.length === CARD_NUMBER;
}