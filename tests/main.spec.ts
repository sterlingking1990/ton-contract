import { Cell, beginCell } from 'ton-core';
import { toNano } from 'ton-core';
import { hex } from '../build/main.compile.json';
import { Blockchain, TreasuryContract } from '@ton-community/sandbox';
import { MainContract } from '../wrapper/MainContract';
import '@ton-community/test-utils';
import { config } from 'dotenv';

describe('main.fc contract tests', () => {
  it('should get the proper most recent sender address', async () => {
    const blockchain = await Blockchain.create();

    const codeCell = Cell.fromBoc(Buffer.from(hex, 'hex'))[0];

    const initAddress = await blockchain.treasury('initAddress');

    // Get the provider for the blockchain
    const contractProvider = blockchain.provider(initAddress.address, {
      code: codeCell,
      data: beginCell().storeUint(0, 32).storeAddress(initAddress.address).endCell()
    });

    const myContract = blockchain.openContract(
      await MainContract.createFromConfig({
        counter_value:1,
        address:initAddress.address
      },codeCell))

    const senderWallet = await blockchain.treasury("sender");

    // Sending the increment message
    const sendMessageResult = await myContract.sendIncrement(
      senderWallet.getSender(),
      toNano("0.05"),
      5
    );

    //expect that comm. extablished from my senderwallet addr to contract address
    expect(sendMessageResult.transactions).toHaveTransaction({
      from:senderWallet.address,
      to:myContract.address,
      success:true
    })

    // Get the incremented value and sender
    const data = await myContract.getData();

    // Check the address of the sender from the mock contract message
    expect(data.recent_sender.toString()).toBe(senderWallet.address.toString());
    expect(data.number).toEqual(6);
  });
});
