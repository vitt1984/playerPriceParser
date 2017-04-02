// Shared functions

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

function execRegex ( regex, text ){
  let result = regex.exec( text);
  // http://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
  // due to a bug, we call the regex a second time
  regex.exec( text );
  return result;
}

function getPlayerId( source ) {

  let playerIdMatch = execRegex( playerIdRegex, source );
  var playerid = undefined;
  if ( playerIdMatch ) {
    playerid = playerIdMatch[1];
  }

  return playerid;
}

function getPlayerAge( transferPlayerInfo ) {

  let ageMatch = execRegex( playerAgeRegex, transferPlayerInfo.outerText );
  var age = undefined;
  if ( ageMatch ) {
    age = Number(ageMatch[1]);
  }

  return age;
}

function getDeadline( transferPlayerInfo ) {

  let deadlineMatch = execRegex( deadlineRegex, transferPlayerInfo.outerText );
  var deadline = undefined;
  if ( deadlineMatch ) {
    deadline = new Date (deadlineMatch[3].concat('-', deadlineMatch[2], '-', deadlineMatch[1], 'T',
                         deadlineMatch[4], ':', deadlineMatch[5], ':00'));
  }

  return deadline;
}

function getPlayerInfo( transferPlayerInfo ) {
  let playerProps = {};

  for (var property in playerProperties) {
    let matchingRegex = execRegex( playerProperties[property].regex, transferPlayerInfo.outerText );
    if ( matchingRegex ) {
      if ( playerProperties[property].numeric ) {
        value = Number(matchingRegex[1].replace(/\s/g, ''));
      } else {
        value = matchingRegex[1].replace(/^\s/g, '').replace(/\s$/g, '');
        if ( value in propertiesValues ) {
          value = propertiesValues[value];
        } else {
          console.warn('value', value,'could not be translated into numeric, saving raw');
        }
      }
      if ( playerProperties[property].modifier ) {
        value = playerProperties[property].modifier( value );
      }
      playerProps[property] = value;
    } else {
    }
  }

  return playerProps;
}

function getSkillsKey( player ) {
  var sortedSkills = [];
  for (property in player) {
    if ( playerProperties[property] !== undefined && playerProperties[property].skill ) {
      sortedSkills.push({ skill: property, value: player[property] });
    }
  }

  sortedSkills.sort( ( firstSkill, secondSkill ) => {
    return Number(firstSkill.value) < Number(secondSkill.value);
  });

  var keys = [];

  for (var index in sortedSkills) {
    var skill = sortedSkills[index].skill;
    var keySkills = skillsView[skill];
    if (keySkills !== undefined) {
      for (var index in keySkills) {
        var key = keySkills[index];
        keys.push(key);
      }
      return keys;
    }
  }
  return undefined;
}

function setIndexFromValue( elementId, value, valueMapping ) {
  let element = document.getElementById( elementId );
  let optionsArray = Array.from(element.options);
  let index = optionsArray.findIndex( ( option ) => {
    if ( valueMapping ) {
      console.info('translating value', option.text.toLowerCase(), valueMapping[option.text.toLowerCase()], value);
      return valueMapping[option.text.toLowerCase()] === value;
    } else if ( isNaN(option.text) ) {
      console.info('lowercasing value', option.text.toLowerCase(), value);
      return option.text.toLowerCase() === value;
    } else {
      console.info('value', Number(option.text), value);
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

function delayedNavigation( navigationAction ) {
  let interval = getRandomInt(3000, 6000);
  console.info('will navigate after', interval);
  setTimeout( () => {
    navigationAction();
  }, interval);
}
