import { Cell, beginCell } from 'ton-core';
import { toNano } from 'ton-core';
import { hex } from '../build/main.compile.json';
import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { MainContract } from '../wrappers/MainContract';
import '@ton-community/test-utils';
import { config } from 'dotenv';
import { compile } from '@ton-community/blueprint';


describe('main.fc contract tests', () => {

  let blockchain:Blockchain;
  let myContract: SandboxContract<MainContract>;
  let initWallet: SandboxContract<TreasuryContract>;
  let ownerWallet: SandboxContract<TreasuryContract>;
  let codeCell: Cell;

  beforeAll(async () => {
    codeCell = await compile("MainContract");
  })

  beforeEach(async () => {
    blockchain = await Blockchain.create();
    initWallet = await blockchain.treasury("initWallet");
    ownerWallet = await blockchain.treasury("ownerWallet");

    myContract = blockchain.openContract(
      await MainContract.createFromConfig({
        counter_value:1,
        address:initWallet.address,
        ownerAddress:ownerWallet.address
      },codeCell));

  })

  it('should successfully increase counter and get the latest sender address', async () => {


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

  it('should successfully deposit funds', async()=>{

    const senderWallet = await blockchain.treasury("sender");
    const depositMessageRes = await myContract.sendDeposit(senderWallet.getSender(),toNano("5"));

    expect(depositMessageRes.transactions).toHaveTransaction({
      from:senderWallet.address,
      to: myContract.address,
      success:true
    })

    const balance = await  myContract.getBalance();
    expect(balance.balance).toBeGreaterThan(toNano("4.99"));
  });

  it('should return deposit funds as no commands is sent', async()=>{
    const senderWalletT = await blockchain.treasury("senderT");
    const depositMessage = await myContract.sendNoOpCodeCommand(senderWalletT.getSender(),toNano("5"));

    expect(depositMessage.transactions).toHaveTransaction({
      from:senderWalletT.address,
      to: myContract.address,
      success:false
    })

    const remBal = await  myContract.getBalance();
    expect(remBal.balance).toEqual(0);
  });

  it('should successfully withdraw funds on behalf of owner', async()=>{
    const senderWalletT = await blockchain.treasury("sender");
    //top up to perform withdraw
    await myContract.sendDeposit(senderWalletT.getSender(),toNano("5"));

    const withdrawalReqRes = await myContract.sendWithdrawalRequest(ownerWallet.getSender(),toNano("0.05"),toNano(1));

    const balanceAfterWithdraw = await myContract.getBalance();

    expect(withdrawalReqRes.transactions).toHaveTransaction({
      from:myContract.address,
      to:ownerWallet.address,
      success:true,
      value:toNano(1)
    })

    expect(balanceAfterWithdraw.balance).toBeLessThan(toNano(5));

  });

  it('should fail to withdraw funds for non-owner', async()=>{
    const senderWalletT = await blockchain.treasury("sender");
    //top up to perform withdraw
    await myContract.sendDeposit(senderWalletT.getSender(),toNano("5"));

    const withdrawalReqRes = await myContract.sendWithdrawalRequest(senderWalletT.getSender(),toNano("0.05"),toNano(1));

    expect(withdrawalReqRes.transactions).toHaveTransaction({
      from:senderWalletT.address,
      to:myContract.address,
      success:false,
      exitCode:103
    })
  });

  it('should fail to withdraw funds if lack of balance', async()=>{

    const withdrawalReqRes = await myContract.sendWithdrawalRequest(ownerWallet.getSender(),toNano("0.05"),toNano(1));

    expect(withdrawalReqRes.transactions).toHaveTransaction({
      from:ownerWallet.address,
      to:myContract.address,
      success:false,
      exitCode:104
    });
  });
});
