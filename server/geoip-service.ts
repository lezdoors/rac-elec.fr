import geoip from 'geoip-lite';

interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  ll?: [number, number]; // latitude, longitude
  countryCode?: string;
  countryName?: string;
  flag?: string;
}

/**
 * Service de géolocalisation d'adresses IP
 * Utilise geoip-lite pour obtenir des informations sur la localisation
 */
export function getLocationFromIp(ip: string): GeoLocation {
  if (!ip || ip === 'localhost' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return { countryCode: 'FR', countryName: 'France', flag: '🇫🇷' };
  }
  
  try {
    const geo = geoip.lookup(ip);
    
    if (!geo) {
      return { countryCode: 'UN', countryName: 'Inconnu', flag: '🌍' };
    }
    
    // Obtenir le nom complet du pays
    const countryName = getCountryName(geo.country);
    
    // Obtenir le drapeau emoji pour le pays
    const flag = getFlagEmoji(geo.country);
    
    return {
      ...geo,
      countryCode: geo.country,
      countryName,
      flag
    };
  } catch (error) {
    console.error(`Erreur lors de la géolocalisation de l'IP ${ip}:`, error);
    return { countryCode: 'UN', countryName: 'Inconnu', flag: '🌍' };
  }
}

/**
 * Convertit un code de pays ISO en emoji de drapeau
 */
function getFlagEmoji(countryCode?: string): string {
  if (!countryCode) return '🌍';
  
  // Convertir le code pays en emoji de drapeau
  // Les emoji de drapeaux sont formés en convertissant les lettres du code en points de code régionaux
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}

/**
 * Convertit un code de pays ISO en nom complet du pays
 */
function getCountryName(countryCode?: string): string {
  if (!countryCode) return 'Inconnu';
  
  const countryNames: {[key: string]: string} = {
    'AF': 'Afghanistan',
    'AL': 'Albanie',
    'DZ': 'Algérie',
    'AS': 'Samoa américaines',
    'AD': 'Andorre',
    'AO': 'Angola',
    'AI': 'Anguilla',
    'AQ': 'Antarctique',
    'AG': 'Antigua-et-Barbuda',
    'AR': 'Argentine',
    'AM': 'Arménie',
    'AW': 'Aruba',
    'AU': 'Australie',
    'AT': 'Autriche',
    'AZ': 'Azerbaïdjan',
    'BS': 'Bahamas',
    'BH': 'Bahreïn',
    'BD': 'Bangladesh',
    'BB': 'Barbade',
    'BY': 'Biélorussie',
    'BE': 'Belgique',
    'BZ': 'Belize',
    'BJ': 'Bénin',
    'BM': 'Bermudes',
    'BT': 'Bhoutan',
    'BO': 'Bolivie',
    'BA': 'Bosnie-Herzégovine',
    'BW': 'Botswana',
    'BV': 'Île Bouvet',
    'BR': 'Brésil',
    'IO': 'Territoire britannique de l\'océan Indien',
    'BN': 'Brunei',
    'BG': 'Bulgarie',
    'BF': 'Burkina Faso',
    'BI': 'Burundi',
    'KH': 'Cambodge',
    'CM': 'Cameroun',
    'CA': 'Canada',
    'CV': 'Cap-Vert',
    'KY': 'Îles Caïmans',
    'CF': 'République centrafricaine',
    'TD': 'Tchad',
    'CL': 'Chili',
    'CN': 'Chine',
    'CX': 'Île Christmas',
    'CC': 'Îles Cocos',
    'CO': 'Colombie',
    'KM': 'Comores',
    'CG': 'Congo',
    'CD': 'République démocratique du Congo',
    'CK': 'Îles Cook',
    'CR': 'Costa Rica',
    'CI': 'Côte d\'Ivoire',
    'HR': 'Croatie',
    'CU': 'Cuba',
    'CY': 'Chypre',
    'CZ': 'République tchèque',
    'DK': 'Danemark',
    'DJ': 'Djibouti',
    'DM': 'Dominique',
    'DO': 'République dominicaine',
    'EC': 'Équateur',
    'EG': 'Égypte',
    'SV': 'El Salvador',
    'GQ': 'Guinée équatoriale',
    'ER': 'Érythrée',
    'EE': 'Estonie',
    'ET': 'Éthiopie',
    'FK': 'Îles Malouines',
    'FO': 'Îles Féroé',
    'FJ': 'Fidji',
    'FI': 'Finlande',
    'FR': 'France',
    'GF': 'Guyane française',
    'PF': 'Polynésie française',
    'TF': 'Terres australes et antarctiques françaises',
    'GA': 'Gabon',
    'GM': 'Gambie',
    'GE': 'Géorgie',
    'DE': 'Allemagne',
    'GH': 'Ghana',
    'GI': 'Gibraltar',
    'GR': 'Grèce',
    'GL': 'Groenland',
    'GD': 'Grenade',
    'GP': 'Guadeloupe',
    'GU': 'Guam',
    'GT': 'Guatemala',
    'GN': 'Guinée',
    'GW': 'Guinée-Bissau',
    'GY': 'Guyana',
    'HT': 'Haïti',
    'HM': 'Îles Heard-et-MacDonald',
    'VA': 'Saint-Siège (Vatican)',
    'HN': 'Honduras',
    'HK': 'Hong Kong',
    'HU': 'Hongrie',
    'IS': 'Islande',
    'IN': 'Inde',
    'ID': 'Indonésie',
    'IR': 'Iran',
    'IQ': 'Irak',
    'IE': 'Irlande',
    'IL': 'Israël',
    'IT': 'Italie',
    'JM': 'Jamaïque',
    'JP': 'Japon',
    'JO': 'Jordanie',
    'KZ': 'Kazakhstan',
    'KE': 'Kenya',
    'KI': 'Kiribati',
    'KP': 'Corée du Nord',
    'KR': 'Corée du Sud',
    'KW': 'Koweït',
    'KG': 'Kirghizistan',
    'LA': 'Laos',
    'LV': 'Lettonie',
    'LB': 'Liban',
    'LS': 'Lesotho',
    'LR': 'Liberia',
    'LY': 'Libye',
    'LI': 'Liechtenstein',
    'LT': 'Lituanie',
    'LU': 'Luxembourg',
    'MO': 'Macao',
    'MK': 'Macédoine du Nord',
    'MG': 'Madagascar',
    'MW': 'Malawi',
    'MY': 'Malaisie',
    'MV': 'Maldives',
    'ML': 'Mali',
    'MT': 'Malte',
    'MH': 'Îles Marshall',
    'MQ': 'Martinique',
    'MR': 'Mauritanie',
    'MU': 'Maurice',
    'YT': 'Mayotte',
    'MX': 'Mexique',
    'FM': 'Micronésie',
    'MD': 'Moldavie',
    'MC': 'Monaco',
    'MN': 'Mongolie',
    'MS': 'Montserrat',
    'MA': 'Maroc',
    'MZ': 'Mozambique',
    'MM': 'Myanmar',
    'NA': 'Namibie',
    'NR': 'Nauru',
    'NP': 'Népal',
    'NL': 'Pays-Bas',
    'NC': 'Nouvelle-Calédonie',
    'NZ': 'Nouvelle-Zélande',
    'NI': 'Nicaragua',
    'NE': 'Niger',
    'NG': 'Nigeria',
    'NU': 'Niue',
    'NF': 'Île Norfolk',
    'MP': 'Îles Mariannes du Nord',
    'NO': 'Norvège',
    'OM': 'Oman',
    'PK': 'Pakistan',
    'PW': 'Palaos',
    'PS': 'Palestine',
    'PA': 'Panama',
    'PG': 'Papouasie-Nouvelle-Guinée',
    'PY': 'Paraguay',
    'PE': 'Pérou',
    'PH': 'Philippines',
    'PN': 'Îles Pitcairn',
    'PL': 'Pologne',
    'PT': 'Portugal',
    'PR': 'Porto Rico',
    'QA': 'Qatar',
    'RE': 'Réunion',
    'RO': 'Roumanie',
    'RU': 'Russie',
    'RW': 'Rwanda',
    'SH': 'Sainte-Hélène',
    'KN': 'Saint-Kitts-et-Nevis',
    'LC': 'Sainte-Lucie',
    'PM': 'Saint-Pierre-et-Miquelon',
    'VC': 'Saint-Vincent-et-les Grenadines',
    'WS': 'Samoa',
    'SM': 'Saint-Marin',
    'ST': 'Sao Tomé-et-Principe',
    'SA': 'Arabie saoudite',
    'SN': 'Sénégal',
    'SC': 'Seychelles',
    'SL': 'Sierra Leone',
    'SG': 'Singapour',
    'SK': 'Slovaquie',
    'SI': 'Slovénie',
    'SB': 'Îles Salomon',
    'SO': 'Somalie',
    'ZA': 'Afrique du Sud',
    'GS': 'Géorgie du Sud et les îles Sandwich du Sud',
    'ES': 'Espagne',
    'LK': 'Sri Lanka',
    'SD': 'Soudan',
    'SR': 'Suriname',
    'SJ': 'Svalbard et Jan Mayen',
    'SZ': 'Eswatini',
    'SE': 'Suède',
    'CH': 'Suisse',
    'SY': 'Syrie',
    'TW': 'Taïwan',
    'TJ': 'Tadjikistan',
    'TZ': 'Tanzanie',
    'TH': 'Thaïlande',
    'TL': 'Timor oriental',
    'TG': 'Togo',
    'TK': 'Tokelau',
    'TO': 'Tonga',
    'TT': 'Trinité-et-Tobago',
    'TN': 'Tunisie',
    'TR': 'Turquie',
    'TM': 'Turkménistan',
    'TC': 'Îles Turques-et-Caïques',
    'TV': 'Tuvalu',
    'UG': 'Ouganda',
    'UA': 'Ukraine',
    'AE': 'Émirats arabes unis',
    'GB': 'Royaume-Uni',
    'US': 'États-Unis',
    'UM': 'Îles mineures éloignées des États-Unis',
    'UY': 'Uruguay',
    'UZ': 'Ouzbékistan',
    'VU': 'Vanuatu',
    'VE': 'Venezuela',
    'VN': 'Viêt Nam',
    'VG': 'Îles Vierges britanniques',
    'VI': 'Îles Vierges américaines',
    'WF': 'Wallis-et-Futuna',
    'EH': 'Sahara occidental',
    'YE': 'Yémen',
    'ZM': 'Zambie',
    'ZW': 'Zimbabwe'
  };
  
  return countryNames[countryCode] || countryCode;
}
