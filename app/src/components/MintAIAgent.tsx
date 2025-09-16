'use client';

import React, { useState } from 'react';
import { useWallet } from '@/lib/wallet';
import toast from 'react-hot-toast';

const AI_PROFESSION_OPTIONS = [
  {
    value: 'assistant',
    label: '🤖 Personal Assistant',
    emoji: '💼',
    description: 'Efficient and organized, helps with daily tasks, scheduling, and productivity',
    color: 'var(--primary-gradient)'
  },
  {
    value: 'teacher',
    label: '👨‍🏫 AI Teacher',
    emoji: '📚',
    description: 'Patient and knowledgeable, explains complex topics in simple terms',
    color: 'var(--success-color)'
  },
  {
    value: 'developer',
    label: '👩‍💻 Code Developer',
    emoji: '⚡',
    description: 'Expert programmer, helps with coding, debugging, and technical solutions',
    color: 'var(--accent-color)'
  },
  {
    value: 'analyst',
    label: '📊 Data Analyst',
    emoji: '📈',
    description: 'Analytical and detail-oriented, provides insights from data and trends',
    color: 'var(--warning-color)'
  },
  {
    value: 'creative',
    label: '🎨 Creative Director',
    emoji: '🌟',
    description: 'Imaginative and artistic, helps with creative projects and design',
    color: 'var(--error-color)'
  },
  {
    value: 'consultant',
    label: '💼 Business Consultant',
    emoji: '💡',
    description: 'Strategic thinker, provides business advice and market insights',
    color: 'var(--secondary-gradient)'
  },
  {
    value: 'therapist',
    label: '🧘‍♀️ AI Therapist',
    emoji: '💚',
    description: 'Empathetic and supportive, provides emotional support and guidance',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    value: 'researcher',
    label: '🔬 Research Scientist',
    emoji: '🧪',
    description: 'Curious and methodical, conducts research and analysis on various topics',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
];

export default function MintAIAgent() {
  const { address } = useWallet();

  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    customProfession: '',
    imageFile: null as File | null,
    isPublic: true
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size cannot exceed 5MB');
      return;
    }
    setFormData(prev => ({ ...prev, imageFile: file }));

    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        toast.error('Please select an image file');
      }
    }
  };

  const handleProfessionChange = (profession: string) => {
    setFormData(prev => ({ ...prev, profession, customProfession: '' }));
  };

  const getProfessionDescription = () => {
    if (formData.profession === 'custom') {
      return formData.customProfession;
    }
    return AI_PROFESSION_OPTIONS.find(p => p.value === formData.profession)?.description || '';
  };

  const mintNFT = async () => {
    if (!address) {
      toast.error('Please connect wallet first');
      return;
    }

    if (!formData.name || !formData.profession || !formData.imageFile) {
      toast.error('Please fill in complete information');
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('Preparing image data...');

      // 获取钱包signer
      if (!window.ethereum) {
        throw new Error('Please install MetaMask wallet');
      }

      const { ethers } = await import('ethers');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      setUploadStatus('Uploading image to 0G storage...');

      // 创建FormData并上传图片文件
      const uploadFormData = new FormData();
      uploadFormData.append('image', formData.imageFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const uploadResult = await uploadResponse.json();
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      const imageHash = uploadResult.tempImageUrl || uploadResult.hash; // 优先使用临时图片URL

      setUploadStatus('Preparing personality data...');

      // 准备职业数据（简化版本，直接使用明文）
      const professionDescription = formData.profession === 'custom'
        ? formData.customProfession || ''
        : getProfessionDescription();

      setUploadStatus('Minting NFT...');

      // 使用前端合约调用铸造NFT
      const { mintAgent } = await import('@/lib/contract-utils');

      const result = await mintAgent(
        signer,
        formData.name,
        professionDescription,
        imageHash,
        formData.isPublic
      );

      setUploadStatus('Minting successful!');

      // 重置表单
      setFormData({
        name: '',
        profession: '',
        customProfession: '',
        imageFile: null,
        isPublic: true
      });
      setPreviewImage(null);

      // 使用toast显示成功信息
      toast.success('🎉 AI Agent NFT minted successfully!', {
        duration: 6000,
        style: {
          fontSize: '16px',
          padding: '16px',
        },
      });

      // 显示详细信息的toast
      setTimeout(() => {
        toast.success(`Token ID: ${result.tokenId}`, {
          duration: 4000,
          style: {
            fontSize: '14px',
          },
        });
      }, 1000);

      setTimeout(() => {
        toast.success(`Transaction Hash: ${result.txHash}`, {
          duration: 4000,
          style: {
            fontSize: '14px',
          },
        });
      }, 2000);

    } catch (error: any) {
      console.error('Minting failed:', error);
      toast.error(`Minting failed: ${error.message}`, {
        duration: 6000,
      });
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };


  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '32px 24px',
      animation: 'fadeIn 0.6s ease-out'
    }}>
      {/* Hero Section */}
      <div className="glass" style={{
        textAlign: 'center',
        padding: '40px 32px',
        marginBottom: '40px',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideUp 0.6s ease-out'
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '16px',
          animation: 'float 3s ease-in-out infinite'
        }}>🤖</div>
        <h1 style={{
          margin: '0 0 16px 0',
          fontSize: '32px',
          fontWeight: '800',
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Create Your AI Agent
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '16px',
          lineHeight: '1.6',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          Bring your AI agent to life with a unique profession and personality.
          Mint as an NFT and let others interact with your creation! ✨
        </p>
      </div>

      {/* 基本信息 */}
      <div className="glass" style={{
        padding: '32px',
        marginBottom: '32px',
        borderRadius: '20px',
        animation: 'slideUp 0.6s ease-out 0.1s both'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📝 Basic Information
        </h3>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}>
            Agent Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Give your AI agent a unique name..."
            className="glass"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              fontSize: '16px',
              color: 'var(--text-primary)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            disabled={isUploading}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-color)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--glass-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--text-secondary)'
          }}>
            Agent Avatar (Max 5MB)
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="glass"
            style={{
              border: `2px dashed ${isDragging ? 'var(--accent-color)' : 'var(--glass-border)'}`,
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              background: isDragging ? 'rgba(0, 212, 255, 0.1)' : 'var(--glass-bg)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              backdropFilter: 'blur(10px)'
            }}
            onClick={() => document.getElementById('imageInput')?.click()}
          >
            {previewImage ? (
              <div>
                <div style={{
                  width: '200px',
                  height: '200px',
                  margin: '0 auto 16px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '3px solid var(--accent-color)',
                  boxShadow: '0 8px 24px rgba(0, 212, 255, 0.3)'
                }}>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  ✨ Click or drag to change image
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  fontSize: '64px',
                  marginBottom: '16px',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
                }}>🖼️</div>
                <h4 style={{
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {isDragging ? '📁 Drop your image here!' : '📸 Upload Agent Avatar'}
                </h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  marginBottom: '12px'
                }}>
                  Click to browse or drag & drop your image
                </p>
                <div className="glass" style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  Supports: JPG, PNG, GIF • Max 5MB
                </div>
              </div>
            )}
          </div>

          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
        </div>

        <div className="glass" style={{
          padding: '20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            disabled={isUploading}
            style={{
              width: '20px',
              height: '20px',
              accentColor: 'var(--accent-color)'
            }}
          />
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}>
              💰 Enable Public Access
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              Allow others to chat with your AI agent for 0.01 $OG (you get 90% revenue share)
            </div>
          </div>
        </div>
      </div>

      {/* 职业选择 */}
      <div className="glass" style={{
        padding: '32px',
        marginBottom: '32px',
        borderRadius: '20px',
        animation: 'slideUp 0.6s ease-out 0.2s both'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          fontSize: '20px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🎭 Choose AI Profession
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {AI_PROFESSION_OPTIONS.map((option, index) => (
            <label
              key={option.value}
              className="glass"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                border: `2px solid ${formData.profession === option.value ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                borderRadius: '16px',
                cursor: 'pointer',
                background: formData.profession === option.value ? 'rgba(0, 212, 255, 0.1)' : 'var(--glass-bg)',
                transition: 'all 0.3s ease',
                minHeight: '140px',
                position: 'relative',
                overflow: 'hidden',
                animation: `slideUp 0.6s ease-out ${0.3 + index * 0.05}s both`
              }}
              onMouseEnter={(e) => {
                if (formData.profession !== option.value) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (formData.profession !== option.value) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* 顶部装饰线 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: option.color,
                opacity: formData.profession === option.value ? 1 : 0.3,
                transition: 'opacity 0.3s ease'
              }} />

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                gap: '8px'
              }}>
                <input
                  type="radio"
                  name="profession"
                  value={option.value}
                  checked={formData.profession === option.value}
                  onChange={() => handleProfessionChange(option.value)}
                  disabled={isUploading}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: 'var(--accent-color)'
                  }}
                />
                <div style={{
                  fontSize: '32px',
                  marginRight: '8px'
                }}>
                  {option.emoji}
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--text-primary)'
                }}>
                  {option.label.split(' ').slice(1).join(' ')}
                </div>
              </div>

              <div style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                flex: 1
              }}>
                {option.description}
              </div>

              {/* 选中状态指示器 */}
              {formData.profession === option.value && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(0, 212, 255, 0.4)'
                }}>
                  ✓
                </div>
              )}
            </label>
          ))}

          {/* Custom Profession */}
          <label
            className="glass"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              border: `2px solid ${formData.profession === 'custom' ? 'var(--accent-color)' : 'var(--glass-border)'}`,
              borderRadius: '16px',
              cursor: 'pointer',
              background: formData.profession === 'custom' ? 'rgba(0, 212, 255, 0.1)' : 'var(--glass-bg)',
              transition: 'all 0.3s ease',
              minHeight: '140px',
              gridColumn: formData.profession === 'custom' ? 'span 2' : 'span 1',
              position: 'relative',
              overflow: 'hidden',
              animation: `slideUp 0.6s ease-out ${0.3 + AI_PROFESSION_OPTIONS.length * 0.05}s both`
            }}
            onMouseEnter={(e) => {
              if (formData.profession !== 'custom') {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.profession !== 'custom') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {/* 顶部装饰线 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, var(--primary-gradient), var(--secondary-gradient))',
              opacity: formData.profession === 'custom' ? 1 : 0.3,
              transition: 'opacity 0.3s ease'
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
              gap: '8px'
            }}>
              <input
                type="radio"
                name="profession"
                value="custom"
                checked={formData.profession === 'custom'}
                onChange={() => handleProfessionChange('custom')}
                disabled={isUploading}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: 'var(--accent-color)'
                }}
              />
              <div style={{
                fontSize: '32px',
                marginRight: '8px'
              }}>
                ⚡
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                Custom Profession
              </div>
            </div>

            {formData.profession === 'custom' ? (
              <textarea
                value={formData.customProfession}
                onChange={(e) => setFormData(prev => ({ ...prev, customProfession: e.target.value }))}
                placeholder="Describe your AI agent's unique profession and capabilities..."
                disabled={isUploading}
                className="glass"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  resize: 'vertical',
                  minHeight: '80px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  lineHeight: '1.5'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-color)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--glass-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            ) : (
              <div style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                flex: 1
              }}>
                Create your own unique profession for your AI agent with custom capabilities and expertise
              </div>
            )}

            {/* 选中状态指示器 */}
            {formData.profession === 'custom' && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: '700',
                boxShadow: '0 2px 8px rgba(0, 212, 255, 0.4)'
              }}>
                ✓
              </div>
            )}
          </label>
        </div>
      </div>

      {/* 费用说明 */}
      <div className="glass" style={{
        padding: '24px',
        marginBottom: '32px',
        borderRadius: '16px',
        border: '2px solid var(--warning-color)',
        background: 'rgba(255, 192, 72, 0.1)',
        animation: 'slideUp 0.6s ease-out 0.3s both'
      }}>
        <h4 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💰 Pricing & Revenue
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {[
            {
              icon: '🏗️',
              title: 'Minting Cost',
              desc: '0.01 $OG for creating your AI agent NFT'
            },
            {
              icon: '💾',
              title: 'Permanent Storage',
              desc: 'Images and data stored forever on 0G network'
            },
            {
              icon: '💸',
              title: 'Revenue Share',
              desc: 'Users pay 0.01 $OG to chat, you get 90% share'
            }
          ].map((item, index) => (
            <div key={index} className="glass" style={{
              padding: '16px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '4px'
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: '1.4'
              }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 铸造按钮和状态 */}
      <div style={{
        animation: 'slideUp 0.6s ease-out 0.4s both'
      }}>
        <button
          onClick={mintNFT}
          disabled={isUploading || !address || !formData.name || !formData.profession || !formData.imageFile}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '700',
            borderRadius: '16px',
            background: (isUploading || !address || !formData.name || !formData.profession || !formData.imageFile)
              ? 'var(--glass-bg)'
              : 'var(--primary-gradient)',
            color: (isUploading || !address || !formData.name || !formData.profession || !formData.imageFile)
              ? 'var(--text-muted)'
              : 'white',
            border: 'none',
            cursor: (isUploading || !address || !formData.name || !formData.profession || !formData.imageFile)
              ? 'not-allowed'
              : 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: (isUploading || !address || !formData.name || !formData.profession || !formData.imageFile)
              ? 'none'
              : '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
        >
          {isUploading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Minting Your Agent...
            </>
          ) : (
            <>
              <span style={{ fontSize: '20px' }}>🚀</span>
              Mint AI Agent NFT (0.01 $OG)
            </>
          )}
        </button>

        {uploadStatus && (
          <div className="glass" style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            background: 'rgba(38, 222, 129, 0.1)',
            border: '1px solid var(--success-color)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              color: 'var(--success-color)',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>⚡</span>
              {uploadStatus}
            </div>
          </div>
        )}

        {!address && (
          <div className="glass" style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid var(--error-color)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              color: 'var(--error-color)',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>👛</span>
              Please connect your wallet first to mint your AI agent
            </div>
          </div>
        )}
      </div>
    </div>
  );
}