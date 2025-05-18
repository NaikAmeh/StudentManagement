using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.Interfaces;
using StudentMgmt.Infrastructure.Data.DBContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<T>();
        }

        public virtual async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<T?> GetByIdAsync(Guid id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task<IReadOnlyList<T>> GetAllAsync()
        {
            return await _dbSet.AsNoTracking().ToListAsync(); // Use NoTracking for read-only ops
        }

        public async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.AsNoTracking().Where(predicate).ToListAsync();
        }

        public async Task<IReadOnlyList<T>> FindAsync(
           Expression<Func<T, bool>>? predicate = null,
           Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
           List<Expression<Func<T, object>>>? includes = null,
           bool disableTracking = true)
        {
            IQueryable<T> query = _dbSet;

            if (disableTracking)
            {
                query = query.AsNoTracking();
            }

            if (includes != null)
            {
                query = includes.Aggregate(query, (current, include) => current.Include(include));
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            if (orderBy != null)
            {
                return await orderBy(query).ToListAsync();
            }
            else
            {
                return await query.ToListAsync();
            }
        }

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, List<Expression<Func<T, object>>>? includes = null)
        {
            IQueryable<T> query = _dbSet;

            if (includes != null)
            {
                query = includes.Aggregate(query, (current, include) => current.Include(include));
            }

            return await query.FirstOrDefaultAsync(predicate);
        }

        public T? FirstOrDefault(Expression<Func<T, bool>> predicate, List<Expression<Func<T, object>>>? includes = null)
        {
            IQueryable<T> query = _dbSet;

            if (includes != null)
            {
                query = includes.Aggregate(query, (current, include) => current.Include(include));
            }

            return query.FirstOrDefault(predicate);
        }

        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public void Update(T entity)
        {
            // Attach the entity if it's not tracked, then mark as modified
            _dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void Delete(T entity)
        {
            // If entity is detached, attach it first
            if (_context.Entry(entity).State == EntityState.Detached)
            {
                _dbSet.Attach(entity);
            }
            _dbSet.Remove(entity);
        }

        public void DeleteRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }

        public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
        {
            if (predicate == null)
            {
                return await _dbSet.CountAsync();
            }
            return await _dbSet.CountAsync(predicate);
        }

        public async Task<List<T>> ToListAsync(Expression<Func<T, bool>> predicate = null)
        {
            return predicate == null
                ? await _dbSet.ToListAsync()
                : await _dbSet.Where(predicate).ToListAsync();
        }

        // If NOT using UnitOfWork, you might add SaveChanges here
        // public async Task<int> SaveChangesAsync()
        // {
        //     return await _context.SaveChangesAsync();
        // }

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            // Directly call EF Core's AnyAsync extension method on the DbSet
            return await _dbSet.AnyAsync(predicate);
        }

        public async Task<bool> AnyAsync()
        {
            // Directly call EF Core's AnyAsync extension method without a predicate
            return await _dbSet.AnyAsync();
        }

        public virtual IQueryable<T> GetQueryable()
        {
            // Return the DbSet directly, as it implements IQueryable<T>
            // Adding AsNoTracking() here would make all derived queries non-tracking by default
            // which might be desirable if the primary use is for reading/filtering.
            // However, if you need to track changes after complex queries, omit AsNoTracking() here
            // and apply it selectively in the service layer if needed.
            return _dbSet.AsQueryable();
        }
    }
}
