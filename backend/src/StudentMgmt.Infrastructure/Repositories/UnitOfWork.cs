using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using StudentManagement.Application.Interfaces;
using StudentMgmt.Infrastructure.Data.DBContext;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace StudentMgmt.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private Hashtable? _repositories;
        private bool _disposed;
        private readonly ILogger<UnitOfWork> _logger;

        public UnitOfWork(ApplicationDbContext context, ILogger<UnitOfWork> logger = null!) // logger can be optional
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger; // Can be null if not provided or using NullLogger
        }

        public IRepository<TEntity> Repository<TEntity>() where TEntity : class
        {
            _repositories ??= new Hashtable();
            var typeName = typeof(TEntity).Name;
            if (!_repositories.ContainsKey(typeName))
            {
                var repositoryType = typeof(Repository<>);
                // Pass the DbContext to the GenericRepository constructor
                var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(typeof(TEntity)), _context);

                if (repositoryInstance != null)
                {
                    _repositories.Add(typeName, repositoryInstance);
                }
                else
                {
                    throw new InvalidOperationException($"Could not create repository instance for {typeName}");
                }
            }
            return (IRepository<TEntity>)_repositories[typeName]!;
        }

        public async Task<int> CompleteAsync()
        {
            _logger?.LogDebug("UnitOfWork.CompleteAsync (DbContext.SaveChangesAsync) called.");
            // This will be executed within the transaction started by ExecuteInTransactionAsync
            return await _context.SaveChangesAsync();
        }

        public async Task ExecuteInTransactionAsync(Func<Task> action)
        {
            // Get the configured execution strategy from the DbContext
            var strategy = _context.Database.CreateExecutionStrategy();

            // Execute the entire block using the strategy
            await strategy.ExecuteAsync(async () =>
            {
                // Start a new transaction for each attempt by the strategy
                await using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    _logger?.LogInformation("Transaction {TransactionId} started within UnitOfWork.ExecuteInTransactionAsync.", transaction.TransactionId);
                    try
                    {
                        // Execute the action passed by the service layer
                        await action();
                        // The 'action' is expected to call _unitOfWork.CompleteAsync()
                        // if it made changes that need to be saved to the database.

                        // If the action completes without exceptions, commit the transaction
                        await transaction.CommitAsync();
                        _logger?.LogInformation("Transaction {TransactionId} committed successfully.", transaction.TransactionId);
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogError(ex, "Error occurred within UnitOfWork transaction {TransactionId}. Rolling back.", transaction.TransactionId);
                        // Attempt to roll back if an error occurs within the action
                        await transaction.RollbackAsync();
                        throw; // Re-throw the exception so the execution strategy knows it failed and can retry if applicable
                    }
                } // Transaction is disposed here by 'await using'
            });
            _logger?.LogDebug("ExecuteInTransactionAsync completed.");
        }

        public async Task<TResult> ExecuteInTransactionAsync<TResult>(Func<Task<TResult>> action)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            TResult result = default!; // Initialize with default

            await strategy.ExecuteAsync(async () =>
            {
                await using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    _logger?.LogInformation("Transaction {TransactionId} (returning TResult) started within UnitOfWork.ExecuteInTransactionAsync.", transaction.TransactionId);
                    try
                    {
                        result = await action(); // Execute the action that returns a result
                        // The 'action' should call CompleteAsync if it made DB changes

                        await transaction.CommitAsync();
                        _logger?.LogInformation("Transaction {TransactionId} (returning TResult) committed successfully.", transaction.TransactionId);
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogError(ex, "Error occurred within UnitOfWork transaction {TransactionId} (returning TResult). Rolling back.", transaction.TransactionId);
                        await transaction.RollbackAsync();
                        throw;
                    }
                }
            });
            _logger?.LogDebug("ExecuteInTransactionAsync<TResult> completed.");
            return result!; // Return the result from the action
        }

        // --- Dispose Pattern ---
        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    // DbContext is managed by the DI container and typically disposed at the end of the request scope.
                    // If UnitOfWork is also scoped, DbContext disposal will be handled by DI.
                    // However, if UnitOfWork were to create its own DbContext instance (not recommended with DI),
                    // then it would be responsible for disposing it here.
                    // For now, assuming DbContext lifetime is managed by DI.
                    // _context.Dispose(); // Only if UoW owns the DbContext instance directly.

                    (_repositories as IDisposable)?.Dispose(); // If repositories ever become IDisposable
                    _repositories = null;
                }
                _disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }



    //public class UnitOfWork : IUnitOfWork
    //{
    //    private readonly ApplicationDbContext _context;
    //    private Hashtable? _repositories; // Use Hashtable or Dictionary<Type, object> for caching
    //    private bool _disposed;

    //    // Remove specific repository fields:
    //    // private IStudentRepository? _students;
    //    // private IUserRepository? _users;
    //    // private ISchoolRepository? _schools;

    //    public UnitOfWork(ApplicationDbContext context)
    //    {
    //        _context = context ?? throw new ArgumentNullException(nameof(context));
    //    }

    //    // Remove specific repository properties:
    //    // public IStudentRepository Students => _students ??= new StudentRepository(_context);
    //    // public IUserRepository Users => _users ??= new UserRepository(_context);
    //    // public ISchoolRepository Schools => _schools ??= new SchoolRepository(_context);

    //    /// <summary>
    //    /// Gets the repository instance for the specified entity type.
    //    /// Lazily creates and caches repository instances.
    //    /// </summary>
    //    /// <typeparam name="TEntity">The type of the entity.</typeparam>
    //    /// <returns>An instance of IGenericRepository<TEntity>.</returns>
    //    public IRepository<TEntity> Repository<TEntity>() where TEntity : class
    //    {

    //        // Initialize cache if null
    //        _repositories ??= new Hashtable();

    //        var type = typeof(TEntity);
    //        var typeName = type.Name; // Key for the cache

    //        // Check if repository already exists in cache
    //        if (!_repositories.ContainsKey(typeName))
    //        {
    //            // Repository not in cache, create a new generic one
    //            var repositoryType = typeof(Repository<>);
    //            var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(type), _context);

    //            if (repositoryInstance != null)
    //            {
    //                // Add the new repository instance to the cache
    //                _repositories.Add(typeName, repositoryInstance);
    //            }
    //            else
    //            {
    //                // Handle potential error during instance creation
    //                throw new InvalidOperationException($"Could not create repository instance for {typeName}");
    //            }
    //        }

    //        // Return the repository from cache (casting is safe due to how we added it)
    //        return (IRepository<TEntity>)_repositories[typeName]!;
    //    }


    //    public async Task<int> CompleteAsync()
    //    {
    //        return await _context.SaveChangesAsync();
    //    }

    //    // Dispose pattern remains the same
    //    protected virtual void Dispose(bool disposing)
    //    {
    //        if (!_disposed)
    //        {
    //            if (disposing)
    //            {
    //                _context.Dispose();
    //                (_repositories as IDisposable)?.Dispose(); // Dispose cache if needed (Hashtable isn't IDisposable)
    //                _repositories = null;
    //            }
    //            _disposed = true;
    //        }
    //    }

    //    public void Dispose()
    //    {
    //        Dispose(disposing: true);
    //        GC.SuppressFinalize(this);
    //    }
    //}
}