const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Token", () => {
    let token

    beforeEach(async () => {
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy();
    })

    it("has a name", async () => {
        expect(await token.name()).to.equal("Dapp University");
    })

    it("has a symbol", async () => {
        expect(await token.symbol()).to.equal("DAPP");
    })
})