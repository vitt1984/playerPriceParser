'use strict';

/*global chrome:false */

// chrome.browserAction.setBadgeText({text: '(ツ)'});
// chrome.browserAction.setBadgeBackgroundColor({color: '#eae'});

//http://stackoverflow.com/questions/28858027/how-to-read-file-from-chrome-extension
//http://stackoverflow.com/questions/21314897/access-dom-elements-through-chrome-extension

/* A function creator for callbacks */
function doStuffWithDOM(element) {
  //alert("I received the following DOM content:\n" + element);
}

function createPlayerWithoutFinalPriceView() {

  var playersDb = new PouchDB('http://localhost:5984/hattrick');

  var noFinalPriceDoc = {
    _id: '_design/no_final_price',
    views: {
      no_final_price: {
        map: function (doc) {
          if ( doc.finalPrice === undefined ) {
            emit(doc.deadline);
          }
        }.toString()
      }
    }
  };

  return playersDb.put(noFinalPriceDoc).then( ()=>{
    console.error('created view');
  } ).catch(function (err) {
    if (err.name !== 'conflict') {
      throw err;
    }
    // ignore if doc already exists
  });

};

function createSkillsView() {

  var playersDb = new PouchDB('http://localhost:5984/hattrick');

  var skillsDoc = {
    _id: '_design/skillsView',
    views: {
      defending: {
        map: function (doc) {
          if ( doc.finalPrice !== undefined && doc.finalPrice !== 'UNSOLD') {
            emit([doc.age, doc.defending, doc.passing, doc.playmaking, doc.winger], doc.finalPrice);
          }
        }.toString(),
        reduce: '_stats'
      },
      playmaking: {
        map: function (doc) {
          if ( doc.finalPrice !== undefined && doc.finalPrice !== 'UNSOLD') {
            emit([doc.age, doc.playmaking, doc.passing, doc.defending, doc.winger], doc.finalPrice);
          }
        }.toString(),
        reduce: '_stats'
      }
    }
  };

  return playersDb.put(skillsDoc).then( ()=>{
    console.error('created skillsDoc view');
  } ).catch(function (err) {
    if (err.name !== 'conflict') {
      throw err;
    }
    // ignore if doc already exists
  });

};


// http://stackoverflow.com/questions/5731193/how-to-format-numbers-using-javascript
function formatNumber(number) {
  number = number.toFixed(2) + '';
  let x = number.split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
};


var review = true;


if ( review ) {

  chrome.browserAction.onClicked.addListener( (aTab) => {

    var playersDb = new PouchDB('http://localhost:5984/hattrick');

    // playersDb.query('skillsView/defending', {
    //   key: [21, 11, 0, 0, 0], group: true
    // }).then(function (result) {
    //   console.error('result', result)
    // }).catch(function (err) {
    //   console.error('err', err)
    // });

    playersDb.query(function (doc) {
      if ( doc.price < doc.priceForProfit2days &&
           doc.price < 400000 &&
           doc.finalPrice === undefined ) {
        emit(doc);
      }
    }, {}).then(function (result) {
      console.error('PROSPECTIVE BUYS');
      console.error('result', result);
      var playerList = result.rows;
      playerList = playerList.sort( ( firstPlayer, secondPlayer ) => {
        var firstDate = new Date(firstPlayer.key.deadline);
        var secondDate = new Date(secondPlayer.key.deadline);
        return firstDate - secondDate;
      });
      for (var index in playerList) {
        console.info('player',
                      playerList[index].key.deadline,
                      playerList[index].id,
                      formatNumber(Number(playerList[index].key.price)),
                      formatNumber(Number(playerList[index].key.priceForProfit2days)));
      }
    }).catch(function (err) {
      console.error('err', err);
    });


    playersDb.query(function (doc) {
      if ( doc.finalPrice !== undefined &&
           doc.finalPrice !== 'UNSOLD'  &&
           doc.priceForProfit2days !== undefined ) {
        emit(doc);
      }
    }, {}).then(function (result) {
      console.error('CHECK ON PAST EVALUATIONS');
      console.error('result', result);
      var playerList = result.rows;
      playerList.sort( ( firstPlayer, secondPlayer ) => {
        var firstDate = new Date(firstPlayer.key.deadline);
        var secondDate = new Date(secondPlayer.key.deadline);
        return firstDate - secondDate;
      });
      for (var index in playerList) {
        if ( playerList[index].key.priceForProfit2days - playerList[index].key.finalPrice > 0 ) {
          console.info('player',
                        playerList[index].key.deadline,
                        playerList[index].id,
                        formatNumber(Number(playerList[index].key.finalPrice)),
                        formatNumber(Number(playerList[index].key.priceForProfit2days - playerList[index].key.finalPrice)));
        } else {
          console.warn('player',
                        playerList[index].key.deadline,
                        playerList[index].id,
                        formatNumber(Number(playerList[index].key.finalPrice)),
                        formatNumber(Number(playerList[index].key.priceForProfit2days - playerList[index].key.finalPrice)));
        }
      }
    }).catch(function (err) {
      console.error('err', err);
    });

    // playersDb.compact().then( ( result ) => {
    //   console.error(result);
    // }).catch(function (err) {
    //   console.log(err);
    // });

  });

} else {

  chrome.browserAction.onClicked.addListener( (aTab) => {

    var searchesDb = new PouchDB('http://localhost:5984/hattrick_searches');

    searchesDb.destroy().then( () => {
      searchesDb = new PouchDB('http://localhost:5984/hattrick_searches');

      var searches = [
        {defending: {min: 11, max: 11}, passing: {max: 5}, age: {min: 20, max: 20}},
        {defending: {min: 11, max: 11}, passing: {max: 5}, age: {min: 21, max: 21}},
        {defending: {min: 11, max: 11}, passing: {max: 5}, age: {min: 22, max: 22}},
        {defending: {min: 11, max: 11}, passing: {max: 5}, age: {min: 23, max: 25}},
        {defending: {min: 11, max: 11}, passing: {min: 6, max: 6}, age: {min: 20, max: 22}},
        {defending: {min: 11, max: 11}, passing: {min: 7, max: 7}, age: {min: 20, max: 22}},
        {defending: {min: 11, max: 11}, passing: {min: 6, max: 6}, age: {min: 23, max: 25}},
        {defending: {min: 11, max: 11}, passing: {min: 7, max: 7}, age: {min: 23, max: 25}},
        {defending: {min: 11, max: 11}, passing: {min: 8, max: 8}, age: {min: 20, max: 25}},
        {defending: {min: 11, max: 11}, passing: {min: 9, max: 15}, age: {min: 21, max: 26}},
        {defending: {min: 12, max: 12}, passing: {max: 5}, age: {min: 20, max: 20}},
        {defending: {min: 12, max: 12}, passing: {max: 5}, age: {min: 21, max: 21}},
        {defending: {min: 12, max: 12}, passing: {max: 5}, age: {min: 22, max: 22}},
        {defending: {min: 12, max: 12}, passing: {max: 5}, age: {min: 23, max: 25}},
        {defending: {min: 12, max: 12}, passing: {min: 6, max: 6}, age: {min: 20, max: 22}},
        {defending: {min: 12, max: 12}, passing: {min: 7, max: 7}, age: {min: 20, max: 22}},
        {defending: {min: 12, max: 12}, passing: {min: 6, max: 6}, age: {min: 23, max: 25}},
        {defending: {min: 12, max: 12}, passing: {min: 7, max: 7}, age: {min: 23, max: 25}},
        {defending: {min: 12, max: 12}, passing: {min: 8, max: 8}, age: {min: 20, max: 25}},
        {defending: {min: 12, max: 12}, passing: {min: 9, max: 15}, age: {min: 21, max: 26}},
        {defending: {min: 13, max: 13}, passing: {max: 5}, age: {min: 20, max: 20}},
        {defending: {min: 13, max: 13}, passing: {max: 5}, age: {min: 21, max: 21}},
        {defending: {min: 13, max: 13}, passing: {max: 5}, age: {min: 22, max: 22}},
        {defending: {min: 13, max: 13}, passing: {max: 5}, age: {min: 23, max: 25}},
        {defending: {min: 13, max: 13}, passing: {min: 6, max: 6}, age: {min: 20, max: 22}},
        {defending: {min: 13, max: 13}, passing: {min: 7, max: 7}, age: {min: 20, max: 22}},
        {defending: {min: 13, max: 13}, passing: {min: 6, max: 6}, age: {min: 23, max: 25}},
        {defending: {min: 13, max: 13}, passing: {min: 7, max: 7}, age: {min: 23, max: 25}},
        {defending: {min: 13, max: 13}, passing: {min: 8, max: 8}, age: {min: 20, max: 25}},
        {defending: {min: 13, max: 13}, passing: {min: 9, max: 15}, age: {min: 21, max: 26}},
        {defending: {min: 14, max: 14}, passing: {max: 5}, age: {min: 20, max: 20}},
        {defending: {min: 14, max: 14}, passing: {max: 5}, age: {min: 21, max: 21}},
        {defending: {min: 14, max: 14}, passing: {max: 5}, age: {min: 22, max: 22}},
        {defending: {min: 14, max: 14}, passing: {max: 5}, age: {min: 23, max: 25}},
        {defending: {min: 14, max: 14}, passing: {min: 6, max: 6}, age: {min: 20, max: 22}},
        {defending: {min: 14, max: 14}, passing: {min: 7, max: 7}, age: {min: 20, max: 22}},
        {defending: {min: 14, max: 14}, passing: {min: 6, max: 6}, age: {min: 23, max: 25}},
        {defending: {min: 14, max: 14}, passing: {min: 7, max: 7}, age: {min: 23, max: 25}},
        {defending: {min: 14, max: 14}, passing: {min: 8, max: 8}, age: {min: 20, max: 25}},
        {defending: {min: 14, max: 14}, passing: {min: 9, max: 15}, age: {min: 21, max: 26}},
      ];

      var promises = [];

      var id = 0;
      for (var index in searches) {
        searches[index]['_id'] = String(id);
        id = id + 1;
        promises.push( searchesDb.put(searches[index]) );
      }

      promises.push( createPlayerWithoutFinalPriceView() );
      promises.push( createSkillsView() );

      var stateDb = new PouchDB('http://localhost:5984/hattrick_state');

      Promise.all( promises ).then( () => {
        stateDb.get('state').then( ( currentState ) => {
          console.error('background currentState', currentState);
          if ( currentState && currentState.state === 'INACTIVE' ) {
            currentState.state = 'PLAYERS_CHECK';
            stateDb.put( currentState ).then( () => {
              chrome.tabs.sendMessage(aTab.id, {}, doStuffWithDOM);
            });
          } else {
            console.error('state is not inactive');
          }
        }).catch( ( error ) => {
        console.error('evil cach');
          stateDb.put({_id: 'state', state: 'PLAYERS_CHECK'}).then( () => {
            console.error('create state for 1st time');
            chrome.tabs.sendMessage(aTab.id, {}, doStuffWithDOM);
          });
        });
      });

    });

  });

}




  //chrome.tabs.create({'url': 'http://chilloutandwatchsomecatgifs.com/', 'active': true});

  // chrome.extension.getBackgroundPage().console.log('foo');
  // chrome.extension.getBackgroundPage().console.log(aTab);

// chrome.browserAction.onClicked.addListener(function(aTab) {
//   chrome.tabs.query({'url': 'http://chilloutandwatchsomecatgifs.com/'}, (tabs) => {
//     if (tabs.length === 0) {
//       // There is no catgif tab!
//       chrome.tabs.create({'url': 'http://chilloutandwatchsomecatgifs.com/', 'active': true});
//     } else {
//       // Do something here…
//       chrome.tabs.query({'url': 'http://chilloutandwatchsomecatgifs.com/', 'active': true}, (active) => {
//         if (active.length === 0) {
//           chrome.tabs.update(tabs[0].id, {'active': true});
//         }
//       });
//     }
//   });
// });


/* When the browser-action button is clicked... */
// chrome.browserAction.onClicked.addListener(function(tab) {
//   console.error('tab', tab);
// });
