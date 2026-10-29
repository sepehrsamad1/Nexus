import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.mediaAsset.deleteMany();
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

  // 3. Create Hardware Products
  console.log('🖱️ Creating Gear & Hardware...');
  const gear = await Promise.all([
    prisma.product.create({
      data: {
        slug: 'logitech-g-pro-x-superlight',
        name: 'G PRO X SUPERLIGHT 2',
        description: 'Fast, precise, and highly reliable wireless gaming mouse.',
        category: 'MOUSE',
        brand: 'Logitech',
        price: 159.00,
        stock: 50,
        specsJson: JSON.stringify({ Weight: '60g', Sensor: 'HERO 2', DPI: '32,000' }),
        relatedGameId: gameBySlug['counter-strike-2'].id, // Counter-Strike 2
        recommendedByStreamerId: streamer2.id // Shroud
      }
    }),
    prisma.product.create({
      data: {
        slug: 'wooting-60he',
        name: 'Wooting 60HE+',
        description: 'Analog mechanical keyboard for ultimate rapid trigger control.',
        category: 'KEYBOARD',
        brand: 'Wooting',
        price: 175.00,
        stock: 12,
        specsJson: JSON.stringify({ Switches: 'Lekker (Magnetic)', Size: '60%', Polling: '1000Hz' }),
        recommendedByStreamerId: streamer1.id
      }
    }),
    prisma.product.create({
      data: {
        slug: 'audeze-maxwell',
        name: 'Audeze Maxwell',
        description: 'Planar magnetic wireless gaming headset.',
        category: 'HEADSET',
        brand: 'Audeze',
        price: 299.00,
        stock: 5,
        specsJson: JSON.stringify({ Drivers: '90mm Planar Magnetic', Battery: '80hr', Weight: '490g' }),
        relatedGameId: gameBySlug['cyberpunk-2077'].id // Cyberpunk 2077
      }
    })
  ]);

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

  // Persist deterministic aggregate metadata that matches the seeded review/discussion graph.
  for (const game of games) {
    const overallScore = Math.round((game.expertScore * 0.45 + game.streamerScore * 0.30 + game.userScore * 0.25) * 10) / 10;
    await prisma.game.update({
      where: { id: game.id },
      data: { overallScore, reviewCount: 4, discussionCount: 3 },
    });
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
