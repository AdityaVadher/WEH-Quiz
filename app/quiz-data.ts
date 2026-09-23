export type QuizRound = {
  question: number;
  answer: string;
  aliases: string[];
  clues: Array<{ points: number; clue: string }>;
};

export const quizRounds: QuizRound[] = [
  {
    question: 1,
    answer: "Sachin Bansal",
    aliases: ["Sachin", "Bansal"],
    clues: [
      { points: 50, clue: "I had a divorce — from my company, not my spouse. Well, actually, also from my spouse." },
      { points: 40, clue: "90% of Bhartiya Junta who know my company think me and my cofounder are brothers but trust me we are not :)" },
      { points: 30, clue: "Add my stakes in both my companies and I’m basically close to 100%." },
      { points: 20, clue: "I walked away from that deal with roughly a billion dollars — and apparently decided retirement sounded boring." },
      { points: 10, clue: "If you ordered a book online in India before Amazon India was a thing, there’s a decent chance my company delivered it" },
    ],
  },
  {
    question: 2,
    answer: "Nikhil Kamath",
    aliases: ["Nikhil"],
    clues: [
      { points: 50, clue: "Chess was one of my earliest obsessions — which probably explains why I still seem to treat business like a game of positioning." },
      { points: 40, clue: "I don’t like raising money" },
      { points: 30, clue: "I left school before finishing Class 10, but somehow ended up spending most of my adult life studying numbers anyway.." },
      { points: 20, clue: "Today, I’m almost as likely to be seen having three-hour conversations with founders, actors and billionaires" },
      { points: 10, clue: "My first proper job involved a headset, night shifts and talking to strangers." },
    ],
  },
  {
    question: 3,
    answer: "Dario Amodei",
    aliases: ["Dario", "Amodei"],
    clues: [
      { points: 50, clue: "Most siblings argue about inheritance; we don’t.." },
      { points: 40, clue: "I have so many cofounders that we can form a volleyball team.." },
      { points: 30, clue: "My relationship status: pre-IPO complicated.." },
      { points: 20, clue: "I made resignation a trend in my previous company" },
      { points: 10, clue: "I did a PhD in biophysics, worked on neural systems, and somehow concluded that artificial intelligence would be the less complicated career choice" },
    ],
  },
  {
    question: 4,
    answer: "Paul Graham",
    aliases: ["Paul", "PG"],
    clues: [
      { points: 50, clue: "I spent years writing about programming languages so passionately that people accidentally started treating my essays like startup scripture.." },
      { points: 40, clue: "I sold one of the early web-based software companies to a much bigger internet company..." },
      { points: 30, clue: "I’ve probably rejected more future millionaires than most people have met..." },
      { points: 20, clue: "A lot of founders have technically worked with me for three months without ever calling me their boss." },
      { points: 10, clue: "If you’ve ever heard a founder say “we’re in a batch,” there’s a decent chance I helped make that sentence normal." },
    ],
  },
  {
    question: 5,
    answer: "Deepinder Goyal",
    aliases: ["Deepinder", "Goyal"],
    clues: [
      { points: 50, clue: "My company’s current name exists because someone else already owned the domain I actually wanted..." },
      { points: 40, clue: "I once spent months personally driving around a city collecting information on businesses that had somehow never bothered putting online...." },
      { points: 30, clue: "One of my biggest acquisitions turned convenience into a business model..." },
      { points: 20, clue: "Most founders step down to slow down. I stepped down because I wanted to do riskier things." },
      { points: 10, clue: "My latest obsession sits on your head, and exists because I started wondering what gravity has been doing to your brain all these years." },
    ],
  },
  {
    question: 6,
    answer: "Daniel Ek",
    aliases: ["Daniel", "Ek"],
    clues: [
      { points: 50, clue: "I became a multimillionaire in my early 20s, bought a Ferrari, partied a lot… and then realized I had to build something for global consumers..." },
      { points: 40, clue: "The name of my company exists partly because my cofounder misheard something during a brainstorming session. Somehow that became a global brand...." },
      { points: 30, clue: "If my users formed a country, it would be the third-largest population on Earth. The national anthem situation would be extremely complicated..." },
      { points: 20, clue: "My big idea was not to beat piracy by moralizing harder — it was to make the legal option so fast and convenient that piracy became annoying." },
      { points: 10, clue: "I love Songs ." },
    ],
  },
  {
    question: 7,
    answer: "Ghazal Alagh",
    aliases: ["Ghazal"],
    clues: [
      { points: 50, clue: "My first target consumer was literally someone who couldn’t give product feedback..." },
      { points: 40, clue: "I was the founding team of the tank" },
      { points: 30, clue: "I was perfectly happy painting and exhibiting art before motherhood dragged me into venture. Apparently the canvas wasn’t complicated enough...." },
      { points: 20, clue: "My first career involved teaching people things like SQL and Oracle. My second involved figuring out what parents were willing to put on their babies....." },
      { points: 10, clue: "I helped turn one company into a whole shelf of brands because apparently one label wasn’t enough admin.." },
    ],
  },
  {
    question: 8,
    answer: "Kunal Shah",
    aliases: ["Kunal"],
    clues: [
      { points: 50, clue: "I studied philosophy, briefly tried an MBA, then decided dropping off might be more useful than finishing business school...." },
      { points: 40, clue: "My Movie Title can be - A journey from India to the World" },
      { points: 30, clue: "If my current company would be a human, it would say - I don’t look for TG, I am the TG...." },
      { points: 20, clue: "I love blue ticks....." },
      { points: 10, clue: "Most founders sell and retire. I sold a slice and got several billion new users instead.." },
    ],
  },
  {
    question: 9,
    answer: "Jensen Huang",
    aliases: ["Jensen", "Jenson Huang"],
    clues: [
      { points: 50, clue: "As a kid, I was accidentally sent to a school for troubled youth because my relatives thought it was a fancy prep school. Slight administrative misunderstanding" },
      { points: 40, clue: "At 15, I was good enough at table tennis to place at the U.S. Open. Apparently I’ve always liked very fast things....." },
      { points: 30, clue: "One of my company’s early projects went so badly that asking a customer to let us walk away from the contract helped save us from bankruptcy...." },
      { points: 20, clue: "My wardrobe has become so predictable that I’ve publicly confirmed I maintain a strategic reserve of black leather jackets....." },
      { points: 10, clue: "I made a very expensive bet in 2007 on technology almost nobody knew what to do with. Years later and now, everybody suddenly wanted it.." },
    ],
  },
  {
    question: 10,
    answer: "Vijay Shekhar Sharma",
    aliases: ["Vijay Shekhar", "VSS", "Vijay Sharma"],
    clues: [
      { points: 50, clue: "I entered engineering college at 15 with strong maths, Hindi-medium schooling, and an urgent English problem." },
      { points: 40, clue: "I learnt English by reading the same textbook in two languages. Duolingo had not arrived to collect the credit." },
      { points: 30, clue: "I built a content-management business in college, sold it, and founded One97. Sleep missed the meeting." },
      { points: 20, clue: "In 2010, I put my own money behind a mobile wallet. Six years later, demonetisation made me look psychic." },
      { points: 10, clue: "My blue QR boxes taught Indian shopkeepers to celebrate with a robotic voice saying payment received." },
    ],
  },
  {
    question: 11,
    answer: "Peyush Bansal",
    aliases: ["Peyush"],
    clues: [
      { points: 50, clue: "I studied at McGill and worked at Microsoft in the US. My parents loved the respectable part of that sentence." },
      { points: 40, clue: "I returned to India and built SearchMyCampus, a portal that tried to solve every student problem before lunch." },
      { points: 30, clue: "An eyewear experiment called Flyrr taught me that people would buy something online even when the fit sat on their face." },
      { points: 20, clue: "I began with contact lenses, then added frames, eye tests, stores, and enough choices to make 20/20 vision feel indecisive." },
      { points: 10, clue: "On Shark Tank I inspect founders. Away from the tank, I help customers inspect everything else." },
    ],
  },
  {
    question: 12,
    answer: "Harshil Mathur",
    aliases: ["Harshil"],
    clues: [
      { points: 50, clue: "I met Shashank Kumar at IIT Roorkee's student software lab, where side projects had better attendance than some lectures." },
      { points: 40, clue: "My first job sent me to oilfields in the Middle East. Online checkout pages were not part of the safety briefing." },
      { points: 30, clue: "We tried to build a crowdfunding platform and discovered that accepting money was harder than asking strangers for it." },
      { points: 20, clue: "We dropped the original idea, joined Y Combinator in 2015, and built payment tools for developers instead." },
      { points: 10, clue: "My company's name sounds sharp. Its job is to make collecting money hurt less." },
    ],
  },
  {
    question: 13,
    answer: "Aman Gupta",
    aliases: ["Aman"],
    clues: [
      { points: 50, clue: "I qualified as a chartered accountant. Somewhere, a spreadsheet still wonders why I left." },
      { points: 40, clue: "Citi and KPMG came next, followed by several ventures that supplied experience instead of profits." },
      { points: 30, clue: "Sameer Mehta and I started a consumer-electronics business in 2016 with a strong opinion about affordable style." },
      { points: 20, clue: "We sold headphones, speakers, and smartwatches with enough celebrity campaigns to fill a music festival." },
      { points: 10, clue: "I am the Shark behind an audio brand whose name belongs on water, not in your ears." },
    ],
  },
  {
    question: 14,
    answer: "Vineeta Singh",
    aliases: ["Vineeta"],
    clues: [
      { points: 50, clue: "I studied at IIT Madras and IIM Ahmedabad, then declined a one-crore job offer. Family group chats survived." },
      { points: 40, clue: "My first ventures included Quetzal and Vellvette. The names improved faster than the sleep schedule." },
      { points: 30, clue: "I built cosmetics for Indian complexions and weather, because lipstick should not resign at 40 degrees Celsius." },
      { points: 20, clue: "I run ultramarathons, which is useful training for fundraising and other activities with no visible finish line." },
      { points: 10, clue: "I am the Shark whose beauty brand has a sweet name and lipsticks with considerably more bite." },
    ],
  },
  {
    question: 15,
    answer: "Anupam Mittal",
    aliases: ["Anupam"],
    clues: [
      { points: 50, clue: "I started an online matchmaking business in the 1990s, when loading a photograph already tested commitment." },
      { points: 40, clue: "The first version carried the name Sagaai.com. Even websites had an engagement before marriage." },
      { points: 30, clue: "My wider group also tried mobile entertainment and property search. One life event failed to satisfy me." },
      { points: 20, clue: "Profiles, preferences, horoscopes, and family filters brought software into a job aunties had owned for generations." },
      { points: 10, clue: "I am the Shark who turned the Hindi word for marriage into a dot-com address." },
    ],
  },
  {
    question: 16,
    answer: "Albinder Dhindsa",
    aliases: ["Albinder"],
    clues: [
      { points: 50, clue: "I studied civil engineering at IIT Delhi, earned a Columbia MBA, and later led international expansion at Zomato." },
      { points: 40, clue: "In 2013, Saurabh Kumar and I built a hyperlocal grocery service. The original name sounded like people who shop for you." },
      { points: 30, clue: "We changed that name in 2021. The replacement suggested the customer should avoid blinking." },
      { points: 20, clue: "Dark stores and ten-minute promises turned grocery delivery into a sport with no warm-up." },
      { points: 10, clue: "My yellow app can deliver milk before your tea finishes blaming you for forgetting it." },
    ],
  },
  {
    question: 17,
    answer: "Whitney Wolfe Herd",
    aliases: ["Whitney", "Whitney Wolfe", "Whitney Herd"],
    clues: [
      { points: 50, clue: "I helped launch Tinder and led its early marketing before deciding I had another dating app in me." },
      { points: 40, clue: "I founded my next company in 2014 with a yellow identity and one deliberate change to the usual rules." },
      { points: 30, clue: "In heterosexual matches, women had to start the conversation. Millions of men discovered patience for the first time." },
      { points: 20, clue: "The idea expanded from dating into friendship and professional networking, because awkward introductions scale." },
      { points: 10, clue: "My app's name is the noise a bee makes after approving your profile." },
    ],
  },
  {
    question: 18,
    answer: "Stewart Butterfield",
    aliases: ["Stewart"],
    clues: [
      { points: 50, clue: "I grew up on a commune and earned philosophy degrees before choosing the peaceful world of software startups." },
      { points: 40, clue: "My team built an online game that failed. A photo-sharing feature escaped the wreckage and became a company instead." },
      { points: 30, clue: "Years later, another game struggled while its internal chat tool became the product. I needed two attempts to spot the pattern." },
      { points: 20, clue: "Channels, emoji, and workplace messages helped offices replace overflowing inboxes with overflowing notifications." },
      { points: 10, clue: "I co-founded the four-letter work app whose notification sound can interrupt lunch from three rooms away." },
    ],
  },
  {
    question: 19,
    answer: "Sara Blakely",
    aliases: ["Sara"],
    clues: [
      { points: 50, clue: "I sold fax machines door to door for seven years, a career built around hearing no before lunch." },
      { points: 40, clue: "I cut the feet off pantyhose before wearing white trousers. The outfit worked; the prototype rolled up." },
      { points: 30, clue: "I invested 5,000 dollars of savings and drafted much of my own patent to keep the legal bill from eating the company." },
      { points: 20, clue: "Hosiery manufacturers rejected the idea until one owner reconsidered after his daughters heard the pitch." },
      { points: 10, clue: "I founded the shapewear brand with a punchy X in its name and an early endorsement from Oprah." },
    ],
  },
];

export function isCorrectGuess(round: QuizRound, guess: string): boolean {
  const normalizedGuess = normalize(guess);
  return [round.answer, ...round.aliases].some((candidate) => normalize(candidate) === normalizedGuess);
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("en").replace(/[^a-z0-9]/g, "");
}
