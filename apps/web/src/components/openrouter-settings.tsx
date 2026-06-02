// components/openrouter-settings.tsx
"use client";

import { useState } from "react";
import { Settings, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { useOpenRouter } from "@/hooks/useOpenRouter";

interface OpenRouterSettingsProps {
  onConfigured?: () => void;
}

export default function OpenRouterSettings({ onConfigured }: OpenRouterSettingsProps) {
  const {
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    models,
    isConfigured,
    clearError,
    error
  } = useOpenRouter();

  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [isExpanded, setIsExpanded] = useState(!isConfigured);

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      setApiKey(tempKey.trim());
      onConfigured?.();
    }
  };

  const handleRemoveKey = () => {
    setTempKey("");
    setApiKey("");
    setIsExpanded(true);
  };

  const selectedModelInfo = models.find(m => m.id === selectedModel);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Settings size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800 dark:text-white">
              OpenRouter AI
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isConfigured
                ? `Conectado • ${selectedModelInfo?.name}`
                : "Configure para usar IA"}
            </p>
          </div>
        </div>
        {isConfigured && (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
            <Check size={12} />
            Ativo
          </span>
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* API Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key do OpenRouter
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                onClick={handleSaveKey}
                disabled={!tempKey.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                Salvar
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Obtenha sua key em{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          {/* Model Selection */}
          {isConfigured && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modelo de IA
              </label>

              {/* Category Tabs */}
              <div className="space-y-3">
                {(["fast", "balanced", "powerful"] as const).map(category => (
                  <div key={category}>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      {category === "fast"
                        ? "⚡ Rápido"
                        : category === "balanced"
                        ? "⚖️ Balanceado"
                        : "💪 Poderoso"}
                    </h4>
                    <div className="grid gap-2">
                      {models
                        .filter(m => m.category === category)
                        .map(model => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`text-left p-3 rounded-lg border transition-all ${
                              selectedModel === model.id
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-purple-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800 dark:text-white text-sm">
                                {model.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {model.pricePer1k}/1k tokens
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {model.description}
                            </p>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remove Key */}
          {isConfigured && (
            <button
              onClick={handleRemoveKey}
              className="text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              Remover API Key
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
