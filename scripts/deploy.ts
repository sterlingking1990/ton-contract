import {address, toNano} from "ton-core";
import {MainContract} from '../wrappers/MainContract';
import {compile,NetworkProvider} from '@ton-community/blueprint';

export async function run(provider: NetworkProvider){
    const codeCell = await compile("MainContract");
    const myContract = MainContract.createFromConfig(
        {
        counter_value:0,
        address: address("0QDfqpWlYZ7J5dGqxZ-afZh5Wsy0Tf8NXQUHPHyO5KBHdySa"),
        ownerAddress: address("0QDfqpWlYZ7J5dGqxZ-afZh5Wsy0Tf8NXQUHPHyO5KBHdySa"),
    },
    codeCell
);

    const openedContract = provider.open(myContract);
    
    openedContract.sendDeploy(provider.sender(), toNano("0.05"));

    await provider.waitForDeploy(myContract.address);

}