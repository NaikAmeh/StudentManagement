using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id); // Assuming int IDs, adjust if needed (e.g., Guid)
        Task<T?> GetByIdAsync(Guid id); // Overload for Guid IDs

        Task<IReadOnlyList<T>> GetAllAsync();

        // Find based on a predicate (condition)
        Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate);

        // Find with includes for related data
        Task<IReadOnlyList<T>> FindAsync(
            Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            List<Expression<Func<T, object>>>? includes = null,
            bool disableTracking = true);

        // Get single entity based on predicate
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, List<Expression<Func<T, object>>>? includes = null);

        Task AddAsync(T entity);
        Task AddRangeAsync(IEnumerable<T> entities);

        void Update(T entity); // Update is typically synchronous in EF Core change tracking
        void UpdateRange(IEnumerable<T> entities);

        void Delete(T entity); // Delete is typically synchronous
        void DeleteRange(IEnumerable<T> entities);

        Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);

        // Potentially add IUnitOfWork or SaveChangesAsync here if not handled elsewhere
        // Task<int> SaveChangesAsync();

        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);

        Task<bool> AnyAsync();
        IQueryable<T> GetQueryable();
        Task<List<T>> ToListAsync(Expression<Func<T, bool>> predicate = null);
    }
}
