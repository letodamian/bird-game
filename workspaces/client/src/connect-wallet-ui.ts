import {
    GameFi,
    ConnectWalletButton,
    ConnectWalletButtonParams,
    TonConnectUI,
    GameFiInitializationParams,
    WalletConnectorParams
} from "@ton/phaser-sdk";
import { Config } from "./config";

export interface ConnectScene {
    show(): void;
    hide(): void;
    toRight(): void;
    toCenter(): void;
    readonly gameFi: GameFi;
}

export class ConnectWalletHtmlScene implements ConnectScene {
    private connectDiv: HTMLDivElement = document.getElementById('connect') as HTMLDivElement;

    constructor(public readonly gameFi: GameFi) {
        this.connectDiv.addEventListener('click', () => {
            this.gameFi.walletConnector.openModal();
        });
    }

    show() {
        this.connectDiv.style.display = 'flex';
    }

    hide() {
        this.connectDiv.style.display = 'none';
    }

    toRight() {
        this.hide();
    }

    toCenter() {
        this.show();
    }
}

export class ConnectWalletCanvasScene extends Phaser.Scene implements ConnectScene {
    public static readonly sceneKey = 'ConnectWalletCanvasScene';
    private button: ConnectWalletButton;

    constructor(public readonly gameFi: GameFi, private params: ConnectWalletButtonParams) {
        super({ key: ConnectWalletCanvasScene.sceneKey, active: true, visible: true });
    }

    create() {
        this.button = this.gameFi.createConnectButton({
            scene: this,
            button: this.params
        });
    }

    show(): void {
        this.scene.setVisible(true);
    }

    hide(): void {
        this.scene.setVisible(false);
    }
    toCenter() {
        this.button.setPosition(
            this.game.scale.displaySize.width * 0.5 - this.button.width * 0.5,
            this.game.scale.displaySize.height * 0.5 - this.button.height * 0.5
        );
    }

    toRight() {
        this.button.setPosition(
            this.game.scale.displaySize.width - this.button.width - 16,
            16
        );
    }
}

export async function createConnectUi(config: Config, uiType: 'html' | 'canvas'): Promise<ConnectScene> {
    const connectorParams: WalletConnectorParams = {
        manifestUrl: config.APP_MANIFEST_URL,
        actionsConfiguration: {
            // twaReturnUrl is for Telegram Mini Apps
            // use returnStrategy: 'https://yourapp.com' otherwise
            twaReturnUrl: config.APP_URL
        }
    };
    const gameFiParams: GameFiInitializationParams = {
        network: config.NETWORK,
        contentResolver: {
            // use urlProxy if you you are going to use methods like:
            // getNftCollection, getNftItem, etc.
            urlProxy: `${config.ENDPOINT}/fix-cors?url=%URL%`
        },
        merchant: {
            // in-game jetton purchases come to this address
            jettonAddress: config.TOKEN_MASTER,
            // in-game TON purchases come to this address
            tonAddress: config.TOKEN_RECIPIENT
        }
    }
    
    let gameFi: GameFi;

    if (uiType === 'html') {
        const connectUi = new TonConnectUI(connectorParams);

        // use TonConnectUI instance with UI itself
        gameFiParams.connector = connectUi;
        gameFi = await GameFi.create({
            ...gameFiParams,
            // use TonConnectUI instance with UI itself
            connector: connectUi,
        });

        return new ConnectWalletHtmlScene(gameFi);
    } else {
        gameFi = await GameFi.create({
            ...gameFiParams,
            // use TonConnectUI instance without UI itself
            // user renders UI other ways, example gameFi.createConnectButton
            connector: connectorParams
        });
        
        return new ConnectWalletCanvasScene(
            gameFi,
            {
                style: 'light',
                onError: (error) => {
                    console.error('Caught Error', error);
                },
            }
        );
    }
}