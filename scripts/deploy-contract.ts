import { ethers } from "ethers";
// import { hardhat } from "hardhat";

async function main() {
  const GamingChallenge = new ethers.ContractFactory(
    [
      // ABI goes here
    ],
    "0x..." // Bytecode goes here
  );
  const contract = await GamingChallenge.deploy();
  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
