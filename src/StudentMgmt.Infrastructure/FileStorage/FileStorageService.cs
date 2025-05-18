using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StudentManagement.Application.Interfaces.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.FileStorage
{
    public class FileStorageService : IFileStorageService
    {
        private readonly FileStorageSettings _settings;
        private readonly ILogger<FileStorageService> _logger;
        private readonly string _basePath; // Resolved absolute base path

        public FileStorageService(IOptions<FileStorageSettings> settings, ILogger<FileStorageService> logger)
        {
            _settings = settings?.Value ?? throw new ArgumentNullException(nameof(settings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Ensure the base path setting is provided for local storage
            if (string.IsNullOrWhiteSpace(_settings.LocalStorageBasePath))
            {
                throw new ArgumentException("LocalStorageBasePath must be configured in FileStorageSettings for Local storage type.");
            }

            // Resolve the absolute path (handle relative paths like "wwwroot/uploads")
            _basePath = Path.GetFullPath(_settings.LocalStorageBasePath);
            _logger.LogInformation("Local Storage Base Path resolved to: {BasePath}", _basePath);
        }

        public async Task<string> SaveFileAsync(Stream fileStream, string containerName, string fileName, string contentType)
        {
            if (fileStream == null || fileStream.Length == 0)
                throw new ArgumentException("File stream cannot be null or empty.", nameof(fileStream));
            if (string.IsNullOrWhiteSpace(containerName))
                throw new ArgumentException("Container name cannot be empty.", nameof(containerName));
            if (string.IsNullOrWhiteSpace(fileName))
                throw new ArgumentException("File name cannot be empty.", nameof(fileName));

            // Combine base path, container, and filename
            // Sanitize container and file names to prevent path traversal issues
            var safeContainerName = Path.GetFileName(containerName); // Basic sanitization
            var safeFileName = Path.GetFileName(fileName); // Basic sanitization

            var containerPath = Path.Combine(_basePath, safeContainerName);
            var filePath = Path.Combine(containerPath, safeFileName);

            _logger.LogInformation("Saving file to local path: {FilePath}", filePath);

            try
            {
                // Ensure the directory exists
                Directory.CreateDirectory(containerPath);

                // Reset stream position if possible (important!)
                if (fileStream.CanSeek)
                {
                    fileStream.Seek(0, SeekOrigin.Begin);
                }

                // Write the stream to the file
                using (var outputStream = new FileStream(filePath, FileMode.Create))
                {
                    await fileStream.CopyToAsync(outputStream);
                }

                _logger.LogInformation("File saved successfully: {FilePath}", filePath);

                // Return a relative path (or identifier) to store in the database
                // This path should be relative to how you serve the files (e.g., relative to wwwroot if served directly)
                // Or just the container/filename part if you construct the URL elsewhere.
                string relativePath = $"{safeContainerName}/{safeFileName}"; // Example relative path
                return relativePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving file to {FilePath}", filePath);
                throw; // Re-throw the exception
            }
        }

        public Task DeleteFileAsync(string containerName, string fileName)
        {
            if (string.IsNullOrWhiteSpace(containerName) || string.IsNullOrWhiteSpace(fileName))
            {
                _logger.LogWarning("DeleteFileAsync called with empty container or filename.");
                return Task.CompletedTask; // Or throw?
            }

            var safeContainerName = Path.GetFileName(containerName);
            var safeFileName = Path.GetFileName(fileName);
            var containerPath = Path.Combine(_basePath, safeContainerName);
            var filePath = Path.Combine(containerPath, safeFileName);

            _logger.LogInformation("Attempting to delete local file: {FilePath}", filePath);

            try
            {
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("File deleted successfully: {FilePath}", filePath);
                }
                else
                {
                    _logger.LogWarning("File not found for deletion: {FilePath}", filePath);
                }
            }
            catch (Exception ex)
            {
                // Log error but don't necessarily throw, deleting is often best-effort
                _logger.LogError(ex, "Error deleting file {FilePath}", filePath);
            }
            return Task.CompletedTask; // Return completed task
        }
    }
}
