### Install Dependencies

1. Install:

* Run with administrator privileges:

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
   
4. Start web

   `3-start_node.bat`
   
   Open a browser (not EDGE) and go to http://localhost:3001