const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const economy = new Map();
const CURRENCY = '💰';
const musicQueues = new Map();
const cooldowns = new Map();

function initUser(userId) {
  if (!economy.has(userId)) {
    economy.set(userId, {
      balance: 100,
      lastDaily: 0,
      lastRob: 0,
      bank: 0
    });
  }
  return economy.get(userId);
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const commands = [
  {
    name: 'help',
    description: 'Show all available commands'
  },
  {
    name: 'profile',
    description: 'Show your profile information'
  },
  {
    name: 'balance',
    description: 'Check your coin balance'
  },
  {
    name: 'daily',
    description: 'Claim your daily coins'
  },
  {
    name: 'pay',
    description: 'Send coins to another user',
    options: [
      {
        name: 'user',
        description: 'User to send coins to',
        type: 6,
        required: true
      },
      {
        name: 'amount',
        description: 'Amount to send',
        type: 4,
        required: true
      }
    ]
  },
  {
    name: 'rob',
    description: 'Attempt to rob another user',
    options: [
      {
        name: 'user',
        description: 'User to rob',
        type: 6,
        required: true
      }
    ]
  },
  {
    name: 'top',
    description: 'Show top 10 richest users'
  },
  {
    name: 'play',
    description: 'Play music',
    options: [
      {
        name: 'song',
        description: 'Song name or URL',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'skip',
    description: 'Skip current song'
  },
  {
    name: 'stop',
    description: 'Stop music'
  },
  {
    name: 'queue',
    description: 'Show current queue'
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands('YOUR_APPLICATION_ID'),
      { body: commands }
    );
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

async function playMusic(guildId, voiceChannel, song) {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guildId,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator
  });

  const player = createAudioPlayer();
  const resource = createAudioResource(ytdl(song, { filter: 'audioonly', quality: 'highestaudio' }));

  connection.subscribe(player);
  player.play(resource);

  if (!musicQueues.has(guildId)) {
    musicQueues.set(guildId, { songs: [], connection: null, player: null });
  }

  const queue = musicQueues.get(guildId);
  queue.connection = connection;
  queue.player = player;

  player.on('error', error => {
    console.error('Audio player error:', error);
  });

  player.on(AudioPlayerStatus.Idle, () => {
    queue.songs.shift();
    if (queue.songs.length > 0) {
      playMusic(guildId, voiceChannel, queue.songs[0]);
    } else {
      connection.destroy();
      musicQueues.delete(guildId);
    }
  });
}

client.on('ready', () => {
  console.log(`🎶 ${client.user.tag} is ready!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options, guild, member, user } = interaction;
  const userId = user.id;
  initUser(userId);

  try {
    if (commandName === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('🌟 Sparkle Bot Commands')
        .setDescription('Here are all available commands:')
        .setColor('#FFD700')
        .addFields(
          { name: '💰 Economy', value: '`/balance`, `/daily`, `/pay`, `/rob`, `/top`' },
          { name: '🎵 Music', value: '`/play`, `/skip`, `/stop`, `/queue`' },
          { name: '📊 Profile', value: '`/profile`, `/help`' }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'profile') {
      const statusMap = {
        online: '🟢 Online',
        idle: '🟠 Idle',
        dnd: '🔴 Do Not Disturb',
        offline: '⚫ Offline'
      };

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${user.username}'s Profile`)
        .setThumbnail(user.displayAvatarURL())
        .setColor('#5865F2')
        .addFields(
          { name: '🆔 Discord ID', value: user.id, inline: true },
          { name: '🕒 Account Created', value: user.createdAt.toLocaleDateString(), inline: true },
          { name: '📅 Joined Server', value: member?.joinedAt?.toLocaleDateString() || 'Unknown', inline: true },
          { name: '💎 Status', value: statusMap[member?.presence?.status || 'offline'], inline: true },
          { name: `${CURRENCY} Balance`, value: formatNumber(initUser(userId).balance), inline: true },
          { name: '🏦 Bank', value: formatNumber(initUser(userId).bank), inline: true }
        )
        .setFooter({ text: `Profile for ${user.username}`, iconURL: user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'balance') {
      const userData = initUser(userId);
      const embed = new EmbedBuilder()
        .setTitle(`${CURRENCY} Your Balance`)
        .setDescription(`You have **${formatNumber(userData.balance)}** ${CURRENCY} Sparkle Coins!`)
        .setColor('#57F287')
        .setThumbnail('https://cdn.discordapp.com/emojis/1125275368957603920.webp')
        .addFields(
          { name: '🏦 Bank', value: formatNumber(userData.bank), inline: true },
          { name: '💵 Net Worth', value: formatNumber(userData.balance + userData.bank), inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'daily') {
      const userData = initUser(userId);
      const now = Date.now();
      const cooldown = 86400000;

      if (now - userData.lastDaily < cooldown) {
        const timeLeft = new Date(cooldown - (now - userData.lastDaily)).toISOString().substr(11, 8);
        return interaction.reply({
          content: `⏳ You already claimed your daily! Next claim available in ${timeLeft}`,
          ephemeral: true
        });
      }

      const reward = 500 + Math.floor(Math.random() * 500);
      userData.balance += reward;
      userData.lastDaily = now;
      
      const embed = new EmbedBuilder()
        .setTitle('🎉 Daily Reward Claimed!')
        .setDescription(`You received **${formatNumber(reward)}** ${CURRENCY} Sparkle Coins!`)
        .setColor('#FEE75C')
        .setThumbnail('https://cdn.discordapp.com/emojis/1125275368957603920.webp')
        .addFields(
          { name: '💳 New Balance', value: formatNumber(userData.balance), inline: true },
          { name: '⏳ Next Daily', value: '<t:' + Math.floor((now + cooldown)/1000) + ':R>', inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'pay') {
      const recipient = options.getUser('user');
      const amount = options.getInteger('amount');
      const senderData = initUser(userId);
      const recipientData = initUser(recipient.id);

      if (amount <= 0) return interaction.reply({ content: '❌ Amount must be positive!', ephemeral: true });
      if (senderData.balance < amount) {
        return interaction.reply({ 
          content: `❌ You don't have enough ${CURRENCY}! You only have ${formatNumber(senderData.balance)}.`, 
          ephemeral: true 
        });
      }

      senderData.balance -= amount;
      recipientData.balance += amount;

      const embed = new EmbedBuilder()
        .setTitle('💸 Payment Successful')
        .setDescription(`You sent **${formatNumber(amount)}** ${CURRENCY} to ${recipient.username}!`)
        .setColor('#57F287')
        .addFields(
          { name: '📉 Your New Balance', value: formatNumber(senderData.balance), inline: true },
          { name: '📈 Their Balance', value: formatNumber(recipientData.balance), inline: true }
        )
        .setFooter({ text: 'Transaction completed', iconURL: 'https://cdn.discordapp.com/emojis/1125275368957603920.webp' });

      await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'rob') {
      const target = options.getUser('user');
      const robberData = initUser(userId);
      const targetData = initUser(target.id);
      const now = Date.now();
      const cooldown = 3600000;

      if (now - robberData.lastRob < cooldown) {
        const timeLeft = new Date(cooldown - (now - robberData.lastRob)).toISOString().substr(11, 8);
        return interaction.reply({
          content: `⏳ You can't rob again yet! Wait ${timeLeft}`,
          ephemeral: true
        });
      }

      if (targetData.balance < 100) {
        return interaction.reply({
          content: `❌ ${target.username} doesn't have enough ${CURRENCY} to rob (minimum 100 required)`,
          ephemeral: true
        });
      }

      if (Math.random() < 0.6) {
        const stolenAmount = Math.floor(targetData.balance * 0.3);
        targetData.balance -= stolenAmount;
        robberData.balance += stolenAmount;
        robberData.lastRob = now;

        const embed = new EmbedBuilder()
          .setTitle('💰 Robbery Successful!')
          .setDescription(`You stole **${formatNumber(stolenAmount)}** ${CURRENCY} from ${target.username}!`)
          .setColor('#ED4245')
          .addFields(
            { name: '🤑 Your Loot', value: formatNumber(stolenAmount), inline: true },
            { name: '⏳ Next Robbery', value: '<t:' + Math.floor((now + cooldown)/1000) + ':R>', inline: true }
          )
          .setThumbnail('https://cdn.discordapp.com/emojis/1125275368957603920.webp');

        await interaction.reply({ embeds: [embed] });
      } else {
        const fine = Math.floor(robberData.balance * 0.1);
        robberData.balance -= fine;
        robberData.lastRob = now;

        const embed = new EmbedBuilder()
          .setTitle('🚨 Caught!')
          .setDescription(`You were caught trying to rob ${target.username} and paid a **${formatNumber(fine)}** ${CURRENCY} fine!`)
          .setColor('#ED4245')
          .setThumbnail('https://cdn.discordapp.com/emojis/1125275368957603920.webp');

        await interaction.reply({ embeds: [embed] });
      }
    }

    if (commandName === 'top') {
      const sorted = Array.from(economy.entries())
        .sort((a, b) => (b[1].balance + b[1].bank) - (a[1].balance + a[1].bank))
        .slice(0, 10);

      const embed = new EmbedBuilder()
        .setTitle(`🏆 Top 10 Richest Users`)
        .setDescription(`Leaderboard of users with the most ${CURRENCY} Sparkle Coins`)
        .setColor('#FEE75C')
        .setThumbnail('https://cdn.discordapp.com/emojis/1125275368957603920.webp');

      for (let i = 0; i < sorted.length; i++) {
        const [userId, data] = sorted[i];
        const user = await client.users.fetch(userId).catch(() => null);
        if (user) {
          embed.addFields({
            name: `${i+1}. ${user.username}`,
            value: `**${formatNumber(data.balance + data.bank)}** ${CURRENCY}`,
            inline: false
          });
        }
      }

      embed.setFooter({ text: 'Economy Leaderboard', iconURL: client.user.displayAvatarURL() });
      await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'play') {
      const song = options.getString('song');
      const voiceChannel = member.voice.channel;

      if (!voiceChannel) {
        return interaction.reply({ content: '❌ You need to be in a voice channel!', ephemeral: true });
      }

      if (!musicQueues.has(guild.id)) {
        musicQueues.set(guild.id, { songs: [], connection: null, player: null });
      }

      const queue = musicQueues.get(guild.id);
      queue.songs.push(song);

      const embed = new EmbedBuilder()
        .setTitle('🎵 Added to Queue')
        .setDescription(`**${song}**`)
        .setColor('#5865F2')
        .setFooter({ text: `Requested by ${user.username}`, iconURL: user.displayAvatarURL() });

      await interaction.reply({ embeds: [embed] });

      if (queue.songs.length === 1) {
        try {
          await playMusic(guild.id, voiceChannel, queue.songs[0]);
        } catch (error) {
          console.error(error);
          interaction.followUp('❌ Failed to play the song!');
        }
      }
    }

    if (commandName === 'skip') {
      const queue = musicQueues.get(guild.id);
      if (!queue || queue.songs.length === 0) {
        return interaction.reply({ content: '❌ There are no songs in the queue!', ephemeral: true });
      }

      queue.songs.shift();
      if (queue.songs.length > 0) {
        playMusic(guild.id, member.voice.channel, queue.songs[0]);
        return interaction.reply('⏭️ Skipped to the next song!');
      } else {
        queue.connection.destroy();
        musicQueues.delete(guild.id);
        return interaction.reply('❌ No more songs in the queue!');
      }
    }

    if (commandName === 'stop') {
      const queue = musicQueues.get(guild.id);
      if (!queue || !queue.connection) {
        return interaction.reply({ content: '❌ No music is currently playing!', ephemeral: true });
      }

      queue.connection.destroy();
      musicQueues.delete(guild.id);
      return interaction.reply('⏹️ Music stopped and connection closed.');
    }

    if (commandName === 'queue') {
      const queue = musicQueues.get(guild.id);
      if (!queue || queue.songs.length === 0) {
        return interaction.reply({ content: '❌ There are no songs in the queue!', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('🎶 Current Queue')
        .setColor('#5865F2')
        .setDescription(queue.songs.join('\n') || 'No songs in the queue');

      await interaction.reply({ embeds: [embed] });
    }
  } catch (error) {
    console.error(error);
    interaction.reply({ content: '❌ There was an error processing the command!', ephemeral: true });
  }
});

client.login(process.env.BOT_TOKEN);
