
var transferPlayerPage = /hattrick\.org\/Club\/Transfers\/TransfersPlayer\.aspx/g;
var transferDateRegex = /([0-9]{2})-([0-9]{2})-([0-9]{4})/g;

if ( transferPlayerPage.exec(window.location.href)) {

  console.error('test transferPlayer.js');

  var playerId = getPlayerId(window.location.href);

  var playersDb = new PouchDB('http://localhost:5984/hattrick');

  playersDb.get(playerId).then( ( player ) => {

    console.error('player', player);

    // check if the date is the same as the deadline

    table = document.getElementById('ctl00_ctl00_CPContent_divStartMain').outerText;

    transferDatesMatches = execRegex( transferDateRegex, table );
    if ( transferDatesMatches ) {
      transferDate = transferDatesMatches[3].concat('-', transferDatesMatches[2], '-', transferDatesMatches[1]);
      if (player.deadline.includes(transferDate)) {
        priceMatches = execRegex(playerProperties.price.regex, table);
        player['finalPrice'] = playerProperties.price.modifier( Number(priceMatches[1].replace(/\s/g, ''))) ;
        console.error('player after update', player);
        return playersDb.put(player);
      } else {
        console.error('player was not sold');
      }
    };

  });
}

/* Listen for messages */
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    /* If the received message has the expected format... */
  console.error('listener called', sendResponse.toString());
  //sendResponse(document.getElementById('firstHeading').innerHTML);

  // sendResponse(player);
});

//   createPlayerWithoutFinalPriceView().then( () => {
//     var playersDb = new PouchDB('http://localhost:5984/hattrick');
//     playersDb.query('no_final_price', {
//       limit        : 1,
//       include_docs : true
//     }).then(function (result) {
//       console.error('players without final price', result);
//       if ( result.total_rows > 0) {



//       } else 





// function createPlayerWithoutFinalPriceView() {

//   var playersDb = new PouchDB('http://localhost:5984/hattrick');

//   var noFinalPriceDoc = {
//     _id: '_design/no_final_price',
//     views: {
//       no_final_price: {
//         map: function (doc) {
//           if ( doc.finalPrice === undefined ) {
//             var now = new Date();
//             var deadline = new Date( doc.deadline );
//             if ( ((now - deadline)/1000) > 300 ) {
//               // if deadline was at least 5 minutes ago
//               emit(doc._id);
//             }
//           }
//         }.toString()
//       }
//     }
//   };

//   return playersDb.put(noFinalPriceDoc).then( ()=>{
//     console.error('created view');
//   } ).catch(function (err) {
//     if (err.name !== 'conflict') {
//       throw err;
//     }
//     // ignore if doc already exists
//   });

// }

// function updateWithFinalPrice() {

//   var playersDb = new PouchDB('http://localhost:5984/hattrick');

//   playersDb.query('no_final_price', {
//     limit        : 1,
//     include_docs : true
//   }).then(function (result) {
//     console.error('players without final price', result);

//     player = result.rows[0].doc;
//     windows.location.href = 'https://www94.hattrick.org/Club/Transfers/TransfersPlayer.aspx?playerId='.concat(player._id, '&browseIds=');

//   }).catch(function (err) {
//     console.error('EERRRER:', err);
//   });

// }