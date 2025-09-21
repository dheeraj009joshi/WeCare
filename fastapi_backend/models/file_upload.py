from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime

# Pydantic schemas
class FileUploadBase(BaseModel):
    filename: str
    original_name: str
    file_type: str
    file_size: int = Field(..., gt=0)
    upload_path: str
    user_id: str
    session_id: str

class FileUploadCreate(FileUploadBase):
    pass

class FileUploadUpdate(BaseModel):
    filename: Optional[str] = None
    original_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = Field(None, gt=0)
    upload_path: Optional[str] = None

class FileUploadResponse(FileUploadBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Beanie Document
class FileUpload(Document, FileUploadBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "file_uploads"
        indexes = [
            "user_id",
            "session_id",
            "file_type",
            "created_at"
        ]

    def __str__(self):
        return f"FileUpload(id={self.id}, filename={self.filename}, user_id={self.user_id})"
