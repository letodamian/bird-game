import { TonConnectUI, TonConnectUiCreateOptions } from "@tonconnect/ui";
import {GameFi, ConnectWalletButton, ConnectWalletParams, WalletConnector, WalletConnectorOptions} from "ton-phaser";

export interface ConnectScene {
    show(): void;
    hide(): void;
    toRight(): void;
    toCenter(): void;
    getTonConnector(): WalletConnector;
}

export class ConnectWalletHtmlScene implements ConnectScene {
    private connectDiv: HTMLDivElement = document.getElementById('connect') as HTMLDivElement;
    public readonly connectUi: TonConnectUI;

    constructor(params: TonConnectUiCreateOptions) {
        this.connectUi = new TonConnectUI(params);

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
    public readonly connector: WalletConnector;

    constructor(connectorOptions: WalletConnectorOptions, private params: ConnectWalletParams) {
        super({ key: ConnectWalletCanvasScene.sceneKey, active: false });
        this.connector = GameFi.createWalletConnector(connectorOptions);
    }

    create() {
        this.button = new ConnectWalletButton(
            this,
            0,
            0,
            this.params,
            this.connector
        );
    }

    show(): void {
        if (!this.game.scene.isActive(ConnectWalletCanvasScene.sceneKey)) {
            this.game.scene.add(ConnectWalletCanvasScene.sceneKey, this, true);
        }

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