# Contract Analysis Database Schema

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │         │  documents   │         │   chunks    │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ user_id PK  │◄────────│ doc_id PK    │◄────────│ chunk_id PK │
│ username    │         │ user_id FK   │         │ doc_id FK   │
│ email       │         │ filename     │         │ user_id FK  │
│ password_hash│         │ uploaded_on  │         │ text_chunk  │
│ created_at  │         │ expiry_date  │         │ embedding   │
└─────────────┘         │ status       │         │ metadata    │
                        │ risk_score   │         │ page_number │
                        └──────────────┘         │ created_at  │
                                                 └─────────────┘
```

## Table Definitions

### users
- **user_id** (UUID, PRIMARY KEY): Unique identifier for each user
- **username** (TEXT, NOT NULL): Display name for the user
- **email** (TEXT, UNIQUE, NOT NULL): User's email address (used for login)
- **password_hash** (TEXT, NOT NULL): Bcrypt hashed password
- **created_at** (TIMESTAMP): Account creation timestamp

### documents  
- **doc_id** (UUID, PRIMARY KEY): Unique identifier for each document
- **user_id** (UUID, FOREIGN KEY): Reference to owning user
- **filename** (TEXT, NOT NULL): Original filename of uploaded document
- **uploaded_on** (TIMESTAMP): Document upload timestamp
- **expiry_date** (DATE): Contract expiration date (if applicable)
- **status** (TEXT, CHECK): Contract status (Active, Renewal Due, Expired)
- **risk_score** (TEXT, CHECK): AI-assessed risk level (Low, Medium, High)

### chunks
- **chunk_id** (UUID, PRIMARY KEY): Unique identifier for each text chunk
- **doc_id** (UUID, FOREIGN KEY): Reference to source document
- **user_id** (UUID, FOREIGN KEY): Reference to owning user (for RLS)
- **text_chunk** (TEXT, NOT NULL): Extracted text content
- **embedding** (VECTOR(384)): Vector embedding for similarity search
- **metadata** (JSONB): Additional chunk metadata (page, clause type, etc.)
- **page_number** (INTEGER): Source page number
- **created_at** (TIMESTAMP): Chunk creation timestamp

## Key Features

### Multi-Tenant Isolation
- All tables include user_id for data segregation
- Row Level Security (RLS) policies enforce access control
- Each user can only access their own data

### Vector Search Capabilities
- pgvector extension enables semantic search
- 384-dimensional embeddings for text chunks
- Cosine similarity indexing for fast retrieval

### Audit Trail
- Timestamps on all records
- Immutable chunk storage preserves original analysis
- Document lifecycle tracking

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expiry_date ON documents(expiry_date);
CREATE INDEX idx_chunks_user_id ON chunks(user_id);
CREATE INDEX idx_chunks_doc_id ON chunks(doc_id);

-- Vector similarity index
CREATE INDEX idx_chunks_embedding ON chunks 
  USING ivfflat (embedding vector_cosine_ops);
```

## Row Level Security Policies

```sql
-- Users can only access their own data
CREATE POLICY "user_isolation" ON documents
  FOR ALL TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "chunk_isolation" ON chunks
  FOR ALL TO authenticated  
  USING (auth.uid()::text = user_id::text);
```

## Sample Queries

### Vector Similarity Search
```sql
-- Find similar text chunks
SELECT text_chunk, metadata->>'contract_name', 
       1 - (embedding <=> $1) as similarity
FROM chunks 
WHERE user_id = $2
ORDER BY embedding <=> $1
LIMIT 5;
```

### Contract Analytics  
```sql
-- Risk score distribution
SELECT risk_score, COUNT(*) 
FROM documents 
WHERE user_id = $1 
GROUP BY risk_score;
```

### Renewal Pipeline
```sql  
-- Contracts expiring soon
SELECT filename, expiry_date, status
FROM documents
WHERE user_id = $1 
  AND expiry_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'
ORDER BY expiry_date;
```

This schema provides the foundation for a production-ready contract analysis system with proper multi-tenancy, vector search capabilities, and audit tracking.