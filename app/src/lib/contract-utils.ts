import { ethers } from 'ethers';
import { AI_AGENT_ABI } from './contracts';
import contractAddresses from './contract-addresses.json';

const AI_AGENT_CONTRACT = contractAddresses.contractAddress;
const RPC_URL = 'https://evmrpc-testnet.0g.ai';

// 创建只读合约实例
export function getReadOnlyContract() {
  if (!AI_AGENT_CONTRACT) {
    throw new Error('合约地址未配置，请先部署合约');
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(AI_AGENT_CONTRACT, AI_AGENT_ABI, provider);
}

// 创建可写合约实例（需要钱包签名）
export function getContract(signer: ethers.Signer) {
  if (!AI_AGENT_CONTRACT) {
    throw new Error('合约地址未配置，请先部署合约');
  }

  return new ethers.Contract(AI_AGENT_CONTRACT, AI_AGENT_ABI, signer);
}

// 获取所有公开的AI代理
export async function getAllPublicAgents() {
  const contract = getReadOnlyContract();
  const publicTokenIds = await contract.getAllPublicAgents();

  const publicAgents = await Promise.all(
    publicTokenIds.map(async (tokenId: bigint) => {
      const details = await contract.getAgentDetails(tokenId);
      return {
        tokenId: tokenId.toString(),
        name: details.name,
        personality: details.personality,
        imageHash: details.imageHash,
        creator: details.creator,
        totalChats: Number(details.totalChats),
        isPublic: details.isPublic,
        createdAt: Number(details.createdAt)
      };
    })
  );

  return publicAgents;
}

// 获取用户创建的AI代理
export async function getUserCreatedAgents(userAddress: string) {
  const contract = getReadOnlyContract();
  const userTokenIds = await contract.getUserCreatedAgents(userAddress);

  const userAgents = await Promise.all(
    userTokenIds.map(async (tokenId: bigint) => {
      const details = await contract.getAgentDetails(tokenId);
      return {
        tokenId: tokenId.toString(),
        name: details.name,
        personality: details.personality,
        imageHash: details.imageHash,
        creator: details.creator,
        totalChats: Number(details.totalChats),
        isPublic: details.isPublic,
        createdAt: Number(details.createdAt)
      };
    })
  );

  return userAgents;
}

// 获取AI代理详情
export async function getAgentDetails(tokenId: string) {
  const contract = getReadOnlyContract();
  const details = await contract.getAgentDetails(tokenId);

  return {
    tokenId,
    name: details.name,
    personality: details.personality,
    imageHash: details.imageHash,
    creator: details.creator,
    totalChats: Number(details.totalChats),
    isPublic: details.isPublic,
    createdAt: Number(details.createdAt)
  };
}

// 获取价格信息
export async function getPrices() {
  const contract = getReadOnlyContract();
  const mintPrice = await contract.MINT_PRICE();
  const chatPrice = await contract.CHAT_PRICE();

  return {
    mintPrice: ethers.formatEther(mintPrice),
    chatPrice: ethers.formatEther(chatPrice)
  };
}

// 开始聊天会话（需要用户签名和支付）
export async function startChatSession(signer: ethers.Signer, tokenId: string) {
  const contract = getContract(signer);
  const chatPrice = await contract.CHAT_PRICE();

  const tx = await contract.startChatSession(tokenId, { value: chatPrice });
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
}

// 铸造AI代理NFT（需要用户签名和支付）
export async function mintAgent(
  signer: ethers.Signer,
  name: string,
  personality: string,
  imageHash: string,
  isPublic: boolean
) {
  const contract = getContract(signer);
  const mintPrice = await contract.MINT_PRICE();

  const tx = await contract.mintAgent(
    name,
    personality,
    imageHash,
    isPublic,
    { value: mintPrice }
  );

  const receipt = await tx.wait();

  // 从事件中获取tokenId
  let tokenId = '';
  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog({
        topics: log.topics,
        data: log.data
      });
      if (parsedLog && parsedLog.name === 'AIAgentMinted') {
        tokenId = parsedLog.args.tokenId.toString();
        break;
      }
    } catch (e) {
      // 忽略解析错误
    }
  }

  return {
    tokenId,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString()
  };
}