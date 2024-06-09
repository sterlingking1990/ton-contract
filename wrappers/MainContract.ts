import { Address, Cell, Contract, ContractProvider, SendMode, Sender, beginCell, contractAddress } from "ton-core";

export type MainContractConfig = {
  counter_value: number;
  address: Address;
  owner_address:Address;
};
export function mainContractConfigToCell(config: MainContractConfig): Cell {
  return beginCell().storeUint(config.counter_value, 32).storeAddress(config.address).storeAddress(config.owner_address).endCell();
}
export class MainContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromConfig(
    config: MainContractConfig,
    code: Cell,
    workchain = 0
  ) {
    const data = mainContractConfigToCell(config);
    const init = { code, data };
    const address = contractAddress(workchain, init);

    return new MainContract(address, init);
  }

  async sendDeploy(provider: ContractProvider, via:Sender, value:bigint){
    await provider.internal(via, {
      value,
      sendMode:SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(2,32).endCell(),
    })
  }

  async sendIncrement(
    provider:ContractProvider,
    sender:Sender,
    value:bigint,
    number_to_inc:number,
  ){
    const bodyMsg = beginCell().storeUint(1,32).storeUint(number_to_inc,32).endCell()
    await provider.internal(sender,{
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body:bodyMsg
    })
  }

  async sendDeposit(provider:ContractProvider, sender:Sender, value:bigint){
    const body = beginCell()
    .storeUint(2,32)
    .endCell();

    await provider.internal(sender,{
      value,
      sendMode:SendMode.PAY_GAS_SEPARATELY,
      body:body
    });
  }

  async sendNoOpCodeCommand(provider:ContractProvider, sender:Sender, value:bigint){
    const bodyMg = beginCell().endCell();
    await provider.internal(sender,{
      value,
      sendMode:SendMode.PAY_GAS_SEPARATELY,
      body:bodyMg
    });
  }

  async sendWithdrawalRequest(provider:ContractProvider,sender:Sender,value:bigint,amount:bigint){
    const mg_body = beginCell()
    .storeUint(3,32)
    .storeCoins(amount)
    .endCell()

    await provider.internal(sender, {
      value,
      sendMode:SendMode.PAY_GAS_SEPARATELY,
      body:mg_body
    })
  }

  async getData(provider:ContractProvider){
    const {stack} = await provider.get("get_contract_storage_data",[]);
    return {
      number:stack.readNumber(),    
      recent_sender: stack.readAddress(),
      owner_address: stack.readAddress()
    }

  }

  async getBalance(provider:ContractProvider){
    const {stack}  = await provider.get("wallet_balance",[]);
    return {
      balance: stack.readNumber()
    }
  }

}