import React, { useState, useEffect } from 'react';
import { telegramService } from '../../services/telegramService';
import {
  Send, CheckCircle2, AlertCircle, Loader2, ExternalLink,
  ShieldCheck, Power, Bell, BellOff, RefreshCw, Smartphone,
  Copy, Check, MessageSquare, Sparkles, Search, HelpCircle
} from 'lucide-react';

export const TelegramAlertsCard = ({ className = '' }) => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatIdInput, setChatIdInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [copiedBot, setCopiedBot] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const data = await telegramService.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load Telegram status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setFeedback({ text: '', type: '' });
    try {
      const res = await telegramService.autoDetect();
      if (res.success && res.data?.chatId) {
        setChatIdInput(String(res.data.chatId));
        if (res.data.username) {
          setUsernameInput(res.data.username);
        }
        setFeedback({
          text: `Success! Auto-detected Chat ID: ${res.data.chatId}${res.data.firstName ? ` (${res.data.firstName})` : ''}. We also sent a confirmation to your Telegram!`,
          type: 'success',
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'No recent messages found from the bot.';
      setFeedback({
        text: `${msg} Tip: Open the bot in Telegram, click START (or send any message), then click Auto-Detect again!`,
        type: 'error',
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!chatIdInput.trim()) {
      setFeedback({ text: 'Please enter your Telegram Chat ID.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ text: '', type: '' });
    try {
      const res = await telegramService.connect(chatIdInput.trim(), usernameInput.trim());
      setFeedback({ text: 'Telegram alerts linked successfully! Welcome message dispatched.', type: 'success' });
      setChatIdInput('');
      setUsernameInput('');
      fetchStatus();
    } catch (err) {
      setFeedback({ text: err.response?.data?.message || err.message || 'Failed to link Telegram account.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestAlert = async () => {
    setIsTesting(true);
    setFeedback({ text: '', type: '' });
    try {
      await telegramService.sendTestAlert();
      setFeedback({ text: 'Test notification sent to your Telegram app!', type: 'success' });
    } catch (err) {
      setFeedback({ text: err.response?.data?.message || err.message || 'Failed to dispatch test notification.', type: 'error' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Telegram alerts?')) return;
    setIsSubmitting(true);
    setFeedback({ text: '', type: '' });
    try {
      await telegramService.disconnect();
      setFeedback({ text: 'Telegram disconnected.', type: 'info' });
      fetchStatus();
    } catch (err) {
      setFeedback({ text: err.response?.data?.message || err.message || 'Failed to disconnect.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAlerts = async () => {
    try {
      await telegramService.toggleAlerts();
      fetchStatus();
    } catch (err) {
      alert(err.message);
    }
  };

  const copyBotUsername = (bot) => {
    navigator.clipboard.writeText(`@${bot}`);
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 2000);
  };

  const botUsername = status?.botUsername || 'RemindXAlertsBot';

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm transition-colors ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <Send className="h-5 w-5 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Telegram Bot Dispatcher
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                100% Free Alerts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant mobile push notifications & expiry alerts sent straight to your Telegram app.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          title="Refresh connection status"
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback.text && (
        <div
          className={`mt-4 flex items-start gap-2.5 p-3.5 rounded-xl border text-xs font-medium leading-relaxed ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : feedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
              : 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Content */}
      <div className="mt-5 space-y-5">
        {isLoading ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Checking Telegram integration status...</span>
          </div>
        ) : status?.isConnected ? (
          /* CONNECTED STATE */
          <div className="space-y-4">
            
            {/* Active Status Banner */}
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Linked Telegram Chat</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    Chat ID: <strong className="text-slate-800 dark:text-slate-200">{status.telegramChatId}</strong>
                    {status.telegramUsername && ` (@${status.telegramUsername})`}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestAlert}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>{isTesting ? 'Sending...' : 'Send Test Alert'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleAlerts}
                  title={status.telegramAlertsEnabled ? 'Pause Telegram Alerts' : 'Resume Telegram Alerts'}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    status.telegramAlertsEnabled
                      ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {status.telegramAlertsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span>Connected on: {new Date(status.telegramConnectedAt).toLocaleDateString()}</span>
              <span>Bot: @{botUsername}</span>
            </div>

          </div>
        ) : (
          /* NOT CONNECTED STATE */
          <div className="space-y-4">
            
            {/* Quick 2-Step Setup Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500/5 to-indigo-500/5 border border-sky-100 dark:border-sky-950 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-sky-500" />
                  <span>Connect in 2 Easy Steps:</span>
                </div>
                <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-500/20">
                  Instant Auto-Detect
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Step 1 */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-extrabold">1</span>
                    <span>Start the Bot in Telegram</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    Open our bot and press <b>START</b> (or send <code>/start</code>):
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={`https://t.me/${botUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px] shadow-sm transition-all"
                    >
                      <span>Open @{botUsername}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyBotUsername(botUsername)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400"
                      title="Copy bot username"
                    >
                      {copiedBot ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-extrabold">2</span>
                    <span>Click Auto-Detect</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    After sending a message to the bot, click the button below to fetch your ID:
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAutoDetect}
                      disabled={isDetecting}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isDetecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                      <span>{isDetecting ? 'Detecting ID...' : 'Auto-Detect My Chat ID'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Clarification note on helper bots */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/40 p-2.5 rounded-lg flex items-start gap-2">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Helper bots like <code>@userinfobot</code> or <code>@getmyid_bot</code> are separate Telegram bots searched from Telegram's main search bar. With our new <strong>Auto-Detect</strong> button above, you don't even need them!
                </span>
              </div>
            </div>

            {/* Link Form */}
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Your Telegram Chat ID *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoDetect}
                      disabled={isDetecting}
                      className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      {isDetecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 text-sky-500" />}
                      Auto-Detect
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={chatIdInput}
                    onChange={(e) => setChatIdInput(e.target.value)}
                    placeholder="e.g. 123456789 (or use Auto-Detect)"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Telegram Username (Optional)
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !chatIdInput.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>{isSubmitting ? 'Linking...' : 'Link Telegram & Send Welcome'}</span>
                </button>
              </div>
            </form>

          </div>
        )}
      </div>

    </div>
  );
};

export default TelegramAlertsCard;

