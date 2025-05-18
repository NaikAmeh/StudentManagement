using Microsoft.Extensions.DependencyInjection;
using StudentManagement.Application.Interfaces.Factories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Factories
{
    public class GenericObjectFactory : IGenericObjectFactory
    {
        private readonly IServiceProvider _serviceProvider;

        public GenericObjectFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        }

        /// <inheritdoc />
        public TFactory GetFactory<TFactory>() where TFactory : IBaseFactory
        {
            // Use the service provider to resolve the requested factory type.
            // This requires TFactory (e.g., IUserFactory) to be registered in DI.
            var factory = _serviceProvider.GetService<TFactory>();

            if (factory == null)
            {
                throw new InvalidOperationException($"Factory of type {typeof(TFactory).FullName} is not registered in the DI container or could not be resolved.");
            }
            return factory;
        }
    }
}
