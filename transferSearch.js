
// CONSTANTS
let propertiesValues = {
  // skills
  'divine'            : 20,
  'utopian'           : 19,
  'magical'           : 18,
  'mythical'          : 17,
  'extra-terrestrial' : 16,
  'titanic'           : 15,
  'supernatural'      : 14,
  'world class'       : 13,
  'magnificent'       : 12,
  'brilliant'         : 11,
  'outstanding'       : 10,
  'formidable'        : 9,
  'excellent'         : 8,
  'solid'             : 7,
  'passable'          : 6,
  'inadequate'        : 5,
  'weak'              : 0,
  'poor'              : 0,
  'wretched'          : 0,
  'disastrous'        : 0,
  'non-existent'      : 0,
  // specialties
  'Technical'     : 5,
  'Quick'         : 4,
  'Head'          : 3,
  'Powerful'      : 2,
  'Unpredictable' : 1,
  'Regainer'      : 0
};

var transferSearchPage = /hattrick\.org\/World\/Transfers\/$/g;

// FUNCTIONS

function setIndexFromValue( elementId, value, valueMapping ) {
  let element = document.getElementById( elementId );
  let optionsArray = Array.from(element.options);
  let index = optionsArray.findIndex( ( option ) => {
    if ( valueMapping ) {
      console.error('translating value', option.text.toLowerCase(), valueMapping[option.text.toLowerCase()], value);
      return valueMapping[option.text.toLowerCase()] === value;
    } else if ( isNaN(option.text) ) {
      console.error('lowercasing value', option.text.toLowerCase(), value);
      return option.text.toLowerCase() === value;
    } else {
      console.error('value', Number(option.text), value);
      return Number(option.text) === value;
    }
  });
  element.selectedIndex = index;
}

// from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function delayedURLNavigation( url ) {
  let interval = getRandomInt(3000, 6000);
  console.error('will navigate to', url, 'after', interval);
  setTimeout( () => {
    window.location.href = url;
  }, interval );
}

// MAIN

// first check for players to add final price

var stateDb = new PouchDB('http://localhost:5984/hattrick_state');
stateDb.get('state').then( ( currentState ) => {

  if ( currentState && currentState.state === 'TRANSFER_CHECK' && transferSearchPage.exec(window.location.href) ) {

    console.error('test transferSearch.js');

    var searchesDb = new PouchDB('http://localhost:5984/hattrick_searches');

    // get requested searches
    searchesDb.allDocs({include_docs: true, limit: 1}).then( (searches) => {
      if ( searches.rows.length > 0 ) {
        let search = searches.rows[0].doc;
        console.error('doing search', search);
        searchesDb.remove( search._id, search._rev );

        delete search._id;
        delete search._rev;

        setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlAgeMin', search.age.min);
        setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlAgeMax', search.age.max);

        let counter = 1;
        for ( property in search )  {
          if (property !== 'age') {
            console.error('setting', property, search[property]);
            setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter), property);
            console.error('setting min', property, search[property]);
            setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter, 'Min'), search[property].min, propertiesValues);
            console.error('setting max', property, search[property]);
            setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter, 'Max'), search[property].max, propertiesValues);
          }
          counter = counter + 1;
        }
        document.getElementById('ctl00_ctl00_CPContent_CPMain_butSearch').click();
      } else {
        console.error('no search to perform');
        currentState.state = 'INACTIVE';
        stateDb.put(currentState);
      }

    });

  }
}).catch( () => {
  console.warn('state is not set');
});

