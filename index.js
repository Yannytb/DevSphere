// index.js

const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, MessageEmbed, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});
const fs = require('fs');
require('dotenv').config();
const blacklist = ['id1', 'id2', 'id3']; // Remplace les ids par les vrais ids des utilisateurs blacklistés

const WELCOME_CHANNEL_ID = '1280861885343731815';
const GOODBYE_CHANNEL_ID = '1280861922970832947';
const BLACKLIST_CHANNEL_ID = '1304785558337355816';
const UNBLACKLIST_CHANNEL_ID = '1304785732770070560';
const WARNS_CHANNEL_ID = '1322538263168286751';
const ROLE_ID = '1280852054872428554';

// Événement : Nouveau membre
client.on('guildMemberAdd', async member => {
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!welcomeChannel) return console.error("Salon de bienvenue introuvable");

    const welcomeEmbed = new EmbedBuilder()
        .setTitle("Bienvenue!")
        .setDescription(`🎉 Bienvenue sur le serveur, ${member.user.username} ! Nous sommes heureux de te compter parmi nous.`)
        .setColor(0x00FF00)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `ID de l'utilisateur : ${member.user.id}` });

    await welcomeChannel.send({ embeds: [welcomeEmbed] });

    const role = member.guild.roles.cache.get(ROLE_ID);
    if (role) {
        try {
            await member.roles.add(role);
            console.log(`Rôle ajouté à ${member.user.username}`);
        } catch (err) {
            console.error(`Impossible d'ajouter le rôle à ${member.user.username}:`, err);
        }
    }
});

// Événement : Départ d'un membre
client.on('guildMemberRemove', async member => {
    const goodbyeChannel = member.guild.channels.cache.get(GOODBYE_CHANNEL_ID);
    if (!goodbyeChannel) return console.error("Salon d'au revoir introuvable");

    const goodbyeEmbed = new EmbedBuilder()
        .setTitle("Au revoir!")
        .setDescription(`😢 ${member.user.username} a quitté le serveur. Nous espérons te revoir bientôt !`)
        .setColor(0xFF0000)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `ID de l'utilisateur : ${member.user.id}` });

    await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
});

// Liste des commandes
const commands = {
    
    topavis: async (message) => {
    const fs = require('fs');
    const path = require('path');
    const avisFile = path.join(__dirname, '../container/home/data/avis.json');

    if (!fs.existsSync(avisFile)) {
        return message.reply("❌ Aucun avis enregistré.");
    }

    const avisData = JSON.parse(fs.readFileSync(avisFile, 'utf8'));

    if (avisData.length === 0) {
        return message.reply("❌ Aucun avis disponible.");
    }

    // Trier les avis par note (du plus élevé au plus bas)
    const topAvis = avisData.sort((a, b) => b.note - a.note).slice(0, 5);

    const embed = {
        color: 0xFFD700,
        title: "🏆 Top 5 des Meilleurs Avis Clients",
        fields: topAvis.map((avis, index) => ({
            name: `#${index + 1} - ${"⭐".repeat(avis.note)} (${avis.note}/5)`,
            value: `👤 **Utilisateur:** <@${avis.userId}>\n📝 **Avis:** ${avis.text}`,
            inline: false
        })),
        footer: {
            text: `Demandé par ${message.author.tag}`,
        },
        timestamp: new Date(),
    };

    message.channel.send({ embeds: [embed] });
},
    
    status: async (message) => {
    const presence = message.client.user.presence;
    const status = presence.status;
    const activity = presence.activities.length > 0 ? presence.activities[0] : null;

    const embed = {
        color: 0x0099ff,
        title: "📊 Statut Actuel du Bot",
        fields: [
            { name: "🟢 Statut", value: `\`${status}\``, inline: true },
            { name: "🎮 Activité", value: activity ? `\`${activity.type.toLowerCase()} ${activity.name}\`` : "Aucune activité", inline: false }
        ],
        footer: {
            text: `Demandé par ${message.author.tag}`,
        },
        timestamp: new Date(),
    };

    message.channel.send({ embeds: [embed] });
},
    
    resetstatus: async (message) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply("❌ Tu n'as pas la permission de réinitialiser le statut du bot.");
    }

    // ✅ Réinitialisation du statut
    message.client.user.setPresence({
        status: 'online',
        activities: [{ name: "les tickets 🎟️", type: "WATCHING" }],
    });

    const embed = {
        color: 0xffa500,
        title: "🔄 Statut Réinitialisé",
        description: "Le statut du bot a été réinitialisé à son état par défaut.",
        fields: [
            { name: "🟢 Statut", value: "`online`", inline: true },
            { name: "🎮 Activité", value: "`Regarde les tickets 🎟️`", inline: false }
        ],
        footer: {
            text: `Mis à jour par ${message.author.tag}`,
        },
        timestamp: new Date(),
    };

    message.channel.send({ embeds: [embed] });
},

    
    setstatus: async (message) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply("❌ Tu n'as pas la permission de changer le statut du bot.");
    }

    const args = message.content.split(/ +/).slice(1);
    if (args.length < 2) {
        return message.reply("⚠️ Usage : `!setstatus <statut> <type> <message>`\nExemple : `!setstatus online watching Netflix`");
    }

    const status = args[0].toLowerCase();
    const activityType = args[1].toUpperCase();
    const activityText = args.slice(2).join(' ');

    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
    const validActivityTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];

    if (!validStatuses.includes(status)) {
        return message.reply("⚠️ Statut invalide. Utilise : `online`, `idle`, `dnd`, `invisible`.");
    }

    if (!validActivityTypes.includes(activityType)) {
        return message.reply("⚠️ Type d'activité invalide. Utilise : `playing`, `streaming`, `listening`, `watching`, `competing`.");
    }

    // ✅ Mise à jour du statut du bot
    message.client.user.setPresence({
        status: status,
        activities: [{ name: activityText, type: activityType }],
    });

    const embed = {
        color: 0x00FF00,
        title: "✅ Statut mis à jour",
        fields: [
            { name: "🟢 Statut", value: `\`${status}\``, inline: true },
            { name: "🎮 Type", value: `\`${activityType}\``, inline: true },
            { name: "📌 Message", value: `\`${activityText}\``, inline: false }
        ],
        footer: {
            text: `Mis à jour par ${message.author.tag}`,
        },
        timestamp: new Date(),
    };

    message.channel.send({ embeds: [embed] });
},

    
   ticket: async (message) => {
    if (!message.guild) return message.reply("❌ Cette commande ne peut être utilisée que dans un serveur.");

    const guild = message.guild;
    const user = message.author;
    const staffRoleId = '1280851157530578985'; // Remplace avec l'ID du rôle staff
    const categoryId = '1335740567610589196'; // Remplace avec l'ID de la catégorie des tickets
    const logChannelId = '1338651277579780206'; // Remplace avec l'ID du salon de logs

    // Vérifie si un ticket existe déjà
    const existingChannel = guild.channels.cache.find(
        (c) => c.name === `ticket-${user.id}` && c.parentId === categoryId
    );

    if (existingChannel) {
        return message.reply(`🎟️ Tu as déjà un ticket ouvert ici : ${existingChannel}`);
    }

    try {
        // Menu déroulant pour choisir le type de ticket
        const ticketSelectMenu = {
            type: 1, // Row de sélection
            components: [
                {
                    type: 3, // Sélecteur
                    custom_id: 'ticket_type',
                    placeholder: '📌 Choisissez le type de ticket...',
                    options: [
                        { label: '💡 Java', value: 'Java', description: 'Besoin d’aide pour ton projet java.' },
                        { label: '🚨 Discord', value: 'Discord', description: 'Faire une commande pour un bot discord.' },
                    ],
                },
            ],
        };

        // Demande à l'utilisateur de choisir un type de ticket
        const reply = await message.reply({ content: "📌 **Choisissez le type de ticket :**", components: [ticketSelectMenu] });

        // Écoute de l'interaction
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isSelectMenu()) return;

            // Vérifie que l'interaction concerne le bon message et le bon sélecteur
            if (interaction.message.id !== reply.id || interaction.customId !== 'ticket_type') return;

            // Récupère la valeur sélectionnée
            const selectedType = interaction.values[0];

            // Crée un ticket pour l'utilisateur
            const ticketChannel = await guild.channels.create(`ticket-${user.id}`, {
                type: 'text',
                parent: categoryId,
                topic: `Ticket créé par ${user.tag} pour ${selectedType}`,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: user.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    },
                    {
                        id: staffRoleId,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                    },
                ],
            });

            // Envoie un message dans le nouveau salon de ticket
            await ticketChannel.send(`🎟️ **Ticket ouvert pour ${selectedType}**\n\nCréé par: ${user.tag}`);

            // Répond à l'utilisateur
            await interaction.reply({ content: `🎟️ Ton ticket pour **${selectedType}** a été créé : ${ticketChannel}.`, ephemeral: true });

            // Log dans le canal des logs
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send(`Nouveau ticket créé par ${user.tag} pour ${selectedType}. Channel: ${ticketChannel}`);
            }
        });
    } catch (error) {
        console.error(error);
        message.reply("❌ Une erreur s'est produite.");
    }
},


    
    stats: async (message) => {
    if (!message.guild) {
        return message.reply("Cette commande ne peut être utilisée que sur un serveur.");
    }

    const { guild } = message;

    const embed = {
        color: 0x0099ff,
        title: `📊 Statistiques du serveur : ${guild.name}`,
        thumbnail: {
            url: guild.iconURL({ dynamic: true }),
        },
        fields: [
            { name: "👥 Membres", value: `${guild.memberCount}`, inline: true },
            { name: "📅 Créé le", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
            { name: "📖 Nombre de salons", value: `${guild.channels.cache.size}`, inline: true },
            { name: "🔰 Rôles", value: `${guild.roles.cache.size}`, inline: true },
            { name: "💬 Salons textuels", value: `${guild.channels.cache.filter(c => c.isTextBased()).size}`, inline: true },
            { name: "🔊 Salons vocaux", value: `${guild.channels.cache.filter(c => c.isVoiceBased()).size}`, inline: true }
        ],
        footer: {
            text: `ID du serveur : ${guild.id}`,
        },
        timestamp: new Date(),
    };

    message.channel.send({ embeds: [embed] });
},
    
    ban: async (message) => {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
        return message.reply('Vous n\'avez pas la permission de bannir des membres.');
    }

    const userMention = message.mentions.members.first();
    if (!userMention) {
        return message.reply('Veuillez mentionner un utilisateur à bannir. Usage : /ban @utilisateur [raison]');
    }

    const reason = message.content.split(' ').slice(2).join(' ') || 'Aucune raison fournie';

    try {
        await userMention.ban({ reason });
        message.channel.send(`${userMention.user.tag} a été banni pour : ${reason}`);
    } catch (error) {
        console.error(error);
        message.reply('Une erreur s\'est produite lors du bannissement.');
    }
},
    
    unban: async (message) => {
    if (!message.member.permissions.has('BAN_MEMBERS')) {
        return message.reply('Vous n\'avez pas la permission de débannir des membres.');
    }

    const args = message.content.split(' ').slice(1);
    const userId = args[0];

    if (!userId) {
        return message.reply('Veuillez fournir l\'ID de l\'utilisateur à débannir. Usage : /unban <ID_utilisateur>');
    }

    try {
        await message.guild.members.unban(userId);
        message.channel.send(`L'utilisateur avec l'ID ${userId} a été débanni.`);
    } catch (error) {
        console.error(error);
        message.reply('Une erreur s\'est produite lors du débannissement.');
    }
},
    
    blacklist: (message) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('Vous n\'avez pas la permission d\'ajouter des utilisateurs à la blacklist.');
    }

    const userMention = message.mentions.members.first();
    if (!userMention) {
        return message.reply('Veuillez mentionner un utilisateur à ajouter à la blacklist.');
    }

    if (blacklist.includes(userMention.id)) {
        return message.reply(`${userMention.user.tag} est déjà sur la blacklist.`);
    }

    blacklist.push(userMention.id);
    message.channel.send(`${userMention.user.tag} a été ajouté à la blacklist.`);
},
    
    unblacklist: (message) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('Vous n\'avez pas la permission de retirer des utilisateurs de la blacklist.');
    }

    const userMention = message.mentions.members.first();
    if (!userMention) {
        return message.reply('Veuillez mentionner un utilisateur à retirer de la blacklist.');
    }

    const index = blacklist.indexOf(userMention.id);
    if (index === -1) {
        return message.reply(`${userMention.user.tag} n'est pas dans la blacklist.`);
    }

    blacklist.splice(index, 1);
    message.channel.send(`${userMention.user.tag} a été retiré de la blacklist.
`);
},
    
    kick: async (message) => {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
        return message.reply('Vous n\'avez pas la permission d\'expulser des membres.');
    }

    const userMention = message.mentions.members.first();
    if (!userMention) {
        return message.reply('Veuillez mentionner un utilisateur à expulser. Usage : /kick @utilisateur');
    }

    const reason = message.content.split(' ').slice(2).join(' ') || 'Aucune raison fournie';

    try {
        await userMention.kick(reason);
        message.channel.send(`${userMention.user.tag} a été expulsé pour : ${reason}`);
    } catch (error) {
        console.error(error);
        message.reply('Une erreur s\'est produite lors de l\'expulsion.');
    }
},
    
    addrole: async (message) => {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
        return message.reply('Vous n\'avez pas la permission d\'ajouter des rôles.');
    }

    const args = message.content.split(' ');
    const roleName = args[1];
    const userMention = message.mentions.members.first();

    if (!roleName || !userMention) {
        return message.reply('Usage : /addrole <nom_du_role> @utilisateur');
    }

    const role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
        return message.reply(`Le rôle \${roleName}\ n'existe pas.`);
    }

    try {
        await userMention.roles.add(role);
        message.channel.send(`Le rôle \${roleName}\ a été ajouté à ${userMention.user.username}.`);
    } catch (error) {
        console.error(error);
        message.reply('Une erreur s\'est produite lors de l\'ajout du rôle.');
    }
},
    
    removerole: async (message) => {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
        return message.reply('Vous n\'avez pas la permission de retirer des rôles.');
    }

    const args = message.content.split(' ');
    const roleName = args[1];
    const userMention = message.mentions.members.first();

    if (!roleName || !userMention) {
        return message.reply('Usage : /removerole <nom_du_role> @utilisateur');
    }

    const role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
        return message.reply(`Le rôle \${roleName}\ n'existe pas.`);
    }

    try {
        await userMention.roles.remove(role);
        message.channel.send(`Le rôle \${roleName}\ a été retiré à ${userMention.user.username}.`);
    } catch (error) {
        console.error(error);
        message.reply('Une erreur s\'est produite lors du retrait du rôle.');
    }
},
    
    giveaway: async (message) => {
    const args = message.content.split(' ');
    const duration = parseInt(args[1]); // Durée en secondes
    const prize = args.slice(2).join(' '); // Récompense du giveaway

    if (!duration || !prize) {
        return message.reply('Usage : /giveaway <durée_en_secondes> <récompense>');
    }

    const embed = new EmbedBuilder()
        .setTitle('🎉 Giveaway 🎉')
        .setDescription(`Récompense : **${prize}**\nRéagissez avec 🎉 pour participer !`)
        .setColor('#00FF00')
        .setFooter({ text: `Le giveaway se termine dans ${duration} secondes. `});

    const giveawayMessage = await message.channel.send({ embeds: [embed] });
    await giveawayMessage.react('🎉');

    setTimeout(async () => {
        const reactions = giveawayMessage.reactions.cache.get('🎉');
        const users = await reactions.users.fetch();
        const participants = users.filter(user => !user.bot);

        if (participants.size === 0) {
            return message.channel.send('Personne n\'a participé au giveaway.');
        }

        const winner = participants.random();
        message.channel.send(`🎉 Félicitations à ${winner} pour avoir gagné **${prize}** !`);
    }, duration * 1000);
},
    
    embed: (message) => {
    const args = message.content.split(' ').slice(1);
    const title = args[0] || 'Titre par défaut';
    const description = args.slice(1).join(' ') || 'Description par défaut';

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor('#0099ff')
        .setFooter({ text:` Embed créé par ${message.author.username}` });

    message.channel.send({ embeds: [embed] });
},
    
    clearall: async (message) => {
    // Vérifie si l'utilisateur a les permissions nécessaires
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return message.reply('Vous n\'avez pas la permission de gérer les messages.');
    }

    // Confirme que la commande est exécutée dans un salon texte
    if (message.channel.type !== 0) { // Type 0 correspond à un salon textuel
        return message.reply('Cette commande ne peut être utilisée que dans un salon textuel.');
    }

    try {
        let fetchedMessages;
        do {
            // Récupère jusqu'à 100 messages à la fois
            fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
            if (fetchedMessages.size > 0) {
                // Supprime les messages récupérés
                await message.channel.bulkDelete(fetchedMessages, true);
            }
        } while (fetchedMessages.size > 0);

        // Confirme la suppression
        message.channel.send('Tous les messages du salon ont été supprimés !')
            .then(msg => setTimeout(() => msg.delete(), 5000)); // Supprime le message de confirmation après 5 secondes
    } catch (error) {
        console.error('Erreur lors de la suppression des messages :', error);
        message.reply('Une erreur s\'est produite lors de la suppression des messages.');
    }
},
    
  help: async (message) => {
    const commandsPerEmbed = 25; // Limite de 25 champs par embed
    const embeds = [];
    let currentEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Liste des commandes')
        .setDescription('Voici une liste complète des commandes disponibles :');

    let count = 0; // Compteur de champs ajoutés
    Object.entries(commands).forEach(([name, command]) => {
        const commandName = name.slice(0, 256); // Limiter le nom à 256 caractères
        const commandDescription = (command.description || 'Aucune description disponible.').slice(0, 1024); // Limiter la description à 1024 caractères

        currentEmbed.addFields({
            name: commandName,
            value: commandDescription,
            inline: false
        });

        count++;

        // Si nous atteignons la limite de 25 champs, envoyer l'embed et en créer un nouveau
        if (count >= commandsPerEmbed) {
            embeds.push(currentEmbed);
            currentEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Suite Liste des commandes')
                .setDescription('Voici une suite de la liste complète des commandes disponibles :');
            count = 0; // Réinitialiser le compteur
        }
    });

    // Ajouter l'embed restant si nécessaire
    if (count > 0) {
        embeds.push(currentEmbed);
    }

    // Envoi des embeds
    try {
        for (const embed of embeds) {
            await message.channel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la commande help :', error);
        message.channel.send('Une erreur est survenue lors de l\'envoi de la commande help.');
    }
},

    
    // Commande : Apropos
    apropos: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('À propos de DevSphere')
            .setDescription('DevSphere est une agence spécialisée en programmation bot discord et java-plugins.')
            .setColor('#0099ff')
            .setFooter({ text: 'Contactez-nous pour en savoir plus !' });
        message.channel.send({ embeds: [embed] });
    },

    services: async  (message) => {
        const embed = new EmbedBuilder()
            .setTitle('Nos Services')
            .setDescription('DevSphere offre :\n\n- Bot Discord Personnalisé \n- Création de plugins/serveur Minecraft')
            .setColor('#00ff00')
            .setFooter({ text: 'DevSphere, votre partenaire digital.' });
        message.channel.send({ embeds: [embed] });
    },

    // Commande : Portfolio
    portfolio: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('Notre Portfolio')
            .setDescription('Découvrez nos projets récents sur notre site web : A venir ')
            .setColor('#ff9900')
            .setFooter({ text: 'Nous innovons pour vous.' });
        message.channel.send({ embeds: [embed] });
    },

    // Commande : Contact
    contact: async (message) => {
        const embed = new EmbedBuilder()
            .setTitle('Contactez-nous')
            .setDescription('Voici nos coordonnées :\n\n**Email** : devsphereassit@gmail.com\n**Site Web** : A venir\n**Discord** : DevSphere#8228')
            .setColor('#00ccff')
            .setFooter({ text: 'Nous sommes là pour vous aider.' });
        message.channel.send({ embeds: [embed] });
    },

    // Commande : Code Snippet
    code_snippet: async (message) => {
        const args = message.content.split(' ').slice(1);
        const langage = args[0];
        const fonctionnalite = args.slice(1).join(' ');

        let code = '';
        if (langage === 'html') {
            code = `<button onclick=\"alert('Bienvenue chez DevSphere !')\">Cliquez-moi</button>`;
        } else if (langage === 'css') {
            code = button `{ background-color: blue; color: white; padding: 10px; border: none; }`;
        } else if (langage === 'javascript') {
            code = console.log('Bienvenue chez DevSphere !');;
        } else {
            return message.reply('Langage non supporté. Veuillez choisir entre HTML, CSS, ou JavaScript.');
        }

        message.channel.send(`Voici un exemple de code pour "${fonctionnalite}" en ${langage} :\n\\\${langage}\n${code}\n\\\``);
    },
    
    // Commande : Idée de Jeu
    idee_jeu: async (message) => {
        const ideas = [
            'Un jeu de plateforme où le héros est un développeur cherchant à résoudre des bugs.',
            'Un RPG où chaque niveau représente une étape dans un projet de programmation.',
            'Un puzzle-game basé sur des algorithmes de tri.'
        ];
        const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
        message.channel.send(`Idée de jeu : ${randomIdea}`);
    },

    avis: async (message) => {
    if (!message.guild) {
        return message.reply("❌ Cette commande ne peut être utilisée que sur un serveur.");
    }

    const args = message.content.split(/ +/).slice(1);
    if (args.length < 2) {
        return message.reply("⚠️ Usage : +avis <note de 1 à 5> <votre avis>\nExemple : +avis 5 Super service, je recommande !");
    }

    const note = parseInt(args[0]);
    if (isNaN(note) || note < 1 || note > 5) {
        return message.reply("⚠️ La note doit être un nombre entre **1 et 5**.");
    }

    const avisTexte = args.slice(1).join(" ");
    const avisChannelId = "1347758146201976898"; // Remplace par l'ID du salon des avis
    const avisChannel = message.guild.channels.cache.get(avisChannelId);

    if (!avisChannel) {
        return message.reply("❌ Le salon des avis clients est introuvable. Vérifie l'ID dans le code !");
    }

    const stars = "⭐".repeat(note) + "☆".repeat(5 - note);
    const avisId = Date.now();

    const embed = {
        color: 0xFFD700,
        title: "📝 Nouvel Avis Client",
        description: avisTexte,
        fields: [
            { name: "👤 Utilisateur", value: `${message.author.tag}`, inline: true },
            { name: "📅 Date", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
            { name: "⭐ Note", value: stars, inline: false }
        ],
        footer: {
            text: `ID de l'avis : ${avisId}`,
        },
        timestamp: new Date(),
    };

    avisChannel.send({ embeds: [embed] });

    // ✅ Sauvegarde de l'avis
    const fs = require('fs');
    const path = require('path');
    const avisFile = path.join(__dirname, '../container/home/data/avis.json');

    let avisData = [];
    if (fs.existsSync(avisFile)) {
        avisData = JSON.parse(fs.readFileSync(avisFile, 'utf8'));
    }
    avisData.push({ id: avisId, userId: message.author.id, text: avisTexte, note });
    fs.writeFileSync(avisFile, JSON.stringify(avisData, null, 2));

    message.reply("✅ Ton avis a été envoyé avec succès. Merci pour ton retour !");
},


mesavis: async (message) => {
    const fs = require('fs');
    const path = require('path');
    const avisFile = path.join(__dirname, '../container/home/data/avis.json');

    if (!fs.existsSync(avisFile)) {
        return message.reply("❌ Aucun avis enregistré.");
    }

    const avisData = JSON.parse(fs.readFileSync(avisFile, 'utf8'));
    const userAvis = avisData.filter(avis => avis.userId === message.author.id);

    if (userAvis.length === 0) {
        return message.reply("❌ Tu n'as laissé aucun avis.");
    }

    const embed = {
        color: 0x0099ff,
        title: "📜 Tes avis",
        fields: userAvis.map(avis => ({
            name: `Avis ID: ${avis.id}`,
            value: `⭐ ${"⭐".repeat(avis.note)}\n${avis.text}`,
            inline: false
        })),
        footer: {
            text: `Demandé par ${message.author.tag}`,
        },
        timestamp: new Date(),
    };

    message.channel.send({ embeds: [embed] });
},

delavis: async (message) => {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply("❌ Tu n'as pas la permission de supprimer des avis.");
    }

    const args = message.content.split(/ +/).slice(1);
    if (args.length !== 1) {
        return message.reply("⚠️ Usage : `!delavis <ID>`\nExemple : `!delavis 1700000000000`");
    }

    const avisId = parseInt(args[0]);
    if (isNaN(avisId)) {
        return message.reply("❌ L'ID de l'avis doit être un nombre.");
    }

    const fs = require('fs');
    const path = require('path');
    const avisFile = path.join(__dirname, '../container/home/data/avis.json');

    if (!fs.existsSync(avisFile)) {
        return message.reply("❌ Aucun avis enregistré.");
    }

    let avisData = JSON.parse(fs.readFileSync(avisFile, 'utf8'));
    const avisIndex = avisData.findIndex(avis => avis.id === avisId);

    if (avisIndex === -1) {
        return message.reply("❌ Avis introuvable.");
    }

    avisData.splice(avisIndex, 1);
    fs.writeFileSync(avisFile, JSON.stringify(avisData, null, 2));

    message.reply(`✅ L'avis **${avisId}** a été supprimé.`);
},

    // Commande : Ping
    ping: async (message) => {
        message.channel.send('Pong');
    }
};

// Gère les messages reçus
client.on('messageCreate', message => {
    if (!message.content.startsWith('+') || message.author.bot) return;

    const args = message.content.slice(1).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command in commands) {
        commands[command](message);
    } else {
        message.channel.send(`Commande inconnue : ${command}`);
    }
});

// Se déclenche lorsque le bot est prêt
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
    
   client.user.setPresence({
    status: 'online', // 🟢 En ligne
    activities: [{
        name: 'Logs Des Serveurs',
        type: 'WATCHING' // 🎮 "Joue à Minecraft"
    }]
});
});

// Connexion du bot
client.login(process.env.DISCORD_TOKEN);