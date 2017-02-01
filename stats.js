// -------------------- CONSTANTS --------------------
const SEASON = "2016";
const SPORT_ID = "1";
const SPORT = "football";

// -------------------- HELPER --------------------
function splitTrans(a) {
	var out = [], a = a.split("¦");
	for (var b = 0; b < a.length; b++) {
    var c = a[b].split("|");
    if (c[1] && c[1].length>0) {
    	out.push({id:c[0],full:c[1],short:c[2],abbr:c[3]});
    }
  }
  return out;
}

function addElement(values, delim, el, id) {
		delim = delim || '', id = id || 'content', el = el || 'div';
		var elem = document.createElement(el);
    elem.innerHTML = values.join(delim);
    document.getElementById(id).appendChild(elem);
}

// -------------------- COMPETITIONS --------------------
var compDef = new $jqOpta.Deferred;
compDef.resolveWith = function(a, b) { a.done(b[0].d); };
compDef.done = function(a) {
	var comps = splitTrans(a);
  comps.forEach(function(comp) {
  	var option = document.createElement("option");
    option.innerHTML = comp.full, option.value = comp.id;
    document.getElementById('comps').appendChild(option);
  });
};

// -------------------- TEAMS --------------------
var teamDef = new $jqOpta.Deferred;
teamDef.resolveWith = function(a, b) { a.done(b[0].d); };
teamDef.done = function(a) {
	var teams = splitTrans(a);
  a = a.split("¦");
  // remove all children
  var c = document.getElementById('teams');
  while (c.firstChild) { c.removeChild(c.firstChild); }
  for (var k in teams) {
  	var option = document.createElement("option");
    option.innerHTML = teams[k].full, option.value = teams[k].id;
    document.getElementById('teams').appendChild(option);
  }
};

// -------------------- COMPS ONCHANGE --------------------
document.getElementById('comps').onchange = function (e) {
	var c = document.getElementById('comps');
  var cid = c.options[c.selectedIndex].value;
  ctParams.competition = String(cid);
  
  var teamRequest = new $jqOpta.FeedRequest(
    $jqOpta.FeedRequest.FEED_TRANS_TEAM,
    ctParams,
    teamDef,
    99999);
  $jqOpta.FeedMonitor.requestFeed(teamRequest);
};

// -------------------- TEAMS ONCHANGE --------------------
document.getElementById('teams').onchange = function (e) {
	var c = document.getElementById('comps');
  var cid = c.options[c.selectedIndex].value;
  var t = document.getElementById('teams');
  var tid = t.options[t.selectedIndex].value;
  
  var r = {
  	feedLife: 60,
    feedParams: {
      competition: cid,
      season: SEASON,
      sport: SPORT,
      team: tid
    }
	};
  
	var dataDef = new $jqOpta.Deferred;
  dataDef.done(function(a) {
  	var Team = a.SeasonStatistics.Team;
    addElement([Team['@attributes'].name]); // add team name
    
    var TeamStat = Team.Stat;
    // remove all children
    var c = document.getElementById('content');
    while (c.firstChild) { c.removeChild(c.firstChild); }
    // output team stats
    TeamStat.forEach(function(o) {
      addElement([o['@attributes'].name, String(o['@value'])], ": ");
    });
    
    var TeamPlayer = Team.Player;
    TeamPlayer.forEach(function(o) {
  	  var a = o['@attributes'];
  	  addElement(['<p></p><b>'+a.first_name+' '+a.last_name+'</b>', a.position], ', ');
      o.Stat.forEach(function(p) {
    	  addElement([p['@attributes'].name, String(p['@value'])], ': ', 'li');
      });
    });
  });
  
  var f = new $jqOpta.FeedRequest(
    $jqOpta.FeedRequest.FEED_F30,
    r.feedParams, // feed params like competition, season, etc.
    dataDef, // result handler object
    r.feedLife, // feed life ??
    r.trn, // trn, maybe translation ??
    r); // request object
  // finally request feed
  $jqOpta.FeedMonitor.requestFeed(f);
};

// -------------------- INITIALIZE --------------------
var ctParams = {
	competition: "",
  cust_id: "default",
  trans_id: $jqOpta.settings.translation_id || 1,
  lang_id: 'en',
  sport_id: SPORT_ID,
  season: SEASON
};

var compRequest = new $jqOpta.FeedRequest(
  $jqOpta.FeedRequest.FEED_TRANS_COMP,
  ctParams,
  compDef,
  99999);
$jqOpta.FeedMonitor.requestFeed(compRequest);