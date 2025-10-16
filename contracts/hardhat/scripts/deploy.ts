import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", await deployer.getAddress());

  const balance = await ethers.provider.getBalance(await deployer.getAddress());
  console.log("Account balance:", ethers.formatEther(balance), "BDAG");

  // use the correct contract name
  const KYCFactory = await ethers.getContractFactory("QuebecKYC");
  const kyc = await KYCFactory.deploy();         // no constructor args
  await kyc.waitForDeployment();

  console.log("DAGKYC deployed to:", await kyc.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
