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
  
  var r = {
  	feedLife: 60,
    feedParams: {
      competition: cid,
      season: SEASON,
      sport: SPORT
    }
	};
  
	var dataDef = new $jqOpta.Deferred;
  dataDef.done(function(a) {
  	var gamesNode = document.getElementById('games');
    var OptaDocument = a.OptaFeed.OptaDocument;
    
    // get teams by id
    var Team = a.OptaFeed.OptaDocument.Team;
    var Teams = {};
    Team.forEach(function(t) {
    	var teamId = t['@attributes']['uID'].match(/\d+/)[0];
      Teams[teamId] = t['Name'];
    });

    var MatchData = OptaDocument.MatchData;
    var matches = {};
    MatchData.forEach(function(md) {
      var homeTeam = {};
      var awayTeam = {};
      var TeamData = md['TeamData'];
      TeamData.forEach(function(td) {
      	td = td['@attributes'];
        var t = (td['Side']=="Home")?homeTeam:awayTeam;
        t['id'] = td['TeamRef'].match(/\d+/)[0];
        t['name'] = Teams[t['id']];
        t['score'] = td['Score'];
        t['halfScore'] = td['HalfScore'];
      });

      var MatchInfo = md['MatchInfo'];
      var gameId = md['@attributes']['uID'].match(/\d+/)[0];  
      matches[gameId] = {
      	gameId: gameId,
      	date: MatchInfo['Date'],
        matchDay: MatchInfo['@attributes']['MatchDay'],
        matchWinner: MatchInfo['@attributes']['MatchWinner'],
        homeTeamId: homeTeam['id'],
        awayTeamId: awayTeam['id'],
        homeTeamName: homeTeam['name'],
        awayTeamName: awayTeam['name'],
        homeScore: homeTeam['score'],
        awayScore: awayTeam['score'],
        period: MatchInfo['@attributes']['Period']
      };
    });
    
    while(gamesNode.hasChildNodes()) {
      gamesNode.removeChild(gamesNode.childNodes[0]);
    }
    
    var th = document.createElement("tr");
    th.innerHTML = "<th>id</th>";
    th.innerHTML += "<th>date</th>";
    th.innerHTML += "<th>day</th>";
    th.innerHTML += "<th>period</th>";
    th.innerHTML += "<th>home</th>";
    th.innerHTML += "<th>away</th>";
    th.innerHTML += "<th>home score</th>";
    th.innerHTML += "<th>away score</th>";
    gamesNode.appendChild(th);
    
    for(var id in matches) {
    	var m = matches[id];
      var hs = (m.homeScore!=null)?m.homeScore:"no score";
      var as = (m.awayScore!=null)?m.awayScore:"no score";
      var tr = document.createElement("tr");
      tr.innerHTML = "<td>"+m.gameId+"</td>";
      tr.innerHTML += "<td>"+m.date+"</td>";
      tr.innerHTML += "<td>"+m.matchDay+"</td>";
      tr.innerHTML += "<td>"+m.period+"</td>";
      tr.innerHTML += "<td>"+m.homeTeamName+"</td>";
      tr.innerHTML += "<td>"+m.awayTeamName+"</td>";
      tr.innerHTML += "<td>"+hs+"</td>";
      tr.innerHTML += "<td>"+as+"</td>";
      gamesNode.appendChild(tr);
    }
  });
  
  var f = new $jqOpta.FeedRequest(
    $jqOpta.FeedRequest.FEED_F1,
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