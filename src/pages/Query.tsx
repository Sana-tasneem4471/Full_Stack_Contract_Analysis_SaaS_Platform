import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Search, MessageCircle, FileText, Lightbulb } from 'lucide-react';

interface QueryResult {
  id: string;
  answer: string;
  confidence: number;
  sources: Array<{
    id: string;
    contractName: string;
    excerpt: string;
    page: number;
    relevance: number;
  }>;
}

const mockQueryResult: QueryResult = {
  id: '1',
  answer: 'Based on your contract analysis, most termination clauses require 90 days written notice. The Master Service Agreement with TechCorp specifically states that "Either party may terminate this agreement with 90 days written notice." However, the Software License with DataFlow Inc has a shorter 60-day notice period. Industry best practice typically ranges from 30-90 days depending on the contract type and relationship complexity.',
  confidence: 94,
  sources: [
    {
      id: '1',
      contractName: 'Master Service Agreement - TechCorp',
      excerpt: 'Either party may terminate this agreement with 90 days written notice to the other party.',
      page: 12,
      relevance: 96
    },
    {
      id: '2',
      contractName: 'Software License - DataFlow Inc',
      excerpt: 'This agreement may be terminated by either party with 60 days prior written notice.',
      page: 8,
      relevance: 89
    },
    {
      id: '3',
      contractName: 'Consulting Agreement - Legal Partners',
      excerpt: 'Termination requires written notice of at least ninety (90) calendar days.',
      page: 15,
      relevance: 87
    }
  ]
};

const suggestedQueries = [
  'What are the termination clauses in my contracts?',
  'Which contracts are expiring in the next 90 days?',
  'What liability limitations are in place?',
  'Are there any auto-renewal clauses?',
  'What intellectual property rights are mentioned?',
  'Which contracts have the highest risk scores?'
];

export default function Query() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([
    'What are the termination notice periods?',
    'Which contracts expire this year?'
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    
    // Add to history
    setQueryHistory(prev => [query, ...prev.slice(0, 4)]);
    
    // Simulate API call
    setTimeout(() => {
      setResult(mockQueryResult);
      setLoading(false);
    }, 2000);
  };

  const handleSuggestedQuery = (suggestedQuery: string) => {
    setQuery(suggestedQuery);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Intelligence</h1>
          <p className="text-gray-600">Ask questions about your contracts in natural language</p>
        </div>

        {/* Query Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about your contracts... (e.g., 'What are the termination clauses?')"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {queryHistory.length > 0 && (
                  <span>Recent: {queryHistory.slice(0, 2).join(', ')}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Ask AI
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Suggested Queries */}
        {!result && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Suggested Questions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQueries.map((suggestedQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuery(suggestedQuery)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition duration-200"
                >
                  <div className="flex items-start">
                    <MessageCircle className="w-4 h-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{suggestedQuery}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Analyzing your contracts...</p>
                <p className="text-sm text-gray-600 mt-1">This may take a moment</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">
            {/* AI Answer */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {result.confidence}% Confidence
                    </span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{result.answer}</p>
                </div>
              </div>
            </div>

            {/* Source Evidence */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Source Evidence ({result.sources.length})
              </h2>
              <div className="space-y-4">
                {result.sources.map((source) => (
                  <div key={source.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{source.contractName}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Page {source.page}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {source.relevance}% match
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded border-l-4 border-blue-200">
                      "{source.excerpt}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-medium text-blue-900 mb-3">Next Steps</h3>
              <div className="space-y-2">
                <button className="block w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition duration-200">
                  <span className="font-medium text-blue-900">Export this analysis to PDF</span>
                  <p className="text-sm text-blue-700">Generate a detailed report for your legal team</p>
                </button>
                <button className="block w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition duration-200">
                  <span className="font-medium text-blue-900">Schedule contract reviews</span>
                  <p className="text-sm text-blue-700">Set reminders for upcoming renewal dates</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Query History */}
        {queryHistory.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h2>
            <div className="space-y-2">
              {queryHistory.map((pastQuery, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(pastQuery)}
                  className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition duration-200"
                >
                  <span className="text-sm text-gray-700">{pastQuery}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}