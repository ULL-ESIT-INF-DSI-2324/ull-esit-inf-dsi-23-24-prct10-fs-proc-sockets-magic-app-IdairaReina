import * as net from 'net';
import yargs from 'yargs';
import chalk from 'chalk';
import { CardData, CardType, Color, Rarity } from './card.js';
import { hideBin } from 'yargs/helpers';
import { userCardsMap } from './server.js';

const client = new net.Socket();

client.connect(60300, 'localhost', () => {
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
        .command(
            'modify',
            'Modifies a card in the collection',
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
                    type: 'string'
                },
                manaCost: {
                    description: 'Mana Cost',
                    type: 'number'
                },
                color: {
                    description: 'Color of the card',
                    type: 'string'
                },
                type: {
                    description: 'Type of the card',
                    type: 'string'
                },
                rarity: {
                    description: 'Rarity of the card',
                    type: 'string'
                },
                rulesText: {
                    description: 'Rules Text of the card',
                    type: 'string'
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
                    type: 'number'
                }
            },
            (argv) => {
                const modifiedData: Partial<CardData> = {};
        
                if (argv.name) modifiedData.name = argv.name;
                if (argv.manaCost) modifiedData.manaCost = argv.manaCost;
                if (argv.color) modifiedData.color = argv.color as Color;
                if (argv.type) modifiedData.type = argv.type as CardType;
                if (argv.rarity) modifiedData.rarity = argv.rarity as Rarity;
                if (argv.rulesText) modifiedData.rulesText = argv.rulesText;
                if (argv.power) modifiedData.power = argv.power;
                if (argv.toughness) modifiedData.toughness = argv.toughness;
                if (argv.loyalty) modifiedData.loyalty = argv.loyalty;
                if (argv.marketValue) modifiedData.marketValue = argv.marketValue;
        
                // Construir la solicitud a enviar al servidor
                const request = {
                    userId: argv.user,
                    action: 'modify',
                    cardId: argv.id,
                    modifiedData: modifiedData
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
        .command(
            'delete',
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
                }
            },
            (argv) => {
                const userId = argv.user;
                const cardId = argv.id;
    
                // Buscar el usuario en userCardsMap
                const userCards = userCardsMap.get(userId);
    
                if (userCards) {
                    // Buscar la carta por su ID
                    const cardToDelete = userCards.find(card => card.id === cardId);
    
                    if (cardToDelete) {
                        // Construir la solicitud a enviar al servidor
                        const request = {
                            userId: userId,
                            action: 'delete',
                            cardData: cardToDelete
                        };
    
                        // Convertir la solicitud a una cadena JSON
                        const requestData = JSON.stringify(request);
                        const requestDataLength = Buffer.byteLength(requestData);
    
                        // Enviar la longitud de los datos de la solicitud primero
                        client.write(Buffer.from(requestDataLength.toString()));
    
                        // Luego, enviar los datos de la solicitud
                        client.write(requestData);
                    } else {
                        console.error(chalk.red('No se encontró ninguna carta con el ID especificado.'));
                    }
                } else {
                    console.error(chalk.red('No se encontró ningún usuario con el nombre especificado.'));
                }
            }
        )
        .command(
            'show',
            'Shows information of a specific card in the collection',
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
                }
            },
            (argv) => {
                const userId = argv.user;
                const cardId = argv.id;

                // Buscar el usuario en userCardsMap
                const userCards = userCardsMap.get(userId);
    
                if (userCards) {
                    // Buscar la carta por su ID
                    const cardToDelete = userCards.find(card => card.id === cardId);
    
                    if (cardToDelete) {
                        // Construir la solicitud a enviar al servidor
                        const request = {
                            userId: userId,
                            action: 'show',
                            cardId: cardId
                        };
    
                        // Convertir la solicitud a una cadena JSON
                        const requestData = JSON.stringify(request);
                        const requestDataLength = Buffer.byteLength(requestData);
    
                        // Enviar la longitud de los datos de la solicitud primero
                        client.write(Buffer.from(requestDataLength.toString()));
    
                        // Luego, enviar los datos de la solicitud
                        client.write(requestData);
                    } else {
                        console.error(chalk.red('No se encontró ninguna carta con el ID especificado.'));
                    }
                } else {
                    console.error(chalk.red('No se encontró ningún usuario con el nombre especificado.'));
                }
        
            }
        )
        .command(
            'list',
            'List all cards in the collection',
            {
                user: {
                    description: 'User name',
                    type: 'string',
                    demandOption: true,
                }
            },
            (argv) => {
                const { user } = argv;
                // Buscar el usuario en userCardsMap
                const userCards = userCardsMap.get(user);
    
                if (userCards) {
    
                        // Construir la solicitud a enviar al servidor
                        const request = {
                            userId: user,
                            action: 'list'
                        };
    
                        // Convertir la solicitud a una cadena JSON
                        const requestData = JSON.stringify(request);
                        const requestDataLength = Buffer.byteLength(requestData);
    
                        // Enviar la longitud de los datos de la solicitud primero
                        client.write(Buffer.from(requestDataLength.toString()));
    
                        // Luego, enviar los datos de la solicitud
                        client.write(requestData);
                } else {
                    console.error(chalk.red('No se encontró ningún usuario con el nombre especificado.'));
                }
            
            }
        )
        .argv;
});

let responseData: string = '';

/**
 * Callback para manejar datos recibidos del servidor.
 * @callback DataReceivedCallback
 * @param {string} data - Los datos recibidos del servidor.
 */

/**
 * Maneja los eventos de datos recibidos y cierre de conexión en el cliente.
 * @param {net.Socket} client - El socket del cliente.
 * @param {DataReceivedCallback} onDataReceived - Callback para manejar los datos recibidos.
 */

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

/**
 * Maneja el evento de cierre de conexión en el cliente.
 */

client.on('close', () => {
    console.log('Conexión cerrada');
});
