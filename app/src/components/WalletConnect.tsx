'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletConnect() {
  return (
    <div style={{
      position: 'relative'
    }}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated');

          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="glass"
                      style={{
                        background: 'var(--primary-gradient)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>👛</span>
                      Connect Wallet
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="glass"
                      style={{
                        background: 'var(--error-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      ⚠️ Wrong network
                    </button>
                  );
                }

                return (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={openChainModal}
                      type="button"
                      className="glass"
                      style={{
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--glass-bg)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 16,
                            height: 16,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="glass"
                      style={{
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--glass-bg)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Status indicator */}
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--success-color)',
                        boxShadow: '0 0 8px rgba(38, 222, 129, 0.6)'
                      }} />

                      {/* Address */}
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '13px'
                      }}>
                        {account.displayName}
                      </span>

                      {/* Balance */}
                      {account.displayBalance && (
                        <span style={{
                          background: 'var(--accent-color)',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          boxShadow: '0 2px 8px rgba(0, 212, 255, 0.3)'
                        }}>
                          {account.displayBalance}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  )
}