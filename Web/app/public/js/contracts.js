function realContractSelected() {
    return localStorage.getItem("network") == "real";
}

function getBaseContract() {
    if (realContractSelected()) return contracts.baseReal;
    return contracts.baseTest;
}

function getHierarchyContract() {
    if (realContractSelected()) return contracts.hierarchyReal;
    return contracts.hierarchyTest;
}

function getProvider() {
    if (realContractSelected()) {
        return contracts.providerReal;
    } else {
        return contracts.providerTest;
    }
}

function getNetworkId() {
    if (realContractSelected()) {
        if (contracts.production) return 1;
        else return 3;
    } else {
        if (contracts.production) return 3;
        else return 0;
    }
}

function loadNetwork(networkId) {
    switch(networkId) {
        case 0:
            // Local
            localStorage.setItem("network", "test");
            break;
        case 1:
            // Main
            localStorage.setItem("network", "real");
            break;
        case 3:
            // Ropsten
        case 4:
            // Rinkeby
            if (contracts.production) {
                localStorage.setItem("network", "test");
            } else {
                localStorage.setItem("network", "real");
            }
            break;
    }
}