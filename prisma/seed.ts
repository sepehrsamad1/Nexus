import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Clean existing data
  await prisma.orderItem.deleteMany();
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

  // 2. Create Games
  console.log('🎮 Creating Games...');
  const games = await Promise.all([
    prisma.game.create({
      data: {
        slug: 'cyberpunk-2077',
        title: 'Cyberpunk 2077: Phantom Liberty',
        description: 'An open-world, action-adventure RPG set in the dark future of Night City.',
        coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
        releaseDate: new Date('2023-09-26'),
        developer: 'CD PROJEKT RED',
        publisher: 'CD PROJEKT RED',
        platformsJson: JSON.stringify(['PC', 'PS5', 'Xbox Series X/S']),
        genresJson: JSON.stringify(['RPG', 'Action', 'Sci-Fi']),
        digitalPrice: 59.99,
        expertScore: 89,
        streamerScore: 92,
        userScore: 86,
        stockKeysJson: JSON.stringify(['CDPR-1234-ABCD', 'CDPR-5678-EFGH', 'CDPR-9012-IJKL'])
      }
    }),
    prisma.game.create({
      data: {
        slug: 'elden-ring',
        title: 'Elden Ring: Shadow of the Erdtree',
        description: 'The Golden Order has been broken. Rise, Tarnished.',
        coverImage: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=800',
        releaseDate: new Date('2024-06-21'),
        developer: 'FromSoftware',
        publisher: 'Bandai Namco',
        platformsJson: JSON.stringify(['PC', 'PS5', 'Xbox Series X/S']),
        genresJson: JSON.stringify(['RPG', 'Action', 'Dark Fantasy']),
        digitalPrice: 39.99,
        expertScore: 96,
        streamerScore: 98,
        userScore: 94,
      }
    }),
    prisma.game.create({
      data: {
        slug: 'valorant',
        title: 'Valorant',
        description: 'A 5v5 character-based tactical shooter.',
        coverImage: 'https://images.unsplash.com/photo-1563853155799-a681c3c3a4f6?auto=format&fit=crop&q=80&w=800',
        releaseDate: new Date('2020-06-02'),
        developer: 'Riot Games',
        publisher: 'Riot Games',
        platformsJson: JSON.stringify(['PC']),
        genresJson: JSON.stringify(['FPS', 'Tactical', 'Competitive']),
        digitalPrice: 0.00,
        expertScore: 80,
        streamerScore: 88,
        userScore: 78,
      }
    }),
    prisma.game.create({
      data: {
        slug: 'helldivers-2',
        title: 'Helldivers 2',
        description: 'Freedom. Peace. Democracy. Your Super Earthborn rights.',
        coverImage: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?auto=format&fit=crop&q=80&w=800',
        releaseDate: new Date('2024-02-08'),
        developer: 'Arrowhead Studios',
        publisher: 'PlayStation PC',
        platformsJson: JSON.stringify(['PC', 'PS5']),
        genresJson: JSON.stringify(['Shooter', 'Co-op', 'Action']),
        digitalPrice: 39.99,
        expertScore: 82,
        streamerScore: 95,
        userScore: 90,
      }
    })
  ]);

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
        relatedGameId: games[2].id, // Valorant
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
        relatedGameId: games[0].id // Cyberpunk
      }
    })
  ]);

  // 4. Register remote demo media without downloading copyrighted assets into the repository.
  // Production/demo data can replace these URLs and attribution fields without changing UI code.
  await prisma.mediaAsset.createMany({
    data: games.map((game) => ({
      entityType: 'GAME',
      entityId: game.id,
      kind: 'COVER',
      url: game.coverImage,
      altText: `${game.title} cover art`,
      source: 'Remote demo URL',
      sourceUrl: game.coverImage,
      attribution: 'Verify creator attribution before production use',
      license: 'Unverified demo source; replace with licensed media for production',
      sortOrder: 0,
    })),
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
        score: Math.floor(Math.random() * 20) + 75,
        title: `A masterpiece in ${game.genresJson.includes('RPG') ? 'storytelling' : 'gameplay'}.`,
        content: `After spending 80 hours with ${game.title}, it is clear that the developers have pushed the boundaries...`,
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
        score: Math.floor(Math.random() * 15) + 85,
        title: `My honest thoughts after 100 hours.`,
        content: `Chat, this game is actually insane. The movement tech is crazy.`,
        videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ", // Dummy URL
        prosJson: JSON.stringify(['God tier movement', 'Hitreg is solid']),
        consJson: JSON.stringify(['Menu UI is clunky']),
        upvotes: 1200,
      }
    });

    // Create a 3-level deep Reddit-style comment tree on the Streamer review
    const rootComment = await prisma.comment.create({
      data: {
        reviewId: streamerReview.id,
        gameId: game.id,
        authorId: regularUsers[0].id,
        content: "I completely disagree about the movement, it feels super floaty compared to the beta.",
        upvotes: 245
      }
    });

    const level2Reply = await prisma.comment.create({
      data: {
        reviewId: streamerReview.id,
        gameId: game.id,
        parentId: rootComment.id, // Self-relation nested
        authorId: regularUsers[1].id,
        content: "Are you crazy? The movement is the best part! You just need to learn the slide-cancel timing.",
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
        content: "Exactly. The slide-cancel timing is tight but once you get it, it's butter.",
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
          score: Math.floor(Math.random() * 40) + 50,
          title: `Pretty good, but has flaws.`,
          content: `I bought this on sale and it's worth it, but full price? Nah.`,
          upvotes: Math.floor(Math.random() * 50),
        }
      });
    }
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
