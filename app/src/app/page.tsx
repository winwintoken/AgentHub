'use client';

import React, { useState } from 'react';
import { WalletConnect } from '@/components/WalletConnect';
import AIAgentGallery from '@/components/AIAgentGallery';
import MintAIAgent from '@/components/MintAIAgent';

type Page = 'gallery' | 'mint';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('gallery');

  const navButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    border: isActive ? 'none' : '1px solid var(--glass-border)',
    background: isActive
      ? 'var(--primary-gradient)'
      : 'var(--glass-bg)',
    color: isActive ? 'white' : 'var(--text-primary)',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: isActive ? '0 4px 15px rgba(102, 126, 234, 0.3)' : 'none',
    position: 'relative',
    overflow: 'hidden'
  });

  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--background-gradient)',
      position: 'relative'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />
      </div>

      {/* Header */}
      <header className="glass-strong" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: '800',
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '32px',
                filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))'
              }}>🤖</span>
              AgentHub
            </h1>

            <nav style={{
              display: 'flex',
              gap: '8px',
              background: 'var(--glass-bg)',
              padding: '8px',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(10px)'
            }}>
              <button
                onClick={() => setCurrentPage('gallery')}
                style={navButtonStyle(currentPage === 'gallery')}
                onMouseEnter={(e) => {
                  if (currentPage !== 'gallery') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'gallery') {
                    e.currentTarget.style.background = 'var(--glass-bg)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                🏠 Gallery
              </button>
              <button
                onClick={() => setCurrentPage('mint')}
                style={navButtonStyle(currentPage === 'mint')}
                onMouseEnter={(e) => {
                  if (currentPage !== 'mint') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'mint') {
                    e.currentTarget.style.background = 'var(--glass-bg)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                ✨ Create Agent
              </button>
            </nav>
          </div>

          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        position: 'relative',
        zIndex: 2
      }}>
        {currentPage === 'gallery' && <AIAgentGallery />}
        {currentPage === 'mint' && <MintAIAgent />}
      </div>

      {/* Footer */}
      <footer className="glass" style={{
        borderTop: '1px solid var(--glass-border)',
        padding: '32px 24px',
        marginTop: '64px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          animation: 'fadeIn 1s ease-out'
        }}>
          <h3 style={{
            marginBottom: '16px',
            fontSize: '20px',
            fontWeight: '700',
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🚀 AI Agent NFT Platform Built on 0G Network
          </h3>


          <div style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            lineHeight: '1.6',
            background: 'var(--glass-bg)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)'
          }}>
            All data is permanently stored in the 0G distributed network, ensuring your AI agent never disappears 🌟
          </div>
        </div>
      </footer>
    </main>
  );
}
