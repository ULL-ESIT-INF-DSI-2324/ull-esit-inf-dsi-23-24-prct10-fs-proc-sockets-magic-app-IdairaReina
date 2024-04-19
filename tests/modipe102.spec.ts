import { expect } from 'chai';
import {  Color, CardType, Rarity, CardData } from '../src/cliente-servidor/card.js';
import {FileManager} from '../src/cliente-servidor/filemanager.js'; // Ajusta la ruta según la ubicación de tu clase FileManager

describe('FileManager', () => {
    let fileManager: FileManager;

    beforeEach(() => {
        fileManager = FileManager.create();
    });

    describe('modifyCard', () => {
        it('should modify a card successfully', async () => {
            const cardData: CardData = {
                id: 1,
                name: 'Test Card',
                manaCost: 3,
                color: Color.Azul,
                type: CardType.Criatura,
                rarity: Rarity.Rara,
                rulesText: 'Test rules text',
                power: 20,
                marketValue: 10
            };
            const result = await fileManager.modifyCard('idaira', 1, cardData );
            expect(result).to.equal('Carta modificada correctamente.');
        });

        it('should modify a card successfully', async () => {
            const cardData: CardData = {
                id: 56,
                name: 'Test Card',
                manaCost: 3,
                color: Color.Verde,
                type: CardType.Planeswalker,
                rarity: Rarity.Comun,
                rulesText: 'Test rules text',
                power: 20,
                marketValue: 10
            };
            const result = await fileManager.modifyCard('maria', 56, cardData );
            expect(result).to.equal('Carta modificada correctamente.');
        });

    });

    describe('deleteCard', () => {
        it('should delete a card successfully', async () => {
            const result = await fileManager.deleteCard('idaira', 123);
            expect(result).to.equal('Carta eliminada correctamente del usuario userId');
        });

        it('should throw an error if card is not found', async () => {
            try {
                await fileManager.deleteCard('idaira', 123);
                // Si no se lanza un error, la prueba falla
                expect.fail('Se esperaba que la función lanzara un error.');
            } catch (error) {
                expect(error.message).to.equal('Error al eliminar la carta: ENOENT: no such file or directory, unlink');
            }
        });

    });

    describe('deleteCard', () => {
        it('should delete a card successfully', async () => {
            const result = await fileManager.deleteCard('idaira', 57);
            expect(result).to.equal('Carta eliminada correctamente del usuario userId');
        });

        it('should throw an error if card is not found', async () => {
            try {
                await fileManager.deleteCard('idaira', 57);
                // Si no se lanza un error, la prueba falla
                expect.fail('Se esperaba que la función lanzara un error.');
            } catch (error) {
                expect(error.message).to.equal('Error al eliminar la carta: ENOENT: no such file or directory, unlink');
            }
        });

    });
});
