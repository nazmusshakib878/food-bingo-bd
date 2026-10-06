// 64 districts, ONE famous food each.
// `verified: false` marks associations that are weaker / should be reviewed before launch.
// Image paths only reference files that exist in /public/foods.

export const DIVISIONS = [
  { key: 'dhaka', bn: 'ঢাকা বিভাগ', en: 'Dhaka Division', color: '#e8590c' },
  { key: 'chattogram', bn: 'চট্টগ্রাম বিভাগ', en: 'Chattogram Division', color: '#0c8599' },
  { key: 'rajshahi', bn: 'রাজশাহী বিভাগ', en: 'Rajshahi Division', color: '#9c36b5' },
  { key: 'khulna', bn: 'খুলনা বিভাগ', en: 'Khulna Division', color: '#2f9e44' },
  { key: 'barishal', bn: 'বরিশাল বিভাগ', en: 'Barishal Division', color: '#5c7cfa' },
  { key: 'sylhet', bn: 'সিলেট বিভাগ', en: 'Sylhet Division', color: '#d6336c' },
  { key: 'rangpur', bn: 'রংপুর বিভাগ', en: 'Rangpur Division', color: '#1c7ed6' },
  { key: 'mymensingh', bn: 'ময়মনসিংহ বিভাগ', en: 'Mymensingh Division', color: '#f59f00' },
];

const C = {
  sweet: 'মিষ্টি',
  rice: 'বিরিয়ানি ও পোলাও',
  meat: 'মাংস',
  fish: 'মাছ ও সামুদ্রিক',
  pitha: 'পিঠা',
  fruit: 'ফল ও কৃষি',
  local: 'আঞ্চলিক বিশেষত্ব',
};

// [id, districtBn, districtEn, division, foodBn, foodEn, category, note, image, verified]
const rows = [
  // ---- Dhaka ----
  ['dhaka', 'ঢাকা', 'Dhaka', 'dhaka', 'কাচ্চি বিরিয়ানি', 'Kacchi Biryani', C.rice, 'পুরান ঢাকার ঐতিহ্যবাহী কাচ্চি', 'kacchi-biryani', true],
  ['gazipur', 'গাজীপুর', 'Gazipur', 'dhaka', 'ভাওয়ালের কাঁঠাল', 'Bhawal Jackfruit', C.fruit, 'ভাওয়াল অঞ্চলের রসালো কাঁঠাল', null, false],
  ['narayanganj', 'নারায়ণগঞ্জ', 'Narayanganj', 'dhaka', 'সোনারগাঁওয়ের খাজা', 'Sonargaon Khaja', C.sweet, 'সোনারগাঁ অঞ্চলের ঐতিহ্যবাহী খাজা', null, false],
  ['narsingdi', 'নরসিংদী', 'Narsingdi', 'dhaka', 'লটকন', 'Lotkon', C.fruit, 'নরসিংদীর টক-মিষ্টি ফল', 'narsingdi-lotkon', true],
  ['manikganj', 'মানিকগঞ্জ', 'Manikganj', 'dhaka', 'ঘিওরের ঘি', 'Ghior Ghee', C.local, 'ঘিওরের খাঁটি ঘি', null, false],
  ['munshiganj', 'মুন্সিগঞ্জ', 'Munshiganj', 'dhaka', 'পাতক্ষীর', 'Patkhir', C.sweet, 'মুন্সিগঞ্জের ঐতিহ্যবাহী মিষ্টি', 'munshiganj-patkhir', true],
  ['tangail', 'টাঙ্গাইল', 'Tangail', 'dhaka', 'পোড়াবাড়ির চমচম', 'Porabari Chomchom', C.sweet, 'টাঙ্গাইলের বিখ্যাত চমচম', 'porabari-chomchom', true],
  ['kishoreganj', 'কিশোরগঞ্জ', 'Kishoreganj', 'dhaka', 'অষ্টগ্রামের পনির', 'Ashtagram Cheese', C.sweet, 'হাওর অঞ্চলের পনির', null, false],
  ['faridpur', 'ফরিদপুর', 'Faridpur', 'dhaka', 'খেজুরের রস', 'Date Palm Juice', C.local, 'শীতকালের ফরিদপুরের খেজুরের রস', null, false],
  ['gopalganj', 'গোপালগঞ্জ', 'Gopalganj', 'dhaka', 'রসগোল্লা', 'Rasgulla', C.sweet, 'গোপালগঞ্জের বিখ্যাত রসগোল্লা', 'gopalganj-rasgulla', true],
  ['rajbari', 'রাজবাড়ী', 'Rajbari', 'dhaka', 'পদ্মার ইলিশ', 'Padma Ilish', C.fish, 'গোয়ালন্দ-দৌলতদিয়ার ইলিশ', null, false],
  ['madaripur', 'মাদারীপুর', 'Madaripur', 'dhaka', 'পাটালি গুড়', 'Patali Gur', C.sweet, 'মাদারীপুরের খেজুরের পাটালি', null, false],
  ['shariatpur', 'শরীয়তপুর', 'Shariatpur', 'dhaka', 'বিবিখানা পিঠা', 'Bibikhana Pitha', C.pitha, 'শরীয়তপুরের ঐতিহ্যবাহী পিঠা', null, true],

  // ---- Chattogram ----
  ['chattogram', 'চট্টগ্রাম', 'Chattogram', 'chattogram', 'মেজবানি গরুর মাংস', 'Mezbani Beef', C.meat, 'চট্টগ্রামের মেজবান আয়োজনের প্রধান পদ', 'mezbani-beef', true],
  ['coxs-bazar', 'কক্সবাজার', "Cox's Bazar", 'chattogram', 'রূপচাঁদা ফ্রাই', 'Rupchanda Fry', C.fish, 'সমুদ্রের তাজা রূপচাঁদা', 'rupchanda-fry', true],
  ['cumilla', 'কুমিল্লা', 'Cumilla', 'chattogram', 'রসমালাই', 'Rasmalai', C.sweet, 'কুমিল্লার বিখ্যাত মিষ্টি', 'cumilla-rasmalai', true],
  ['feni', 'ফেনী', 'Feni', 'chattogram', 'ফেনীর খাজা', 'Feni Khaja', C.sweet, 'ফেনীর মচমচে খাজা', null, false],
  ['noakhali', 'নোয়াখালী', 'Noakhali', 'chattogram', 'খোলাজা পিঠা', 'Kholaja Pitha', C.pitha, 'নোয়াখালীর ঐতিহ্যবাহী পিঠা', 'kholaja-pitha', false],
  ['lakshmipur', 'লক্ষ্মীপুর', 'Lakshmipur', 'chattogram', 'নারিকেলের নাড়ু', 'Narikel Naru', C.sweet, 'উপকূলীয় নারিকেলের নাড়ু', null, false],
  ['chandpur', 'চাঁদপুর', 'Chandpur', 'chattogram', 'সর্ষে ইলিশ', 'Shorshe Ilish', C.fish, 'মেঘনার ইলিশের সর্ষে রান্না', 'shorshe-ilish', true],
  ['brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'Brahmanbaria', 'chattogram', 'ছানামুখী', 'Chanamukhi', C.sweet, 'ব্রাহ্মণবাড়িয়ার বিখ্যাত মিষ্টি', 'brahmanbaria-chanamukhi', true],
  ['rangamati', 'রাঙামাটি', 'Rangamati', 'chattogram', 'পাজন', 'Pajon', C.local, 'চাকমাদের ঐতিহ্যবাহী মিশ্র সবজি', null, true],
  ['khagrachari', 'খাগড়াছড়ি', 'Khagrachari', 'chattogram', 'বাঁশকোড়ল', 'Bamboo Shoot Curry', C.local, 'পাহাড়ি বাঁশের কচি কোড়ল', null, false],
  ['bandarban', 'বান্দরবান', 'Bandarban', 'chattogram', 'বাঁশের চোঙার রান্না', 'Bamboo Hollow Cooking', C.local, 'পাহাড়ি বাঁশের চোঙায় রান্না', null, true],

  // ---- Rajshahi ----
  ['rajshahi', 'রাজশাহী', 'Rajshahi', 'rajshahi', 'ফজলি আম', 'Fazli Mango', C.fruit, 'রাজশাহীর বিখ্যাত আম', 'rajshahi-fazli-mango', true],
  ['natore', 'নাটোর', 'Natore', 'rajshahi', 'কাঁচাগোল্লা', 'Kachagolla', C.sweet, 'নাটোরের বিখ্যাত মিষ্টি', 'natore-kachagolla', true],
  ['chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 'Chapainawabganj', 'rajshahi', 'ক্ষীরসাপাত আম', 'Khirsapat Mango', C.fruit, 'আমের রাজধানীর ক্ষীরসাপাত', null, true],
  ['naogaon', 'নওগাঁ', 'Naogaon', 'rajshahi', 'নওগাঁর আম', 'Naogaon Mango', C.fruit, 'নওগাঁর বাগানের আম', null, false],
  ['bogura', 'বগুড়া', 'Bogura', 'rajshahi', 'বগুড়ার দই', 'Bogura Doi', C.sweet, 'মাটির পাত্রের বিখ্যাত দই', 'bogura-doi', true],
  ['joypurhat', 'জয়পুরহাট', 'Joypurhat', 'rajshahi', 'আখের গুড়', 'Sugarcane Gur', C.sweet, 'জয়পুরহাটের আখের গুড়', null, false],
  ['sirajganj', 'সিরাজগঞ্জ', 'Sirajganj', 'rajshahi', 'পানতোয়া', 'Pantua', C.sweet, 'সিরাজগঞ্জের পানতোয়া', 'sirajganj-pantua', false],
  ['pabna', 'পাবনা', 'Pabna', 'rajshahi', 'প্যারা মিষ্টি', 'Pera Mishti', C.sweet, 'পাবনার ঐতিহ্যবাহী প্যারা', 'pabna-pera-mishti', true],

  // ---- Khulna ----
  ['khulna', 'খুলনা', 'Khulna', 'khulna', 'চুইঝাল গরুর মাংস', 'Chui Jhal Beef', C.meat, 'খুলনার ঝাল স্বাদের গরুর মাংস', 'chui-jhal-beef', true],
  ['bagerhat', 'বাগেরহাট', 'Bagerhat', 'khulna', 'চিংড়ির মালাইকারি', 'Prawn Malaikari', C.fish, 'বাগদা চিংড়ির নারকেল দুধের রান্না', 'prawn-malaikari', true],
  ['satkhira', 'সাতক্ষীরা', 'Satkhira', 'khulna', 'সুন্দরবনের মধু', 'Sundarbans Honey', C.local, 'সুন্দরবনের খলিশা ফুলের মধু', 'sundarbans-honey', true],
  ['jashore', 'যশোর', 'Jashore', 'khulna', 'খেজুরের গুড়', 'Khejur Gur', C.sweet, 'যশোরের নলেন গুড়', 'jashore-khejur-gur', true],
  ['jhenaidah', 'ঝিনাইদহ', 'Jhenaidah', 'khulna', 'ঝিনাইদহের কুল', 'Jhenaidah Boroi', C.fruit, 'ঝিনাইদহের রসালো কুল', null, false],
  ['magura', 'মাগুরা', 'Magura', 'khulna', 'মাগুর মাছের ঝোল', 'Magur Fish Curry', C.fish, 'মাগুরার ঐতিহ্যবাহী মাছের ঝোল', null, false],
  ['narail', 'নড়াইল', 'Narail', 'khulna', 'খেজুরের পাটালি', 'Khejur Patali', C.sweet, 'নড়াইলের শীতের পাটালি', null, false],
  ['kushtia', 'কুষ্টিয়া', 'Kushtia', 'khulna', 'তিলের খাজা', 'Tiler Khaja', C.sweet, 'কুষ্টিয়ার বিখ্যাত তিলের খাজা', 'tiler-khaja', true],
  ['chuadanga', 'চুয়াডাঙ্গা', 'Chuadanga', 'khulna', 'চুয়াডাঙ্গার কুলফি', 'Chuadanga Kulfi', C.sweet, 'চুয়াডাঙ্গার ঠান্ডা কুলফি', null, false],
  ['meherpur', 'মেহেরপুর', 'Meherpur', 'khulna', 'সাবিত্রী মিষ্টি', 'Sabitri Mishti', C.sweet, 'মেহেরপুরের ঐতিহ্যবাহী মিষ্টি', null, true],

  // ---- Barishal ----
  ['barishal', 'বরিশাল', 'Barishal', 'barishal', 'ইলিশ ভাপা', 'Vapa Ilish', C.fish, 'বরিশালের সর্ষে ভাপা ইলিশ', 'vapa-ilish', true],
  ['bhola', 'ভোলা', 'Bhola', 'barishal', 'মহিষের দুধের দই', 'Buffalo Milk Doi', C.sweet, 'ভোলার মহিষের দুধের দই', 'buffalo-yogurt', true],
  ['barguna', 'বরগুনা', 'Barguna', 'barishal', 'নারিকেলের পিঠা', 'Narikel Pitha', C.pitha, 'উপকূলের নারিকেলের পিঠা', null, false],
  ['patuakhali', 'পটুয়াখালী', 'Patuakhali', 'barishal', 'কুয়াকাটার কাঁকড়া ভুনা', 'Kuakata Crab Bhuna', C.fish, 'কুয়াকাটার সামুদ্রিক কাঁকড়া', null, false],
  ['pirojpur', 'পিরোজপুর', 'Pirojpur', 'barishal', 'স্বরূপকাঠির পেয়ারা', 'Swarupkathi Guava', C.fruit, 'ভাসমান পেয়ারা বাজারের পেয়ারা', null, true],
  ['jhalokati', 'ঝালকাঠি', 'Jhalokati', 'barishal', 'বরিশালের আমড়া', 'Amra', C.fruit, 'ঝালকাঠির আমড়া', 'barishal-amra', false],

  // ---- Sylhet ----
  ['sylhet', 'সিলেট', 'Sylhet', 'sylhet', 'সাতকড়া গরুর মাংস', 'Shatkora Beef', C.meat, 'সিলেটের সাতকড়ার ঝাল-টক রান্না', 'shatkora-beef', true],
  ['maulvibazar', 'মৌলভীবাজার', 'Maulvibazar', 'sylhet', 'সাত রঙা চা', 'Seven Color Tea', C.local, 'শ্রীমঙ্গলের বিখ্যাত চা', 'seven-color-tea', true],
  ['habiganj', 'হবিগঞ্জ', 'Habiganj', 'sylhet', 'আখনি পোলাও', 'Akhni Polao', C.rice, 'সিলেট অঞ্চলের আখনি', 'akhni-polao', false],
  ['sunamganj', 'সুনামগঞ্জ', 'Sunamganj', 'sylhet', 'হাওরের মাছের ঝোল', 'Haor Fish Curry', C.fish, 'টাঙ্গুয়ার হাওরের মাছ', null, false],

  // ---- Rangpur ----
  ['rangpur', 'রংপুর', 'Rangpur', 'rangpur', 'হাড়িভাঙ্গা আম', 'Haribhanga Mango', C.fruit, 'রংপুরের বিখ্যাত আম', 'haribhanga-mango', true],
  ['dinajpur', 'দিনাজপুর', 'Dinajpur', 'rangpur', 'কাটারিভোগ চাল', 'Kataribhog Rice', C.local, 'দিনাজপুরের সুগন্ধি চাল', 'kataribhog-rice', true],
  ['thakurgaon', 'ঠাকুরগাঁও', 'Thakurgaon', 'rangpur', 'ঠাকুরগাঁওয়ের চিড়া', 'Thakurgaon Chira', C.local, 'ঠাকুরগাঁওয়ের চিড়া', null, false],
  ['panchagarh', 'পঞ্চগড়', 'Panchagarh', 'rangpur', 'তেঁতুলিয়ার চা', 'Tetulia Tea', C.local, 'পঞ্চগড়ের চা', null, true],
  ['nilphamari', 'নীলফামারী', 'Nilphamari', 'rangpur', 'সৈয়দপুরের কাবাব', 'Saidpur Kabab', C.meat, 'সৈয়দপুরের কাবাব', null, false],
  ['lalmonirhat', 'লালমনিরহাট', 'Lalmonirhat', 'rangpur', 'ভাপা পিঠা', 'Vapa Pitha', C.pitha, 'উত্তরের শীতের ভাপা পিঠা', 'vapa-pitha', false],
  ['kurigram', 'কুড়িগ্রাম', 'Kurigram', 'rangpur', 'চিতই পিঠা', 'Chitoi Pitha', C.pitha, 'কুড়িগ্রামের চিতই', 'chitoi-pitha', false],
  ['gaibandha', 'গাইবান্ধা', 'Gaibandha', 'rangpur', 'পাটিসাপটা', 'Patishapta', C.pitha, 'গাইবান্ধার পাটিসাপটা', 'patishapta', false],

  // ---- Mymensingh ----
  ['mymensingh', 'ময়মনসিংহ', 'Mymensingh', 'mymensingh', 'মুক্তাগাছার মণ্ডা', 'Muktagacha Monda', C.sweet, 'মুক্তাগাছার ঐতিহাসিক মণ্ডা', 'muktagacha-monda', true],
  ['netrokona', 'নেত্রকোণা', 'Netrokona', 'mymensingh', 'বালিশ মিষ্টি', 'Balish Mishti', C.sweet, 'নেত্রকোণার বিখ্যাত বালিশ মিষ্টি', null, true],
  ['jamalpur', 'জামালপুর', 'Jamalpur', 'mymensingh', 'নকশি পিঠা', 'Nokshi Pitha', C.pitha, 'জামালপুর-ময়মনসিংহ অঞ্চলের নকশি পিঠা', 'nokshi-pitha', false],
  ['sherpur', 'শেরপুর', 'Sherpur', 'mymensingh', 'ছানার পায়েস', 'Chanar Payesh', C.sweet, 'শেরপুরের ছানার পায়েস', 'sherpur-chanar-payesh', true],
];

const divisionMap = Object.fromEntries(DIVISIONS.map((d) => [d.key, d]));

export const districts = rows.map(([id, districtBn, districtEn, div, foodBn, foodEn, category, regionNote, img, verified]) => ({
  id,
  districtBn,
  districtEn,
  divisionKey: div,
  divisionBn: divisionMap[div].bn,
  divisionEn: divisionMap[div].en,
  foodBn,
  foodEn,
  category,
  regionNote,
  image: img ? `/foods/${img}.webp` : null,
  verified,
}));

export const TOTAL = districts.length;
export const districtById = Object.fromEntries(districts.map((d) => [d.id, d]));
export const divisionColor = (key) => divisionMap[key].color;

export const getLevel = (count) => {
  const pct = TOTAL ? (count / TOTAL) * 100 : 0;
  if (pct >= 100) return 'বাংলাদেশের খাবার চ্যাম্পিয়ন 👑';
  if (pct > 75) return 'বাংলার স্বাদ-বিজয়ী';
  if (pct > 50) return 'ভোজন রসিক';
  if (pct > 25) return 'খাবার অন্বেষক';
  return 'নতুন স্বাদ-ভ্রমণকারী';
};
