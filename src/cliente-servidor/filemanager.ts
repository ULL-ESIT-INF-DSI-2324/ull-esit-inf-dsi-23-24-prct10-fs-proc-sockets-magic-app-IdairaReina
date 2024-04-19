import fs from 'fs';
import chalk from 'chalk';
import { CardData } from './card.js';
import * as path from 'path';

/**
 * Clase que gestiona las operaciones relacionadas con el manejo de archivos.
 */
export class FileManager {
  private static instance: FileManager;
  private userDataDirectory = 'users';
  //constructor(private userDataDirectory: string) {}

  private constructor() {}

  public static create(): FileManager {
    return new FileManager();
}

 /**
     * Método para obtener la instancia del FileManager.
     * @returns La instancia del FileManager.
     */
  public static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  /**
     * Agrega una carta al sistema de archivos del usuario.
     * @param userId - ID del usuario.
     * @param cardData - Datos de la carta a agregar.
     * @param callback - Función de retorno de llamada que maneja errores y resultados.
     */
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


/* public deleteCard(userId: string, cardId: number, callback: (error: string | undefined, result: string | undefined) => void): void {
  const cardFilePath = `./users/${userId}/${cardId}.json`;

  fs.unlink(cardFilePath, (err) => {
      if (err) {
          callback(`Error al eliminar la carta: ${err.message}`, undefined);
      } else {
          callback(undefined, `Carta eliminada correctamente del usuario ${userId}`);
      }
  });
} */
/**
     * Elimina una carta del sistema de archivos del usuario.
     * @param userId - ID del usuario.
     * @param cardId - ID de la carta a eliminar.
     * @returns Promise 
     */
public deleteCard(userId: string, cardId: number): Promise<string> {
    const cardFilePath = path.join(this.userDataDirectory, userId, `${cardId}.json`);

    return new Promise((resolve, reject) => {
        fs.unlink(cardFilePath, (err) => {
            if (err) {
                reject(`Error al eliminar la carta: ${err.message}`);
            } else {
                resolve(`Carta eliminada correctamente del usuario ${userId}`);
            }
        });
    });
}

/**
     * Modifica una carta en el sistema de archivos del usuario.
     * @param userId - ID del usuario.
     * @param cardId - ID de la carta a modificar.
     * @param newCardData - Nuevos datos de la carta.
     * @returns Promisa
     */

public async modifyCard(userId: string, cardId: number, newCardData: CardData): Promise<string> {
    const filePath = path.join(this.userDataDirectory, userId, `${cardId}.json`);

    return new Promise((resolve, reject) => {
        fs.promises.readFile(filePath, 'utf-8')
            .then(data => {
                const existingCardData: CardData = JSON.parse(data);
                const modifiedCardData: CardData = { ...existingCardData, ...newCardData };

                return fs.promises.writeFile(filePath, JSON.stringify(modifiedCardData, null, 2));
            })
            .then(() => {
                resolve('Carta modificada correctamente.');
            })
            .catch(error => {
                if (error.code === 'ENOENT') {
                    reject(new Error('No se encontró la carta especificada.'));
                } else {
                    reject(new Error('Error al modificar la carta.'));
                }
            });
    });
}

/* public modifyCard(userId: string, cardId: number, newCardData: CardData, callback: (error: string | undefined, result: string | undefined) => void): void {
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
} */

 /**
     * Lista todas las cartas del usuario.
     * @param userId - ID del usuario.
     * @param callback - Función de retorno de llamada que maneja errores y resultados.
     */
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

 /**
     * Muestra una carta específica del usuario.
     * @param userId - ID del usuario.
     * @param cardId - ID de la carta a mostrar.
     * @param callback - Función de retorno de llamada que maneja errores y resultados.
     */

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

