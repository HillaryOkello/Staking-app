const RewardToken = artifacts.require('RewardToken')
const HillaryToken = artifacts.require('HillaryToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
  // Deploy Mock DAI Token
  await deployer.deploy(HillaryToken)
  const daiToken = await HillaryToken.deployed()

  // Deploy Reward Token
  await deployer.deploy(RewardToken)
  const dappToken = await RewardToken.deployed()

  // Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  // Transfer all tokens to TokenFarm (1 million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  // Transfer 100 Hillary tokens to investor
  await daiToken.transfer(accounts[1], '100000000000000000000')
}
