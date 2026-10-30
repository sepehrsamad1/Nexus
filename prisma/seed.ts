import { PrismaClient } from '@prisma/client';
import { recalculateGameScores } from '../src/lib/scoring';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.externalReference.deleteMany();
  await prisma.creatorFollow.deleteMany();
  await prisma.creatorPost.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.order.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data.');

  // 1. Create Users
  console.log('👥 Creating Users...');
  const users = await Promise.all([
    // Admins
    prisma.user.create({ data: { id: "adm_demo123", name: "System Admin", email: "admin@nexus.gg", role: "ADMIN" } }),
    // Experts
    prisma.user.create({ data: { id: "exp_demo123", name: "IGN_Reviewer", email: "critic@nexus.gg", role: "EXPERT" } }),
    prisma.user.create({ data: { name: "PCGamer_Tom", email: "tom@pcgamer.com", role: "EXPERT" } }),
    prisma.user.create({ data: { name: "Eurogamer_Sarah", email: "sarah@eurogamer.net", role: "EXPERT" } }),
    prisma.user.create({ data: { name: "Kotaku_Alex", email: "alex@kotaku.com", role: "EXPERT" } }),
    // Streamers
    prisma.user.create({ data: { id: "str_demo123", name: "NinjaPlays", email: "streamer@nexus.gg", role: "STREAMER", twitchUrl: "https://twitch.tv/ninja", youtubeUrl: "https://youtube.com/ninja" } }),
    prisma.user.create({ data: { name: "Shroud", email: "shroud@nexus.gg", role: "STREAMER", twitchUrl: "https://twitch.tv/shroud" } }),
    prisma.user.create({ data: { name: "Asmongold", email: "asmon@nexus.gg", role: "STREAMER", twitchUrl: "https://twitch.tv/asmongold" } }),
    prisma.user.create({ data: { name: "Pokimane", email: "poki@nexus.gg", role: "STREAMER", twitchUrl: "https://twitch.tv/pokimane" } }),
    // Regular Users
    prisma.user.create({ data: { id: "usr_demo123", name: "GamerPro99", email: "user@nexus.gg", role: "USER" } }),
  ]);
  
  // Add 9 more regular users for voting/comments
  for(let i=0; i<9; i++) {
    users.push(await prisma.user.create({ data: { name: `CommunityUser${i}`, email: `user${i}@nexus.gg`, role: "USER" } }));
  }

  const [admin, critic1, critic2, critic3, critic4, streamer1, streamer2, streamer3, streamer4, user1] = users;
  const experts = [critic1, critic2, critic3, critic4];
  const streamers = [streamer1, streamer2, streamer3, streamer4];
  const regularUsers = users.slice(9);

  // Creator profiles are explicitly demo/editorial personas unless a verified external identity is added later.
  await prisma.creatorProfile.createMany({
    data: [
      { userId: streamer1.id, displayName: 'NinjaPlays', handle: 'ninjaplays-demo', tagline: 'Demo creator profile focused on competitive games.', bio: 'Demo/editorial creator persona used to demonstrate Nexus discovery and community features.', isDemoEditorial: true },
      { userId: streamer2.id, displayName: 'Shroud', handle: 'shroud-demo', tagline: 'Demo creator profile focused on tactical shooters.', bio: 'Demo/editorial creator persona; not a verified external identity or endorsement.', isDemoEditorial: true },
      { userId: streamer3.id, displayName: 'Asmongold', handle: 'asmongold-demo', tagline: 'Demo creator profile focused on RPG discussion.', bio: 'Demo/editorial creator persona; not a verified external identity or endorsement.', isDemoEditorial: true },
      { userId: streamer4.id, displayName: 'Pokimane', handle: 'pokimane-demo', tagline: 'Demo creator profile focused on community discovery.', bio: 'Demo/editorial creator persona; not a verified external identity or endorsement.', isDemoEditorial: true },
    ],
  });

  await prisma.creatorFollow.createMany({
    data: [
      { followerId: user1.id, followingId: streamer1.id },
      { followerId: regularUsers[1].id, followingId: streamer1.id },
      { followerId: regularUsers[2].id, followingId: streamer1.id },
      { followerId: user1.id, followingId: streamer2.id },
      { followerId: regularUsers[1].id, followingId: streamer2.id },
      { followerId: regularUsers[3].id, followingId: streamer2.id },
      { followerId: regularUsers[1].id, followingId: streamer3.id },
      { followerId: regularUsers[2].id, followingId: streamer3.id },
      { followerId: regularUsers[3].id, followingId: streamer4.id },
    ],
  });

  await prisma.creatorPost.createMany({
    data: [
      { authorId: streamer1.id, title: 'Demo Creator Post: What Makes a Great Competitive Game?', content: 'Seeded demo/editorial post for the Nexus creator-platform prototype. Follower count changes discovery reach, not game scoring.', isDemo: true },
      { authorId: streamer2.id, title: 'Demo Creator Post: Aim, Teamplay, and Game Feel', content: 'Seeded demo/editorial creator post. This is not a verified statement from the named public persona.', isDemo: true },
      { authorId: streamer3.id, title: 'Demo Creator Post: RPGs Worth Discussing', content: 'Seeded demo/editorial creator post used to demonstrate creator feeds and profile presentation.', isDemo: true },
      { authorId: streamer4.id, title: 'Demo Creator Post: Finding Your Next Game', content: 'Seeded demo/editorial creator post for discovery UX testing.', isDemo: true },
    ],
  });

  // 2. Create the curated 30-game Nexus catalog.
  // Covers use remote Steam header media where available; console-only titles use the existing
  // remote demo image until licensed/source-attributed media is supplied by the media pass.
  console.log('🎮 Creating curated 30-game catalog...');
  const gameCatalog = [
    ['demons-souls','Demon\'s Souls','A landmark action RPG remake built around brutal encounters, exploration, and risk-reward combat.','2020-11-12','Bluepoint Games','Sony Interactive Entertainment',['PS5'],['RPG','Action','Souls-like'],89,91,88,69.99,null],
    ['dark-souls','Dark Souls','An interconnected dark fantasy action RPG where every victory is earned through patience, mastery, and discovery.','2011-09-22','FromSoftware','Bandai Namco Entertainment',['PC','PS3','Xbox 360','Switch'],['RPG','Action','Dark Fantasy'],89,93,91,39.99,570940],
    ['dark-souls-2','Dark Souls II','A challenging journey through Drangleic with deep build variety, deliberate combat, and a huge world to explore.','2014-03-11','FromSoftware','Bandai Namco Entertainment',['PC','PS3','Xbox 360'],['RPG','Action','Dark Fantasy'],91,90,87,39.99,335300],
    ['dark-souls-3','Dark Souls III','A faster, refined finale to the Dark Souls trilogy with spectacular bosses and dense world design.','2016-03-24','FromSoftware','Bandai Namco Entertainment',['PC','PS4','Xbox One'],['RPG','Action','Dark Fantasy'],89,94,92,59.99,374320],
    ['bloodborne','Bloodborne','A gothic action RPG defined by aggressive combat, cosmic horror, and one of gaming\'s most memorable worlds.','2015-03-24','FromSoftware','Sony Interactive Entertainment',['PS4'],['RPG','Action','Horror'],92,96,95,59.99,null],
    ['sekiro-shadows-die-twice','Sekiro: Shadows Die Twice','A precision-focused action adventure built around parries, posture, stealth, and relentless sword combat.','2019-03-22','FromSoftware','Activision',['PC','PS4','Xbox One'],['Action','Adventure','Souls-like'],90,95,93,59.99,814380],
    ['elden-ring','Elden Ring','An expansive open-world action RPG combining FromSoftware combat with unprecedented exploration freedom.','2022-02-25','FromSoftware','Bandai Namco Entertainment',['PC','PS5','Xbox Series X/S','PS4','Xbox One'],['RPG','Action','Open World'],96,98,94,59.99,1245620],
    ['god-of-war','God of War','Kratos begins a new chapter in the Norse realms in a focused, cinematic action adventure.','2018-04-20','Santa Monica Studio','Sony Interactive Entertainment',['PS4','PC'],['Action','Adventure','RPG'],94,94,93,49.99,1593500],
    ['god-of-war-ragnarok','God of War Ragnarök','A larger Norse saga that expands Kratos and Atreus\' journey with spectacular combat and set pieces.','2022-11-09','Santa Monica Studio','Sony Interactive Entertainment',['PS5','PS4','PC'],['Action','Adventure','RPG'],94,95,94,69.99,2322010],
    ['uncharted-2','Uncharted 2: Among Thieves','A globe-spanning cinematic adventure combining exploration, climbing, puzzles, and blockbuster action.','2009-10-13','Naughty Dog','Sony Interactive Entertainment',['PS3','PS4'],['Action','Adventure','Third-Person'],96,95,94,39.99,null],
    ['uncharted-4','Uncharted 4: A Thief\'s End','Nathan Drake\'s final major adventure delivers cinematic spectacle, exploration, and character-driven storytelling.','2016-05-10','Naughty Dog','Sony Interactive Entertainment',['PS4','PC'],['Action','Adventure','Third-Person'],93,94,93,49.99,1659420],
    ['assassins-creed-ii','Assassin\'s Creed II','A Renaissance-era open-world adventure that introduced Ezio Auditore and a landmark stealth-action sandbox.','2009-11-17','Ubisoft Montreal','Ubisoft',['PC','PS3','Xbox 360'],['Action','Adventure','Open World'],90,91,92,29.99,33230],
    ['assassins-creed-brotherhood','Assassin\'s Creed Brotherhood','Ezio returns to Rome with expanded stealth, parkour, combat, and an influential brotherhood system.','2010-11-16','Ubisoft Montreal','Ubisoft',['PC','PS3','Xbox 360'],['Action','Adventure','Open World'],89,91,91,29.99,48190],
    ['assassins-creed-revelations','Assassin\'s Creed Revelations','A reflective finale to Ezio\'s story that blends Constantinople exploration with refined series mechanics.','2011-11-15','Ubisoft Montreal','Ubisoft',['PC','PS3','Xbox 360'],['Action','Adventure','Open World'],80,86,87,29.99,201870],
    ['skyrim','The Elder Scrolls V: Skyrim','A vast fantasy RPG where players can explore, quest, fight, craft, and build their own legend.','2011-11-11','Bethesda Game Studios','Bethesda Softworks',['PC','PS5','Xbox Series X/S','Switch'],['RPG','Open World','Fantasy'],94,95,94,39.99,489830],
    ['dota-2','Dota 2','A deep competitive MOBA built around strategy, hero mastery, teamwork, and near-limitless match variety.','2013-07-09','Valve','Valve',['PC'],['MOBA','Strategy','Competitive'],90,95,91,0,570],
    ['counter-strike-2','Counter-Strike 2','A competitive tactical shooter centered on precision aim, team coordination, economy, and round-to-round adaptation.','2023-09-27','Valve','Valve',['PC'],['FPS','Tactical','Competitive'],82,93,88,0,730],
    ['devil-may-cry-3','Devil May Cry 3: Special Edition','A stylish action classic famous for demanding combat, expressive combos, and memorable boss fights.','2006-01-24','Capcom','Capcom',['PC','PS2','Switch'],['Action','Character Action','Hack and Slash'],84,92,91,19.99,631510],
    ['devil-may-cry-5','Devil May Cry 5','A polished character-action showcase with three distinct combat styles and exceptional mechanical depth.','2019-03-08','Capcom','Capcom',['PC','PS5','Xbox Series X/S','PS4','Xbox One'],['Action','Character Action','Hack and Slash'],88,96,94,29.99,601150],
    ['clair-obscur-expedition-33','Clair Obscur: Expedition 33','A stylish turn-based RPG combining reactive combat, striking art direction, and an emotionally focused expedition.','2025-04-24','Sandfall Interactive','Kepler Interactive',['PC','PS5','Xbox Series X/S'],['RPG','Turn-Based','Adventure'],93,95,94,49.99,1903340],
    ['red-dead-redemption-2','Red Dead Redemption 2','An enormous western epic blending immersive open-world systems, character writing, and painstaking environmental detail.','2018-10-26','Rockstar Games','Rockstar Games',['PC','PS4','Xbox One'],['Action','Adventure','Open World'],97,96,95,59.99,1174180],
    ['the-witcher-3','The Witcher 3: Wild Hunt','A massive fantasy RPG driven by meaningful quests, memorable characters, exploration, and monster hunting.','2015-05-19','CD PROJEKT RED','CD PROJEKT RED',['PC','PS5','Xbox Series X/S','Switch'],['RPG','Open World','Fantasy'],93,95,95,39.99,292030],
    ['baldurs-gate-3','Baldur\'s Gate 3','A sprawling party-based RPG built around freedom of choice, reactive storytelling, and deep turn-based combat.','2023-08-03','Larian Studios','Larian Studios',['PC','PS5','Xbox Series X/S'],['RPG','Turn-Based','Fantasy'],96,97,96,59.99,1086940],
    ['cyberpunk-2077','Cyberpunk 2077','A story-driven open-world RPG set in Night City, combining character builds, action combat, and branching quests.','2020-12-10','CD PROJEKT RED','CD PROJEKT RED',['PC','PS5','Xbox Series X/S'],['RPG','Action','Sci-Fi'],88,93,91,59.99,1091500],
    ['hollow-knight','Hollow Knight','A hand-drawn metroidvania built around precise combat, exploration, atmospheric world design, and challenging bosses.','2017-02-24','Team Cherry','Team Cherry',['PC','PS4','Xbox One','Switch'],['Metroidvania','Action','Indie'],91,94,94,14.99,367520],
    ['resident-evil-4-remake','Resident Evil 4 Remake','A modern survival-horror action classic rebuilt with tense combat, exploration, and cinematic presentation.','2023-03-24','Capcom','Capcom',['PC','PS5','Xbox Series X/S','PS4'],['Horror','Action','Survival Horror'],93,95,94,59.99,2050650],
    ['black-myth-wukong','Black Myth: Wukong','A visually ambitious action RPG inspired by Journey to the West, featuring demanding combat and spectacular bosses.','2024-08-20','Game Science','Game Science',['PC','PS5','Xbox Series X/S'],['Action','RPG','Mythology'],81,94,91,59.99,2358720],
    ['monster-hunter-world','Monster Hunter: World','A deep action RPG built around hunting massive monsters, crafting gear, and mastering weapon-specific combat.','2018-01-26','Capcom','Capcom',['PC','PS4','Xbox One'],['Action','RPG','Co-op'],90,94,93,29.99,582010],
    ['hades','Hades','A fast, replayable roguelike action game where each escape attempt reveals more combat depth and story.','2020-09-17','Supergiant Games','Supergiant Games',['PC','PS5','Xbox Series X/S','Switch'],['Roguelike','Action','Indie'],93,96,95,24.99,1145360],
    ['resident-evil-requiem','Resident Evil Requiem','A modern survival-horror entry that combines investigation, resource management, tense combat, and first- or third-person play.','2026-02-27','Capcom','Capcom',['PC','PS5','Xbox Series X/S','Switch 2'],['Horror','Action','Survival Horror'],92,95,96,69.99,3764200],
  ] as const;

  const games = await Promise.all(gameCatalog.map(([slug, title, description, releaseDate, developer, publisher, platforms, genres, expertScore, streamerScore, userScore, digitalPrice, steamAppId]) =>
    prisma.game.create({
      data: {
        slug,
        title,
        description,
        coverImage: steamAppId
          ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/header.jpg`
          : ({
              'demons-souls': 'https://img.youtube.com/vi/JxDhzaZpGOw/maxresdefault.jpg',
              'bloodborne': 'https://img.youtube.com/vi/1jkK0E5xJfM/maxresdefault.jpg',
              'uncharted-2': 'https://img.youtube.com/vi/tlkkceDkT88/maxresdefault.jpg',
            } as Record<string, string>)[slug],
        bannerImage: steamAppId
          ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppId}/library_hero.jpg`
          : ({
              'demons-souls': 'https://img.youtube.com/vi/JxDhzaZpGOw/maxresdefault.jpg',
              'bloodborne': 'https://img.youtube.com/vi/1jkK0E5xJfM/maxresdefault.jpg',
              'uncharted-2': 'https://img.youtube.com/vi/tlkkceDkT88/maxresdefault.jpg',
            } as Record<string, string>)[slug],
        releaseDate: new Date(releaseDate),
        developer,
        publisher,
        platformsJson: JSON.stringify(platforms),
        genresJson: JSON.stringify(genres),
        digitalPrice,
        expertScore,
        streamerScore,
        userScore,
        stockKeysJson: JSON.stringify(Array.from({ length: 3 }, (_, index) => `NEXUS-${slug.toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 18)}-${index + 1}-DEMO`)),
      },
    })
  ));
  const gameBySlug = Object.fromEntries(games.map(game => [game.slug, game]));

  // 3. Create the exact 15-product P11 curated Nexus gear catalog.
  // Prices are either verified current-market references or clearly documented prototype placeholders.
  // Inventory and product ratings are demo catalog data; they are not live retailer inventory or user reviews.
  console.log('🛒 Creating curated 15-product gear catalog...');
  const priceCheckedAt = new Date('2026-10-30T00:00:00.000Z');
  const gearCatalog = [
    {
      slug: 'wooting-80he-plus', name: 'Wooting 80HE+', brand: 'Wooting', category: 'KEYBOARD',
      description: 'Premium Hall Effect TKL keyboard built around adjustable actuation, Rapid Trigger, analog input and true 8 kHz polling.',
      price: 199.99, stock: 8, rating: 4.8, reviewCount: 4641,
      specs: { Layout: '80% / TKL', Switches: 'Lekker Tikken Medium', 'Polling Rate': '8 kHz', 'Actuation': '0.1–4.0 mm', Connectivity: 'USB-C' },
      sourceUrl: 'https://wooting.io/wooting-80he-plus', priceSource: 'Verified vendor reference: USD 199.99 ABS prebuilt; prototype stock is simulated.',
    },
    {
      slug: 'logitech-g-pro-x-superlight-2', name: 'G PRO X SUPERLIGHT 2', brand: 'Logitech G', category: 'MOUSE',
      description: 'Lightweight competitive wireless mouse focused on low latency, precise tracking and long battery life.',
      price: 159.99, stock: 24, rating: 4.8, reviewCount: 1563,
      specs: { Weight: '60 g', Sensor: 'HERO 2', 'Max DPI': '44,000', 'Polling Rate': 'Up to 8 kHz', Battery: 'Up to 95 hours' },
      sourceUrl: 'https://www.logitechg.com/en-us/shop/p/pro-x2-superlight-wireless-mouse.910-006636', priceSource: 'Verified current Logitech/retailer reference: USD 159.99.',
      relatedGameSlug: 'counter-strike-2',
    },
    {
      slug: 'razer-viper-v4-pro', name: 'Viper V4 Pro', brand: 'Razer', category: 'MOUSE',
      description: 'Ultra-light symmetrical wireless esports mouse designed around high-speed tracking and competitive control.',
      price: 159.99, stock: 18, rating: 0, reviewCount: 0,
      specs: { Weight: '49 g', Sensor: 'Focus Pro 50K', 'Polling Rate': 'Up to 8 kHz', Battery: 'Up to 180 hours', Connectivity: '2.4 GHz / USB' },
      sourceUrl: 'https://www.razer.com/gaming-mice/razer-viper-v4-pro', priceSource: 'Verified current retailer reference: USD 159.99; market rating unavailable in retrieved source.',
    },
    {
      slug: 'razer-blackshark-v3-pro', name: 'BlackShark V3 Pro', brand: 'Razer', category: 'HEADSET',
      description: 'Wireless ANC esports headset with low-latency connectivity, a detachable microphone and competitive-focused audio.',
      price: 249.99, stock: 10, rating: 4.5, reviewCount: 10,
      specs: { Connectivity: '2.4 GHz / Bluetooth / USB', 'Noise Cancellation': 'ANC', Microphone: 'Full-band wireless mic', 'Audio Focus': 'Esports / spatial audio' },
      sourceUrl: 'https://www.razer.com/gaming-headsets/razer-blackshark-v3-pro', priceSource: 'Verified current retailer reference: USD 249.99.',
    },
    {
      slug: 'steelseries-arctis-nova-elite', name: 'Arctis Nova Elite', brand: 'SteelSeries', category: 'HEADSET',
      description: 'Premium multi-platform wireless headset focused on high-resolution audio, flexible connectivity and luxury build quality.',
      price: 599.99, stock: 6, rating: 0, reviewCount: 0,
      specs: { Audio: '96 kHz / 24-bit wireless', Connectivity: '2.4 GHz + Bluetooth LE Audio', Construction: 'Carbon-fiber reinforced', Platforms: 'PC / console / Bluetooth' },
      sourceUrl: 'https://steelseries.com/gaming-headsets/arctis-nova-elite', priceSource: 'Verified current retailer reference: USD 599.99; market rating unavailable in retrieved source.',
    },
    {
      slug: 'artisan-ninja-fx-zero', name: 'Ninja FX Zero', brand: 'ARTISAN', category: 'MOUSEPAD',
      description: 'Premium Japanese control mousepad tuned for consistent glide, precise stopping and competitive mouse control.',
      price: 69.99, stock: 14, rating: 0, reviewCount: 0,
      specs: { Surface: 'Woven control cloth', Size: 'Large', Base: 'Soft non-slip foam', Origin: 'Japan', Use: 'Competitive FPS / general gaming' },
      sourceUrl: 'https://artisan-jp.com/nj/', priceSource: 'Current-market prototype placeholder: USD 69.99; verify variant and size before live commerce.',
    },
    {
      slug: 'zowie-xl2566k', name: 'XL2566K', brand: 'ZOWIE', category: 'MONITOR',
      description: 'Competitive 24.5-inch esports monitor designed for high-refresh motion clarity and tournament-focused FPS play.',
      price: 599.99, stock: 5, rating: 0, reviewCount: 0,
      specs: { Size: '24.5 inch', Resolution: '1920×1080', 'Refresh Rate': '360 Hz', Panel: 'TN', Feature: 'DyAc+ motion clarity' },
      sourceUrl: 'https://zowie.benq.com/en-us/monitor/xl2566k.html', priceSource: 'Current-market prototype placeholder: USD 599.99; verify live retailer pricing before production use.',
    },
    {
      slug: 'lg-ultragear-oled-27gs95qe', name: 'UltraGear OLED 27GS95QE', brand: 'LG', category: 'MONITOR',
      description: '27-inch QHD OLED gaming monitor combining deep contrast, 240 Hz refresh and fast response for premium PC gaming.',
      price: 899.99, stock: 5, rating: 0, reviewCount: 0,
      specs: { Size: '27 inch', Resolution: '2560×1440', 'Refresh Rate': '240 Hz', Panel: 'OLED', Response: '0.03 ms GtG' },
      sourceUrl: 'https://www.lg.com/us/monitors/lg-27gs95qe-b-gaming-monitor', priceSource: 'Verified current retailer reference: USD 899.99.',
    },
    {
      slug: 'secretlab-titan-evo', name: 'TITAN Evo', brand: 'Secretlab', category: 'CHAIR',
      description: 'Premium ergonomic gaming chair designed for long sessions with adjustable lumbar support and a full recline range.',
      price: 549.00, stock: 7, rating: 0, reviewCount: 0,
      specs: { Upholstery: 'Neo Hybrid Leatherette / SoftWeave options', Lumbar: '4-way L-ADAPT', Recline: '165°', Frame: 'Full-length steel', Base: 'XL PU casters' },
      sourceUrl: 'https://secretlab.co/products/titan-evo', priceSource: 'Current-market prototype placeholder: USD 549.00; configuration affects final price.',
    },
    {
      slug: 'elgato-wave-3', name: 'Wave:3', brand: 'Elgato', category: 'MICROPHONE',
      description: 'USB condenser microphone built for streaming, voice chat and creator workflows with onboard anti-clipping protection.',
      price: 149.99, stock: 12, rating: 0, reviewCount: 0,
      specs: { Type: 'USB condenser', Pattern: 'Cardioid', Resolution: '24-bit / 96 kHz', Feature: 'Clipguard', Connection: 'USB-C' },
      sourceUrl: 'https://www.elgato.com/us/en/p/wave-3', priceSource: 'Current-market prototype placeholder: USD 149.99; verify current retailer pricing before live commerce.',
    },
    {
      slug: 'elgato-facecam-mk2', name: 'Facecam MK.2', brand: 'Elgato', category: 'WEBCAM',
      description: 'Full HD creator webcam with 60 fps capture, HDR support and software controls designed for streaming and calls.',
      price: 139.99, stock: 11, rating: 4.3, reviewCount: 7,
      specs: { Resolution: '1080p', 'Frame Rate': 'Up to 60 fps', HDR: 'Yes', Lens: 'Fixed focus', Connection: 'USB-C' },
      sourceUrl: 'https://www.elgato.com/us/en/p/facecam-mk2', priceSource: 'Verified current retailer reference: USD 139.99.',
    },
    {
      slug: 'wd-black-sn850x-2tb', name: 'WD_BLACK SN850X 2TB', brand: 'WD_BLACK', category: 'SSD',
      description: 'PCIe Gen4 NVMe gaming SSD designed for fast load times, high sustained throughput and a large game library.',
      price: 149.99, stock: 16, rating: 4.8, reviewCount: 1284,
      specs: { Capacity: '2 TB', Interface: 'PCIe Gen4 x4 NVMe', Form: 'M.2 2280', 'Sequential Read': 'Up to 7,300 MB/s', Feature: 'Game Mode 2.0' },
      sourceUrl: 'https://www.westerndigital.com/products/internal-drives/wd-black-sn850x-nvme-ssd', priceSource: 'Current-market prototype placeholder: USD 149.99; retrieved retailer pricing varied substantially.',
    },
    {
      slug: 'amd-radeon-rx-9070-xt', name: 'Radeon RX 9070 XT', brand: 'AMD', category: 'GPU',
      description: 'High-end/value-focused Radeon GPU aimed at high-refresh 1440p and capable 4K gaming.',
      price: 599.99, stock: 4, rating: 0, reviewCount: 0,
      specs: { Architecture: 'RDNA 4', Memory: '16 GB GDDR6', Interface: 'PCIe 5.0', Target: '1440p / 4K gaming', Feature: 'Ray tracing + FSR' },
      sourceUrl: 'https://www.amd.com/en/products/graphics/desktops/radeon/9000-series/amd-radeon-rx-9070-xt.html', priceSource: 'Current-market prototype placeholder: USD 599.99; verify board-partner pricing before live commerce.',
    },
    {
      slug: 'nvidia-geforce-rtx-5070-ti', name: 'GeForce RTX 5070 Ti', brand: 'NVIDIA', category: 'GPU',
      description: 'High-end GeForce GPU for demanding 1440p and 4K gaming with modern ray tracing and DLSS features.',
      price: 749.99, stock: 4, rating: 0, reviewCount: 0,
      specs: { Architecture: 'Blackwell', Memory: '16 GB GDDR7', Interface: 'PCIe 5.0', Feature: 'DLSS / Frame Generation', Target: '1440p / 4K gaming' },
      sourceUrl: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-ti/', priceSource: 'Current-market prototype placeholder: USD 749.99; verify board-partner pricing before live commerce.',
    },
    {
      slug: 'playstation-dualsense-edge', name: 'DualSense Edge', brand: 'PlayStation', category: 'CONTROLLER',
      description: 'Premium PS5 controller with remappable controls, adjustable triggers, replaceable stick modules and custom profiles.',
      price: 199.99, stock: 9, rating: 4.5, reviewCount: 2360,
      specs: { Platform: 'PS5 / PC', Controls: 'Remappable', 'Stick Caps': 'Interchangeable', Triggers: 'Adjustable', Profiles: 'Customizable' },
      sourceUrl: 'https://www.playstation.com/en-us/accessories/dualsense-edge-wireless-controller/', priceSource: 'Verified current retailer reference: USD 199.99.',
    },
  ];

  const products = await Promise.all(gearCatalog.map((product) => prisma.product.create({
    data: {
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
      rating: product.rating,
      reviewCount: product.reviewCount,
      priceSource: product.priceSource,
      priceCheckedAt,
      sourceUrl: product.sourceUrl,
      imagesJson: JSON.stringify([
        `/api/product-image/${product.slug}?view=front`,
        `/api/product-image/${product.slug}?view=detail`,
      ]),
      imageSourceJson: JSON.stringify([product.sourceUrl, product.sourceUrl]),
      specsJson: JSON.stringify(product.specs),
      ...('relatedGameSlug' in product && product.relatedGameSlug ? { relatedGameId: gameBySlug[product.relatedGameSlug].id } : {}),
    },
  })));

  // Register remote game media references. Nexus stores URLs/attribution metadata only; no copyrighted assets are downloaded.
  const trailerVideoIds: Record<string, string> = {
    'demons-souls': 'JxDhzaZpGOw',
    'bloodborne': '1nKW9kTjsps',
    'uncharted-2': 'tlkkceDkT88',
  };
  await prisma.mediaAsset.createMany({
    data: games.flatMap((game) => {
      const trailerId = trailerVideoIds[game.slug];
      const source = game.coverImage.includes('steamstatic.com') ? 'Steam remote media' : 'Official/public trailer thumbnail reference';
      const sourceUrl = trailerId ? `https://www.youtube.com/watch?v=${trailerId}` : game.coverImage;
      const heroUrl = game.bannerImage || game.coverImage;
      return [
        { entityType: 'GAME', entityId: game.id, kind: 'COVER', url: game.coverImage, altText: `${game.title} cover art`, source, sourceUrl, attribution: trailerId ? 'Trailer published by the official/public publisher channel or public trailer source; verify rights before production use' : 'Steam-hosted remote media; verify rights before production use', license: 'Remote platform-hosted media; rights are not transferred to Nexus', sortOrder: 0 },
        { entityType: 'GAME', entityId: game.id, kind: 'HERO', url: heroUrl, altText: `${game.title} hero artwork`, source, sourceUrl, attribution: trailerId ? 'Public trailer thumbnail reference; verify rights before production use' : 'Steam-hosted remote media; verify rights before production use', license: 'Remote platform-hosted media; rights are not transferred to Nexus', sortOrder: 1 },
        { entityType: 'GAME', entityId: game.id, kind: 'TRAILER_THUMBNAIL', url: trailerId ? `https://img.youtube.com/vi/${trailerId}/maxresdefault.jpg` : heroUrl, altText: `${game.title} trailer thumbnail`, source: trailerId ? 'YouTube public trailer thumbnail' : 'Steam remote media', sourceUrl, attribution: 'Publicly accessible media reference; verify rights before production use', license: 'Remote platform-hosted media; rights are not transferred to Nexus', sortOrder: 2 },
      ];
    }),
  });

  // P10 fallback records: external integrations are disabled by default, so the demo remains self-contained.
  // These records link to public sources but are explicitly Nexus editorial/demo references, not imported user identities or quotes.
  await prisma.externalReference.createMany({
    data: [
      {
        entityType: 'GAME',
        entityId: gameBySlug['elden-ring'].id,
        kind: 'REDDIT_REFERENCE',
        externalId: 'demo-elden-ring-reddit-2026',
        source: 'Nexus Editorial Demo',
        sourceUrl: 'https://www.reddit.com/r/Eldenring/comments/1u3j61e/2026_first_time_player_impressions/',
        canonicalUrl: 'https://www.reddit.com/r/Eldenring/comments/1u3j61e/2026_first_time_player_impressions/',
        title: 'Public Reddit community reference — Elden Ring impressions',
        excerpt: 'Demo reference only. Open the original public post to read the community discussion; Nexus does not copy or impersonate the author.',
        retrievedAt: new Date(),
        attribution: 'Public Reddit URL supplied as a Nexus editorial/demo reference. External author identity is not a Nexus account.',
        metadataJson: JSON.stringify({ provider: 'reddit', mode: 'demo-reference' }),
        isDemoEditorial: true,
      },
      {
        entityType: 'GAME',
        entityId: gameBySlug['cyberpunk-2077'].id,
        kind: 'REDDIT_REFERENCE',
        externalId: 'demo-cyberpunk-reddit-2026',
        source: 'Nexus Editorial Demo',
        sourceUrl: 'https://www.reddit.com/r/cyberpunkgame/comments/1xgd8do/removed/',
        canonicalUrl: 'https://www.reddit.com/r/cyberpunkgame/comments/1xgd8do/removed/',
        title: 'Public Reddit community reference — Cyberpunk 2077',
        excerpt: 'Demo reference only. The source may be removed or unavailable; Nexus does not present the external author as a Nexus user.',
        retrievedAt: new Date(),
        attribution: 'Public Reddit URL supplied as a Nexus editorial/demo reference. External author identity is not a Nexus account.',
        metadataJson: JSON.stringify({ provider: 'reddit', mode: 'demo-reference' }),
        isDemoEditorial: true,
      },
      {
        entityType: 'GAME',
        entityId: gameBySlug['demons-souls'].id,
        kind: 'OFFICIAL_TRAILER',
        externalId: 'demo-demons-souls-trailer',
        source: 'Nexus Editorial Demo',
        sourceUrl: 'https://www.youtube.com/watch?v=JxDhzaZpGOw',
        canonicalUrl: 'https://www.youtube.com/watch?v=JxDhzaZpGOw',
        title: 'Public trailer reference — Demon\'s Souls',
        excerpt: 'Demo reference only. Replace with a verified official publisher/developer trailer when external integration is enabled.',
        retrievedAt: new Date(),
        attribution: 'Public YouTube URL supplied as a Nexus editorial/demo reference; Nexus does not re-host the video.',
        metadataJson: JSON.stringify({ provider: 'youtube', mode: 'demo-reference' }),
        isDemoEditorial: true,
      },
    ],
  });

  // 4. Create Reviews & Comments
  console.log('✍️ Creating Reviews & Reddit-Style Comment Trees...');
  
  for (const game of games) {
    // 1 Expert Review per game
    await prisma.review.create({
      data: {
        gameId: game.id,
        authorId: experts[0].id,
        roleAtCreation: 'EXPERT',
        score: game.expertScore,
        title: `A masterpiece in ${game.genresJson.includes('RPG') ? 'storytelling' : 'gameplay'}.`,
        content: `Seeded expert-perspective placeholder for ${game.title}; score and metadata are deterministic demo data, not a published critic quote.`,
        prosJson: JSON.stringify(['Incredible visuals', 'Deep mechanics']),
        consJson: JSON.stringify(['Slight pacing issues']),
        upvotes: 450,
      }
    });

    // 1 Streamer VOD Review per game
    const streamerReview = await prisma.review.create({
      data: {
        gameId: game.id,
        authorId: streamers[1].id, // Shroud
        roleAtCreation: 'STREAMER',
        score: game.streamerScore,
        title: `Seeded creator perspective`,
        content: `Seeded creator-perspective placeholder for ${game.title}; this text is demo content and does not represent a real creator statement.`,
        videoUrl: undefined,
        prosJson: JSON.stringify(['Seeded gameplay highlight', 'Representative strengths']),
        consJson: JSON.stringify(['Representative trade-off']),
        upvotes: 1200,
      }
    });

    // Create a 3-level deep Reddit-style comment tree on the Streamer review
    const rootComment = await prisma.comment.create({
      data: {
        reviewId: streamerReview.id,
        gameId: game.id,
        authorId: regularUsers[0].id,
        content: `Seeded community discussion for ${game.title}; replace with a real user contribution in a live environment.`,
        upvotes: 245
      }
    });

    const level2Reply = await prisma.comment.create({
      data: {
        reviewId: streamerReview.id,
        gameId: game.id,
        parentId: rootComment.id, // Self-relation nested
        authorId: regularUsers[1].id,
        content: `Seeded reply discussing the gameplay of ${game.title}; this is demonstration content, not a real user quote.`,
        upvotes: 89
      }
    });

    // The Streamer replies in their own thread
    await prisma.comment.create({
      data: {
        reviewId: streamerReview.id,
        gameId: game.id,
        parentId: level2Reply.id, // Deeply nested
        authorId: streamers[1].id, // OP replies
        content: `Seeded creator reply for ${game.title}; this is demonstration content, not a real creator quote.`,
        upvotes: 412
      }
    });

    // A separate game-level discussion thread powers the community feed.
    // This is explicitly seeded demo content, not a real user quote.
    const gameDiscussion = await prisma.comment.create({
      data: {
        gameId: game.id,
        authorId: regularUsers[2].id,
        content: `Seeded game discussion for ${game.title}: what mechanic, encounter, or moment stands out most in this demo?`,
        upvotes: 64,
      },
    });

    await prisma.comment.create({
      data: {
        gameId: game.id,
        parentId: gameDiscussion.id,
        authorId: regularUsers[3].id,
        content: `Seeded reply for ${game.title}: this reply demonstrates nested community discussion and is not a real user quote.`,
        upvotes: 21,
      },
    });

    // 2 Regular User Reviews per game
    for (let i = 2; i < 4; i++) {
      await prisma.review.create({
        data: {
          gameId: game.id,
          authorId: regularUsers[i].id,
          roleAtCreation: 'USER',
          score: game.userScore - (i === 2 ? 2 : 4),
          title: `Seeded player perspective`,
          content: `Seeded player-perspective placeholder for ${game.title}; this is demonstration content and not a real purchase claim.`,
          upvotes: i === 2 ? 18 : 11,
        }
      });
    }
  }

  // Recalculate every aggregate from the actual seeded review graph.
  // Missing score sources are omitted from the overall-weight denominator rather than treated as zero.
  for (const game of games) {
    await recalculateGameScores(game.id);
  }

  console.log(`✅ Seeding completed successfully: ${games.length} canonical games.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
