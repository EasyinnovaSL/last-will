if not exist "blockchain" mkdir blockchain
ganache-cli -m --networkId="7" --db="blockchain" --account="0x66c14ddb845e629975e138a5c28ad5a72a73552ea65b3d3ec99810c82751cc35,100000000000000000000000000" --gasLimit 6721975 --gasPrice 100000000000
