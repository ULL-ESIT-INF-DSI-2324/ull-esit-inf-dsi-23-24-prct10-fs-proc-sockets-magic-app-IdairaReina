# Práctica 10 - Aplicación cliente-servidor para coleccionistas de cartas Magic

- Grado en Ingenería Informática
- Asignatura: Desarrollo de sistemas informáticos
- Curso: 2024
- Alumno: Idaira Reina González (alu0101398495)
- Universidad de La Laguna

## Índice
- [1. Introduccion](#introduccion)
- [2. Desarrollo de la aplicación](#desarrollo)
- [3. Tests realizados](#tests)
- [4. Ejercicios realizados en el pe102](#pe102)
- [5. Dificultades y conclusion](#conclusion)
- [6. Referencias](#referencias)

## 1. Introducción <a name="introduccion"></a>
En esta práctica, se abordará la extensión de la aplicación previamente desarrollada para coleccionistas de cartas Magic, como se detalla en la Práctica 9. La tarea consiste en la creación de un sistema de servidor y cliente utilizando los recursos proporcionados por los sockets integrados en el módulo net de Node.js.

Las funcionalidades disponibles para el cliente serán las mismas que fueron implementadas en la etapa anterior: agregar, modificar, eliminar, listar y visualizar la colección de cartas asociada a un usuario específico. La interacción del usuario con la aplicación cliente se realizará exclusivamente a través de la interfaz de línea de comandos.

Simultáneamente, en el servidor, la gestión de la información referente a las cartas Magic se llevará a cabo mediante el almacenamiento en archivos JSON dentro del sistema de archivos. Este enfoque sigue la misma estructura de directorios adoptada en la Práctica 9.

## 2. Desarrollo de la aplicación <a name="desarrollo"></a>

En primer lugar se explica como está desarrollada la aplicación, es decir, el contenido de cada uno de los ficheros que la componen:

### [filemanager.ts](https://github.com/ULL-ESIT-INF-DSI-2324/ull-esit-inf-dsi-23-24-prct10-fs-proc-sockets-magic-app-IdairaReina/blob/main/src/cliente-servidor/filemanager.ts)

Este archivo contiene la definición de la clase FileManager, que se encarga de administrar la creación, lectura, modificación y eliminación de archivos JSON que representan cartas de usuarios en el sistema.

**Contenido:**
Definición de la clase FileManager.
Métodos para agregar, eliminar, modificar, listar y mostrar cartas de usuarios.
Lógica para leer y escribir archivos JSON en el sistema de archivos.
Implementación de rutas de archivos y directorios para almacenar datos de usuarios y cartas.

**Métodos principales:**
addCard(userId, cardData, callback): Agrega una nueva carta para un usuario específico.
deleteCard(userId, cardId, callback): Elimina una carta de un usuario.
modifyCard(userId, cardId, newCardData, callback): Modifica los datos de una carta existente.
listCard(userId, callback): Lista todas las cartas de un usuario.
showCard(userId, cardId, callback): Muestra los detalles de una carta específica de un usuario.

El código correspondiente a esta parte:
```ts
import fs from 'fs';
import chalk from 'chalk';
import { CardData } from './card.js';
import * as path from 'path';

/**
 * Class to manage the file system for user cards
 */
export class FileManager {
  private static instance: FileManager;
  private userDataDirectory = 'users';

  private constructor() {}

  /**
   * Method to get the instance of the FileManager
   * @returns the instance of the FileManager
   */
  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

 // Método para agregar una carta al sistema de archivos del usuario
public addCard(userId: string, cardData: CardData, callback: (error: string | undefined, result: string | undefined) => void): void {
  // Se define la ruta del directorio del usuario
  const userDirectory = `./users/${userId}`;

  // Se verifica si el directorio del usuario ya existe
  fs.stat(userDirectory, (err) => {
      if (err) {
          // Si no existe, se crea el directorio
          fs.mkdir(userDirectory, { recursive: true }, (err) => {
              if (err) {
                  // Si ocurre un error al crear el directorio, se llama al callback con el error
                  callback(chalk.red.bold(err.message), undefined);
              } else {
                  // Si la operación es exitosa, se procede a escribir la carta en el archivo correspondiente
                  const cardFilePath = `${userDirectory}/${cardData.id}.json`;
                  fs.writeFile(cardFilePath, JSON.stringify(cardData), (err) => {
                      if (err) {
                          // Si ocurre un error al escribir el archivo, se llama al callback con el error
                          callback(chalk.red.bold(err.message), undefined);
                      } else {
                          // Si la operación es exitosa, se llama al callback con un mensaje de éxito
                          callback(undefined, chalk.green.bold(`Card added to user ${userId}'s collection`));
                      }
                  });
              }
          });
      } else {
          // Si el directorio del usuario ya existe, se procede a verificar si el archivo de la carta ya existe
          const cardFilePath = `${userDirectory}/${cardData.id}.json`;
          fs.stat(cardFilePath, (err) => {
              if (err) {
                  // Si no existe, se procede a escribir la carta en el archivo correspondiente
                  fs.writeFile(cardFilePath, JSON.stringify(cardData), (err) => {
                      if (err) {
                          // Si ocurre un error al escribir el archivo, se llama al callback con el error
                          callback(chalk.red.bold(err.message), undefined);
                      } else {
                          // Si la operación es exitosa, se llama al callback con un mensaje de éxito
                          callback(undefined, chalk.green.bold(`Card added to user ${userId}'s collection`));
                      }
                  });
              } else {
                  // Si ya existe un archivo con el mismo ID, se llama al callback con un mensaje de error
                  callback(chalk.red.bold(`A card with the same ID already exists in user ${userId}'s collection`), undefined);
              }
          });
      }
  });
}

public deleteCard(userId: string, cardId: number, callback: (error: string | undefined, result: string | undefined) => void): void {
  const cardFilePath = `./users/${userId}/${cardId}.json`;

  fs.unlink(cardFilePath, (err) => {
      if (err) {
          callback(`Error al eliminar la carta: ${err.message}`, undefined);
      } else {
          callback(undefined, `Carta eliminada correctamente del usuario ${userId}`);
      }
  });
}

public modifyCard(userId: string, cardId: number, newCardData: CardData, callback: (error: string | undefined, result: string | undefined) => void): void {
    const userDir = path.join(this.userDataDirectory, userId);
    const filePath = path.join(userDir, `${cardId}.json`);

    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            callback('No se encontró la carta especificada.', undefined);
        } else {
            try {
                const existingCardData: CardData = JSON.parse(data);
                const modifiedCardData: CardData = { ...existingCardData, ...newCardData };

                fs.writeFile(filePath, JSON.stringify(modifiedCardData, null, 2), (err) => {
                    if (err) {
                        callback('Error al modificar la carta.', undefined);
                    } else {
                        callback(undefined, 'Carta modificada correctamente.');
                    }
                });
            } catch (error) {
                callback('Error al procesar los datos de la carta.', undefined);
            }
        }
    });
}

public listCard(userId: string, callback: (error: string | undefined, result: CardData[] | undefined) => void): void {
    const userDir = path.join(this.userDataDirectory, userId);

    fs.readdir(userDir, (err, files) => {
        if (err) {
            callback('Error al listar las cartas del usuario.', undefined);
        } else {
            const cardFiles: string[] = files.filter(file => file.endsWith('.json'));
            const cards: CardData[] = [];

            // Leer cada archivo de carta
            cardFiles.forEach(file => {
                const filePath = path.join(userDir, file);
                //const cardId = parseInt(path.parse(file).name); // Obtener el ID de la carta del nombre del archivo

                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        console.error('Error al leer el archivo:', err);
                    } else {
                        try {
                            const cardData: CardData = JSON.parse(data);
                            cards.push(cardData);
                        } catch (error) {
                            console.error('Error al procesar los datos de la carta:', error);
                        }
                    }

                    // Verificar si se han leído todas las cartas
                    if (cards.length === cardFiles.length) {
                        callback(undefined, cards);
                    }
                });
            });
        }
    });
}

public showCard(userId: string, cardId: number, callback: (error: string | undefined, result: CardData | undefined) => void): void {
    const cardFilePath = `./users/${userId}/${cardId}.json`;

    fs.readFile(cardFilePath, 'utf-8', (err, data) => {
        if (err) {
            callback('Error al mostrar la carta.', undefined);
        } else {
            try {
                const cardData: CardData = JSON.parse(data);
                callback(undefined, cardData);
            } catch (error) {
                callback('Error al procesar los datos de la carta.', undefined);
            }
        }
    });
}
}
```

### [client.ts](https://github.com/ULL-ESIT-INF-DSI-2324/ull-esit-inf-dsi-23-24-prct10-fs-proc-sockets-magic-app-IdairaReina/blob/main/src/cliente-servidor/client.ts)

Este archivo contiene la implementación del cliente de la aplicación, que se conecta al servidor y envía solicitudes para agregar, eliminar, modificar, listar y mostrar cartas.

**Contenido:**
Configuración de la conexión del cliente al servidor.
Implementación de comandos para agregar, eliminar, modificar, listar y mostrar cartas utilizando la biblioteca yargs.
Manejo de eventos de conexión, envío y recepción de datos con el servidor.

El código correspondiente a esta parte:
```ts
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
```
### [server.ts](https://github.com/ULL-ESIT-INF-DSI-2324/ull-esit-inf-dsi-23-24-prct10-fs-proc-sockets-magic-app-IdairaReina/blob/main/src/cliente-servidor/server.ts)

Este archivo contiene la implementación del servidor de la aplicación, que recibe las solicitudes del cliente, procesa los datos y devuelve las respuestas correspondientes.

**Contenido:**
Configuración del servidor para escuchar conexiones de clientes.
Manejo de solicitudes del cliente, incluyendo agregar, eliminar, modificar, listar y mostrar cartas.
Lógica para procesar las solicitudes del cliente y comunicarse con el FileManager.

**Métodos principales:**
Lógica para agregar, eliminar, modificar, listar y mostrar cartas según las solicitudes del cliente.
FileManager se utiliza para realizar operaciones en los datos de las cartas.

El código correspondiente a esta parte:
```ts
import * as net from 'net';
import fs from 'fs';
import { Card, CardData } from './card.js';
import * as path from 'path';
import {FileManager} from './filemanager.js';


// Directorio base para los datos de los usuarios
const userDataDirectory = 'users';
export const userCardsMap: Map<string, Card[]> = new Map();


// Función para cargar todas las cartas de un usuario existente
async function loadAllUserCards(): Promise<void> {
    try {
        const userDirectories = await fs.promises.readdir(userDataDirectory);

        for (const userId of userDirectories) {
            const userDir = path.join(userDataDirectory, userId);
            const userFiles = await fs.promises.readdir(userDir);

            const cards: Card[] = [];

            for (const userFile of userFiles) {
                const filePath = path.join(userDir, userFile);
                const cardData = await loadCardFromFileAsync(filePath);
                cards.push(cardData);
            }

            userCardsMap.set(userId, cards);
            console.log(`Cartas de usuario '${userId}' cargadas correctamente.`);
        }
    } catch (error) {
        console.error('Error al cargar las cartas de usuario:', error);
    }
}

// Llamar a la función para cargar las cartas de todos los usuarios existentes al iniciar el servidor
loadAllUserCards()
    .then(() => {
        console.log('Todas las cartas de usuario cargadas correctamente.');
    })
    .catch(error => {
        console.error('Error al cargar las cartas de usuario:', error);
    });

// Función para cargar una carta desde un archivo JSON de manera asíncrona
function loadCardFromFileAsync(filePath: string): Promise<Card> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                const cardData: CardData = JSON.parse(data);
                const card = new Card(cardData);
                resolve(card);
            }
        });
    });
}


const server = net.createServer((socket) => {
    console.log('Cliente conectado');

    let requestDataLength: number | null = null;
    let requestData = '';
    const fileManager = FileManager.getInstance();
    

    // Manejar datos recibidos del cliente
    socket.on('data', async (data) => {
      
        if (requestDataLength === null) {
            // Si aún no hemos recibido la longitud de los datos de la solicitud
            requestDataLength = parseInt(data.toString());

        } else {
            // Concatenar los datos de la solicitud
            requestData += data.toString();

                // Analizar la solicitud del cliente
                const request = JSON.parse(requestData);

                const { cardData } = request;

                // Manejar la solicitud y enviar respuesta al cliente
                const userId = request.userId;
                
                try {
                    switch (request.action) {
                        case 'add':
                           // Añadir la carta al sistema de archivos
                        fileManager.addCard(userId, cardData, (error, result) => {
                         if (error) {
                         console.error('Error al añadir la carta:', error);
                         const responseError = { status: 'Error', message: error };
                         const responseDataError = JSON.stringify(responseError);
                         socket.write(responseDataError);
                         } else {
                             console.log('Carta añadida correctamente:', result);
                             const responseAdd = { status: 'OK', message: 'Carta añadida correctamente' };
                             const responseDataAdd = JSON.stringify(responseAdd);
                             socket.write(responseDataAdd);
                             // Cerrar el lado cliente del socket después de enviar la respuesta
                             socket.end();
                            }
                        });
                            break;
                        case 'modify':
                            fileManager.modifyCard(userId, request.cardId, request.modifiedData, (error, result) => {
                                if (error) {
                                    // Si hay un error, registrar y enviar respuesta de error al cliente
                                    console.error('Error al modificar la carta:', error);
                                    const responseError = { status: 'Error', message: error };
                                    const responseDataError = JSON.stringify(responseError);
                                    socket.write(responseDataError);
                                } else {
                                    // Si se modificó correctamente, registrar y enviar respuesta de éxito al cliente
                                    console.log('Carta modificada correctamente:', result);
                                    const responseSuccess = { status: 'OK', message: result };
                                    const responseDataSuccess = JSON.stringify(responseSuccess);
                                    socket.write(responseDataSuccess);
                                }
                            });
                            break;
                        case 'delete':
                            // Llamada a la función deleteCard del FileManager
                        fileManager.deleteCard(userId, request.cardData.id, (error, result) => {
                          if (error) {
                         // Si hay un error, registrar y enviar respuesta de error al cliente
                         console.error('Error al eliminar la carta:', error);
                         const responseError = { status: 'Error', message: error };
                         const responseDataError = JSON.stringify(responseError);
                         socket.write(responseDataError);
                         } else {
                           // Si se eliminó correctamente, registrar y enviar respuesta de éxito al cliente
                           console.log('Carta eliminada correctamente:', result);
                           const responseSuccess = { status: 'OK', message: result };
                           const responseDataSuccess = JSON.stringify(responseSuccess);
                           socket.write(responseDataSuccess);
                           socket.end();
                         }
                        });
                            break;
                        case 'list':
                            fileManager.listCard(userId, (error, result) => {
                                if (error) {
                                    const responseError = { status: 'Error', message: error };
                                    const responseDataError = JSON.stringify(responseError);
                                    const responseDataLengthError = Buffer.byteLength(responseDataError);
                                    socket.write(Buffer.from(responseDataLengthError.toString()));
                                    socket.write(responseDataError);
                                } else {
                                    const responseSuccess = { status: 'OK', message: result };
                                    const responseDataSuccess = JSON.stringify(responseSuccess);
                                    const responseDataLengthSuccess = Buffer.byteLength(responseDataSuccess);
                                    socket.write(Buffer.from(responseDataLengthSuccess.toString()));
                                    socket.write(responseDataSuccess);
                                }
                            });
                            break;
                        case 'show':
                            fileManager.showCard(userId, request.cardId, (error, result) => {
                                if (error) {
                                    console.error('Error:', error);
                                    // Enviar respuesta de error al cliente
                                    const responseError = { status: 'Error', message: error };
                                    const responseDataError = JSON.stringify(responseError);
                                    const responseDataLengthError = Buffer.byteLength(responseDataError);
                                    socket.write(Buffer.from(responseDataLengthError.toString()));
                                    socket.write(responseDataError);
                                } else {
                                    // Enviar respuesta con los datos de la carta al cliente
                                    const responseData = JSON.stringify(result);
                                    const responseDataLength = Buffer.byteLength(responseData);
                                    socket.write(Buffer.from(responseDataLength.toString()));
                                    socket.write(responseData);
                                }
                            });
                            break;
                        default:
                            console.error('Acción no válida');
                    }
                } catch (error) {
                    console.error('Error:', error.message);
                    // Enviar respuesta de error al cliente
                    const responseError = { status: 'Error', message: error.message };
                    const responseDataError = JSON.stringify(responseError);
                    const responseDataLengthError = Buffer.byteLength(responseDataError);
                    socket.write(Buffer.from(responseDataLengthError.toString()));
                    socket.write(responseDataError);
                }

                // Reiniciar variables para la próxima solicitud
                requestDataLength = null;
                requestData = '';
        }
    });

    // Manejar eventos de cierre de conexión
    socket.on('close', () => {
        console.log('Cliente desconectado');
    });

    // Manejar errores de conexión
    socket.on('error', (error) => {
        console.error('Error en la conexión:', error);
    });
});

// Escuchar en un puerto específico
const PORT = 60300;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
```

### [card.ts](https://github.com/ULL-ESIT-INF-DSI-2324/ull-esit-inf-dsi-23-24-prct10-fs-proc-sockets-magic-app-IdairaReina/blob/main/src/cliente-servidor/card.ts)

En este archivo se encuentra la implementación de la clase Card, que representa una carta del juego. La clase Card tiene métodos para acceder y manipular los datos de la carta, así como para serializar y deserializar la carta a/desde JSON.

Constructor: Al crear una instancia de Card, se especifican los datos de la carta.

Métodos Get: Proporcionan acceso a los diferentes atributos de la carta, como ID, nombre, costo de mana, etc.

Método setData: Actualiza los datos de la carta con los proporcionados.

Método toJSON: Serializa la carta a un objeto JSON.

Método estático fromJSON: Deserializa un objeto JSON en una instancia de Card.

```ts
/**
 * Enumeración para los colores de las cartas.
 */
export enum Color {
    Blanco = "blanco",
    Azul = "azul",
    Negro = "negro",
    Rojo = "rojo",
    Verde = "verde",
    Incoloro = "incoloro",
    Multicolor = "multicolor"
}

/**
 * Enumeración para los tipos de cartas.
 */
export enum CardType {
    Tierra = "Tierra",
    Criatura = "Criatura",
    Encantamiento = "Encantamiento",
    Conjuro = "Conjuro",
    Instantaneo = "Instantáneo",
    Artefacto = "Artefacto",
    Planeswalker = "Planeswalker"
}

/**
 * Enumeración para las rarezas de las cartas.
 */
export enum Rarity {
    Comun = "Común",
    Infrecuente = "Infrecuente",
    Rara = "Rara",
    Mítica = "Mítica"
}

/**
 * Interfaz que define la estructura de los datos de una carta.
 */
export interface CardData {
    id: number;
    name: string;
    manaCost: number;
    color: Color;
    type: CardType;
    rarity: Rarity;
    rulesText: string;
    power?: number;
    toughness?: number; //resistencia
    loyalty?: number;
    marketValue: number;
}

/**
 * Clase que representa una carta.
 */
export class Card {
    private data: CardData;

    /**
     * Crea una instancia de Card.
     * @param data Los datos de la carta.
     */
    constructor(data: CardData) {
        this.data = data;
    }

    // Getters
    get id() {
        return this.data.id;
    }

    get name() {
        return this.data.name;
    }

    get manaCost() {
        return this.data.manaCost;
    }

    get color() {
        return this.data.color;
    }

    get type() {
        return this.data.type;
    }

    get rarity() {
        return this.data.rarity;
    }

    get rulesText() {
        return this.data.rulesText;
    }

    get power() {
        return this.data.power;
    }

    get toughness() {
        return this.data.toughness;
    }

    get loyalty() {
        return this.data.loyalty;
    }

    get marketValue() {
        return this.data.marketValue;
    }

    // Other getters for card properties...

    /**
     * Establece los datos de la carta.
     * @param data Los nuevos datos de la carta.
     */
    setData(data: CardData) {
        this.data = data;
    }

    /**
     * Convierte la carta a formato JSON.
     * @returns Los datos de la carta en formato JSON.
     */
    toJSON(): CardData {
        return this.data;
    }

    /**
     * Crea una instancia de Card a partir de datos en formato JSON.
     * @param json Los datos de la carta en formato JSON.
     * @returns Una nueva instancia de Card.
     */
    static fromJSON(json: CardData): Card {
        return new Card(json);
    }
}
```

## 3. Tests realizados <a name="tests"></a>

El conjunto de pruebas proporcionado abarca varios aspectos, desde la creación y manipulación de cartas hasta la interacción con el servidor y el administrador de archivos. A continuación, se presenta un análisis detallado de cada conjunto de pruebas:

**Pruebas para la Clase Card:**

Creación de Instancia: Esta prueba verifica si se puede crear correctamente una instancia de la clase Card utilizando datos válidos de una carta. Se espera que la instancia creada sea un objeto de tipo Card.
Comprobación de Atributos: Se realizan tres pruebas separadas para verificar que los atributos de las cartas de diferentes tipos se asignan correctamente a las instancias de Card. Cada prueba evalúa si los atributos de la carta creada coinciden con los datos proporcionados.

**Pruebas para el FileManager:**
Agregar Carta: Verifica si se puede agregar una carta al sistema de archivos utilizando el método addCard del FileManager. Se espera que la operación se realice sin errores.
Eliminar Carta: Prueba la funcionalidad de eliminación de una carta del sistema de archivos utilizando el método deleteCard. Se espera que la operación se realice sin errores.
Modificar Carta: Verifica si se puede modificar una carta en el sistema de archivos utilizando el método modifyCard. Se espera que la operación se realice sin errores.
Listar Cartas: Prueba la capacidad de listar todas las cartas de un usuario utilizando el método listCard. Se espera que la operación se realice sin errores y que el resultado sea un array de objetos CardData.
Mostrar Carta: Verifica si se puede mostrar una carta específica de un usuario utilizando el método showCard. Se espera que la operación se realice sin errores y que el resultado sea un objeto CardData.

**Pruebas para el Cliente:**
Conexión al Servidor: Esta prueba verifica si el cliente puede conectarse al servidor. Se espera que la conexión se establezca correctamente.
Envío de Datos al Servidor: Verifica si el cliente puede enviar datos al servidor y recibir una respuesta. Se espera que el servidor reciba los datos correctamente y responda apropiadamente.

Se puede ver el código de dichas pruebas en este [enlace](https://github.com/ULL-ESIT-INF-DSI-2324/ull-esit-inf-dsi-23-24-prct10-fs-proc-sockets-magic-app-IdairaReina/blob/main/tests/cliente-servidor.spec.ts).

## 4. Ejercicios realizados durante la sesión de práctica <a name="pe102"></a>
El ejercicio propuesto en clase consistía en la modificacion de una de las funciones principales de la práctica 9, implementandola siguiendo el patrón callback y luego sustituir la invocación de métodos del API sincrona de Node.js de gestión del sistema de ficheros por llamadas a los métodos equivalentes del API asíncrona basada en callbacks.

la implementacion realizada fue la siguiente:
```ts
removeCardFromCollection(id: number, userName: string, callback: (error: string | undefined, respuesta: string | undefined) => void): void {
        const userDirectory = `users/${userName}`;
        const filePath = `${userDirectory}/${id}.json`;
    
        // Verificar si el archivo JSON existe
        fs.access(filePath, fs.constants.F_OK, (errAccess) => {
            if (errAccess) {
                const errorMessage = `Card with ID ${id} does not exist in the collection!`;
                console.log(chalk.red(errorMessage));
                callback(errorMessage, undefined);
            } else {
                // Eliminar el archivo
                fs.unlink(filePath, (errUnlink) => {
                    if (errUnlink) {
                        const errorMessage = `Error deleting card with ID ${id}: ${errUnlink.message}`;
                        console.error(chalk.red(errorMessage));
                        callback(errorMessage, undefined);
                    } else {
                        try {
                            this.cards.delete(id);
                            console.log(chalk.green(`Card with ID ${id} successfully deleted from collection!`));
                            callback(undefined, "`Card with ID ${id} successfully deleted from collection!`" );
                        } catch (errDelete) {
                            const errorMessage = `Error deleting card with ID ${id} from memory: ${errDelete.message}`;
                            console.error(chalk.red(errorMessage));
                            callback(errorMessage, undefined);
                        }
                    }
                });
            }
        });
    }   
```


## 5. Dificultades y conclusion <a name="conclusion"></a>

Una de las partes más difíciles ha sido la coordinación entre el cliente y el servidor, asegurándose de que ambos se comuniquen correctamente y manejen los datos de manera adecuada. Esto ha requerido un entendimiento profundo de los protocolos de red y la implementación de lógica robusta para garantizar una comunicación fluida y confiable.

Otra de las dificultades fueron la gestión de tantos errores en la realización de la práctica, que no pude solucionar finalmente.

A pesar de los desafíos, esta práctica ha sido extremadamente valiosa para mi aprendizaje.

## 7. Referencias <a name="referencias"></a>

- [Guión práctica 10](https://ull-esit-inf-dsi-2324.github.io/prct10-fs-proc-sockets-magic-app/)
- [Apuntes sobre Node.js](https://ull-esit-inf-dsi-2324.github.io/nodejs-theory/)
- [Guía para crear un proyecto](https://ull-esit-inf-dsi-2324.github.io/typescript-theory/typescript-project-setup.html)
- [Tutorial de instalación y configuracion Typedoc](https://drive.google.com/file/d/19LLLCuWg7u0TjjKz9q8ZhOXgbrKtPUme/view)
- [Tutorial de instalación y configuración de Mocha y Chai en Typescript](https://drive.google.com/file/d/1-z1oNOZP70WBDyhaaUijjHvFtqd6eAmJ/view)
- [Tutorial de instalación y configuración Workflow GH Actions Sonar-Cloud](https://drive.google.com/file/d/1FLPargdPBX6JaJ_85jNsRzxe34sMi-Z3/view)
- [Tutorial de instalación y configuración Workflow GH Actions Coveralls](https://drive.google.com/file/d/1yOonmpVbOyvzx3ZbXMQTAPxvA3a7AE7w/view)
- [Principios SOLID](https://ull-esit-inf-dsi-2324.github.io/typescript-theory/typescript-solid.html)
- [Guia de Typedoc](https://typedoc.org/guides/installation/)
- [Yargs. Pagina oficial npm](https://www.npmjs.com/package/yargs)
- [Chalk. Pagina oficial npm](https://www.npmjs.com/package/chalk)