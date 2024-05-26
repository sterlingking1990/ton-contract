import {Address, Cell, contractAddress, toNano} from 'ton-core'
import {hex} from '../build/main.compile.json'
import { getHttpV4Endpoint } from '@orbs-network/ton-access'
import {TonClient4} from 'ton'
import qs from "qs"
import qrcode from "qrcode-terminal";
import { exitCode } from 'process'
import dotenv from 'dotenv';
dotenv.config();

async function onChainTestScript() {
    //create a new cell block for our code and data 
    const codeCell = Cell.fromBoc(Buffer.from(hex,"hex"))[0];
    const dataCell = new Cell();
    
    //specify an address for our cell bloc
    const address = contractAddress(0,{
        code: codeCell,
        data: dataCell
    });

    const endpoint = await getHttpV4Endpoint({
        network:process.env.TESTNET ? "testnet":"mainnet"
    });

    const client4 = new TonClient4({endpoint});

    //call the method that checks and returns the latest address of our contract deployment on the blockchain
    const latestBlock = await client4.getLastBlock();
    let addressStatus = await client4.getAccount(latestBlock.last.seqno, address);

    if(addressStatus.account.state.type!=='active'){
        console.log('Contract with address ' + address + ' not yet active on the ' + process.env.TESTNET ? 'testnet':'mainnet' + ' blockchain')
        return;
    }

    //deploy the contract with some money
    let link = `ton://transfer/` +
        address.toString({
            testOnly: process.env.TESTNET ? true:false,
        }) +
        "?" +
        qs.stringify({
            text: "Deploy Contract",
            amount: toNano("0.05").toString(10),
        });

        qrcode.generate(link, { small: true }, (code) => {
            console.log(code);
        })

    //run script on interval of 2 secs to get 
    //the different address of our contract when deployed on the  testnet blockchain

    //note- the address changes if the code,data changes at any deployment
    let recent_sender_archive:Address;

    setInterval(async ()=> {
        const latestBlock = await client4.getLastBlock();
        const {exitCode, result} = await client4.runMethod(
            latestBlock.last.seqno,
            address,
            "get_the_latest_sender"
        );

        if(exitCode!=0){
            console.log("Running getter method failed");
            return;
        }

        if(result[0].type !=="slice"){
            console.log("Unknown result type");
            return;
        }
        let most_recent_sender = result[0].cell.beginParse().loadAddress();

        if(most_recent_sender && most_recent_sender.toString()!= recent_sender_archive?.toString()){
            console.log("New recent sender found: " + most_recent_sender.toString({testOnly:true}));
            recent_sender_archive = most_recent_sender as any;
        }
    },2000);

}

onChainTestScript();