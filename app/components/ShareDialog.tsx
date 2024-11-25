'use client';

import { useState } from 'react';
import { X, Share2, Lock, Copy, Check, Download } from 'lucide-react';
import { Message } from '../lib/types';
import { p2pManager, EncryptedConversation } from '../lib/p2pManager';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

export function ShareDialog({ isOpen, onClose, messages }: ShareDialogProps) {
  const [peerId, setPeerId] = useState('');
  const [password, setPassword] = useState('');
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [encryptedConversation, setEncryptedConversation] = useState<EncryptedConversation | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const initializeP2P = async () => {
    try {
      const id = await p2pManager.initialize();
      setMyPeerId(id);
    } catch (err) {
      setError('Failed to initialize P2P connection');
    }
  };

  const handleEncrypt = async () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const encrypted = await p2pManager.encryptConversation(messages, password);
      setEncryptedConversation(encrypted);
    } catch (err) {
      setError('Failed to encrypt conversation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!encryptedConversation) {
      setError('Please encrypt the conversation first');
      return;
    }

    if (!peerId) {
      setError('Please enter a peer ID');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await p2pManager.connectToPeer(peerId);
      await p2pManager.sendConversation(peerId, encryptedConversation);
      setError(null);
    } catch (err) {
      setError('Failed to share conversation');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPeerId = async () => {
    if (myPeerId) {
      try {
        await navigator.clipboard.writeText(myPeerId);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        setError('Failed to copy peer ID');
      }
    }
  };

  const downloadEncrypted = () => {
    if (!encryptedConversation) return;

    const blob = new Blob([JSON.stringify(encryptedConversation)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encrypted-conversation-${encryptedConversation.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-[400px] border border-[#ff0000] bg-black p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#ff0000] text-lg font-mono flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Conversation
          </h2>
          <button 
            onClick={onClose}
            className="text-[#ff0000] hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {!myPeerId ? (
            <button
              onClick={initializeP2P}
              className="w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10"
            >
              Initialize P2P Connection
            </button>
          ) : (
            <div className="space-y-4">
              <div className="border border-[#ff0000] p-4">
                <div className="text-[#ff0000] font-mono text-sm mb-2">Your Peer ID:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={myPeerId}
                    readOnly
                    className="flex-1 bg-transparent border border-[#ff0000] p-2 text-[#ff0000] font-mono"
                  />
                  <button
                    onClick={copyPeerId}
                    className="px-3 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10"
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="border border-[#ff0000] p-4">
                <div className="text-[#ff0000] font-mono text-sm mb-2 flex items-center gap-2">
                  <Lock size={16} />
                  Encryption Password:
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to encrypt"
                  className="w-full bg-transparent border border-[#ff0000] p-2 text-[#ff0000] font-mono mb-2"
                />
                <button
                  onClick={handleEncrypt}
                  disabled={isProcessing || !password}
                  className="w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 disabled:opacity-50"
                >
                  {isProcessing ? 'Encrypting...' : 'Encrypt Conversation'}
                </button>
              </div>

              {encryptedConversation && (
                <div className="border border-[#ff0000] p-4">
                  <div className="text-[#ff0000] font-mono text-sm mb-2">Share with Peer:</div>
                  <input
                    type="text"
                    value={peerId}
                    onChange={(e) => setPeerId(e.target.value)}
                    placeholder="Enter recipient's peer ID"
                    className="w-full bg-transparent border border-[#ff0000] p-2 text-[#ff0000] font-mono mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      disabled={isProcessing || !peerId}
                      className="flex-1 py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 disabled:opacity-50"
                    >
                      {isProcessing ? 'Sharing...' : 'Share'}
                    </button>
                    <button
                      onClick={downloadEncrypted}
                      className="px-4 py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-[#ff0000] font-mono text-sm">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}