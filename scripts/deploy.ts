import { NetworkProvider, compile } from "@ton-community/blueprint";
import { MainContract } from "../wrappers/MainContract";
import { address, toNano } from "ton-core";

export async function run(provider: NetworkProvider){
    const myContract = MainContract.createFromConfig(
        {
            counter_value: 0,
            address: address("EQBzZw1R4CUufsfrC2Q26vazNzMJrn0BfJWXwcLEdop7ZxkC"),
            owner_address: address("EQBzZw1R4CUufsfrC2Q26vazNzMJrn0BfJWXwcLEdop7ZxkC"),
        },
        await compile("MainContract")
    );

    const openedContract = provider.open(myContract);

    openedContract.sendDeploy(provider.sender(), toNano("0.05"));

    await provider.waitForDeploy(myContract.address);
}