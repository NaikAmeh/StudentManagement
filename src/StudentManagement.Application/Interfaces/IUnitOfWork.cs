using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        /// <summary>
        /// Gets a generic repository for the specified entity type.
        /// </summary>
        /// <typeparam name="TEntity">The type of the entity.</typeparam>
        /// <returns>An instance of IGenericRepository<TEntity>.</returns>
        IRepository<TEntity> Repository<TEntity>() where TEntity : class;

        /// <summary>
        /// Saves all pending changes tracked by the DbContext.
        /// This is typically called within the action passed to ExecuteInTransactionAsync.
        /// </summary>
        /// <returns>The number of state entries written to the database.</returns>
        Task<int> CompleteAsync();

        /// <summary>
        /// Executes a given set of operations as a single atomic unit,
        /// within a database transaction and using the configured execution strategy for retries.
        /// The provided action should make calls to Repository methods and then CompleteAsync.
        /// </summary>
        /// <param name="action">An asynchronous function representing the work to be done within the transaction.
        /// It should call CompleteAsync at the end of its database operations before the transaction commits.
        /// </param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task ExecuteInTransactionAsync(Func<Task> action);

        /// <summary>
        /// Executes a given set of operations that return a result, as a single atomic unit,
        /// within a database transaction and using the configured execution strategy for retries.
        /// </summary>
        /// <typeparam name="TResult">The type of the result returned by the action.</typeparam>
        /// <param name="action">An asynchronous function returning TResult, representing the work to be done.
        /// It should call CompleteAsync at the end of its database operations if changes were made.
        /// </param>
        /// <returns>The result of the action.</returns>
        Task<TResult> ExecuteInTransactionAsync<TResult>(Func<Task<TResult>> action);
    }
}
