# Memory Game: Matching

This is a memory game in which you should try to match cards with the same pattern.  

Click to play the game: [Memory Game: Matching](https://zhichl.github.io/memory-game/)

## Code Details

### I. Components and logics

#### Game board

Game board is the playing interface. It contains statistics on the top and card deck as the main part. 

#### Ending modal

An ending modal is shown when the player matches all the cards on card deck. It shows the final statistical information throughout the game, including moves have been taken to win the game, stars that rates the performance according to moves and times that elapsed  winning a game.

#### Class

Card class, containing card properties and state information.

#### Global variables 

| Variable          | Notes                                    |
| :---------------- | :--------------------------------------- |
| ```cards```       | An array storing all cards which are instances of the Card class. |
| ```openStack```   | An array storing cards that are currently opened (matched cards excluded). |
| ```matchStack```  | An array storing cards that have already been matched (complete match). |
| ```moveCounter``` | Count moves that the player is taking as the game continues. One move is added as a complete match or a mismatch is presented. |
| ```starCounter``` | Count stars based on moves. Since winning is perfect when using only 8 (pattern number of cards) moves to win, which is of very low likeliness, an error-tolerance (4 moves) is added to achieve a full-star rating. Therefore full-star (3 stars) is rated when moves are less then or equal to 12 (8 + 4). After then, stars decreases by one when every 8 (pattern number) moves is added. |
| ```Time```        | Record the time elapsed from game start through the end. |

#### Extensibility  

1. Number of patterns(icons) of card can be increased to upgrade the difficulty of game.

2. Further extention for triple-match, quadra-match and so forth might be needed in accordance to the game difficulty. So the multi-match extensibility is approached by categorizing card matching situations.

   Matches are devided into to three categories:

   | Category               | Notes                                    |
   | ---------------------- | ---------------------------------------- |
   | ``` MISMATCH```        | New pushed card doesn't match with previous ones in the open stack. |
   | ```INCOMPLETE_MATCH``` | New pushed card matches with previous ones in the open stack with at least one card with the same pattern not being found(not opened by player and pushed into open stack yet). |
   | ```COMPLETE_MATCH```   | New pushed card matches with previous ones in the open stack and all cards with the same pattern are found and matched. |

### II. Dependencies

1. JQuery v3.2.1
2. Font Awesome v4.7.0

### III. TODOs / Future works

1. Add animation effects when cards are matched / failing match
2. Add animation effects when ending modal is showing
3. Add difficulty selection by adding pattern number selection and multi-match modes