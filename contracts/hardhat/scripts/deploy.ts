import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "BDAG");

  const KYCRegistry = await ethers.getContractFactory("Greeter");
  const KYCApp = await KYCRegistry.deploy("Hello BlockDAG!");
  await KYCApp.waitForDeployment();

  const address = await KYCApp.getAddress();
  console.log("Greeter deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
