var transferPlayerPage = /hattrick\.org\/Club\/Transfers\/TransfersPlayer\.aspx/g;
var transferDateRegex = /([0-9]{2})-([0-9]{2})-([0-9]{4})/g;

function getNoFinalPricePlayer() {

  var playersDb = new PouchDB('http://localhost:5984/hattrick');

  var now = new Date();
  var fiveMinutesAgo = new Date(now.valueOf() - 5*60*1000);

  return playersDb.query('no_final_price', {
    endkey       : fiveMinutesAgo.toISOString(),
    limit        : 1,
    include_docs : true
  }).then(function (result) {
    console.error('Player without final price', result);

    player = result.rows[0].doc;
    return player;

  }).catch(function (err) {
    console.error('Query to retrieve players without a final price failed:', err);
  });
}

var stateDb = new PouchDB('http://localhost:5984/hattrick_state');

stateDb.get('state').then( ( currentState ) => {

  if ( currentState && currentState.state === 'PLAYERS_CHECK' && transferPlayerPage.exec(window.location.href)) {

    console.info('Getting player info...');

    var playerId = getPlayerId(window.location.href);

    var playersDb = new PouchDB('http://localhost:5984/hattrick');

    playersDb.get(playerId).then( ( player ) => {

      console.info('Player', player);

      // check if the date is the same as the deadline

      table = document.getElementById('ctl00_ctl00_CPContent_divStartMain').outerText;

      let priceUpdatePromise = Promise.resolve();

      transferDatesMatches = execRegex( transferDateRegex, table );
      if ( transferDatesMatches ) {
        transferDate = transferDatesMatches[3].concat('-', transferDatesMatches[2], '-', transferDatesMatches[1]);
        if (player.deadline.includes(transferDate)) {
          priceMatches = execRegex(playerProperties.price.regex, table);
          player['finalPrice'] = playerProperties.price.modifier( Number(priceMatches[1].replace(/\s/g, ''))) ;
          console.error('player after update', player);
        }
      }
      if ( player.finalPrice === undefined ) {
        player['finalPrice'] = 'UNSOLD';
        console.error('player was not sold');
      }

      priceUpdatePromise = playersDb.put(player);

      priceUpdatePromise.then( () => {
        getNoFinalPricePlayer().then( (nextPlayer) => {
          console.error('nextPlayer', nextPlayer);
          if ( !nextPlayer ) {
            currentState.state = 'TRANSFER_CHECK';
            stateDb.put(currentState);
            delayedNavigation( () => { window.location.href = SERVER.concat('/World/Transfers/'); });
          } else {
            console.error('navigating to next player');
            delayedNavigation( () => { window.location.href = SERVER.concat('/Club/Transfers/TransfersPlayer.aspx?playerId=', nextPlayer._id, '&browseIds='); });
          }
        });
      });
    });
  }
}).catch( () => {
  console.warn('state is not set');
});
