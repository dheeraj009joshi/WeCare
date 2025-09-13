from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import AzureError
from typing import Optional, BinaryIO
import logging
import uuid
from ..core.config import settings

logger = logging.getLogger(__name__)

class AzureStorageService:
    def __init__(self):
        try:
            self.blob_service_client = BlobServiceClient.from_connection_string(
                settings.azure_storage_connection_string
            )
            self.container_name = settings.container_name
            logger.info("Azure Storage Service initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Azure Storage Service: {e}")
            raise

    async def upload_file(
        self, 
        file_content: BinaryIO, 
        file_name: str,
        content_type: Optional[str] = None,
        folder: Optional[str] = None
    ) -> str:
        """
        Upload a file to Azure Blob Storage
        
        Args:
            file_content: File content as binary
            file_name: Original file name
            content_type: MIME type of the file
            folder: Optional folder path in container
            
        Returns:
            URL of the uploaded file
        """
        try:
            # Generate unique filename
            file_extension = file_name.split('.')[-1] if '.' in file_name else ''
            unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
            
            # Add folder path if specified
            blob_name = f"{folder}/{unique_filename}" if folder else unique_filename
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            # Upload file
            blob_client.upload_blob(
                file_content,
                content_type=content_type,
                overwrite=True
            )
            
            # Return the URL
            blob_url = blob_client.url
            logger.info(f"File uploaded successfully: {blob_url}")
            return blob_url
            
        except AzureError as e:
            logger.error(f"Azure error during file upload: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during file upload: {e}")
            raise

    async def delete_file(self, blob_name: str) -> bool:
        """
        Delete a file from Azure Blob Storage
        
        Args:
            blob_name: Name of the blob to delete
            
        Returns:
            True if successful, False otherwise
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            blob_client.delete_blob()
            logger.info(f"File deleted successfully: {blob_name}")
            return True
            
        except AzureError as e:
            logger.error(f"Azure error during file deletion: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during file deletion: {e}")
            return False

    async def get_file_url(self, blob_name: str) -> Optional[str]:
        """
        Get the URL of a file in Azure Blob Storage
        
        Args:
            blob_name: Name of the blob
            
        Returns:
            URL of the file or None if not found
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            if blob_client.exists():
                return blob_client.url
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error getting file URL: {e}")
            return None

    async def list_files(self, folder: Optional[str] = None) -> list:
        """
        List files in the container
        
        Args:
            folder: Optional folder path to filter by
            
        Returns:
            List of blob names
        """
        try:
            container_client = self.blob_service_client.get_container_client(
                self.container_name
            )
            
            blob_list = []
            blobs = container_client.list_blobs(name_starts_with=folder)
            
            for blob in blobs:
                blob_list.append({
                    'name': blob.name,
                    'size': blob.size,
                    'last_modified': blob.last_modified,
                    'url': f"{container_client.url}/{blob.name}"
                })
            
            return blob_list
            
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            return []

# Create a global instance
azure_storage = AzureStorageService()