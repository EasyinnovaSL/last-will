### Install Dependencies

1. Install:

    Run with administrator privileges:

    `npm install --global truffle`

    `npm install --global ganache-cli`

2. Run inside the folder Web:

    `npm install`

3. Run inside the folder Smart Contract:

    `npm install`

### Configure Application

1. Rename .\Web\app\server\config\config.js.sample to .\Web\app\server\config\config.js

2. Write your own configuration
 
### Run Application

1. Start Ganache

   `1_start_ganache.bat`

2. Upload lastwill smart contract (if not uploaded or modified)

   `2_upload_contract.bat`
   
3. Start web

   `3-start_node.bat`
   
   Open a browser (not EDGE) and go to http://localhost:3001
   
   
### How To Verify a truffle deployed Smart Contract in Etherscan?

1. Install truffle-flattener

    `npm install truffle-flattener -g`
    
2. Run in "Smart Contract" folder:

    `truffle-flattener "contracts/BackToLife.sol" > Output.sol`
    
3. The generated file contains the code to paste in Etherscan

4. (Optional) Get the input parameters ABI:

    * Go to:
    
        https://npm.runkit.com/ethereumjs-abi
        
    * Code (example):
            
            var abi = require("ethereumjs-abi")

            var parameterTypes = ["address"];
            var parameterValues = ["0x337c204fa619a86b3608ae05be85d20bbaa2fc6f"];

            console.log(abi.rawEncode(parameterTypes, parameterValues).toString('hex'));
            
5. Check the solidity compiler version with:

    ``truffle version``