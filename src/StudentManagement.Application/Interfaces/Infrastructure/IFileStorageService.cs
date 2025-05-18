using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Infrastructure
{
    public interface IFileStorageService
    {
        /// <summary>
        /// Saves a file stream to the storage.
        /// </summary>
        /// <param name="fileStream">The stream containing the file data.</param>
        /// <param name="containerName">The logical container or directory name (e.g., "student-photos").</param>
        /// <param name="fileName">The desired unique filename within the container.</param>
        /// <param name="contentType">The MIME content type of the file (e.g., "image/jpeg").</param>
        /// <returns>The relative path or identifier/URL of the saved file.</returns>
        Task<string> SaveFileAsync(Stream fileStream, string containerName, string fileName, string contentType);

        /// <summary>
        /// Deletes a file from storage.
        /// </summary>
        /// <param name="containerName">The container name.</param>
        /// <param name="fileName">The name of the file to delete.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task DeleteFileAsync(string containerName, string fileName);

        // Potentially add GetFileAsync or GetPresignedUrlAsync if needed later
    }

    // Optional: Define configuration for storage
    public class FileStorageSettings
    {
        public string StorageType { get; set; } = "Local"; // "Local", "AzureBlob", "S3" etc.
        public string LocalStorageBasePath { get; set; } = string.Empty; // Base path for local storage
        // Add settings for Azure Blob (ConnectionString, ContainerName) or S3 (AccessKey, SecretKey, BucketName) if used
    }
}
