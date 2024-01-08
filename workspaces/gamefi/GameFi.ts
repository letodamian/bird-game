import {ITonConnect, Wallet, Account} from '@tonconnect/sdk';
import {toNano, TonClient, Address} from "@ton/ton";
import {AmountInTon} from './types';
import { NftItem } from './NftItem';
import { NftCollection } from './NftCollection';

export class GameFi {
    private static transactionTtl = 3600;
    public readonly wallet: Wallet;
    public readonly account: Account;
    private readonly tonClient: TonClient;
    public readonly nft: {
        collection: NftCollection,
        item: NftItem
    }

    constructor(public readonly ton: ITonConnect) {
        if (ton.wallet == null) {
            throw new Error('Connect a wallet before using GameFi.');
        }
        this.wallet = ton.wallet;
        this.account = ton.wallet.account;

        // use https://github.com/orbs-network/ton-access
        this.tonClient = new TonClient({
            endpoint: 'https://toncenter.com/api/v2/jsonRPC',
            apiKey: '19841bdee86b16f94d6c1edd73596daf9624e20de9422799e36b3bd537148a8b',
        });

        this.nft = {
            item: new NftItem(this.tonClient),
            collection: new NftCollection(this.tonClient),
        }
    }

    public async pay({to, amount}: {to: string, amount: AmountInTon}) {
        return this.ton.sendTransaction({
            validUntil: GameFi.createExpirationTimestamp(),
            messages: [{
                address: to,
                amount: toNano(amount).toString()
            }]
        });
    }

    public async transferNft({to, nftAddress}: {to: string, nftAddress: string}) {
        const payload = await this.nft.item.createTransferPayload({
            to: GameFi.addressStringToAddress(to),
            responseDestination: GameFi.addressStringToAddress(this.account.address),
        });

        return this.ton.sendTransaction({
            validUntil: GameFi.createExpirationTimestamp(),
            messages: [{
                address: nftAddress,
                amount: toNano(NftItem.transferFeePrepay).toString(),
                payload: payload.toBoc().toString('base64')
            }]
        });
    }

    private static createExpirationTimestamp(): number {
        return Math.floor(Date.now() / 1000) + GameFi.transactionTtl;
    }

    public static addressStringToAddress(address: Address | string): Address {
        if (typeof address === 'string') {
            return Address.parse(address);
        }

        return address;
    }
}