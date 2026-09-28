/*
 * NFL roster for the Full 9 Yards Tier List Maker's Team Browser.
 *
 * Unlike teams-data.js (FBS college football), NFL divisions are a fixed,
 * long-standing structure — 8 divisions of 4 teams, 32 teams total — and
 * don't need the same kind of weekly/seasonal re-verification.
 *
 * Same shape as window.F9Y_TEAMS so the Team Browser's existing filter/
 * search/render code works unchanged against either roster:
 *   - `conf`  holds the division (e.g. "AFC East")
 *   - `tier`  holds the conference (AFC / NFC)
 *   - `colors` is [primary, secondary] hex, used for the fallback chip
 *     gradient when a team has no logo file
 *
 * Real logos for teams included in the original asset upload live at
 * assets/logos/nfl/<slugified-team-name>.png (see slugify() in app.js).
 * Denver Broncos and Kansas City Chiefs had no logo file in that upload
 * and fall back to a colored initials chip like any team missing a local
 * file — drop a PNG named accordingly into assets/logos/nfl/ to fix that.
 */
window.F9Y_NFL_TEAMS = [
  { name: 'Buffalo Bills', abbr: 'BUF', conf: 'AFC East', tier: 'AFC', colors: ['#00338D', '#C60C30'] },
  { name: 'Miami Dolphins', abbr: 'MIA', conf: 'AFC East', tier: 'AFC', colors: ['#008E97', '#FC4C02'] },
  { name: 'New England Patriots', abbr: 'NE', conf: 'AFC East', tier: 'AFC', colors: ['#002244', '#C60C30'] },
  { name: 'New York Jets', abbr: 'NYJ', conf: 'AFC East', tier: 'AFC', colors: ['#125740', '#FFFFFF'] },

  { name: 'Baltimore Ravens', abbr: 'BAL', conf: 'AFC North', tier: 'AFC', colors: ['#241773', '#000000'] },
  { name: 'Cincinnati Bengals', abbr: 'CIN', conf: 'AFC North', tier: 'AFC', colors: ['#FB4F14', '#000000'] },
  { name: 'Cleveland Browns', abbr: 'CLE', conf: 'AFC North', tier: 'AFC', colors: ['#311D00', '#FF3C00'] },
  { name: 'Pittsburgh Steelers', abbr: 'PIT', conf: 'AFC North', tier: 'AFC', colors: ['#FFB612', '#101820'] },

  { name: 'Houston Texans', abbr: 'HOU', conf: 'AFC South', tier: 'AFC', colors: ['#03202F', '#A71930'] },
  { name: 'Indianapolis Colts', abbr: 'IND', conf: 'AFC South', tier: 'AFC', colors: ['#002C5F', '#A2AAAD'] },
  { name: 'Jacksonville Jaguars', abbr: 'JAX', conf: 'AFC South', tier: 'AFC', colors: ['#101820', '#D7A22A'] },
  { name: 'Tennessee Titans', abbr: 'TEN', conf: 'AFC South', tier: 'AFC', colors: ['#0C2340', '#4B92DB'] },

  { name: 'Denver Broncos', abbr: 'DEN', conf: 'AFC West', tier: 'AFC', colors: ['#FB4F14', '#002244'] },
  { name: 'Kansas City Chiefs', abbr: 'KC', conf: 'AFC West', tier: 'AFC', colors: ['#E31837', '#FFB81C'] },
  { name: 'Las Vegas Raiders', abbr: 'LV', conf: 'AFC West', tier: 'AFC', colors: ['#000000', '#A5ACAF'] },
  { name: 'Los Angeles Chargers', abbr: 'LAC', conf: 'AFC West', tier: 'AFC', colors: ['#0080C6', '#FFC20E'] },

  { name: 'Dallas Cowboys', abbr: 'DAL', conf: 'NFC East', tier: 'NFC', colors: ['#041E42', '#869397'] },
  { name: 'New York Giants', abbr: 'NYG', conf: 'NFC East', tier: 'NFC', colors: ['#0B2265', '#A71930'] },
  { name: 'Philadelphia Eagles', abbr: 'PHI', conf: 'NFC East', tier: 'NFC', colors: ['#004C54', '#A5ACAF'] },
  { name: 'Washington Commanders', abbr: 'WAS', conf: 'NFC East', tier: 'NFC', colors: ['#5A1414', '#FFB612'] },

  { name: 'Chicago Bears', abbr: 'CHI', conf: 'NFC North', tier: 'NFC', colors: ['#0B162A', '#C83803'] },
  { name: 'Detroit Lions', abbr: 'DET', conf: 'NFC North', tier: 'NFC', colors: ['#0076B6', '#B0B7BC'] },
  { name: 'Green Bay Packers', abbr: 'GB', conf: 'NFC North', tier: 'NFC', colors: ['#203731', '#FFB612'] },
  { name: 'Minnesota Vikings', abbr: 'MIN', conf: 'NFC North', tier: 'NFC', colors: ['#4F2683', '#FFC62F'] },

  { name: 'Atlanta Falcons', abbr: 'ATL', conf: 'NFC South', tier: 'NFC', colors: ['#A71930', '#000000'] },
  { name: 'Carolina Panthers', abbr: 'CAR', conf: 'NFC South', tier: 'NFC', colors: ['#0085CA', '#101820'] },
  { name: 'New Orleans Saints', abbr: 'NO', conf: 'NFC South', tier: 'NFC', colors: ['#D3BC8D', '#101820'] },
  { name: 'Tampa Bay Buccaneers', abbr: 'TB', conf: 'NFC South', tier: 'NFC', colors: ['#D50A0A', '#34302B'] },

  { name: 'Arizona Cardinals', abbr: 'ARI', conf: 'NFC West', tier: 'NFC', colors: ['#97233F', '#000000'] },
  { name: 'Los Angeles Rams', abbr: 'LAR', conf: 'NFC West', tier: 'NFC', colors: ['#003594', '#FFA300'] },
  { name: 'San Francisco 49ers', abbr: 'SF', conf: 'NFC West', tier: 'NFC', colors: ['#AA0000', '#B3995D'] },
  { name: 'Seattle Seahawks', abbr: 'SEA', conf: 'NFC West', tier: 'NFC', colors: ['#002244', '#69BE28'] }
];
