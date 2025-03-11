client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'ticket_type') {
        const guild = interaction.guild;
        const user = interaction.user;
        const categoryId = '1335740567610589196';  // Assure-toi que cette catégorie existe
        const staffRoleId = '1280851157530578985'; // ID du rôle staff
        const type = interaction.values[0]; // Type choisi pour le ticket

        const typeLabels = {
            support: '💡 Java',
            reclamation: '🚨 Discord',
        };

        try {
            // Vérifie l'ID de la catégorie
            console.log('Catégorie:', guild.channels.cache.get(categoryId));

            // Créer le salon de ticket
            const ticketName = `ticket-${user.id}`;
            console.log('Nom du ticket:', ticketName);  // Log du nom du ticket

            const ticketChannel = await guild.channels.create({
                name: ticketName,  // Utilise un nom valide
                type: 'GUILD_TEXT',  // Assure-toi d'utiliser 'GUILD_TEXT'
                parent: categoryId,  // ID de la catégorie des tickets
                topic: `${user.username} - ${typeLabels[type]}`,  // Sujet du salon
                permissionOverwrites: [
                    { id: guild.id, deny: ['VIEW_CHANNEL'] },
                    { id: user.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
                    { id: staffRoleId, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
                ],
            });

            console.log('Salon de ticket créé:', ticketChannel.name);

            // Ajouter des boutons "Claim" et "Fermer"
            const row = {
                type: 1,
                components: [
                    { type: 2, custom_id: 'claim_ticket', label: '🎫 Claim Ticket', style: 1 },
                    { type: 2, custom_id: 'close_ticket', label: '🔒 Fermer le ticket', style: 4 },
                ],
            };

            await ticketChannel.send({
                content: `🎟️ **Ticket ouvert par ${user} - Type : ${typeLabels[type]}**\n🔧 Un membre du staff va t'aider.`,
                components: [row],
            });

            // Confirmation à l'utilisateur
            await interaction.reply({ content: `✅ Ton ticket a été créé ici : ${ticketChannel}`, ephemeral: true });

        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error);
            interaction.reply({ content: "❌ Une erreur s'est produite.", ephemeral: true });
        }
    }
});
