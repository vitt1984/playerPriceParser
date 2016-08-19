
/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  console.error('listener for message');
  var stateDb = new PouchDB('http://localhost:5984/hattrick_state');

  stateDb.get('state').then( ( currentState ) => {
    console.info('starting process');

    if ( currentState && currentState.state === 'PLAYERS_CHECK' ) {
      getNoFinalPricePlayer().then( ( player ) => {
        console.error('testtest', player);
        if ( !player ) {
          currentState.state = 'TRANSFERS_CHECK';
          stateDb.put(currentState);
          delayedURLNavigation( 'https://www91.hattrick.org/World/Transfers/' );
        } else {
          delayedURLNavigation( 'https://www91.hattrick.org/Club/Transfers/TransfersPlayer.aspx?playerId='.concat(player._id, '&browseIds=') ); 
        }
      });
    }
  });

});
