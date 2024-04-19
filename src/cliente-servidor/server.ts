import * as net from 'net';
import fs from 'fs';
import { Card, CardData } from './card.js';
import * as path from 'path';
import {FileManager} from './filemanager.js';


// Directorio base para los datos de los usuarios
const userDataDirectory = 'users';
export const userCardsMap: Map<string, Card[]> = new Map();


/**
 * Carga todas las cartas de los usuarios existentes en memoria.
 */
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


/**
 * Carga una carta desde un archivo JSON de manera asíncrona.
 * @param {string} filePath - Ruta del archivo JSON.
 * @returns {Promise<Card>} - Promesa que resuelve con la carta cargada.
 */
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
                            fileManager.modifyCard(userId, request.cardId, request.modifiedData)
                            .then((result) => {
                                console.log('Carta modificada correctamente:', result);
                                const responseSuccess = { status: 'OK', message: result };
                                const responseDataSuccess = JSON.stringify(responseSuccess);
                                socket.write(responseDataSuccess);
                            })
                            .catch((error) => {
                                console.error('Error al modificar la carta:', error);
                                const responseError = { status: 'Error', message: error };
                                const responseDataError = JSON.stringify(responseError);
                                socket.write(responseDataError);
                            });
                        break;
                        case 'delete':
                            fileManager.deleteCard(userId, request.cardData.id)
                            .then((result) => {
                                // Si se eliminó correctamente, registrar y enviar respuesta de éxito al cliente
                                console.log('Carta eliminada correctamente:', result);
                                const responseSuccess = { status: 'OK', message: result };
                                const responseDataSuccess = JSON.stringify(responseSuccess);
                                socket.write(responseDataSuccess);
                                socket.end();
                            })
                            .catch((error) => {
                                // Si hay un error, registrar y enviar respuesta de error al cliente
                                console.error('Error al eliminar la carta:', error);
                                const responseError = { status: 'Error', message: error };
                                const responseDataError = JSON.stringify(responseError);
                                socket.write(responseDataError);
                                socket.end();
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


