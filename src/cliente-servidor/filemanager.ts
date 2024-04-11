import fs from 'fs';
import chalk from 'chalk';
import { CardData } from './card.js';

/**
 * Class to manage the file system for user cards
 */
export class FileManager {
  private static instance: FileManager;

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


}

