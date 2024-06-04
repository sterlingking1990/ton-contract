import {address, toNano} from "ton-core";
import {MainContract} from '../wrappers/MainContract';
import {compile,NetworkProvider} from '@ton-community/blueprint';

export async function run(provider: NetworkProvider){
    const codeCell = await compile("MainContract");
    const myContract = MainContract.createFromConfig(
        {
        counter_value:0,
        address: address("0QB_rfmuoOaBpZkym2Je1j79t1AK-GSfASZNvIWJiFgCLske"),
        ownerAddress: address("0QB_rfmuoOaBpZkym2Je1j79t1AK-GSfASZNvIWJiFgCLske"),
    },
    codeCell
);

    const openedContract = provider.open(myContract);
    
    openedContract.sendDeploy(provider.sender(), toNano("0.05"));

    await provider.waitForDeploy(myContract.address);

}