const MATCH_NUMBER = 2;
const CARD_ICONS = ["fa-anchor", "fa-bolt", "fa-leaf", "fa-diamond", "fa-bomb", "fa-bicycle", "fa-paper-plane-o", "fa-cube"];
const CARD_NUMBER = MATCH_NUMBER * CARD_ICONS.length;

class Card {
	constructor(icon, index) {
		this.icon = icon;
		this.faClasses = "fa " + icon;
		this.index = index;
	}
}

// list holding all cards
var cards = initCards(CARD_ICONS),
	clickStack = [],
	matchStack = [],
	moveCounter = 0,
	stars = 3;

// startGame();

function startGame() {
	cards = shuffle(cards);
	clickStack = [];
	matchStack = [];
	moveCounter = 0;
	stars = 3;
	// TODO: dynamically create card HTML


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
	let cards = new Array();
	for (let icon of icons) {
		while (matchNumber-- > 0) {
			let card = new Card(icon);
			cards.push(card);
		}
	}
	return cards;
}

// Shuffle function, implementing Fisher–Yates shuffle algorithm
function shuffle(array) {

	// TODO: modify shuffle method
	var currentIndex = array.length,
		temporaryValue, randomIndex;

	while (currentIndex !== 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function createCardsHTML(cards) {
	let $deck = $(".deck");
	for(let card of cards) {
		let $cardLi = $("<li>", {"class": "card"}),
			$cardIcon = $("<i>", {"class": card.faClasses});

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
			let matched = checkMatch(clickStack);
			// if cards are matched, 
			if (matched) {
				while (clickStack) {
					let card = clickStack.pop();
					let index = card.index;

					matchStack.push(card);
					$(".card").get(index).addClass("match");

					//TODO: do something with matched card li

				}

				// check win
				let won = checkWin();
				if (won) {
					//TODO: do something if won
				}

				// cards not matched
			} else {

				//TODO: do something with failing cards(change background) 
				//      AND card li(hide icon)

				moveCounter++;
				// clear clickStack
				clickStack = [];
			}

			updateStars();

		}

	});
}



function checkMatch(cards) {
	let matched = true;
	if (cards.length > 1) {
		for (let i = 1; i < cards.length && matched; i++) {
			matched = (cards[i].icon === cards[i - 1].icon);
		}
	} else {
		return false;
	}

	// moveCounter increments by 1 if there's a complete match
	if (matched && cards.length === MATCH_NUMBER) {
		moveCounter++;
	}
	return matched;
}

function updateStars() {
	stars -= Math.floor(moveCounter / 8);
	stars = Math.max(0, stars);
}

function checkWin() {
	return matchStack.length === CARD_NUMBER;
}