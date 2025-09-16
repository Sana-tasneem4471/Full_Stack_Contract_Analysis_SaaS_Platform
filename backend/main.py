"""
FastAPI Backend for Contract Analysis SaaS
This is a reference implementation - not executable in WebContainer
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta
import os
from typing import List, Optional
import numpy as np

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/contractiq")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    documents = relationship("Document", back_populates="user")
    chunks = relationship("Chunk", back_populates="user")

class Document(Base):
    __tablename__ = "documents"
    
    doc_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    filename = Column(String, nullable=False)
    uploaded_on = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime)
    status = Column(String, nullable=False)  # Active, Renewal Due, Expired
    risk_score = Column(String, nullable=False)  # Low, Medium, High
    
    user = relationship("User", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document")

class Chunk(Base):
    __tablename__ = "chunks"
    
    chunk_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doc_id = Column(UUID(as_uuid=True), ForeignKey("documents.doc_id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    text_chunk = Column(Text, nullable=False)
    embedding = Column(Vector(384))  # pgvector extension
    metadata = Column(JSONB)
    page_number = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="chunks")
    document = relationship("Document", back_populates="chunks")

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="ContractIQ API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secure-secret")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), 
                    db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Mock LlamaCloud parsing function
def mock_llamacloud_parse(file_content: bytes, filename: str) -> dict:
    """
    Mock implementation of LlamaCloud document parsing
    Returns structured chunks with embeddings
    """
    # This would normally call LlamaCloud API
    # For demo, return mock structured data
    return {
        "document_id": str(uuid.uuid4()),
        "chunks": [
            {
                "chunk_id": str(uuid.uuid4()),
                "text": "Termination clause: Either party may terminate with 90 days' notice.",
                "embedding": np.random.rand(384).tolist(),  # Mock embedding
                "metadata": {"page": 2, "contract_name": filename}
            },
            {
                "chunk_id": str(uuid.uuid4()),
                "text": "Liability cap: Limited to 12 months' fees.",
                "embedding": np.random.rand(384).tolist(),  # Mock embedding
                "metadata": {"page": 5, "contract_name": filename}
            }
        ]
    }

# Routes
@app.post("/api/signup")
async def signup(username: str = Form(), email: str = Form(), password: str = Form(), 
                db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user
    user = User(username=username, email=email, password_hash=password_hash)
    db.add(user)
    db.commit()
    
    # Generate JWT
    token = jwt.encode(
        {"sub": str(user.user_id), "exp": datetime.utcnow() + timedelta(days=7)},
        JWT_SECRET,
        algorithm="HS256"
    )
    
    return {"token": token, "user": {"id": str(user.user_id), "username": username, "email": email}}

@app.post("/api/login")
async def login(email: str = Form(), password: str = Form(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate JWT
    token = jwt.encode(
        {"sub": str(user.user_id), "exp": datetime.utcnow() + timedelta(days=7)},
        JWT_SECRET,
        algorithm="HS256"
    )
    
    return {"token": token, "user": {"id": str(user.user_id), "username": user.username, "email": user.email}}

@app.post("/api/upload")
async def upload_contract(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if file.content_type not in ["application/pdf", "text/plain", 
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Read file content
    content = await file.read()
    
    # Mock LlamaCloud parsing
    parse_result = mock_llamacloud_parse(content, file.filename)
    
    # Create document record
    document = Document(
        user_id=current_user.user_id,
        filename=file.filename,
        status="Active",
        risk_score="Low"  # Would be calculated by AI
    )
    db.add(document)
    db.flush()  # Get document ID
    
    # Store chunks with embeddings
    for chunk_data in parse_result["chunks"]:
        chunk = Chunk(
            doc_id=document.doc_id,
            user_id=current_user.user_id,
            text_chunk=chunk_data["text"],
            embedding=chunk_data["embedding"],
            metadata=chunk_data["metadata"],
            page_number=chunk_data["metadata"].get("page", 1)
        )
        db.add(chunk)
    
    db.commit()
    
    return {
        "document_id": str(document.doc_id),
        "filename": file.filename,
        "chunks_processed": len(parse_result["chunks"])
    }

@app.get("/api/contracts")
async def list_contracts(current_user: User = Depends(get_current_user), 
                        db: Session = Depends(get_db)):
    documents = db.query(Document).filter(Document.user_id == current_user.user_id).all()
    
    return [{
        "id": str(doc.doc_id),
        "name": doc.filename,
        "uploaded_on": doc.uploaded_on.isoformat(),
        "status": doc.status,
        "risk_score": doc.risk_score
    } for doc in documents]

@app.get("/api/contracts/{contract_id}")
async def get_contract(contract_id: str, current_user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    document = db.query(Document).filter(
        Document.doc_id == contract_id,
        Document.user_id == current_user.user_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Get chunks for this document
    chunks = db.query(Chunk).filter(Chunk.doc_id == document.doc_id).all()
    
    return {
        "id": str(document.doc_id),
        "name": document.filename,
        "status": document.status,
        "risk_score": document.risk_score,
        "chunks": [{
            "id": str(chunk.chunk_id),
            "text": chunk.text_chunk,
            "page": chunk.page_number,
            "metadata": chunk.metadata
        } for chunk in chunks]
    }

@app.post("/api/ask")
async def query_contracts(
    query: str = Form(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mock query embedding (would normally use OpenAI/other embedding service)
    query_embedding = np.random.rand(384).tolist()
    
    # Vector similarity search using pgvector
    # This is a simplified example - real implementation would use proper vector operations
    chunks = db.query(Chunk).filter(Chunk.user_id == current_user.user_id).limit(5).all()
    
    # Mock AI-generated answer
    answer = f"Based on your contracts, here's what I found regarding '{query}': " + \
            "Your contracts contain several relevant clauses. The most important considerations are " + \
            "termination procedures, liability limitations, and renewal terms."
    
    return {
        "answer": answer,
        "confidence": 94,
        "sources": [{
            "contract_name": chunk.document.filename,
            "excerpt": chunk.text_chunk,
            "page": chunk.page_number,
            "relevance": 85 + (i * 3)  # Mock relevance score
        } for i, chunk in enumerate(chunks[:3])]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)