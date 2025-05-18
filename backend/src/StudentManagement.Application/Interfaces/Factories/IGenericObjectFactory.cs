using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Factories
{
    public interface IGenericObjectFactory
    {
        /// <summary>
        /// Gets a specific factory of type TFactory.
        /// </summary>
        /// <typeparam name="TFactory">The type of the specific factory to retrieve (must implement IBaseFactory).</typeparam>
        /// <returns>An instance of the requested factory.</returns>
        /// <exception cref="InvalidOperationException">Thrown if the factory is not registered.</exception>
        T GetFactory<T>() where T : IBaseFactory;
    }
}
