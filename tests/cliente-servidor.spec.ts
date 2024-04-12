import 'mocha';
import { expect } from 'chai';
import * as net from 'net';
import { Card, Color, CardType, Rarity, CardData } from '../src/cliente-servidor/card.js';
import {FileManager} from '../src/cliente-servidor/filemanager.js'

describe('Card', () => {
    // Prueba para crear una instancia de la clase Card
    it('Debería crear una instancia de la clase Card', () => {
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

        const card = new Card(cardData);

        expect(card).to.be.instanceOf(Card);
    });

    // Prueba para verificar los atributos de la carta
    it('Comprobando atributos del tipo Criatura', () => {
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

        const card = new Card(cardData);

        expect(card.id).to.equal(1);
        expect(card.name).to.equal('Test Card');
        expect(card.manaCost).to.equal(3);
        expect(card.color).to.equal(Color.Azul);
        expect(card.type).to.equal(CardType.Criatura);
        expect(card.rarity).to.equal(Rarity.Rara);
        expect(card.power).to.equal(20);
        expect(card.rulesText).to.equal('Test rules text');
    });

    it('Comprobando atributos del tipo Conjuro', () => {
        const cardData: CardData = {
            id: 7,
            name: 'White Lotus',
            manaCost: 36,
            color: Color.Blanco,
            type: CardType.Conjuro,
            rarity: Rarity.Infrecuente,
            rulesText: 'spells',
            marketValue: 55
        };

        const card = new Card(cardData);

        expect(card.id).to.equal(7);
        expect(card.name).to.equal('White Lotus');
        expect(card.manaCost).to.equal(36);
        expect(card.color).to.equal(Color.Blanco);
        expect(card.type).to.equal(CardType.Conjuro);
        expect(card.rarity).to.equal(Rarity.Infrecuente);
        expect(card.rulesText).to.equal('spells');
    });

    it('Comprobar atributos del tipo Planeswalker', () => {
        const cardData: CardData = {
            id: 4,
            name: 'Black Lotus',
            manaCost: 3,
            color: Color.Verde,
            type: CardType.Planeswalker,
            rarity: Rarity.Comun,
            rulesText: 'rules text',
            loyalty: 10,
            marketValue: 10
        };

        const card = new Card(cardData);

        expect(card.id).to.equal(4);
        expect(card.name).to.equal('Black Lotus');
        expect(card.manaCost).to.equal(3);
        expect(card.color).to.equal(Color.Verde);
        expect(card.type).to.equal(CardType.Planeswalker);
        expect(card.rarity).to.equal(Rarity.Comun);
        expect(card.loyalty).to.equal(10);
        expect(card.rulesText).to.equal('rules text');
    });

});

describe('FileManager', function() {
    let administradorArchivos;

    // Antes de cada prueba, creamos una nueva instancia de FileManager
    beforeEach(function() {
        administradorArchivos = FileManager.getInstance();
    });

    // Prueba para agregar una carta al sistema de archivos
    it('debería agregar una carta al sistema de archivos', function(done) {
        const userId = 'idaira';
        const cardData: CardData = {
            id: 4,
            name: 'Black Lotus',
            manaCost: 3,
            color: Color.Verde,
            type: CardType.Planeswalker,
            rarity: Rarity.Comun,
            rulesText: 'rules text',
            loyalty: 10,
            marketValue: 10
        };
        administradorArchivos.addCard(userId, cardData, (error, resultado) => {
            expect(error).to.equal(null);
            expect(resultado).to.equal(undefined);
            done();
        });
    });

    // Prueba para eliminar una carta del sistema de archivos
    it('debería eliminar una carta del sistema de archivos', function(done) {
        const userId = 'eduardo';
        const idCarta = 1;
        administradorArchivos.deleteCard(userId, idCarta, (error, resultado) => {
            expect(error).to.equal(null);
            expect(resultado).to.equal(undefined);
            done();
        });
    });

    // Prueba para modificar una carta en el sistema de archivos
    it('debería modificar una carta en el sistema de archivos', function(done) {
        const userId = 'pedro';
        const idCarta = 67;
        const nuevosDatosCarta = {
            nombre: 'Nueva Carta de Prueba',
            costoMana: 3
        };
        administradorArchivos.modifyCard(userId, idCarta, nuevosDatosCarta, (error, resultado) => {
            expect(error).to.equal(null);
            expect(resultado).to.equal(undefined);
            done();
        });
    });

    // Prueba para listar todas las cartas de un usuario
    it('debería listar todas las cartas de un usuario', function(done) {
        const userId = 'juan';
        administradorArchivos.listCard(userId, (error, resultado) => {
            expect(error).to.equal(null);
            expect(resultado).to.be.instanceOf(Array);
            done();
        });
    });

    // Prueba para mostrar una carta específica de un usuario
    it('debería mostrar una carta específica de un usuario', function(done) {
        const userId = 'maria';
        const idCarta = 1;
        administradorArchivos.showCard(userId, idCarta, (error, resultado) => {
            expect(error).to.equal(null);
            expect(resultado).to.be.instanceOf(Object);
            done();
        });
    });
});

describe('Client', () => {
    // Prueba para verificar la conexión con el servidor
    it('should connect to the server', (done) => {
      const client = new net.Socket();
  
      client.connect(60300, 'localhost', () => {
        expect(client).to.be.an.instanceOf(net.Socket);
        client.end();
        done();
      });
    });
  
    // Prueba para enviar datos al servidor
    it('should send data to the server', (done) => {
      const client = new net.Socket();
  
      client.connect(60300, 'localhost', () => {
        client.write('Test data');
      });
  
      client.on('data', (data) => {
        expect(data.toString()).to.equal('Received: Test data');
        client.end();
        done();
      });
    });
  });
