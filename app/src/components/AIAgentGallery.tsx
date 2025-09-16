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
    background: 'var(--card-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--card-border)',
    borderRadius: '20px',
    padding: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    height: '380px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardHoverStyle: React.CSSProperties = {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    borderColor: 'var(--accent-color)',
    background: 'rgba(255, 255, 255, 0.08)'
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    border: 'none',
    background: isActive ? 'var(--primary-gradient)' : 'var(--glass-bg)',
    color: isActive ? 'white' : 'var(--text-primary)',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: isActive ? 'none' : '1px solid var(--glass-border)',
    boxShadow: isActive ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none'
  });

  return (
    <div style={{
      padding: '32px 24px',
      maxWidth: '1200px',
      margin: '0 auto',
      animation: 'fadeIn 0.6s ease-out'
    }}>

      {/* 导航标签 */}
      <div className="glass" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '32px',
        padding: '12px',
        borderRadius: '24px',
        width: 'fit-content',
        margin: '0 auto 32px auto',
        animation: 'slideUp 0.6s ease-out'
      }}>
        <button
          onClick={() => setActiveTab('all')}
          style={tabStyle(activeTab === 'all')}
          onMouseEnter={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.background = 'var(--glass-bg)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          🌟 All Agents ({agents.length})
        </button>
        <button
          onClick={() => setActiveTab('my')}
          style={tabStyle(activeTab === 'my')}
          onMouseEnter={(e) => {
            if (activeTab !== 'my') {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'my') {
              e.currentTarget.style.background = 'var(--glass-bg)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          💕 My Agents ({myAgents.length})
        </button>
      </div>

      {/* 排序控制 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        animation: 'slideUp 0.6s ease-out 0.1s both'
      }}>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {activeTab === 'all'
            ? `✨ Discover ${agents.length} amazing AI agents`
            : `💖 You created ${myAgents.length} AI agents`
          }
        </div>
        <div className="glass" style={{
          display: 'flex',
          gap: '8px',
          padding: '8px',
          borderRadius: '16px'
        }}>
          <button
            onClick={() => setSortBy('newest')}
            style={{
              ...tabStyle(sortBy === 'newest'),
              padding: '8px 16px',
              fontSize: '12px'
            }}
            onMouseEnter={(e) => {
              if (sortBy !== 'newest') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (sortBy !== 'newest') {
                e.currentTarget.style.background = 'var(--glass-bg)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            🆕 Newest
          </button>
          <button
            onClick={() => setSortBy('popular')}
            style={{
              ...tabStyle(sortBy === 'popular'),
              padding: '8px 16px',
              fontSize: '12px'
            }}
            onMouseEnter={(e) => {
              if (sortBy !== 'popular') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (sortBy !== 'popular') {
                e.currentTarget.style.background = 'var(--glass-bg)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            🔥 Popular
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 24px',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTop: '4px solid var(--accent-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px',
            filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.3))'
          }} />
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            ✨ Loading amazing AI agents...
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          animation: 'slideUp 0.6s ease-out 0.2s both'
        }}>
          {getSortedAgents(activeTab === 'all' ? agents : myAgents).map((agent, index) => (
            <div
              key={agent.tokenId}
              className="card"
              style={{
                ...cardStyle,
                animation: `slideUp 0.6s ease-out ${0.3 + index * 0.1}s both`
              }}
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
                width: '140px',
                height: '140px',
                borderRadius: '20px',
                background: 'var(--primary-gradient)',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '48px',
                fontWeight: 'bold',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}>
                {/* 渐变装饰 */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)'
                }} />

                {/* 默认头像显示名字首字母 */}
                <span style={{
                  position: 'absolute',
                  zIndex: 1,
                  pointerEvents: 'none',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
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
                    borderRadius: '20px',
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
                      borderRadius: '20px',
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

                {/* 闪光效果 */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
                  animation: 'float 3s ease-in-out infinite',
                  pointerEvents: 'none'
                }} />
              </div>

              {/* 基本信息 */}
              <div style={{
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  background: 'var(--primary-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {agent.name}
                </h3>

                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {agent.tokenId === '1' ? 'Mysterious and charming, speaks with subtle hints' : agent.personality}
                </p>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  gap: '12px',
                  marginTop: '8px'
                }}>
                  <div className="glass" style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
                      {agent.totalChats}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                      Chats
                    </div>
                  </div>
                  <div className="glass" style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    <div style={{ color: 'var(--success-color)', fontWeight: '600' }}>
                      #{agent.tokenId}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                      Token
                    </div>
                  </div>
                </div>

                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  👨‍💻 Creator: {formatAddress(agent.creator)}
                </p>
              </div>

              {/* 底部按钮区域 */}
              <div style={{ marginTop: 'auto' }}>
                <button className="btn btn-primary" style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}>
                  💬 Start Conversation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === 'all' && agents.length === 0 && (
        <div className="glass" style={{
          textAlign: 'center',
          padding: '60px 40px',
          margin: '40px auto',
          maxWidth: '400px',
          borderRadius: '24px',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            animation: 'float 3s ease-in-out infinite'
          }}>🚀</div>
          <h3 style={{
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            No AI Agents Yet
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Be the first pioneer to create an amazing AI agent and start the revolution! ✨
          </p>
        </div>
      )}

      {!loading && activeTab === 'my' && myAgents.length === 0 && (
        <div className="glass" style={{
          textAlign: 'center',
          padding: '60px 40px',
          margin: '40px auto',
          maxWidth: '400px',
          borderRadius: '24px',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>💖</div>
          <h3 style={{
            color: 'var(--text-primary)',
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            Your Agent Collection is Empty
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Create your first exclusive AI agent and bring your imagination to life! 🌟
          </p>
        </div>
      )}
    </div>
  );
}