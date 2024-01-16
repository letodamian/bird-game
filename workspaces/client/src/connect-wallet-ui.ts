import { TonConnectUI } from "@tonconnect/ui";
import {GameFi, ConnectWalletButton, ConnectWalletParams, WalletConnector, WalletConnectorOptions} from "ton-phaser";
import { Config } from "./config";

export interface ConnectScene {
    show(): void;
    hide(): void;
    toRight(): void;
    toCenter(): void;
    getTonConnector(): WalletConnector;
}

export class ConnectWalletHtmlScene implements ConnectScene {
    private connectDiv: HTMLDivElement = document.getElementById('connect') as HTMLDivElement;

    constructor(private readonly connectUi: TonConnectUI) {
        this.connectDiv.addEventListener('click', () => {
            this.connectUi.openModal();
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

    getTonConnector() {
        return this.connectUi.connector;
    }
}

export class ConnectWalletCanvasScene extends Phaser.Scene implements ConnectScene {
    public static readonly sceneKey = 'ConnectWalletCanvasScene';
    public button!: ConnectWalletButton;

    constructor(private readonly connector: WalletConnector, private params: ConnectWalletParams) {
        super({ key: ConnectWalletCanvasScene.sceneKey, active: false });
        this.connector = GameFi.getWalletConnector();
    }

    create() {
        this.button = GameFi.createConnectButton({
            phaserOptions: {
                scene: this,
                x: 0,
                y: 0
            },
            buttonOptions: this.params
        });
    }

    show(): void {
        this.scene.setVisible(true);
    }

    hide(): void {
        this.scene.setVisible(false);
    }

    getTonConnector() {
        return this.connector;
    };

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
    if (uiType === 'html') {
        const connectUi = new TonConnectUI({
            // we will do connection restore manually later
            restoreConnection: false,
            manifestUrl: config.APP_MANIFEST_URL,
            actionsConfiguration: {
                twaReturnUrl: config.APP_URL
            }
        });

        await GameFi.init({
            network: config.NETWORK,
            // use ton connect ui instance
            connector: connectUi.connector
        });

        return new ConnectWalletHtmlScene(connectUi);
    } else {
        await GameFi.init({
            network: config.NETWORK,
            // create ton connect instance under the hood
            connector: {manifestUrl: config.APP_MANIFEST_URL},
            returnStrategy: {
                twaReturnUrl: config.APP_URL
            }
        });

        return new ConnectWalletCanvasScene(
            GameFi.getWalletConnector(),
            {
                style: 'light',
                onError: (error) => {
                    console.error('Caught Error', error);
                },
            }
        );
    }
}