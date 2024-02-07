import * as Phaser from 'phaser';
import { Wallet } from '@ton/phaser-sdk';
import { UI } from './ui';
import { ConnectWalletCanvasScene, createConnectUi } from './connect-wallet-ui';
import { loadConfig } from './config';
import { GAME_HEIGHT, GAME_WIDTH } from './consts';
import { GameScene } from './game-scene';

async function run() {
    try {
        (window as any).Telegram.WebApp.expand();
        const config = await loadConfig();

        // prepare UI elements
        // you can pass 'html' instead of 'canvas' here
        const connectUi = await createConnectUi(config, 'canvas');
        const gameFi = connectUi.gameFi;
        const gameUi = new UI(config, gameFi);

        // create game scenes
        const scenes: Phaser.Scene[] = [new GameScene(gameUi)];
        if (connectUi instanceof ConnectWalletCanvasScene) {
            scenes.push(connectUi);
        }
        // render game
        const game = new Phaser.Game({
            type: Phaser.AUTO,
            height: GAME_HEIGHT,
            width: GAME_WIDTH,
            scene: scenes,
            physics: {
                default: 'arcade',
            },
            input: {
                keyboard: true,
            },
            scale: {
                mode: Phaser.Scale.NONE,
                parent: document.body,
                width: GAME_WIDTH,
                height: GAME_HEIGHT,
            },
        });
        // You can install Devtools for PixiJS - https://github.com/bfanger/pixi-inspector#installation
        // @ts-ignore
        globalThis.__PHASER_GAME__ = game;

        // if wallet connected - show game UI
        // if not - show only connection button
        const initUi = async (wallet: Wallet | null) => {
            connectUi.show();

            if (wallet) {
                gameUi.transitionToGame();
                gameUi.showMain(false);
                gameUi.showBalance();
        
                connectUi.toRight();
            } else {
                gameUi.transitionOutOfGame();
                gameUi.hideShop();
                gameUi.hideMain();
                gameUi.hideBalance();

                connectUi.toCenter();
            }
        }

        gameFi.onWalletChange(initUi);
    } catch (e) {
        console.error('Failed to launch the game.', e);
    }
}

run();