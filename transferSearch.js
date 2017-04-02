var transferSearchPage = /hattrick\.org\/World\/Transfers\/$/g;

// first check for players to add final price

var stateDb = new PouchDB('http://localhost:5984/hattrick_state');
stateDb.get('state').then( ( currentState ) => {

  if ( currentState && currentState.state === 'TRANSFER_CHECK' && transferSearchPage.exec(window.location.href) ) {

    console.info('Setting search info..');

    var searchesDb = new PouchDB('http://localhost:5984/hattrick_searches');

    // get requested searches
    searchesDb.allDocs({include_docs: true, limit: 1}).then( (searches) => {
      if ( searches.rows.length > 0 ) {
        let search = searches.rows[0].doc;
        console.info('doing search', search);
        searchesDb.remove( search._id, search._rev );

        delete search._id;
        delete search._rev;

        setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlAgeMin', search.age.min);
        setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlAgeMax', search.age.max);

        let counter = 1;
        for ( property in search )  {
          if (property !== 'age') {
            setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter), property);
            setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter, 'Min'), search[property].min, propertiesValues);
            setIndexFromValue('ctl00_ctl00_CPContent_CPMain_ddlSkill'.concat(counter, 'Max'), search[property].max, propertiesValues);
          }
          counter = counter + 1;
        }
        delayedNavigation( () => { document.getElementById('ctl00_ctl00_CPContent_CPMain_butSearch').click(); });
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

