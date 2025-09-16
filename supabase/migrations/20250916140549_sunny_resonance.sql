/*
# Contract Analysis Database Schema

1. New Tables
  - `users`
    - `user_id` (uuid, primary key)
    - `username` (text)
    - `email` (text, unique)  
    - `password_hash` (text)
    - `created_at` (timestamp)
  - `documents`
    - `doc_id` (uuid, primary key)
    - `user_id` (uuid, foreign key)
    - `filename` (text)
    - `uploaded_on` (timestamp)
    - `expiry_date` (date)
    - `status` (text, check constraint)
    - `risk_score` (text, check constraint)
  - `chunks`
    - `chunk_id` (uuid, primary key)
    - `doc_id` (uuid, foreign key)
    - `user_id` (uuid, foreign key)  
    - `text_chunk` (text)
    - `embedding` (vector)
    - `metadata` (jsonb)
    - `page_number` (integer)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access only their own data
  - Multi-tenant isolation enforced at database level

3. Extensions
  - Enable pgvector extension for vector similarity search
  - Set up indexes for optimal query performance
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  doc_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  filename text NOT NULL,
  uploaded_on timestamptz DEFAULT now(),
  expiry_date date,
  status text NOT NULL CHECK (status IN ('Active', 'Renewal Due', 'Expired')) DEFAULT 'Active',
  risk_score text NOT NULL CHECK (risk_score IN ('Low', 'Medium', 'High')) DEFAULT 'Low'
);

-- Create chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS chunks (
  chunk_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id uuid NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  text_chunk text NOT NULL,
  embedding vector(384), -- 384-dimensional embeddings
  metadata jsonb DEFAULT '{}',
  page_number integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_risk_score ON documents(risk_score);
CREATE INDEX IF NOT EXISTS idx_documents_expiry_date ON documents(expiry_date);

CREATE INDEX IF NOT EXISTS idx_chunks_user_id ON chunks(user_id);
CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for documents table
CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for chunks table
CREATE POLICY "Users can read own chunks"
  ON chunks
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own chunks"
  ON chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own chunks"
  ON chunks
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own chunks"
  ON chunks
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Insert sample data for demo
INSERT INTO users (user_id, username, email, password_hash) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo User',
  'demo@contractiq.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6E9lxOgCCi' -- bcrypt hash of 'demo123'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (doc_id, user_id, filename, expiry_date, status, risk_score)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Master Service Agreement - TechCorp.pdf',
    '2025-03-15',
    'Active',
    'Low'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002', 
    '550e8400-e29b-41d4-a716-446655440000',
    'Software License - DataFlow Inc.pdf',
    '2025-01-30',
    'Renewal Due',
    'Medium'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000', 
    'Consulting Agreement - Legal Partners.pdf',
    '2024-12-20',
    'Expired',
    'High'
  )
ON CONFLICT (doc_id) DO NOTHING;

-- Insert sample chunks with mock embeddings
INSERT INTO chunks (chunk_id, doc_id, user_id, text_chunk, metadata, page_number)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Termination clause: Either party may terminate this agreement with 90 days written notice.',
    '{"contract_name": "Master Service Agreement - TechCorp.pdf", "clause_type": "termination"}',
    2
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Liability limitation: Total liability shall not exceed the fees paid in the 12 months preceding the claim.',
    '{"contract_name": "Master Service Agreement - TechCorp.pdf", "clause_type": "liability"}',
    5
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'Auto-renewal clause: This agreement shall automatically renew for successive one-year terms unless terminated.',
    '{"contract_name": "Software License - DataFlow Inc.pdf", "clause_type": "renewal"}',
    3
  )
ON CONFLICT (chunk_id) DO NOTHING;