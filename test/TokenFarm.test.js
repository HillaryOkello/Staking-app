const HillaryToken = artifacts.require('HillaryToken')
const RewardToken = artifacts.require('RewardToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
  let hillaryToken, rewardToken, tokenFarm

  before(async () => {
    // Load Contracts
    hillaryToken = await HillaryToken.new()
    rewardToken = await RewardToken.new()
    tokenFarm = await TokenFarm.new(rewardToken.address, hillaryToken.address)

    // Transfer all Reward tokens to farm (1 million)
    await rewardToken.transfer(tokenFarm.address, tokens('1000000'))

    // Send tokens to investor
    await hillaryToken.transfer(investor, tokens('100'), { from: owner })
  })

  describe('Hillary deployment', async () => {
    it('has a name', async () => {
      const name = await hillaryToken.name()
      assert.equal(name, 'Hillary Token')
    })
  })

  describe('Reward Token deployment', async () => {
    it('has a name', async () => {
      const name = await rewardToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await tokenFarm.name()
      assert.equal(name, 'Reward Token Farm')
    })

    it('contract has tokens', async () => {
      let balance = await rewardToken.balanceOf(tokenFarm.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Farming tokens', async () => {

    it('rewards investors for staking mDai tokens', async () => {
      let result

      // Check investor balance before staking
      result = await hillaryToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Hillary wallet balance correct before staking')

      // Stake Hillary Tokens
      await hillaryToken.approve(tokenFarm.address, tokens('100'), { from: investor })
      await tokenFarm.stakeTokens(tokens('100'), { from: investor })

      // Check staking result
      result = await hillaryToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), 'investor Hillary wallet balance correct after staking')

      result = await hillaryToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('100'), 'Token Farm Hillary balance correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

      // Issue Tokens
      await tokenFarm.issueTokens({ from: owner })

      // Check balances after issuance
      result = await rewardToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct affter issuance')

      // Ensure that only onwer can issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // Unstake tokens
      await tokenFarm.unstakeTokens({ from: investor })

      // Check results after unstaking
      result = await hillaryToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Hillary wallet balance correct after staking')

      result = await hillaryToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('0'), 'Token Farm Hillary balance correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
    })
  })

})
