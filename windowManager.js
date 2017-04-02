
/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

  var stateDb = new PouchDB('http://localhost:5984/hattrick_state');

  stateDb.get('state').then( ( currentState ) => {
    console.info('starting process');

    if ( currentState && currentState.state === 'PLAYERS_CHECK' ) {
      getNoFinalPricePlayer().then( ( player ) => {
        if ( !player ) {
          currentState.state = 'TRANSFER_CHECK';
          stateDb.put(currentState);
          delayedNavigation( () => { window.location.href = SERVER.concat('/World/Transfers/'); });
        } else {
          delayedNavigation( () => { window.location.href = SERVER.concat('/Club/Transfers/TransfersPlayer.aspx?playerId=', player._id, '&browseIds='); });
        }
      });
    }
  });

});
