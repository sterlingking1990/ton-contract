import type { MainCompileJson } from '../types';
import compileJson from '../build/main.compile.json';
import { Cell, StateInit, beginCell, contractAddress, storeStateInit, toNano } from "ton-core";
import qs from 'qs';
import qrcode from "qrcode-terminal";
import { TonConnect } from '@tonconnect/sdk';
import dotenv from 'dotenv';
dotenv.config();

const { hex }: MainCompileJson = compileJson;

async function deployScript() {
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    const dataCell = new Cell();

    const stateInit: StateInit = {
        code: codeCell,
        data: dataCell
    };

    const stateInitBuilder = beginCell();
    storeStateInit(stateInit)(stateInitBuilder);

    const stateInitCell = stateInitBuilder.endCell();

    const address = contractAddress(0, {
        code: codeCell,
        data: dataCell
    });
    
    console.log(`Future address of our current contract is ${address}`);
    let link = `ton://transfer/` +
        address.toString({
            testOnly: process.env.TESTNET ? true:false,
        }) +
        "?" +
        qs.stringify({
            text: "Deploy Contract",
            amount: toNano("0.05").toString(10),
            init: stateInitCell.toBoc({ idx: false }).toString("base64")
        });
    console.log("please scan the code below to deploy to the address in " + process.env.TESTNET?'testnet':'mainnet')
    qrcode.generate(link, { small: true }, (code) => {
        console.log(code)
    })
}

deployScript();
