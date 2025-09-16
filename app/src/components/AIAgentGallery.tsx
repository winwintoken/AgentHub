'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/wallet';
import ChatInterface from './ChatInterface';

interface AIAgent {
  tokenId: string;
  name: string;
  personality: string;
  imageHash: string;
  creator: string;
  totalChats: number;
  isPublic: boolean;
  createdAt?: number;
}


export default function AIAgentGallery() {
  const { address } = useWallet();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [myAgents, setMyAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  useEffect(() => {
    loadAgents();
  }, [address]);

  const loadAgents = async () => {
    try {
      setLoading(true);

      // 加载所有公开的AI代理
      const { getAllPublicAgents, getUserCreatedAgents } = await import('@/lib/contract-utils');

      const publicAgents = await getAllPublicAgents();
      setAgents(publicAgents);

      // 如果用户已连接，加载用户创建的AI代理
      if (address) {
        const userAgents = await getUserCreatedAgents(address);
        setMyAgents(userAgents);
      }

    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedAgents = (agentsList: AIAgent[]) => {
    const sorted = [...agentsList];
    if (sortBy === 'newest') {
      return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else {
      return sorted.sort((a, b) => b.totalChats - a.totalChats);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getImageUrl = (imageHash: string) => {
    // 如果是临时图片URL，直接返回
    if (imageHash.startsWith('/temp/') || imageHash.startsWith('http')) {
      return imageHash;
    }
    // 否则尝试通过下载API（向后兼容）
    return `/api/download?hash=${imageHash}`;
  };

  const getPlaceholderUrl = (tokenId: string) => {
    // 根据tokenId循环选择默认头像（使用通用头像）
    const tokenNum = parseInt(tokenId) || 1;
    const avatarNumber = ((tokenNum - 1) % 5) + 1;
    return `/temp/avatar${avatarNumber}.jpg`;
  };

  if (selectedAgent) {
    return (
      <ChatInterface
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
      />
    );
  }

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '1rem',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    height: '320px',
    display: 'flex',
    flexDirection: 'column'
  };

  const cardHoverStyle: React.CSSProperties = {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: isActive ? '#e91e63' : 'transparent',
    color: isActive ? 'white' : '#666',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: isActive ? '600' : 'normal'
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* 导航标签 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        backgroundColor: '#f8f9fa',
        padding: '0.5rem',
        borderRadius: '30px',
        width: 'fit-content',
        margin: '0 auto 2rem auto'
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={tabStyle(activeTab === 'all')}
        >
          🌟 All Agents ({agents.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          style={tabStyle(activeTab === 'my')}
        >
          💕 My Agents ({myAgents.length})
        </button>
      </div>

      {/* 排序控制 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ color: '#666', fontSize: '0.9rem' }}>
          {activeTab === 'all'
            ? `Discover ${agents.length} AI agents`
            : `You created ${myAgents.length} AI agents`
          }
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setSortBy('newest')}
            style={{
              ...tabStyle(sortBy === 'newest'),
              padding: '0.5rem 1rem',
              fontSize: '0.8rem'
            }}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy('popular')}
            style={{
              ...tabStyle(sortBy === 'popular'),
              padding: '0.5rem 1rem',
              fontSize: '0.8rem'
            }}
          >
            Most Popular
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #e91e63',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {getSortedAgents(activeTab === 'all' ? agents : myAgents).map((agent) => (
            <div
              key={agent.tokenId}
              style={cardStyle}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, cardHoverStyle);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, cardStyle);
              }}
              onClick={() => setSelectedAgent(agent)}
            >
              {/* 头像区域 */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                backgroundColor: '#e91e63',
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem',
                fontWeight: 'bold',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* 默认头像显示名字首字母 */}
                <span style={{
                  position: 'absolute',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}>
                  {agent.name[0]}
                </span>

                {/* 快速占位头像 */}
                <img
                  src={getPlaceholderUrl(agent.tokenId)}
                  alt={`${agent.name} placeholder`}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    objectPosition: 'center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    backgroundColor: 'transparent'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0';
                  }}
                />

                {/* 如果有真实图片，用img标签显示 */}
                {agent.imageHash && (
                  <img
                    src={getImageUrl(agent.imageHash)}
                    alt={agent.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 3,
                      backgroundColor: 'transparent'
                    }}
                    onError={(e) => {
                      // 真实头像加载失败时隐藏，显示占位头像
                      (e.target as HTMLImageElement).style.opacity = '0';
                      console.log('真实头像加载失败，显示占位头像');
                    }}
                    onLoad={() => {
                      console.log('真实头像加载成功');
                    }}
                  />
                )}
              </div>

              {/* 基本信息 */}
              <div style={{ textAlign: 'center', flex: 1 }}>
                <h3 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.2rem',
                  color: '#333'
                }}>
                  {agent.name}
                </h3>

                <p style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '0.9rem',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  {agent.tokenId === '1' ? 'Mysterious and charming, speaks with subtle hints' : agent.personality}
                </p>

                <p style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.8rem',
                  color: '#999'
                }}>
                  Creator: {formatAddress(agent.creator)}
                </p>
              </div>

              {/* 底部按钮区域 */}
              <div style={{ marginTop: 'auto' }}>
                <button style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#e91e63',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  💬 Start Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === 'all' && agents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💔</div>
          <p>No public AI agents yet</p>
          <p style={{ fontSize: '0.9rem' }}>Be the first to create an AI agent!</p>
        </div>
      )}

      {!loading && activeTab === 'my' && myAgents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#666'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💕</div>
          <p>You haven&apos;t created any AI agents yet</p>
          <p style={{ fontSize: '0.9rem' }}>Go create your first exclusive AI agent!</p>
        </div>
      )}
    </div>
  );
}