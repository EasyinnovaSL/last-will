function realContractSelected() {
    var contractType = localStorage.getItem("contractType")
    return contractType == "real";
}

function getBaseContract(contracts) {
    if (realContractSelected()) return contracts.baseReal;
    return contracts.base;
}

function getHierarchyContract(contracts) {
    if (realContractSelected()) return contracts.hierarchyReal;
    return contracts.hierarchy;
}