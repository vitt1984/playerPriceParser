'use strict';

/*global chrome:false */

// chrome.browserAction.setBadgeText({text: '(ツ)'});
// chrome.browserAction.setBadgeBackgroundColor({color: '#eae'});

//http://stackoverflow.com/questions/28858027/how-to-read-file-from-chrome-extension
//http://stackoverflow.com/questions/21314897/access-dom-elements-through-chrome-extension

/* A function creator for callbacks */
function doStuffWithDOM(element) {
    alert("I received the following DOM content:\n" + element);
}

chrome.browserAction.onClicked.addListener(function(aTab) {
  //chrome.tabs.create({'url': 'http://chilloutandwatchsomecatgifs.com/', 'active': true});

  var searchesDb = new PouchDB('http://localhost:5984/hattrick_searches');

  searchesDb.put({
    _id: '2',
    defending: {
      min: 14,
      max: 17
    },
    age: {
      min: 23,
      max: 27
    }
  });

  searchesDb.put({
    _id: '3',
    playmaking: {
      min: 14,
      max: 17
    },
    age: {
      min: 23,
      max: 27
    }
  });

  // chrome.extension.getBackgroundPage().console.log('foo');
  // chrome.extension.getBackgroundPage().console.log(aTab);
  // chrome.tabs.sendMessage(aTab.id, { text: "report_back" },
  //                         doStuffWithDOM);
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
