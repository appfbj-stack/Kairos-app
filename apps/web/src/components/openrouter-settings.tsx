// components/openrouter-settings.tsx
"use client";

import { useState } from "react";
import { Settings, Eye, EyeOff, Check, AlertCircle, ExternalLink } from "lucide-react";
import { useOpenRouter } from "@/hooks/useOpenRouter";
import { formatPrice } from "@/lib/openrouter";

export default function OpenRouterSettings() {
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
  const [activeCategory, setActiveCategory] = useState<"economy" | "standard" | "premium">("economy");

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      setApiKey(tempKey.trim());
    }
  };

  const handleRemoveKey = () => {
    setTempKey("");
    setApiKey("");
  };

  const selectedModelInfo = models.find(m => m.id === selectedModel);

  const categories = [
    { key: "economy" as const, label: "💰 Economy", desc: "Mais baratos" },
    { key: "standard" as const, label: "⚖️ Standard", desc: "Balanceados" },
    { key: "premium" as const, label: "👑 Premium", desc: "Mais poderosos" }
  ];

  const filteredModels = models.filter(m => m.category === activeCategory);

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
              {isConfigured && selectedModelInfo
                ? `${selectedModelInfo.name} • ${formatPrice(selectedModelInfo.promptPrice)}`
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
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
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
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Não tem uma key?</span>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline flex items-center gap-1"
              >
                Criar conta grátis <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Model Selection */}
          {isConfigured && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Modelo de IA (apenas pagos)
              </label>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-3">
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`flex-1 p-2 rounded-lg text-center transition-all ${
                      activeCategory === cat.key
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <div className="text-sm font-bold">{cat.label}</div>
                    <div className="text-xs opacity-75">{cat.desc}</div>
                  </button>
                ))}
              </div>

              {/* Models List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedModel === model.id
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-500"
                        : "border-gray-200 dark:border-gray-600 hover:border-purple-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 dark:text-white text-sm">
                        {model.name}
                      </span>
                      <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                        {formatPrice(model.promptPrice)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {model.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Contexto: {(model.contextLength / 1000).toFixed(0)}K</span>
                      {selectedModel === model.id && (
                        <span className="text-green-600 font-bold flex items-center gap-1">
                          <Check size={12} /> Selecionado
                        </span>
                      )}
                    </div>
                  </button>
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
              <button onClick={clearError} className="ml-auto text-xs underline">
                Fechar
              </button>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-400">
            <strong>Dica:</strong> Todos os modelos são pagos. Os preços mostrados são por 1 milhão de tokens.
            Custo aproximado de uma pergunta simples: $0.01 a $0.10 dependendo do modelo.
          </div>
        </div>
      )}
    </div>
  );
}
