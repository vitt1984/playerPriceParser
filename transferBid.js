var transferBidPage = /hattrick\.org\/Club\/Players\/Player\.aspx/g;

// TODO shared function
function formatNumber(number) {
  number = number.toFixed(2) + '';
  let x = number.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ' ' + '$2');
  }
  return x1 + x2;
};

var stateDb = new PouchDB('http://localhost:5984/hattrick_state');

stateDb.get('state').then( ( currentState ) => {

  if ( currentState && currentState.state === 'INACTIVE' && transferBidPage.exec(window.location.href)) {

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
          console.error(id, playerId);
          if ( id === playerId ) {
            id = id.concat(' <----');
          }
          console.error(id);

          playerLinksHtml = playerLinksHtml.concat('<a href=\"', playerLink, '\">', id, '</a>');
          console.error(playerLinksHtml);
        }
      }

      let rightSidebar = document.getElementById('ctl00_ctl00_CPContent_CPSidebar_pnlRight');
      let secondBoxBody = rightSidebar.getElementsByClassName('boxBody')[1];
      secondBoxBody.innerHTML = secondBoxBody.innerHTML.concat('<br>', playerLinksHtml);

    }).catch(function (err) {
      console.error('Error while trying to retrieve similarly priced players', err);
    });

  }

}).catch( () => {
  console.warn('state is not set');
});
