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
            var now = new Date();
            var deadline = new Date( doc.deadline );
            if ( ((now - deadline)/1000) > 300 ) {
              // if deadline was at least 5 minutes ago
              emit(doc._id);
            }
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



chrome.browserAction.onClicked.addListener( (aTab) => {

  var searchesDb = new PouchDB('http://localhost:5984/hattrick_searches');

  searchesDb.destroy().then( () => {
    searchesDb = new PouchDB('http://localhost:5984/hattrick_searches');

    var searches = [
      // {defending: {min: 11, max: 11}, passing: {max: 5}, age: {min: 20, max: 25}},
      // {defending: {min: 11, max: 11}, passing: {min: 6, max: 6}, age: {min: 20, max: 25}},
      // {defending: {min: 11, max: 11}, passing: {min: 7, max: 7}, age: {min: 20, max: 25}},
      // {defending: {min: 11, max: 11}, passing: {min: 8, max: 8}, age: {min: 20, max: 25}},
      // {defending: {min: 11, max: 11}, passing: {min: 9, max: 15}, age: {min: 21, max: 26}},
      // {defending: {min: 12, max: 12}, passing: {max: 5}, age: {min: 20, max: 25}},
      // {defending: {min: 12, max: 12}, passing: {min: 6, max: 6}, age: {min: 20, max: 25}},
      // {defending: {min: 12, max: 12}, passing: {min: 7, max: 7}, age: {min: 20, max: 25}},
      // {defending: {min: 12, max: 12}, passing: {min: 8, max: 8}, age: {min: 20, max: 25}},
      // {defending: {min: 12, max: 12}, passing: {min: 9, max: 15}, age: {min: 21, max: 26}},
      // {defending: {min: 13, max: 13}, passing: {max: 5}, age: {min: 20, max: 25}},
      // {defending: {min: 13, max: 13}, passing: {min: 6, max: 6}, age: {min: 20, max: 25}},
      // {defending: {min: 13, max: 13}, passing: {min: 7, max: 7}, age: {min: 20, max: 25}},
      // {defending: {min: 13, max: 13}, passing: {min: 8, max: 8}, age: {min: 20, max: 25}},
      // {defending: {min: 13, max: 13}, passing: {min: 9, max: 15}, age: {min: 21, max: 26}},
      // {defending: {min: 14, max: 14}, passing: {max: 5}, age: {min: 20, max: 25}},
      // {defending: {min: 14, max: 14}, passing: {min: 6, max: 6}, age: {min: 20, max: 25}},
      // {defending: {min: 14, max: 14}, passing: {min: 7, max: 7}, age: {min: 20, max: 25}},
      // {defending: {min: 14, max: 14}, passing: {min: 8, max: 8}, age: {min: 20, max: 25}},
      {defending: {min: 14, max: 14}, passing: {min: 9, max: 15}, age: {min: 21, max: 26}},
    ];

    var promises = [];

    var id = 0;
    for (var index in searches) {
      searches[index]['_id'] = String(id);
      id = id + 1;
      promises.push( searchesDb.put(searches[index]) );
    }

    promises.push( createPlayerWithoutFinalPriceView );

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

  //chrome.tabs.create({'url': 'http://chilloutandwatchsomecatgifs.com/', 'active': true});

  // chrome.extension.getBackgroundPage().console.log('foo');
  // chrome.extension.getBackgroundPage().console.log(aTab);
});

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
