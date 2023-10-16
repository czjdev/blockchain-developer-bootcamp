const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Exchange", () => {
  let exchange, deployer, feeAccount, user1, token1
  const feePercent = 10

  beforeEach(async () => {
    const Exchange = await ethers.getContractFactory("Exchange");
    const Token = await ethers.getContractFactory("Token");

    token1 = await Token.deploy("Dapp University", "DAPP", "1000000");

    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    feeAccount = accounts[1];
    user1 = accounts[2];

    let transction = await token1.connect(deployer).transfer(user1.address, tokens(100))
    await transction.wait()

    exchange = await Exchange.deploy(feeAccount.address, feePercent);
  });

  describe("Deployment", () => {
    it("tracks the fee account", async () => {
      expect(await exchange.feeAccount()).to.equal(feeAccount.address);
    });

    it("tracks the fee percent", async () => {
        expect(await exchange.feePercent()).to.equal(feePercent);
    })
  });

  describe("Depositing Tokens", () => {
    let result, transction
    const amount = tokens(10)
    
    beforeEach(async () => {
      transction = await token1.connect(user1).approve(exchange.address, amount)
      transction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transction.wait()
    })

    describe("Success", () => {
      it("tracks the token deposit", async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(amount)
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
      })

      it("emits an Deposit event", () => {
        const event = result.events[1];
        expect(event.event).to.equal('Deposit');
        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(amount);
      })
    })

    describe("Failure", () => {
      it("fails when no tokens are approved", async () => {
        await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
      })
    })
  })

  describe("Withdrawing Tokens", () => {
    let transaction, result;
    let amount = tokens(100);

    beforeEach(async () => {
      // approve token
      transaction = await token1.connect(user1).approve(exchange.address, amount);
      result = await transaction.wait()
      // deposit token
      transaction = await exchange.connect(user1).depositToken(token1.address, amount);
      result = await transaction.wait()
      // withdraw token 
      transaction = await exchange.connect(user1).withdrawToken(token1.address, amount);
      result = await transaction.wait()
    })

    describe("Success", () => {
      it("withdraws token funds", async () => {
        expect(await token1.balanceOf(exchange.address)).to.equal(0);
        expect(await exchange.tokens(token1.address, user1.address)).to.equal(0);
        expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0);
      })

      it("emits a withdraw event", () => {
        const event = result.events[1];
        expect(event.event).to.equal('Withdraw');
        const args = event.args;
        expect(args.token).to.equal(token1.address);
        expect(args.user).to.equal(user1.address);
        expect(args.amount).to.equal(amount);
        expect(args.balance).to.equal(0);
      })
    })

    describe("Failure", () => {
      it("fails for insufiiient balances", async () => {
        await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
      })
    })
  })

  describe("Checking balances", () => {
    let result, transction
    const amount = tokens(1)

    beforeEach(async () => {
      transction = await token1.connect(user1).approve(exchange.address, amount)
      result = await transction.wait()
      transction = await exchange.connect(user1).depositToken(token1.address, amount)
      result = await transction.wait()
    })

    it("returns user balance", async () => {
      expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount);
    })
  })
});
