const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Token", () => {
  let token, accounts, deployer, reciver

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Dapp University", "DAPP", "1000000");

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    reciver = accounts[1];
  });

  describe("Deployment", () => {
    const name = "Dapp University";
    const symbol = "DAPP";
    const decimals = "18";
    const totalSupply = tokens("1000000");

    it("has correct name", async () => {
      expect(await token.name()).to.equal(name);
    });

    it("has correct symbol", async () => {
      expect(await token.symbol()).to.equal(symbol);
    });

    it("has correct decimals", async () => {
      expect(await token.decimals()).to.equal(decimals);
    });

    it("has correct total supply", async () => {
      expect(await token.totalSupply()).to.equal(totalSupply);
    });

    it("assign total supply to deployer", async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    });
  });

  describe("Sending Token", () => {
    let amount, transaction, result

    beforeEach(async () => {
      amount = tokens(100)
      transaction = await token.connect(deployer).transfer(reciver.address, amount);
      result = await transaction.wait()
    })
    it("Transfers token balances", async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
      expect(await token.balanceOf(reciver.address)).to.equal(amount)
    })
    it("Emit a transfer event", async () => {
      const event = result.events[0];
      expect(event.event).to.equal("Transfer");
      const args = event.args;
      expect(args.from).to.equal(deployer.address);
      expect(args.to).to.equal(reciver.address);
      expect(args.value).to.equal(amount);
    })
  })
});
