var transferBidPage = /hattrick\.org\/Club\/Players\/Player\.aspx/g;

var stateDb = new PouchDB('http://localhost:5984/hattrick_state');

function displaySimilarPlayers( currentState ) {

  if ( (!currentState || currentState.state === 'INACTIVE') && transferBidPage.exec(window.location.href)) {

    var playerId = getPlayerId(window.location.href);

    var playersDb = new PouchDB('http://localhost:5984/hattrick');

    playersDb.get(playerId).then( ( player ) => {

      let bidBox = document.getElementById('ctl00_ctl00_CPContent_CPMain_pnlPlaceBid');

      if ( bidBox && player['priceForProfit2days'] !== undefined ) {
        bidBox.innerHTML = ''.concat('<p>Price for profit 2 days: ', formatNumber(Number(player['priceForProfit2days'])), '</p>',
                                     '<p>Price for profit 5 days: ', formatNumber(Number(player['priceForProfit5days'])), '</p>',
                                     '<p>Examples considered: ', player['priceExamplesCount'], '</p>',
                                     bidBox.innerHTML);
      }

    }).catch ( ( err ) => {
      // ignore errors... it's normal
    });

    var now = new Date();

    now = now - 180*60*1000; // 3 hours

    playersDb.query(function (doc) {
      // TODO: currently hardcoded - to be set dynamically
      if ( doc.price < doc.priceForProfit2days &&
           doc.price < 600000 &&
           doc.priceForProfit2days < 600000 &&
           doc.finalPrice === undefined ) {
        emit(doc);
      }
    }, {}).then(function (result) {

      var playerList = result.rows;

      playerList = playerList.sort( ( firstPlayer, secondPlayer ) => {
        var firstDate = new Date(firstPlayer.key.deadline);
        var secondDate = new Date(secondPlayer.key.deadline);
        return firstDate - secondDate;
      });

      let playerLinksHtml = '';
      for (var index in playerList) {

        let deadline = new Date(playerList[index].key.deadline);

        if ( deadline - now > 0 ) {
          let playerLink = SERVER.concat('/Club/Players/Player.aspx?playerId=', playerList[index].id, '&browseIds=');
          let id = playerList[index].id;
          if ( id === playerId ) {
            id = id.concat(' <----');
          }

          playerLinksHtml = playerLinksHtml.concat('<a href=\"', playerLink, '\">', id, '</a>');
        }
      }

      let rightSidebar = document.getElementById('ctl00_ctl00_CPContent_CPSidebar_pnlRight');
      let secondBoxBody = rightSidebar.getElementsByClassName('boxBody')[1];
      secondBoxBody.innerHTML = secondBoxBody.innerHTML.concat('<br>', playerLinksHtml);

    }).catch(function (err) {
      console.error('Error while trying to retrieve similarly priced players', err);
    });

  }
}

stateDb.get('state').then( ( currentState ) => {
  displaySimilarPlayers( currentState );
}).catch( () => {
  console.warn('state is not set');
  displaySimilarPlayers( currentState );
});
