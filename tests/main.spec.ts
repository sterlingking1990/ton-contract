// tests/main.spec.ts

import { Cell } from 'ton-core';
import { toNano } from 'ton-core';
import { hex } from '../build/main.compile.json';
import { Blockchain } from '@ton-community/sandbox';
import { MainContract } from '../wrapper/MainContract';
import '@ton-community/test-utils';

describe('main.fc contract tests', () => {
  it('should get the proper most recent sender address', async () => {
    const blockchain = await Blockchain.create();

    const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0];

    const myContract = blockchain.openContract(
      await MainContract.createFromConfig({}, codeCell)
    );

    const senderWallet = await blockchain.treasury('sender');

    const sendMessageResult = await myContract.sendInternalMessage(
      senderWallet.getSender(),
      toNano('0.05')
    );

    // that the message being sent has the sender address and the mock contract address as the recipient
    expect(sendMessageResult.transactions).toHaveTransaction({
      from: senderWallet.address,
      to: myContract.address,
      success: true,
    });

    const data = await myContract.getData();

    // that the address of the sender from the mock contract message received is same to the sender's actual address
    expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
  });
});
