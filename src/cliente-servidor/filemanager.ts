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

  /**
   * Method to add a card to the collection of a user
   * @param userId The ID of the user
   * @param cardData The data of the card to add
   * @param callback Callback function to handle the result or error
   */
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

