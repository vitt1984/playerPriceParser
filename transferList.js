var stateDb = new PouchDB('http://localhost:5984/hattrick_state');

stateDb.get('state').then( ( currentState ) => {

  if ( currentState && currentState.state === 'TRANSFER_CHECK' && transferResultPage.exec(window.location.href) ) {

    console.info('Gathering info on players price...');

    var playersDb = new PouchDB('http://localhost:5984/hattrick');

    var transferPlayerInfoList = document.getElementsByClassName('transferPlayerInfo');
    var playerList = [];

    var promises = [];

    for ( index in transferPlayerInfoList ) {
      let transferPlayerInfo = transferPlayerInfoList[index];

      let player = {
        '_id': getPlayerId( transferPlayerInfo.outerHTML ),
        'age': getPlayerAge( transferPlayerInfo ),
        'deadline': getDeadline( transferPlayerInfo ),
        'finalPrice': undefined
      };

      if ( player.deadline ) {
        Object.assign(player, getPlayerInfo( transferPlayerInfo ));

        var varSkills = getSkillsKey(player);
        var varSkillsKey = varSkills.map( (key) => {
          return player[key];
        });

        let promise = playersDb.query('skillsView/'.concat(varSkills[1]), {
          key: varSkillsKey, group: true
        }).then(function (result) {
          if ( result.rows.length > 0 ) {
            let averagePrice = result.rows[0].value.sum / result.rows[0].value.count;
            player['priceForProfit2days'] = averagePrice * 0.85 - 100000;
            player['priceForProfit5days'] = averagePrice * 0.86 - 100000;
            player['priceExamplesCount'] = result.rows[0].value.count;
          } else {
            console.warn('could not determine best price');
          }
          console.info('result', result);
          playerList.push(player);
        }).catch(function (err) {
          console.error('Query for skillsview failed with error:', err);
        });

        promises.push(promise);
      }
    }

    Promise.all( promises ).then( () => {
      playersDb.bulkDocs(playerList).then( () => {
        nextPageLink = document.getElementById('ctl00_ctl00_CPContent_CPMain_ucPager2_next');
        if ( nextPageLink && !nextPageLink.hasAttribute('disabled') ) {
          delayedNavigation( () => { nextPageLink.click(); });
        } else {
          transferSearchLink = document.getElementById('ctl00_ctl00_CPContent_ucSubMenu_A4');
          if ( transferSearchLink ) {
            delayedNavigation( () => { transferSearchLink.click(); });
          }
        }
      });
    });

  }
}).catch( () => {
  console.warn('state is not set');
});