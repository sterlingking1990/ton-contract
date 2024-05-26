import * as fs from "fs";
import process from "process";
import { Cell, Address } from "ton-core";
import { compileFunc } from "@ton-community/func-js";

async function compileScript() {
    const compileResult = await compileFunc({
        targets: ["./contracts/main.fc"],
        sources: (x) => fs.readFileSync(x).toString("utf-8")
    });

    if(compileResult.status==="error"){
        console.log(" -Chaii, Compilation errors! compiler output was:");
        console.log(`\n${compileResult.message}`);
        process.exit(1);
    }

    console.log("- Compilation successful");

    const hexArtifact = "build/main.compile.json"
    fs.writeFileSync(
        hexArtifact,
        JSON.stringify({
            hex: Cell.fromBoc(Buffer.from(compileResult.codeBoc, "base64"))[0]
            .toBoc()
            .toString("hex")
        })
    )
    console.log(`Compile code saved to ${hexArtifact}`);
    const raw = "a3935861f79daf59a13d6d182e1640210c02f98e3df18fda74b8f5ab141abf18";

    const friendly = new Address(0, Buffer.from(raw, "hex"));
    console.log(friendly);
}

compileScript()