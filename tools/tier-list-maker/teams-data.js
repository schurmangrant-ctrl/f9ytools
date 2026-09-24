/*
  Full FBS team roster for the Team Browser panel.

  Conference realignment moves fast, and the newest moves here (the
  relaunched Pac-12 for the 2026 season, and the resulting Mountain West
  shake-up) are the parts I'm least confident are 100% current — double
  check the "Mountain West" and "Pac-12" sections below before relying on
  them for real content, and edit freely; this is a plain array.

  `logo` is intentionally left null — no real logo files/URLs are baked
  in yet. Until real logos are wired in (via assets/logos/<team>.png or
  an imported team_logo_lookup()-style URL map), the Team Browser shows a
  colored initials chip using each team's `colors`, so the feature works
  end-to-end today and just needs logos dropped in later.

  Shape: { name, abbr, conf, tier, colors: [primary, secondary], aliases? }
  tier: 'P4' (Power Four: ACC/Big Ten/Big 12/SEC), 'G6' (Group of Six),
        or 'IND' (independent)
  aliases: alternate names to help match an imported logo map whose keys
           might not exactly match `name` (e.g. cfbd's "school" strings)
*/

window.F9Y_TEAMS = [
  // ---------------- ACC (P4) ----------------
  { name: 'Boston College', abbr: 'BC', conf: 'ACC', tier: 'P4', colors: ['#8C2232', '#C4A64C'] },
  { name: 'California', abbr: 'CAL', conf: 'ACC', tier: 'P4', colors: ['#003262', '#FDB515'], aliases: ['Cal'] },
  { name: 'Clemson', abbr: 'CLEM', conf: 'ACC', tier: 'P4', colors: ['#F56600', '#522D80'] },
  { name: 'Duke', abbr: 'DUKE', conf: 'ACC', tier: 'P4', colors: ['#00539B', '#FFFFFF'] },
  { name: 'Florida State', abbr: 'FSU', conf: 'ACC', tier: 'P4', colors: ['#782F40', '#CEB888'] },
  { name: 'Georgia Tech', abbr: 'GT', conf: 'ACC', tier: 'P4', colors: ['#003057', '#B3A369'] },
  { name: 'Louisville', abbr: 'LOU', conf: 'ACC', tier: 'P4', colors: ['#AD0000', '#000000'] },
  { name: 'Miami', abbr: 'MIA', conf: 'ACC', tier: 'P4', colors: ['#F47321', '#005030'], aliases: ['Miami (FL)', 'Miami Hurricanes'] },
  { name: 'NC State', abbr: 'NCST', conf: 'ACC', tier: 'P4', colors: ['#CC0000', '#FFFFFF'], aliases: ['North Carolina State'] },
  { name: 'North Carolina', abbr: 'UNC', conf: 'ACC', tier: 'P4', colors: ['#7BAFD4', '#FFFFFF'] },
  { name: 'Pittsburgh', abbr: 'PITT', conf: 'ACC', tier: 'P4', colors: ['#003594', '#FFB81C'], aliases: ['Pitt'] },
  { name: 'SMU', abbr: 'SMU', conf: 'ACC', tier: 'P4', colors: ['#C8102E', '#354CA1'], aliases: ['Southern Methodist'] },
  { name: 'Stanford', abbr: 'STAN', conf: 'ACC', tier: 'P4', colors: ['#8C1515', '#FFFFFF'] },
  { name: 'Syracuse', abbr: 'SYR', conf: 'ACC', tier: 'P4', colors: ['#D44500', '#000E54'] },
  { name: 'Virginia', abbr: 'UVA', conf: 'ACC', tier: 'P4', colors: ['#232D4B', '#E57200'] },
  { name: 'Virginia Tech', abbr: 'VT', conf: 'ACC', tier: 'P4', colors: ['#630031', '#CF4420'] },
  { name: 'Wake Forest', abbr: 'WAKE', conf: 'ACC', tier: 'P4', colors: ['#9E7E38', '#000000'] },

  // ---------------- Big Ten (P4) ----------------
  { name: 'Illinois', abbr: 'ILL', conf: 'Big Ten', tier: 'P4', colors: ['#E84A27', '#13294B'] },
  { name: 'Indiana', abbr: 'IU', conf: 'Big Ten', tier: 'P4', colors: ['#990000', '#EEEDEB'] },
  { name: 'Iowa', abbr: 'IOWA', conf: 'Big Ten', tier: 'P4', colors: ['#000000', '#FFCD00'] },
  { name: 'Maryland', abbr: 'UMD', conf: 'Big Ten', tier: 'P4', colors: ['#E21833', '#FFD520'] },
  { name: 'Michigan', abbr: 'MICH', conf: 'Big Ten', tier: 'P4', colors: ['#00274C', '#FFCB05'] },
  { name: 'Michigan State', abbr: 'MSU', conf: 'Big Ten', tier: 'P4', colors: ['#18453B', '#FFFFFF'] },
  { name: 'Minnesota', abbr: 'MINN', conf: 'Big Ten', tier: 'P4', colors: ['#7A0019', '#FFCC33'] },
  { name: 'Nebraska', abbr: 'NEB', conf: 'Big Ten', tier: 'P4', colors: ['#E41C38', '#F5F1E7'] },
  { name: 'Northwestern', abbr: 'NW', conf: 'Big Ten', tier: 'P4', colors: ['#4E2A84', '#FFFFFF'] },
  { name: 'Ohio State', abbr: 'OSU', conf: 'Big Ten', tier: 'P4', colors: ['#BB0000', '#666666'] },
  { name: 'Oregon', abbr: 'ORE', conf: 'Big Ten', tier: 'P4', colors: ['#154733', '#FEE123'] },
  { name: 'Penn State', abbr: 'PSU', conf: 'Big Ten', tier: 'P4', colors: ['#041E42', '#FFFFFF'] },
  { name: 'Purdue', abbr: 'PUR', conf: 'Big Ten', tier: 'P4', colors: ['#CEB888', '#000000'] },
  { name: 'Rutgers', abbr: 'RUTG', conf: 'Big Ten', tier: 'P4', colors: ['#CC0033', '#5F6A72'] },
  { name: 'UCLA', abbr: 'UCLA', conf: 'Big Ten', tier: 'P4', colors: ['#2D68C4', '#F2A900'] },
  { name: 'USC', abbr: 'USC', conf: 'Big Ten', tier: 'P4', colors: ['#990000', '#FFC72C'], aliases: ['Southern California'] },
  { name: 'Washington', abbr: 'WASH', conf: 'Big Ten', tier: 'P4', colors: ['#4B2E83', '#B7A57A'] },
  { name: 'Wisconsin', abbr: 'WISC', conf: 'Big Ten', tier: 'P4', colors: ['#C5050C', '#FFFFFF'] },

  // ---------------- Big 12 (P4) ----------------
  { name: 'Arizona', abbr: 'ARIZ', conf: 'Big 12', tier: 'P4', colors: ['#AB0520', '#0C234B'] },
  { name: 'Arizona State', abbr: 'ASU', conf: 'Big 12', tier: 'P4', colors: ['#8C1D40', '#FFC627'] },
  { name: 'Baylor', abbr: 'BAY', conf: 'Big 12', tier: 'P4', colors: ['#154734', '#FFB81C'] },
  { name: 'BYU', abbr: 'BYU', conf: 'Big 12', tier: 'P4', colors: ['#002E5D', '#FFFFFF'], aliases: ['Brigham Young'] },
  { name: 'Cincinnati', abbr: 'CIN', conf: 'Big 12', tier: 'P4', colors: ['#E00122', '#000000'] },
  { name: 'Colorado', abbr: 'COLO', conf: 'Big 12', tier: 'P4', colors: ['#000000', '#CFB87C'] },
  { name: 'Houston', abbr: 'HOU', conf: 'Big 12', tier: 'P4', colors: ['#C8102E', '#FFFFFF'] },
  { name: 'Iowa State', abbr: 'ISU', conf: 'Big 12', tier: 'P4', colors: ['#C8102E', '#F1BE48'] },
  { name: 'Kansas', abbr: 'KU', conf: 'Big 12', tier: 'P4', colors: ['#0051BA', '#E8000D'] },
  { name: 'Kansas State', abbr: 'KSU', conf: 'Big 12', tier: 'P4', colors: ['#512888', '#FFFFFF'] },
  { name: 'Oklahoma State', abbr: 'OKST', conf: 'Big 12', tier: 'P4', colors: ['#FF7300', '#000000'] },
  { name: 'TCU', abbr: 'TCU', conf: 'Big 12', tier: 'P4', colors: ['#4D1979', '#A3A9AC'], aliases: ['Texas Christian'] },
  { name: 'Texas Tech', abbr: 'TTU', conf: 'Big 12', tier: 'P4', colors: ['#CC0000', '#000000'] },
  { name: 'UCF', abbr: 'UCF', conf: 'Big 12', tier: 'P4', colors: ['#000000', '#BA9B37'], aliases: ['Central Florida'] },
  { name: 'Utah', abbr: 'UTAH', conf: 'Big 12', tier: 'P4', colors: ['#CC0000', '#000000'] },
  { name: 'West Virginia', abbr: 'WVU', conf: 'Big 12', tier: 'P4', colors: ['#EAAA00', '#002855'] },

  // ---------------- SEC (P4) ----------------
  { name: 'Alabama', abbr: 'BAMA', conf: 'SEC', tier: 'P4', colors: ['#9E1B32', '#FFFFFF'] },
  { name: 'Arkansas', abbr: 'ARK', conf: 'SEC', tier: 'P4', colors: ['#9D2235', '#FFFFFF'] },
  { name: 'Auburn', abbr: 'AUB', conf: 'SEC', tier: 'P4', colors: ['#0C2340', '#E87722'] },
  { name: 'Florida', abbr: 'UF', conf: 'SEC', tier: 'P4', colors: ['#0021A5', '#FA4616'] },
  { name: 'Georgia', abbr: 'UGA', conf: 'SEC', tier: 'P4', colors: ['#BA0C2F', '#000000'] },
  { name: 'Kentucky', abbr: 'UK', conf: 'SEC', tier: 'P4', colors: ['#0033A0', '#FFFFFF'] },
  { name: 'LSU', abbr: 'LSU', conf: 'SEC', tier: 'P4', colors: ['#461D7C', '#FDD023'], aliases: ['Louisiana State'] },
  { name: 'Mississippi State', abbr: 'MSST', conf: 'SEC', tier: 'P4', colors: ['#660000', '#FFFFFF'] },
  { name: 'Missouri', abbr: 'MIZ', conf: 'SEC', tier: 'P4', colors: ['#000000', '#F1B82D'] },
  { name: 'Oklahoma', abbr: 'OU', conf: 'SEC', tier: 'P4', colors: ['#841617', '#FDF9D8'] },
  { name: 'Ole Miss', abbr: 'MISS', conf: 'SEC', tier: 'P4', colors: ['#14213D', '#CE1126'], aliases: ['Mississippi'] },
  { name: 'South Carolina', abbr: 'SC', conf: 'SEC', tier: 'P4', colors: ['#73000A', '#000000'] },
  { name: 'Tennessee', abbr: 'TENN', conf: 'SEC', tier: 'P4', colors: ['#FF8200', '#FFFFFF'] },
  { name: 'Texas', abbr: 'TEX', conf: 'SEC', tier: 'P4', colors: ['#BF5700', '#FFFFFF'] },
  { name: 'Texas A&M', abbr: 'TAMU', conf: 'SEC', tier: 'P4', colors: ['#500000', '#FFFFFF'] },
  { name: 'Vanderbilt', abbr: 'VAN', conf: 'SEC', tier: 'P4', colors: ['#000000', '#CFAE70'] },

  // ---------------- American (G6) ----------------
  { name: 'Army', abbr: 'ARMY', conf: 'American', tier: 'G6', colors: ['#000000', '#D4BF91'] },
  { name: 'Charlotte', abbr: 'CLT', conf: 'American', tier: 'G6', colors: ['#046A38', '#FFFFFF'] },
  { name: 'East Carolina', abbr: 'ECU', conf: 'American', tier: 'G6', colors: ['#592A8A', '#FDC82F'] },
  { name: 'Florida Atlantic', abbr: 'FAU', conf: 'American', tier: 'G6', colors: ['#003366', '#CC0000'] },
  { name: 'Memphis', abbr: 'MEM', conf: 'American', tier: 'G6', colors: ['#003087', '#898D8D'] },
  { name: 'Navy', abbr: 'NAVY', conf: 'American', tier: 'G6', colors: ['#00205B', '#C5B783'] },
  { name: 'North Texas', abbr: 'UNT', conf: 'American', tier: 'G6', colors: ['#00853E', '#000000'] },
  { name: 'Rice', abbr: 'RICE', conf: 'American', tier: 'G6', colors: ['#00205B', '#C1C6C8'] },
  { name: 'South Florida', abbr: 'USF', conf: 'American', tier: 'G6', colors: ['#006747', '#CFC493'] },
  { name: 'Temple', abbr: 'TEM', conf: 'American', tier: 'G6', colors: ['#9E1B32', '#FFFFFF'] },
  { name: 'Tulane', abbr: 'TUL', conf: 'American', tier: 'G6', colors: ['#006747', '#418FDE'] },
  { name: 'Tulsa', abbr: 'TLSA', conf: 'American', tier: 'G6', colors: ['#002D72', '#C8B568'] },
  { name: 'UAB', abbr: 'UAB', conf: 'American', tier: 'G6', colors: ['#1E6B52', '#FFC845'] },
  { name: 'UTSA', abbr: 'UTSA', conf: 'American', tier: 'G6', colors: ['#0C2340', '#F15A22'] },

  // ---------------- Conference USA (G6) ----------------
  { name: 'Delaware', abbr: 'DEL', conf: 'Conference USA', tier: 'G6', colors: ['#00539F', '#FFD200'] },
  { name: 'Florida International', abbr: 'FIU', conf: 'Conference USA', tier: 'G6', colors: ['#081E3F', '#B6862C'], aliases: ['FIU'] },
  { name: 'Jacksonville State', abbr: 'JVST', conf: 'Conference USA', tier: 'G6', colors: ['#8C1D40', '#FFFFFF'] },
  { name: 'Kennesaw State', abbr: 'KENN', conf: 'Conference USA', tier: 'G6', colors: ['#000000', '#FFC629'] },
  { name: 'Liberty', abbr: 'LIB', conf: 'Conference USA', tier: 'G6', colors: ['#002D62', '#C41230'] },
  { name: 'Louisiana Tech', abbr: 'LT', conf: 'Conference USA', tier: 'G6', colors: ['#C41230', '#002F6C'] },
  { name: 'Middle Tennessee', abbr: 'MTSU', conf: 'Conference USA', tier: 'G6', colors: ['#0066CC', '#4D4D4F'] },
  { name: 'Missouri State', abbr: 'MOST', conf: 'Conference USA', tier: 'G6', colors: ['#6F263D', '#FFFFFF'] },
  { name: 'New Mexico State', abbr: 'NMSU', conf: 'Conference USA', tier: 'G6', colors: ['#8B0000', '#FFFFFF'] },
  { name: 'Sam Houston', abbr: 'SHSU', conf: 'Conference USA', tier: 'G6', colors: ['#FF6600', '#FFFFFF'] },
  { name: 'UTEP', abbr: 'UTEP', conf: 'Conference USA', tier: 'G6', colors: ['#FF8200', '#041E42'] },
  { name: 'Western Kentucky', abbr: 'WKU', conf: 'Conference USA', tier: 'G6', colors: ['#C60C30', '#FFFFFF'] },

  // ---------------- MAC (G6) ----------------
  { name: 'Akron', abbr: 'AKR', conf: 'MAC', tier: 'G6', colors: ['#041E42', '#A89968'] },
  { name: 'Ball State', abbr: 'BALL', conf: 'MAC', tier: 'G6', colors: ['#BA0C2F', '#FFFFFF'] },
  { name: 'Bowling Green', abbr: 'BGSU', conf: 'MAC', tier: 'G6', colors: ['#4F2C1D', '#FE5000'] },
  { name: 'Buffalo', abbr: 'BUFF', conf: 'MAC', tier: 'G6', colors: ['#005BBB', '#FFFFFF'] },
  { name: 'Central Michigan', abbr: 'CMU', conf: 'MAC', tier: 'G6', colors: ['#6A0032', '#FFC72C'] },
  { name: 'Eastern Michigan', abbr: 'EMU', conf: 'MAC', tier: 'G6', colors: ['#006633', '#FFFFFF'] },
  { name: 'Kent State', abbr: 'KENT', conf: 'MAC', tier: 'G6', colors: ['#002664', '#EAAB00'] },
  { name: 'Miami (OH)', abbr: 'M-OH', conf: 'MAC', tier: 'G6', colors: ['#C41230', '#FFFFFF'], aliases: ['Miami Ohio'] },
  { name: 'Northern Illinois', abbr: 'NIU', conf: 'MAC', tier: 'G6', colors: ['#BA0C2F', '#000000'] },
  { name: 'Ohio', abbr: 'OHIO', conf: 'MAC', tier: 'G6', colors: ['#00694E', '#FFFFFF'] },
  { name: 'Toledo', abbr: 'TOL', conf: 'MAC', tier: 'G6', colors: ['#0A1F63', '#FFC845'] },
  { name: 'Western Michigan', abbr: 'WMU', conf: 'MAC', tier: 'G6', colors: ['#532E1F', '#FFC72C'] },

  // ---------------- Mountain West (G6) ----------------
  // NOTE: several longtime members left for the relaunched Pac-12 below —
  // verify this list is current before relying on it.
  { name: 'Air Force', abbr: 'AF', conf: 'Mountain West', tier: 'G6', colors: ['#003087', '#8A8D8F'] },
  { name: 'Hawaii', abbr: 'HAW', conf: 'Mountain West', tier: 'G6', colors: ['#024731', '#C8C9C7'] },
  { name: 'Nevada', abbr: 'NEV', conf: 'Mountain West', tier: 'G6', colors: ['#003366', '#A2AAAD'] },
  { name: 'New Mexico', abbr: 'UNM', conf: 'Mountain West', tier: 'G6', colors: ['#BA0C2F', '#A7A8AA'] },
  { name: 'San Jose State', abbr: 'SJSU', conf: 'Mountain West', tier: 'G6', colors: ['#0055A2', '#E5A823'] },
  { name: 'Wyoming', abbr: 'WYO', conf: 'Mountain West', tier: 'G6', colors: ['#492F24', '#FFC425'] },
  // Added on a spot-check against a real logo set — Sac State's move to
  // FBS/Mountain West is recent, double check this placement.
  { name: 'Sacramento State', abbr: 'SAC', conf: 'Mountain West', tier: 'G6', colors: ['#046A38', '#FFC72C'] },

  // ---------------- Pac-12 (relaunched, G6) ----------------
  // NOTE: this conference relaunched football for the 2026 season —
  // membership here is my best knowledge but double-check it. Oregon
  // State and Washington State are the two legacy members who kept the
  // conference name through the 2024 realignment; the rest are new adds.
  { name: 'Boise State', abbr: 'BSU', conf: 'Pac-12', tier: 'G6', colors: ['#0033A0', '#D64309'] },
  { name: 'Colorado State', abbr: 'CSU', conf: 'Pac-12', tier: 'G6', colors: ['#1E4D2B', '#C8C372'] },
  { name: 'Fresno State', abbr: 'FRES', conf: 'Pac-12', tier: 'G6', colors: ['#DB0032', '#002856'] },
  { name: 'Oregon State', abbr: 'ORST', conf: 'Pac-12', tier: 'G6', colors: ['#DC4405', '#000000'] },
  { name: 'San Diego State', abbr: 'SDSU', conf: 'Pac-12', tier: 'G6', colors: ['#A6192E', '#000000'] },
  { name: 'UNLV', abbr: 'UNLV', conf: 'Pac-12', tier: 'G6', colors: ['#CF0A2C', '#B2B4B2'] },
  { name: 'Utah State', abbr: 'USU', conf: 'Pac-12', tier: 'G6', colors: ['#0F2439', '#4C7CB4'] },
  { name: 'Washington State', abbr: 'WSU', conf: 'Pac-12', tier: 'G6', colors: ['#981E32', '#5E6A71'] },
  { name: 'Texas State', abbr: 'TXST', conf: 'Pac-12', tier: 'G6', colors: ['#501214', '#A99873'] },

  // ---------------- Sun Belt (G6) ----------------
  { name: 'Appalachian State', abbr: 'APP', conf: 'Sun Belt', tier: 'G6', colors: ['#000000', '#FFC72C'] },
  { name: 'Arkansas State', abbr: 'ARST', conf: 'Sun Belt', tier: 'G6', colors: ['#CC092F', '#000000'] },
  { name: 'Coastal Carolina', abbr: 'CCU', conf: 'Sun Belt', tier: 'G6', colors: ['#006F71', '#A27752'] },
  { name: 'Georgia Southern', abbr: 'GASO', conf: 'Sun Belt', tier: 'G6', colors: ['#041E42', '#FFFFFF'] },
  { name: 'Georgia State', abbr: 'GSU', conf: 'Sun Belt', tier: 'G6', colors: ['#0039A6', '#C60C30'] },
  { name: 'James Madison', abbr: 'JMU', conf: 'Sun Belt', tier: 'G6', colors: ['#450084', '#CBB677'] },
  { name: 'Louisiana', abbr: 'ULL', conf: 'Sun Belt', tier: 'G6', colors: ['#CE181E', '#FFFFFF'], aliases: ['Louisiana-Lafayette', 'UL Lafayette'] },
  { name: 'UL Monroe', abbr: 'ULM', conf: 'Sun Belt', tier: 'G6', colors: ['#7A1734', '#FFC72C'], aliases: ['Louisiana-Monroe', 'Louisiana Monroe'] },
  { name: 'Marshall', abbr: 'MRSH', conf: 'Sun Belt', tier: 'G6', colors: ['#00B140', '#FFFFFF'] },
  { name: 'Old Dominion', abbr: 'ODU', conf: 'Sun Belt', tier: 'G6', colors: ['#003057', '#A7A9AC'] },
  { name: 'South Alabama', abbr: 'USA', conf: 'Sun Belt', tier: 'G6', colors: ['#00205B', '#C41230'] },
  { name: 'Southern Miss', abbr: 'USM', conf: 'Sun Belt', tier: 'G6', colors: ['#000000', '#FFC72C'], aliases: ['Southern Mississippi'] },
  { name: 'Troy', abbr: 'TROY', conf: 'Sun Belt', tier: 'G6', colors: ['#862633', '#A7A8AA'] },

  // ---------------- Independents ----------------
  { name: 'Notre Dame', abbr: 'ND', conf: 'Independent', tier: 'IND', colors: ['#0C2340', '#C99700'] },
  { name: 'UConn', abbr: 'CONN', conf: 'Independent', tier: 'IND', colors: ['#000E2F', '#FFFFFF'], aliases: ['Connecticut'] },
  { name: 'UMass', abbr: 'UMASS', conf: 'Independent', tier: 'IND', colors: ['#881C1C', '#FFFFFF'], aliases: ['Massachusetts'] },
];
