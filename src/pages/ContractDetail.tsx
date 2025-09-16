import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, Users, AlertTriangle, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';

interface ContractDetail {
  id: string;
  name: string;
  parties: string[];
  expiryDate: string;
  status: 'Active' | 'Renewal Due' | 'Expired';
  riskScore: 'Low' | 'Medium' | 'High';
  uploadedOn: string;
  clauses: Array<{
    id: string;
    title: string;
    content: string;
    confidence: number;
    type: string;
  }>;
  insights: Array<{
    id: string;
    type: 'risk' | 'recommendation';
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
  }>;
  evidenceSnippets: Array<{
    id: string;
    text: string;
    page: number;
    relevance: number;
  }>;
}

const mockContractDetail: ContractDetail = {
  id: '1',
  name: 'Master Service Agreement - TechCorp',
  parties: ['Your Company', 'TechCorp Solutions'],
  expiryDate: '2025-03-15',
  status: 'Active',
  riskScore: 'Low',
  uploadedOn: '2024-01-15',
  clauses: [
    {
      id: '1',
      title: 'Termination Clause',
      content: 'Either party may terminate this agreement with 90 days written notice.',
      confidence: 95,
      type: 'Termination'
    },
    {
      id: '2',
      title: 'Liability Limitation',
      content: 'Total liability shall not exceed the amount paid under this agreement in the 12 months preceding the claim.',
      confidence: 88,
      type: 'Liability'
    },
    {
      id: '3',
      title: 'Intellectual Property',
      content: 'Each party retains ownership of their pre-existing intellectual property.',
      confidence: 92,
      type: 'IP Rights'
    }
  ],
  insights: [
    {
      id: '1',
      type: 'risk',
      title: 'Auto-renewal Risk',
      description: 'Contract contains automatic renewal clause that may extend terms without explicit consent.',
      severity: 'Medium'
    },
    {
      id: '2',
      type: 'recommendation',
      title: 'Review Termination Notice',
      description: '90-day notice period is longer than industry standard. Consider negotiating to 30-60 days.',
      severity: 'Low'
    },
    {
      id: '3',
      type: 'risk',
      title: 'Liability Cap Analysis',
      description: 'Current liability limitation may not adequately protect against potential claims.',
      severity: 'Medium'
    }
  ],
  evidenceSnippets: [
    {
      id: '1',
      text: 'This agreement shall automatically renew for successive one-year terms unless either party provides written notice...',
      page: 3,
      relevance: 94
    },
    {
      id: '2',
      text: 'In no event shall either party be liable for any indirect, incidental, or consequential damages...',
      page: 7,
      relevance: 87
    }
  ]
};

export default function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEvidenceDrawer, setShowEvidenceDrawer] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContract(mockContractDetail);
      setLoading(false);
    }, 1000);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-700 bg-green-100';
      case 'Renewal Due': return 'text-yellow-700 bg-yellow-100';
      case 'Expired': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-700 bg-green-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'High': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (!contract) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Contract not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{contract.name}</h1>
              <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {contract.parties.join(' ↔ ')}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Expires: {contract.expiryDate}
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Uploaded: {contract.uploadedOn}
                </div>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                {contract.status}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(contract.riskScore)}`}>
                {contract.riskScore} Risk
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Clauses */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Clauses</h2>
              <div className="space-y-4">
                {contract.clauses.map((clause) => (
                  <div key={clause.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{clause.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{clause.type}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {clause.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{clause.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
              <div className="space-y-4">
                {contract.insights.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(insight.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900">{insight.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(insight.severity)}`}>
                            {insight.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.type === 'risk' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {insight.type === 'risk' ? 'Risk' : 'Recommendation'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Contract Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Clauses</span>
                  <span className="font-medium">{contract.clauses.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risks Identified</span>
                  <span className="font-medium text-red-600">
                    {contract.insights.filter(i => i.type === 'risk').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recommendations</span>
                  <span className="font-medium text-green-600">
                    {contract.insights.filter(i => i.type === 'recommendation').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days to Expiry</span>
                  <span className="font-medium">
                    {Math.ceil((new Date(contract.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Snippets */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Evidence Snippets</h3>
                <button
                  onClick={() => setShowEvidenceDrawer(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {contract.evidenceSnippets.slice(0, 2).map((snippet) => (
                  <div key={snippet.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Page {snippet.page}</p>
                    <p className="text-sm text-gray-800">{snippet.text}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {snippet.relevance}% relevance
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                  Export Report
                </button>
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200">
                  Schedule Review
                </button>
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200">
                  Share with Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Drawer */}
      {showEvidenceDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEvidenceDrawer(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Evidence Snippets</h2>
                <button
                  onClick={() => setShowEvidenceDrawer(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {contract.evidenceSnippets.map((snippet) => (
                  <div key={snippet.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Page {snippet.page}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {snippet.relevance}% relevance
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{snippet.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}