import * as net from 'net';
import yargs from 'yargs';
import chalk from 'chalk';
import { CardData, CardType, Color, Rarity } from './card.js';
import { hideBin } from 'yargs/helpers';

const client = new net.Socket();

client.connect(3000, 'localhost', () => {
    console.log('Conectado al servidor');

    // Obtener los argumentos de la línea de comandos utilizando yargs
    yargs(hideBin(process.argv))
        .command(
            'add',
            'Adds a card to the collection',
            {
                user: {
                    description: 'User name',
                    type: 'string',
                    demandOption: true,
                },
                id: {
                    description: 'Card ID',
                    type: 'number',
                    demandOption: true
                },
                name: {
                    description: 'Card Name',
                    type: 'string',
                    demandOption: true
                },
                manaCost: {
                    description: 'Mana Cost',
                    type: 'number',
                    demandOption: true
                },
                color: {
                    description: 'Color of the card',
                    type: 'string',
                    demandOption: true
                },
                type: {
                    description: 'Type of the card',
                    type: 'string',
                    demandOption: true
                },
                rarity: {
                    description: 'Rarity of the card',
                    type: 'string',
                    demandOption: true
                },
                rulesText: {
                    description: 'Rules Text of the card',
                    type: 'string',
                    demandOption: true
                },
                power: {
                    description: 'Power of the card (only for creatures)',
                    type: 'number'
                },
                toughness: {
                    description: 'Toughness of the card (only for creatures)',
                    type: 'number'
                },
                loyalty: {
                    description: 'Loyalty of the card (only for planeswalkers)',
                    type: 'number'
                },
                marketValue: {
                    description: 'Market value of the card',
                    type: 'number',
                    demandOption: true
                }
            },
            (argv) => {
                // Crear un objeto CardData con los datos de la carta
                const cardData: CardData = {
                    id: argv.id,
                    name: argv.name,
                    manaCost: argv.manaCost,
                    color: argv.color as Color,
                    type: argv.type as CardType,
                    rarity: argv.rarity as Rarity,
                    rulesText: argv.rulesText,
                    power: argv.power,
                    toughness: argv.toughness,
                    loyalty: argv.loyalty,
                    marketValue: argv.marketValue
                };

                // Construir la solicitud a enviar al servidor
                const request = {
                    userId: argv.user,
                    action: 'add',
                    cardData: cardData
                };

                // Convertir la solicitud a una cadena JSON
                const requestData = JSON.stringify(request);
                const requestDataLength = Buffer.byteLength(requestData);

                // Enviar la longitud de los datos de la solicitud primero
                client.write(Buffer.from(requestDataLength.toString()));

                // Luego, enviar los datos de la solicitud
                client.write(requestData);
            }
        )
        .argv;
});


let responseData: string = '';

client.on('data', (data) => {

        // Concatenar los datos de respuesta
        responseData += data.toString();

            // Analizar la respuesta del servidor
            try {
                const response = JSON.parse(responseData);

                // Verificar el estado de la respuesta y mostrarla con Chalk
                if (response.status === 'OK') {
                    console.log(chalk.green('Respuesta del servidor:', response.message));
                } else {
                    console.error(chalk.red('Error del servidor:', response.message));
                }
            } catch (error) {
                console.error(chalk.red('Error al analizar la respuesta del servidor:', error));
            }

            // Cerrar la conexión después de recibir la respuesta
            client.end();
 
});

client.on('close', () => {
    console.log('Conexión cerrada');
});
